"use client";
import api from "@/services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Professor, Disciplina, ModalDeleteProps } from "../interfaces/types";

export default function ModalDelete({
	isOpen,
	onClose,
	onDelete,
	onUpdate,
	conteudo,
	idCelula,
	idDisciplina,
	idProfessor,
	dia,
	semestre,
	idGrade,
	idCurso,
}: ModalDeleteProps) {
	const [editando, setEditando] = useState(false);
	const [professores, setProfessores] = useState<Professor[]>([]);
	const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingProfessores, setLoadingProfessores] = useState(false);
	const [salvando, setSalvando] = useState(false);
	const [formData, setFormData] = useState({
		disciplinaId: "",
		professorId: "",
	});

	// Quando entrar em modo edição, carregar disciplinas e pré-preencher
	useEffect(() => {
		if (editando) {
			carregarDisciplinas();
		}
	}, [editando]);

	// Pré-preencher os selects quando as disciplinas carregarem
	useEffect(() => {
		if (editando && disciplinas.length > 0 && idDisciplina) {
			setFormData((prev) => ({
				...prev,
				disciplinaId: idDisciplina.toString(),
			}));
		}
	}, [editando, disciplinas, idDisciplina]);

	// Carregar professores quando disciplina mudar e pré-preencher professor
	useEffect(() => {
		if (formData.disciplinaId) {
			carregarProfessoresPorDisciplina(parseInt(formData.disciplinaId));
		} else {
			setProfessores([]);
			setFormData((prev) => ({ ...prev, professorId: "" }));
		}
	}, [formData.disciplinaId]);

	// Pré-preencher professor quando os professores carregarem (só se a disciplina não mudou)
	useEffect(() => {
		if (
			editando &&
			professores.length > 0 &&
			idProfessor &&
			formData.disciplinaId === idDisciplina.toString()
		) {
			setFormData((prev) => ({
				...prev,
				professorId: idProfessor.toString(),
			}));
		}
	}, [editando, professores, idProfessor, idDisciplina, formData.disciplinaId]);

	// Resetar ao fechar
	useEffect(() => {
		if (!isOpen) {
			setEditando(false);
			setFormData({ disciplinaId: "", professorId: "" });
			setProfessores([]);
			setDisciplinas([]);
		}
	}, [isOpen]);

	const carregarDisciplinas = async () => {
		try {
			setLoading(true);
			const semestreNumero = parseInt(semestre.replace("º Semestre", ""));
			const disciplinasResponse = await api.get<Disciplina[]>(
				`/disciplina/curso/${idCurso}`,
			);
			const dados = Array.isArray(disciplinasResponse.data)
				? disciplinasResponse.data
				: [];
			const filtradas = dados.filter(
				(d: any) => (d.periodo ?? d.semestreDisciplina) === semestreNumero,
			);
			const unicas = [
				...new Map(filtradas.map((d) => [d.idDisciplina, d])).values(),
			];
			setDisciplinas(unicas);
		} catch (error) {
			toast.error("Erro ao carregar disciplinas");
		} finally {
			setLoading(false);
		}
	};

	const carregarProfessoresPorDisciplina = async (idDisc: number) => {
		try {
			setLoadingProfessores(true);
			const professoresResponse = await api.get<Professor[]>(
				`/professorDisciplina/${idDisc}`,
			);
			const unicos = [
				...new Map(
					professoresResponse.data.map((p) => [p.idProfessor, p]),
				).values(),
			];
			setProfessores(unicos);
		} catch (error) {
			setProfessores([]);
			toast.error("Erro ao carregar professores");
		} finally {
			setLoadingProfessores(false);
		}
	};

	const getDiaSemanaId = (diaNome: string): number | null => {
		const diasMap: { [key: string]: number } = {
			"Segunda-feira": 1,
			"Terça-feira": 2,
			"Quarta-feira": 3,
			"Quinta-feira": 4,
			"Sexta-feira": 5,
			Sábado: 6,
		};
		return diasMap[diaNome] ?? null;
	};

	const handleSalvar = async () => {
		if (!formData.professorId || !formData.disciplinaId) {
			toast.error("Por favor, selecione professor e disciplina");
			return;
		}

		const idDiaSemana = getDiaSemanaId(dia);
		if (!idDiaSemana) {
			toast.error(`Dia da semana "${dia}" não encontrado no sistema`);
			return;
		}

		const semestreNumero = parseInt(semestre.replace("º Semestre", ""));

		try {
			setSalvando(true);
			await api.put(`/celula/${idCelula}`, {
				idDisciplina: parseInt(formData.disciplinaId),
				idProfessor: parseInt(formData.professorId),
				idDiaSemana,
				semestre: semestreNumero,
			});
			toast.success("Aula atualizada com sucesso!");
			onUpdate();
		} catch (error: any) {
			let mensagemErro = "Erro ao atualizar a aula";

			if (error.response?.data?.error) {
				mensagemErro = error.response.data.error;
			} else if (error.response?.data?.message) {
				mensagemErro = error.response.data.message;
			} else if (error.response?.data?.msg) {
				mensagemErro = error.response.data.msg;
			} else if (typeof error.response?.data === "string") {
				mensagemErro = error.response.data;
			} else if (error.message) {
				mensagemErro = error.message;
			}

			toast.error(mensagemErro, {
				duration: 4000,
				position: "top-center",
			});
		} finally {
			setSalvando(false);
		}
	};

	if (!isOpen) return null;

	// Modo de edição: exibe selects de disciplina e professor
	if (editando) {
		return (
			<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
				<div className='bg-white rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto'>
					<div className='flex justify-center mb-4 sm:mb-6'>
						<div className='w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center'>
							<svg
								className='w-6 h-6 sm:w-8 sm:h-8 text-blue-600'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
								/>
							</svg>
						</div>
					</div>

					<h2 className='text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-8 text-gray-800'>
						Editar Aula
					</h2>

					{loading ? (
						<div className='text-center py-8'>Carregando opções...</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8'>
							<div className='flex flex-col'>
								<label className='block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-700'>
									Disciplina
								</label>
								<select
									value={formData.disciplinaId}
									onChange={(e) =>
										setFormData({
											disciplinaId: e.target.value,
											professorId: "",
										})
									}
									className='w-full h-10 sm:h-12 border border-gray-300 rounded-lg pl-3 sm:pl-4 pr-8 text-sm sm:text-base text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								>
									<option value=''>Selecione a disciplina</option>
									{disciplinas.map((disciplina) => (
										<option
											key={disciplina.idDisciplina}
											value={disciplina.idDisciplina}
										>
											{disciplina.codigoDisciplina} -{" "}
											{disciplina.nomeDisciplina}
										</option>
									))}
								</select>
							</div>

							<div className='flex flex-col'>
								<label className='block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-700'>
									Professor
								</label>
								<select
									value={formData.professorId}
									onChange={(e) =>
										setFormData({ ...formData, professorId: e.target.value })
									}
									disabled={!formData.disciplinaId || loadingProfessores}
									className='w-full h-10 sm:h-12 border border-gray-300 rounded-lg pl-3 sm:pl-4 pr-8 text-sm sm:text-base text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
								>
									<option value=''>
										{loadingProfessores
											? "Carregando..."
											: !formData.disciplinaId
												? "Selecione disciplina"
												: "Selecione professor"}
									</option>
									{professores.map((professor) => (
										<option
											key={professor.idProfessor}
											value={professor.idProfessor}
										>
											{professor.nomeProfessor}
											{professor.titulacao && ` (${professor.titulacao})`}
										</option>
									))}
								</select>
							</div>

							<div className='flex flex-col'>
								<label className='block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-700'>
									Horário
								</label>
								<div className='w-full h-10 sm:h-12 border border-gray-300 rounded-lg px-3 sm:px-4 text-sm sm:text-base text-gray-700 bg-gray-50 flex items-center'>
									<span className='truncate'>
										{dia} - {semestre}
									</span>
								</div>
							</div>
						</div>
					)}

					<div className='flex flex-col sm:flex-row justify-center gap-3 sm:gap-4'>
						<button
							onClick={() => setEditando(false)}
							className='w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base'
						>
							Voltar
						</button>
						<button
							onClick={handleSalvar}
							disabled={salvando || loading || loadingProfessores}
							className='w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm sm:text-base'
						>
							{salvando ? "Salvando..." : "Salvar"}
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Modo padrão: exibe conteúdo com opções de editar ou excluir
	return (
		<div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl'>
				<div className='flex justify-center mb-6'>
					<div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
						<svg
							className='w-8 h-8 text-gray-600'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
							/>
						</svg>
					</div>
				</div>

				<h2 className='text-2xl font-bold text-center mb-4 text-gray-800'>
					Aula Cadastrada
				</h2>

				<div className='bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200'>
					<p className='text-sm text-gray-700 whitespace-pre-line text-center font-medium'>
						{conteudo}
					</p>
				</div>

				<p className='text-center text-gray-500 text-sm mb-6'>
					O que deseja fazer com esta aula?
				</p>

				<div className='flex flex-col sm:flex-row justify-center gap-3'>
					<button
						onClick={onClose}
						className='w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors'
					>
						Cancelar
					</button>
					<button
						onClick={() => setEditando(true)}
						className='w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
					>
						Editar
					</button>
					<button
						onClick={onDelete}
						className='w-full sm:w-auto px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors'
					>
						Excluir
					</button>
				</div>
			</div>
		</div>
	);
}
