"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import {
	Disciplina,
	DisciplinaSelectorProps,
	Professor,
} from "@/interfaces/types";
import { AxiosResponse } from "axios";
import ResumoSelecao from "./ResumoSelecao";

interface Curso {
	idCurso: number;
	nomeCurso: string;
	duracaoSemestres: number;
}

export default function DisciplinaSelector({
	courseId,
	onChange,
	className = "",
}: DisciplinaSelectorProps) {
	const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
	const [curso, setCurso] = useState<Curso | null>(null);
	const [selecionados, setSelecionados] = useState<number[]>([]);
	const [professores, setProfessores] = useState<Professor[]>([]);
	const [professorSelecionado, setProfessorSelecionado] = useState<
		number | null
	>(null);
	const [semestreSelecionado, setSemestreSelecionado] = useState<number | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Carregar professores do curso selecionado
	useEffect(() => {
		if (!courseId) {
			setProfessores([]);
			return;
		}

		const carregarProfessores = async () => {
			try {
				const response: AxiosResponse<Professor[]> = await api.get(
					`/professor/curso/${courseId}`,
				);

				const professoresData: Professor[] = Array.isArray(response.data)
					? response.data
					: [];

				const professoresUnicos = [...new Map(professoresData.map((p) => [p.idProfessor, p])).values()];

				setProfessores(professoresUnicos);
			} catch (err) {
				setProfessores([]);
			}
		};

		carregarProfessores();
	}, [courseId]);

	// Carregar dados do curso e disciplinas
	useEffect(() => {
		if (!courseId) {
			setDisciplinas([]);
			setCurso(null);
			return;
		}

		const carregarDados = async () => {
			try {
				setLoading(true);
				setError(null);

				// Buscar dados do curso e disciplinas em paralelo com tipagem explícita
				const [cursoRes, disciplinasRes]: [any, AxiosResponse<Disciplina[]>] =
					await Promise.all([
						api.get(`/curso/${courseId}`),
						api.get<Disciplina[]>(`/disciplina/curso/${courseId}`),
					]);

				// A API retorna um array, pegar o primeiro elemento
				const dadosCurso = Array.isArray(cursoRes.data)
					? cursoRes.data[0]
					: cursoRes.data;

				// Definir curso
				setCurso(dadosCurso || null);

				// Processar disciplinas com tipagem explícita
				const disciplinasArray: Disciplina[] = Array.isArray(
					disciplinasRes.data,
				)
					? disciplinasRes.data
					: [];

				const disciplinasUnicas = [...new Map(disciplinasArray.map((d) => [d.idDisciplina, d])).values()];

				setDisciplinas(disciplinasUnicas || []);
			} catch (err: any) {
				setError("Erro ao carregar dados");
			} finally {
				setLoading(false);
			}
		};

		carregarDados();
	}, [courseId]);

	const toggle = useCallback((id: number) => {
		setSelecionados((prev) => {
			const novo = prev.includes(id)
				? prev.filter((i) => i !== id)
				: [...prev, id];
			onChange?.(novo, professorSelecionado);
			return novo;
		});
	}, [professorSelecionado, onChange]);

	const removerDisciplina = useCallback((id: number) => {
		setSelecionados((prev) => {
			const novo = prev.filter((i) => i !== id);
			onChange?.(novo, professorSelecionado);
			return novo;
		});
	}, [professorSelecionado, onChange]);

	const handleProfessorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const professorId = e.target.value ? Number(e.target.value) : null;
		setProfessorSelecionado(professorId);
		onChange?.(selecionados, professorId);
	}, [selecionados, onChange]);

	// Agrupar disciplinas por semestre (periodo vem do curso_disciplina, semestreDisciplina é fallback)
	const disciplinasPorSemestre = useMemo(() => {
		return disciplinas.reduce(
			(acc, disc) => {
				const semestre = (disc as any).periodo ?? disc.semestreDisciplina ?? 1;
				if (!acc[semestre]) {
					acc[semestre] = [];
				}
				acc[semestre].push(disc);
				return acc;
			},
			{} as Record<number, Disciplina[]>,
		);
	}, [disciplinas]);

	// Gerar array de semestres baseado na duração do curso
	const semestres = useMemo(() => {
		return curso
			? Array.from({ length: curso.duracaoSemestres }, (_, i) => i + 1)
			: [];
	}, [curso]);

	// Filtrar disciplinas do semestre selecionado
	const disciplinasFiltradas = useMemo(() => {
		return semestreSelecionado
			? disciplinasPorSemestre[semestreSelecionado] || []
			: [];
	}, [semestreSelecionado, disciplinasPorSemestre]);

	// Obter disciplinas selecionadas
	const disciplinasSelecionadas = useMemo(() => {
		return disciplinas.filter((d) => selecionados.includes(d.idDisciplina));
	}, [disciplinas, selecionados]);

	// Obter nome do professor selecionado
	const professorSelecionadoNome = useMemo(() => {
		return professores.find(
			(p) => p.idProfessor === professorSelecionado,
		)?.nomeProfessor;
	}, [professores, professorSelecionado]);

	if (error) {
		return <span className='text-sm text-red-600'>{error}</span>;
	}

	return (
		<div className={`flex flex-col gap-6 ${className}`}>
			{/* Seletor de Professor */}
			<div className='flex flex-col gap-2'>
				<label
					htmlFor='professor-select'
					className='text-gray-800 font-semibold text-base sm:text-lg'
				>
					Selecione o professor
				</label>
				<select
					id='professor-select'
					value={professorSelecionado || ""}
					onChange={handleProfessorChange}
					className='w-full h-10 sm:h-12 border-2 border-gray-300 rounded-2xl px-3 sm:px-4 text-sm sm:text-base text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				>
					<option value=''>Selecione um professor</option>
					{professores.map((prof) => (
						<option key={prof.idProfessor} value={prof.idProfessor}>
							{prof.nomeProfessor}
						</option>
					))}
				</select>
			</div>

			{/* Container de Semestres e Disciplinas */}
			<div className='flex flex-col gap-4'>
				<label className='text-gray-800 font-semibold text-base sm:text-lg'>
					Selecione o semestre e as disciplinas
				</label>

				{loading ? (
					<span className='text-sm text-gray-600'>
						Carregando disciplinas...
					</span>
				) : !courseId ? (
					<span className='text-sm text-gray-600'>
						Nenhum curso selecionado
					</span>
				) : semestres.length > 0 ? (
					<div className='flex flex-col gap-4'>
						{/* Botões de Semestres */}
						<div className='flex flex-wrap gap-3'>
							{semestres.map((semestre) => {
								const qtdDisciplinas =
									disciplinasPorSemestre[semestre]?.length || 0;
								return (
									<button
										key={`semestre-${semestre}`}
										type='button'
										onClick={() => setSemestreSelecionado(semestre)}
										className={`px-6 py-2.5 rounded-2xl border-2 transition-colors font-medium text-sm sm:text-base
                                        ${
																					semestreSelecionado === semestre
																						? "bg-green-700 text-white border-green-700 hover:bg-green-800 hover:border-green-800"
																						: "bg-white text-gray-800 border-gray-800 hover:bg-gray-100"
																				}
                                    `}
									>
										{semestre}º Semestre ({qtdDisciplinas})
									</button>
								);
							})}
						</div>

						{/* Disciplinas do Semestre Selecionado */}
						{semestreSelecionado ? (
							<div className='border-2 border-gray-300 rounded-2xl p-6 bg-gray-50'>
								<h3 className='text-gray-800 font-semibold text-base sm:text-lg mb-4'>
									Disciplinas do {semestreSelecionado}º Semestre
								</h3>
								<div className='flex flex-wrap gap-3'>
									{disciplinasFiltradas.length > 0 ? (
										disciplinasFiltradas.map((d) => {
											const id = d.idDisciplina;
											const ativo = selecionados.includes(id);
											return (
												<button
													key={`disciplina-${id}`}
													type='button'
													onClick={() => toggle(id)}
													className={`px-4 py-2 rounded-2xl border-2 transition-colors text-sm sm:text-base whitespace-nowrap
                                                    ${
																											ativo
																												? "bg-blue-800 text-white border-blue-800 hover:bg-blue-950 hover:border-blue-950"
																												: "bg-white text-gray-800 border-gray-800 hover:bg-gray-200"
																										}
                                                `}
													title={d.nomeDisciplina}
												>
													{d.nomeDisciplina}
												</button>
											);
										})
									) : (
										<span className='text-sm text-gray-600'>
											Nenhuma disciplina cadastrada neste semestre
										</span>
									)}
								</div>
							</div>
						) : (
							<div className='border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center'>
								<span className='text-gray-500 text-sm sm:text-base'>
									👆 Selecione um semestre acima para ver as disciplinas
								</span>
							</div>
						)}
					</div>
				) : (
					<div className='flex flex-col gap-2 text-sm text-gray-600'>
						<span>❌ Nenhum curso encontrado</span>
						<span className='text-xs text-gray-500'>
							Verifique se o curso existe no backend
						</span>
					</div>
				)}
			</div>

			{/* Resumo das Disciplinas Selecionadas */}
			<ResumoSelecao
				professorNome={professorSelecionadoNome}
				disciplinas={disciplinasSelecionadas}
				onRemoverDisciplina={removerDisciplina}
			/>
		</div>
	);
}
