"use client";
import api from "@/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

import {
	CelulaViewInterface,
	ModalData,
	Grade,
	Curso,
} from "../interfaces/types";

import ModalCreate from "./ModalCreate";
import ModalDelete from "./ModalDelete";

const dias = [
	"Segunda-feira",
	"Terça-feira",
	"Quarta-feira",
	"Quinta-feira",
	"Sexta-feira",
	"Sábado",
];

const gerarSemestres = (quantidade: number, apenasImpares = true) => {
	const lista: string[] = [];
	for (let i = 1; i <= quantidade; i++) {
		const ehImpar = i % 2 !== 0;
		if (apenasImpares && ehImpar) {
			lista.push(`${i}º Semestre`);
		} else if (!apenasImpares && !ehImpar) {
			lista.push(`${i}º Semestre`);
		}
	}
	return lista;
};

export default function Tabela() {
	const { usuario } = useAuth();
	const isAdmin = usuario?.nomePerfil.toLowerCase() === "admin";
	const cursoUsuario = usuario?.cursos?.[0]?.idCurso ?? 0;

	const [cursos, setCursos] = useState<Curso[]>([]);
	const [cursoSelecionado, setCursoSelecionado] =
		useState<number>(cursoUsuario);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [gradeSelecionada, setGradeSelecionada] = useState<number | null>(null);
	const [dados, setDados] = useState<{ [key: string]: string }>({});
	const [celulasMap, setCelulasMap] = useState<{ [key: string]: number }>({});
	const [loading, setLoading] = useState(true);
	const [loadingGrades, setLoadingGrades] = useState(true);
	const [modalAberto, setModalAberto] = useState(false);
	const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
	const [modalData, setModalData] = useState<ModalData | null>(null);
	const [celulaParaDeletar, setCelulaParaDeletar] = useState<{
		id: number;
		conteudo: string;
	} | null>(null);
	const [criandoGrade, setCriandoGrade] = useState(false);
	const [duracaoSemestres, setDuracaoSemestres] = useState<number>(8);

	const isProfessor = usuario?.nomePerfil.toLowerCase() === "professor";

	// Determinar semestres com base no semestreLetivo da grade selecionada
	const gradeAtual = useMemo(
		() => grades.find((g) => g.idGrade === gradeSelecionada),
		[grades, gradeSelecionada],
	);
	const apenasImpares = gradeAtual ? gradeAtual.semestreLetivo === 1 : true;
	const semestres = useMemo(
		() => gerarSemestres(duracaoSemestres, apenasImpares),
		[duracaoSemestres, apenasImpares],
	);

	// Normalizar dia_semana do backend para o formato da tabela
	const normalizarDiaSemana = useCallback((dia: string | number): string => {
		const valor = String(dia).toLowerCase().trim();
		const mapa: { [key: string]: string } = {
			segunda: "Segunda-feira",
			"segunda-feira": "Segunda-feira",
			terça: "Terça-feira",
			terca: "Terça-feira",
			"terça-feira": "Terça-feira",
			quarta: "Quarta-feira",
			"quarta-feira": "Quarta-feira",
			quinta: "Quinta-feira",
			"quinta-feira": "Quinta-feira",
			sexta: "Sexta-feira",
			"sexta-feira": "Sexta-feira",
			sábado: "Sábado",
			sabado: "Sábado",
			"1": "Segunda-feira",
			"2": "Terça-feira",
			"3": "Quarta-feira",
			"4": "Quinta-feira",
			"5": "Sexta-feira",
			"6": "Sábado",
		};
		return mapa[valor] || "";
	}, []);

	// Carregar todos os cursos (apenas para admin)
	const carregarCursos = async () => {
		try {
			const response = await api.get<Curso[]>("/curso");
			setCursos(response.data);
			// Se admin ainda não tem curso selecionado, selecionar o primeiro
			if (response.data.length > 0 && !cursoSelecionado) {
				setCursoSelecionado(response.data[0].idCurso);
			}
		} catch (error) {
			toast.error("Erro ao carregar cursos");
		}
	};

	// Carregar grades do curso selecionado
	const carregarGrades = async () => {
		if (!cursoSelecionado) return;

		try {
			setLoadingGrades(true);
			const response = await api.get<Grade[]>(`/grade?idCurso=${cursoSelecionado}`);
			const gradesDoCurso = response.data;
			setGrades(gradesDoCurso);

			// Selecionar a grade mais recente automaticamente
			if (gradesDoCurso.length > 0) {
				const maisRecente = [...gradesDoCurso].sort(
					(a, b) =>
						b.anoLetivo - a.anoLetivo || b.semestreLetivo - a.semestreLetivo,
				)[0];
				setGradeSelecionada(maisRecente.idGrade);
			} else {
				setGradeSelecionada(null);
			}
		} catch (error) {
			toast.error("Erro ao carregar grades");
		} finally {
			setLoadingGrades(false);
		}
	};

	const carregarDados = async () => {
		if (!gradeSelecionada) {
			setDados({});
			setCelulasMap({});
			setLoading(false);
			return;
		}

		try {
			setLoading(true);

			// Buscar dados de células
			const celulasResponse = await api.get<CelulaViewInterface[]>("/celula");

			// Filtrar apenas as células da grade selecionada
			// Comparar como number para evitar mismatch de tipo (string vs number)
			const celulasGrade = celulasResponse.data.filter(
				(celula) => Number(celula.idGrade) === gradeSelecionada,
			);

			// Mapear os dados da API para o formato do estado
			const dadosMapeados: { [key: string]: string } = {};
			const celulasIdMap: { [key: string]: number } = {};

			celulasGrade.forEach((celula: CelulaViewInterface) => {
				// Normalizar dia_semana do backend
				const diaSemana = normalizarDiaSemana(celula.dia_semana);

				if (!diaSemana || !dias.includes(diaSemana)) {
					return;
				}

				// Usar semestreCelula (campo real do backend)
				const semestreNumero = celula.semestreCelula || 1;

				// Criar a chave usando dia_semana e semestre
				const chave = `${diaSemana}-${semestreNumero}º Semestre`;

				// Armazenar o ID da célula
				if (celula.idCelula !== undefined && celula.idCelula !== null) {
					celulasIdMap[chave] = celula.idCelula;
				}

				// Construir o conteúdo formatado
				const linhas: string[] = [];

				// Linha 1: Código + Nome da Disciplina
				if (celula.codigoDisciplina && celula.disciplina) {
					linhas.push(`${celula.codigoDisciplina} - ${celula.disciplina}`);
				} else if (celula.disciplina) {
					linhas.push(celula.disciplina);
				}

				// Linha 2: Tipo de Sala
				if (celula.tipo_sala) {
					linhas.push(`${celula.tipo_sala}`);
				}

				// Linha 3: Professor + Titulação
				if (celula.professor && celula.titulacao) {
					linhas.push(`${celula.professor} (${celula.titulacao})`);
				} else if (celula.professor) {
					linhas.push(celula.professor);
				}

				const conteudo = linhas.join("\n");
				dadosMapeados[chave] = conteudo;
			});

			setDados(dadosMapeados);
			setCelulasMap(celulasIdMap);
		} catch (error) {
			toast.error("Erro ao carregar dados da tabela");
		} finally {
			setLoading(false);
		}
	};

	// Admin: carregar lista de cursos ao montar
	useEffect(() => {
		if (isAdmin) {
			carregarCursos();
		}
	}, [isAdmin]);

	// Carregar duracao do curso e grades quando o curso selecionado mudar
	useEffect(() => {
		if (!cursoSelecionado) return;
		setLoadingGrades(true);
		Promise.all([
			api.get<Grade[]>(`/grade?idCurso=${cursoSelecionado}`),
			api.get(`/curso/${cursoSelecionado}`),
		]).then(([gradesRes, cursoRes]) => {
			const gradesDoCurso = gradesRes.data;
			setGrades(gradesDoCurso);
			if (gradesDoCurso.length > 0) {
				const maisRecente = [...gradesDoCurso].sort(
					(a, b) => b.anoLetivo - a.anoLetivo || b.semestreLetivo - a.semestreLetivo,
				)[0];
				setGradeSelecionada(maisRecente.idGrade);
			} else {
				setGradeSelecionada(null);
			}
			const dados = Array.isArray(cursoRes.data) ? cursoRes.data[0] : cursoRes.data;
			if (dados?.duracaoSemestres) setDuracaoSemestres(dados.duracaoSemestres);
			setLoadingGrades(false);
		}).catch(() => {
			toast.error("Erro ao carregar dados do curso");
			setLoadingGrades(false);
		});
	}, [cursoSelecionado]);

	// Recarregar células quando a grade selecionada mudar
	useEffect(() => {
		carregarDados();
	}, [gradeSelecionada]);

	const handleCellClick = (dia: string, semestre: string) => {
		if (!gradeSelecionada) {
			toast.error("Selecione uma grade antes de adicionar aulas");
			return;
		}

		const chave = `${dia}-${semestre}`;
		const idCelula = celulasMap[chave];
		const conteudo = dados[chave];

		// Verifica se tem conteúdo (célula preenchida)
		if (conteudo && conteudo.trim() !== "") {
			// Célula já existe - abrir modal de exclusão
			setCelulaParaDeletar({ id: idCelula || 0, conteudo });
			setModalDeleteAberto(true);
		} else {
			// Célula vazia - abrir modal de criação
			setModalData({ dia, semestre, chave });
			setModalAberto(true);
		}
	};

	const handleDeletar = async () => {
		if (!celulaParaDeletar) return;

		try {
			await api.delete(`/celula/${celulaParaDeletar.id}`);
			toast.success("Aula excluída com sucesso!");
			setModalDeleteAberto(false);
			setCelulaParaDeletar(null);
			await carregarDados();
		} catch (error: any) {
			let mensagemErro = "Erro ao excluir a aula";

			if (error.response?.data?.error) {
				mensagemErro = error.response.data.error;
			} else if (error.response?.data?.message) {
				mensagemErro = error.response.data.message;
			} else if (typeof error.response?.data === "string") {
				mensagemErro = error.response.data;
			}

			toast.error(mensagemErro);
		}
	};

	const handleSalvar = async (conteudo: string) => {
		if (!modalData) return;

		// Atualizar o estado local imediatamente para feedback visual
		setDados({ ...dados, [modalData.chave]: conteudo });
		setModalAberto(false);
		setModalData(null);

		// Sincronizar em background sem bloquear a UI
		carregarDados();
	};

	const handleFecharModal = () => {
		setModalAberto(false);
		setModalData(null);
	};

	const handleFecharModalDelete = () => {
		setModalDeleteAberto(false);
		setCelulaParaDeletar(null);
	};

	const handleCriarGrade = async () => {
		if (!cursoSelecionado) {
			toast.error("Selecione um curso primeiro");
			return;
		}

		// Calcular próxima grade com base na mais recente do curso
		let novoAno: number;
		let novoSemestre: number;

		if (grades.length > 0) {
			const maisRecente = [...grades].sort(
				(a, b) =>
					b.anoLetivo - a.anoLetivo || b.semestreLetivo - a.semestreLetivo,
			)[0];

			if (maisRecente.semestreLetivo === 2) {
				novoAno = maisRecente.anoLetivo + 1;
				novoSemestre = 1;
			} else {
				novoAno = maisRecente.anoLetivo;
				novoSemestre = 2;
			}
		} else {
			novoAno = new Date().getFullYear();
			novoSemestre = 1;
		}

		try {
			setCriandoGrade(true);
			await api.post("/grade", {
				idCurso: cursoSelecionado,
				anoLetivo: novoAno,
				semestreLetivo: novoSemestre,
			});

			toast.success(`Grade ${novoAno}.${novoSemestre} criada com sucesso!`);
			await carregarGrades();
		} catch (error: any) {
			let mensagemErro = "Erro ao criar grade";
			if (error.response?.data?.message) {
				mensagemErro = error.response.data.message;
			}
			toast.error(mensagemErro);
		} finally {
			setCriandoGrade(false);
		}
	};

	if (loadingGrades) {
		return (
			<div className='flex justify-center items-center min-h-screen lg:ml-72'>
				<div className='text-xl'>Carregando grades...</div>
			</div>
		);
	}

	if (grades.length === 0) {
		return (
			<div className='flex flex-col justify-center items-center min-h-screen lg:ml-72 gap-4'>
				<div className='text-xl text-gray-600'>
					Nenhuma grade encontrada para o seu curso.
				</div>
				{!isProfessor ? (
					<button
						type='button'
						onClick={handleCriarGrade}
						disabled={criandoGrade}
						className='px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{criandoGrade ? "Criando..." : "Criar primeira grade"}
					</button>
				) : (
					<p className='text-sm text-gray-400'>
						Solicite a um administrador ou coordenador que crie uma grade.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 lg:ml-72 pt-20'>
			{/* Seletores */}
			<div className='mb-4 flex flex-col sm:flex-row items-center gap-3'>
				{/* Seletor de Curso (apenas Admin) */}
				{isAdmin && (
					<>
						<label className='text-sm font-semibold text-gray-700'>
							Curso:
						</label>
						<select
							value={cursoSelecionado}
							onChange={(e) => setCursoSelecionado(Number(e.target.value))}
							className='h-10 border border-gray-300 rounded-lg px-4 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							{cursos.map((curso) => (
								<option key={curso.idCurso} value={curso.idCurso}>
									{curso.nomeCurso}
								</option>
							))}
						</select>
					</>
				)}

				{/* Seletor de Grade */}
				<label className='text-sm font-semibold text-gray-700'>Grade:</label>
				<select
					value={gradeSelecionada ?? ""}
					onChange={(e) => setGradeSelecionada(Number(e.target.value))}
					className='h-10 border border-gray-300 rounded-lg px-4 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				>
					{grades.length === 0 && (
						<option value=''>Nenhuma grade disponível</option>
					)}
					{grades.map((grade) => (
						<option key={grade.idGrade} value={grade.idGrade}>
							{grade.anoLetivo} - {grade.semestreLetivo}º Semestre
						</option>
					))}
				</select>

				{/* Botão Nova Grade (Admin e Coordenador) */}
				{!isProfessor && (
					<button
						type='button'
						onClick={handleCriarGrade}
						disabled={criandoGrade}
						className='h-10 px-4 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{criandoGrade ? "Criando..." : "+ Nova Grade"}
					</button>
				)}
			</div>

			{loading && (
				<div className='mb-4 text-gray-500 text-sm'>Carregando células...</div>
			)}

			<div className='w-full overflow-x-auto shadow-lg max-w-[95vw] lg:max-w-[1200px]'>
				<table className='border-separate border-spacing-0 border text-center w-full'>
					<thead>
						<tr className='bg-blue-900 text-white'>
							<th
								className='p-1 sm:p-2 h-16 sm:h-20 border border-black text-xs sm:text-sm lg:text-base sticky left-0 z-20 bg-blue-900'
								style={{ minWidth: "188px", width: "188px" }}
							>
								Dia
							</th>
							{semestres.map((s) => (
								<th
									key={s}
									className='p-1 sm:p-2 h-16 sm:h-20 border border-black text-xs sm:text-sm lg:text-base'
									style={{ width: `${100 / semestres.length}%` }}
								>
									{s}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{dias.map((dia) => (
							<tr key={dia}>
								<td
									className='border p-1 sm:p-2 font-semibold bg-gray-50 sticky left-0 z-10 h-20 sm:h-24 text-xs sm:text-sm lg:text-base'
									style={{ minWidth: "188px", width: "188px" }}
								>
									<div className='break-words'>{dia}</div>
								</td>
								{semestres.map((sem) => {
									const chave = `${dia}-${sem}`;
									const conteudo = dados[chave];
									return (
										<td
											key={chave}
											onClick={() => handleCellClick(dia, sem)}
											className='border p-1 sm:p-2 hover:bg-blue-50 cursor-pointer h-20 sm:h-24 overflow-hidden'
											style={{ width: `${100 / semestres.length}%` }}
											title={conteudo || chave}
										>
											<div className='h-full flex items-center justify-center overflow-auto text-[10px] sm:text-xs leading-tight whitespace-pre-line break-words'>
												{conteudo || ""}
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Modal de Criação */}
			{modalData && (
				<ModalCreate
					isOpen={modalAberto}
					onClose={handleFecharModal}
					onSave={handleSalvar}
					dia={modalData.dia}
					semestre={modalData.semestre}
					idGrade={gradeSelecionada ?? undefined}
					idCurso={cursoSelecionado}
				/>
			)}

			{/* Modal de Exclusão */}
			{celulaParaDeletar && (
				<ModalDelete
					isOpen={modalDeleteAberto}
					onClose={handleFecharModalDelete}
					onDelete={handleDeletar}
					conteudo={celulaParaDeletar.conteudo}
				/>
			)}
		</div>
	);
}
