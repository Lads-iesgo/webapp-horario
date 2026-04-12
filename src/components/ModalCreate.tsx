"use client";
import api from "@/services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Professor, Disciplina, ModalProps } from "../interfaces/types";

export default function Modal({
	isOpen,
	onClose,
	onSave,
	dia,
	semestre,
	idGrade,
	idCelula,
	idCurso,
}: ModalProps) {
	const [professores, setProfessores] = useState<Professor[]>([]);
	const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingProfessores, setLoadingProfessores] = useState(false);
	const [formData, setFormData] = useState({
		professorId: "",
		disciplinaId: "",
	});

	useEffect(() => {
		if (isOpen) {
			carregarDisciplinas();
			setFormData({
				professorId: "",
				disciplinaId: "",
			});
			setProfessores([]);
		}
	}, [isOpen]);

	// Carregar professores quando uma disciplina for selecionada
	useEffect(() => {
		if (formData.disciplinaId) {
			carregarProfessoresPorDisciplina(parseInt(formData.disciplinaId));
		} else {
			setProfessores([]);
			setFormData((prev) => ({ ...prev, professorId: "" }));
		}
	}, [formData.disciplinaId]);

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
			const unicas = filtradas.filter(
				(d, i, arr) =>
					arr.findIndex((x) => x.idDisciplina === d.idDisciplina) === i,
			);
			setDisciplinas(unicas);
		} catch (error) {
			toast.error("Erro ao carregar disciplinas");
		} finally {
			setLoading(false);
		}
	};

	const carregarProfessoresPorDisciplina = async (idDisciplina: number) => {
		try {
			setLoadingProfessores(true);
			const professoresResponse = await api.get<Professor[]>(
				`/professorDisciplina/${idDisciplina}`,
			);
			const unicos = professoresResponse.data.filter(
				(p, i, arr) =>
					arr.findIndex((x) => x.idProfessor === p.idProfessor) === i,
			);
			setProfessores(unicos);
		} catch (error) {
			setProfessores([]);
			toast.error("Erro ao carregar professores");
		} finally {
			setLoadingProfessores(false);
		}
	};

	// Mapeamento fixo: banco armazena 1=Segunda, 2=Terça, ..., 6=Sábado
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

		if (!idGrade) {
			toast.error("Nenhuma grade selecionada");
			return;
		}

		const professorSelecionado = professores.find(
			(p) => p.idProfessor.toString() === formData.professorId,
		);
		const disciplinaSelecionada = disciplinas.find(
			(d) => d.idDisciplina.toString() === formData.disciplinaId,
		);

		if (!professorSelecionado || !disciplinaSelecionada) {
			toast.error("Erro ao encontrar professor ou disciplina selecionados");
			return;
		}

		// Extrair o número do semestre (ex: "1º Semestre" -> 1)
		const semestreNumero = parseInt(semestre.replace("º Semestre", ""));

		// Obter o ID do dia da semana do banco de dados
		const idDiaSemana = getDiaSemanaId(dia);

		if (!idDiaSemana) {
			toast.error(`Dia da semana "${dia}" não encontrado no sistema`);
			return;
		}

		// Construir conteúdo para exibição na célula
		const conteudo = `${disciplinaSelecionada.codigoDisciplina} - ${disciplinaSelecionada.nomeDisciplina}\n${disciplinaSelecionada.tipoSala}\n${professorSelecionado.nomeProfessor} (${professorSelecionado.titulacao})`;

		try {
			const payload = {
				idGrade: idGrade,
				idDisciplina: parseInt(formData.disciplinaId),
				idProfessor: parseInt(formData.professorId),
				idDiaSemana: idDiaSemana,
				semestre: semestreNumero,
			};

			await api.post("/celula", payload);
			toast.success("Aula cadastrada com sucesso!");
			onSave(conteudo);
		} catch (error: any) {
			let mensagemErro = "Erro ao salvar os dados";

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
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto'>
				<div className='flex justify-center mb-4 sm:mb-6'>
					<div className='w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center'>
						<svg
							className='w-6 h-6 sm:w-8 sm:h-8 text-green-600'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M5 13l4 4L19 7'
							/>
						</svg>
					</div>
				</div>

				<h2 className='text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-8 text-gray-800'>
					Adicionar Aula
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
										...formData,
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
										{disciplina.codigoDisciplina} - {disciplina.nomeDisciplina}
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
						onClick={onClose}
						className='w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base'
					>
						Voltar
					</button>
					<button
						onClick={handleSalvar}
						disabled={loading || loadingProfessores}
						className='w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 text-sm sm:text-base'
					>
						Criar
					</button>
				</div>
			</div>
		</div>
	);
}
