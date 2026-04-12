"use client";

import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import ModalProfessor from "@/components/ModalProfessor";

import api from "@/services/api";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Curso {
	idCurso: number;
	nomeCurso: string;
}

interface Professor {
	idProfessor: number;
	nomeProfessor: string;
	titulacao?: string;
}

export default function Professores() {
	const { usuario } = useAuth();
	const [cursos, setCursos] = useState<Curso[]>([]);
	const [cursoSelecionado, setCursoSelecionado] = useState<number | null>(null);
	const [professores, setProfessores] = useState<Professor[]>([]);
	const [loadingCursos, setLoadingCursos] = useState(true);
	const [loadingProfessores, setLoadingProfessores] = useState(false);

	// Modal
	const [modalAberto, setModalAberto] = useState(false);
	const [professorSelecionado, setProfessorSelecionado] = useState<number | null>(null);

	// Carregar cursos
	useEffect(() => {
		const carregarCursos = async () => {
			try {
				setLoadingCursos(true);
				const response = await api.get<Curso[]>("/curso");
				setCursos(response.data);
			} catch (error) {
				toast.error("Erro ao carregar cursos");
			} finally {
				setLoadingCursos(false);
			}
		};
		carregarCursos();
	}, []);

	// Carregar professores quando selecionar um curso
	useEffect(() => {
		if (!cursoSelecionado) {
			setProfessores([]);
			return;
		}

		const carregarProfessores = async () => {
			try {
				setLoadingProfessores(true);
				const response = await api.get<Professor[]>(
					`/professor/curso/${cursoSelecionado}`
				);
				const data = Array.isArray(response.data) ? response.data : [];
				// Deduplicar por idProfessor
				const unicos = data.filter(
					(prof, index, self) =>
						index === self.findIndex((p) => p.idProfessor === prof.idProfessor)
				);
				setProfessores(unicos);
			} catch (error) {
				toast.error("Erro ao carregar professores");
				setProfessores([]);
			} finally {
				setLoadingProfessores(false);
			}
		};

		carregarProfessores();
	}, [cursoSelecionado]);

	const handleProfessorClick = (idProfessor: number) => {
		setProfessorSelecionado(idProfessor);
		setModalAberto(true);
	};

	const titulacaoLabel: Record<string, string> = {
		graduado: "Graduado",
		especialista: "Especialista",
		mestre: "Mestre",
		doutor: "Doutor",
		doutora: "Doutora",
	};

	return (
		<>
			<Header title="Professores" />
			<NavBar />

			<div className="lg:ml-72 pt-20 px-4 sm:px-6 lg:px-8 pb-8">
				<div className="max-w-4xl mx-auto flex flex-col gap-6">
					{/* Selecao de curso */}
					<section>
						<h2 className="text-gray-800 font-semibold text-base sm:text-lg mb-3">
							Selecione o curso
						</h2>
						{loadingCursos ? (
							<span className="text-sm text-gray-500">
								Carregando cursos...
							</span>
						) : (
							<div className="flex flex-wrap gap-3">
								{cursos.map((curso) => (
									<button
										key={curso.idCurso}
										type="button"
										onClick={() => setCursoSelecionado(curso.idCurso)}
										className={`px-6 py-2.5 rounded-2xl border-2 transition-colors font-medium text-sm sm:text-base
											${
												cursoSelecionado === curso.idCurso
													? "bg-green-700 text-white border-green-700 hover:bg-green-800 hover:border-green-800"
													: "bg-white text-gray-800 border-gray-800 hover:bg-gray-100"
											}
										`}
									>
										{curso.nomeCurso}
									</button>
								))}
							</div>
						)}
					</section>

					{/* Lista de professores */}
					<section>
						{!cursoSelecionado ? (
							<div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
								<span className="text-gray-500 text-sm sm:text-base">
									Selecione um curso acima para ver os professores
								</span>
							</div>
						) : loadingProfessores ? (
							<div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
								<span className="text-gray-500 text-sm">
									Carregando professores...
								</span>
							</div>
						) : professores.length > 0 ? (
							<div className="border-2 border-gray-300 rounded-2xl p-6 bg-gray-50">
								<h3 className="text-gray-800 font-semibold text-base sm:text-lg mb-4">
									Professores do curso ({professores.length})
								</h3>
								<div className="flex flex-wrap gap-3">
									{professores.map((prof) => (
										<button
											key={prof.idProfessor}
											type="button"
											onClick={() => handleProfessorClick(prof.idProfessor)}
											className="flex flex-col items-start px-5 py-3 rounded-2xl border-2 border-gray-800 bg-white text-left hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-colors group"
										>
											<span className="font-medium text-sm sm:text-base">
												{prof.nomeProfessor}
											</span>
											{prof.titulacao && (
												<span className="text-xs text-gray-500 group-hover:text-blue-200">
													{titulacaoLabel[prof.titulacao] || prof.titulacao}
												</span>
											)}
										</button>
									))}
								</div>
							</div>
						) : (
							<div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
								<span className="text-gray-500 text-sm">
									Nenhum professor vinculado a este curso
								</span>
							</div>
						)}
					</section>
				</div>
			</div>

			{/* Modal de detalhes */}
			<ModalProfessor
				isOpen={modalAberto}
				onClose={() => setModalAberto(false)}
				idProfessor={professorSelecionado}
			/>
		</>
	);
}
