"use client";

import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import DisciplinaSelector from "@/components/DisciplinaSelector";
import FormCadastro from "@/components/FormCadastro";

import api from "@/services/api";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Professor, Curso } from "@/interfaces/types";
import { useAuth } from "@/contexts/AuthContext";

export default function VincularDisciplinaProfessor() {
	const { usuario } = useAuth();
	const isAdmin = usuario?.nomePerfil.toLowerCase() === "admin";
	const cursoUsuario = usuario?.cursos?.[0]?.idCurso ?? 0;

	const [cursos, setCursos] = useState<Curso[]>([]);
	const [cursoSelecionado, setCursoSelecionado] = useState<number>(cursoUsuario);
	const [disciplinasIds, setDisciplinasIds] = useState<number[]>([]);
	const [professorId, setProfessorId] = useState<number | null>(null);
	const [resetKey, setResetKey] = useState(0);
	const [loading, setLoading] = useState(false);

	// Admin: carregar todos os cursos
	useEffect(() => {
		if (isAdmin) {
			const carregarCursos = async () => {
				try {
					const response = await api.get<Curso[]>("/curso");
					setCursos(response.data);
					if (response.data.length > 0 && !cursoSelecionado) {
						setCursoSelecionado(response.data[0].idCurso);
					}
				} catch (error) {
					toast.error("Erro ao carregar cursos");
				}
			};
			carregarCursos();
		}
	}, [isAdmin]);

	// Resetar seleções ao trocar de curso
	const handleCursoChange = (novoCursoId: number) => {
		setCursoSelecionado(novoCursoId);
		setDisciplinasIds([]);
		setProfessorId(null);
		setResetKey((prev) => prev + 1);
	};

	const handleDisciplinasChange = (
		disciplinasIds: number[],
		professorId: number | null,
	) => {
		setDisciplinasIds(disciplinasIds);
		setProfessorId(professorId);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!professorId) {
			toast.error("Selecione um professor");
			return;
		}

		if (disciplinasIds.length === 0) {
			toast.error("Selecione pelo menos uma disciplina");
			return;
		}

		try {
			setLoading(true);

			for (const idDisciplina of disciplinasIds) {
				const payload = {
					idDisciplina: idDisciplina,
					idProfessor: professorId,
				};
				await api.post("/professorDisciplina", payload);
			}

			toast.success(
				`${disciplinasIds.length} disciplina(s) vinculada(s) com sucesso!`,
			);

			// Reset form
			setDisciplinasIds([]);
			setProfessorId(null);
			setResetKey((prev) => prev + 1);
		} catch (error: any) {
			let mensagemErro = "Erro ao vincular disciplinas";

			if (error.response?.data) {
				const errorData = error.response.data;
				mensagemErro =
					errorData.error ||
					errorData.message ||
					errorData.msg ||
					errorData.mensagem ||
					(typeof errorData === "string" ? errorData : mensagemErro);
			} else if (error.message) {
				mensagemErro = error.message;
			}

			toast.error(mensagemErro, {
				duration: 5000,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Header title='Vincular Professor a Disciplina' />
			<NavBar />
			<div className='[&>div>div]:lg:max-w-3xl'>
				<FormCadastro onSubmit={handleSubmit}>
					{/* Seletor de Curso (apenas Admin) */}
					{isAdmin && (
						<div className='flex flex-col gap-2 mb-4'>
							<label className='text-gray-800 font-semibold text-base sm:text-lg'>
								Selecione o curso
							</label>
							<select
								value={cursoSelecionado}
								onChange={(e) => handleCursoChange(Number(e.target.value))}
								className='w-full h-10 sm:h-12 border-2 border-gray-300 rounded-2xl px-3 sm:px-4 text-sm sm:text-base text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							>
								{cursos.map((curso) => (
									<option key={curso.idCurso} value={curso.idCurso}>
										{curso.nomeCurso}
									</option>
								))}
							</select>
						</div>
					)}

					<DisciplinaSelector
						key={resetKey}
						courseId={cursoSelecionado}
						onChange={handleDisciplinasChange}
					/>
				</FormCadastro>
			</div>
		</>
	);
}
