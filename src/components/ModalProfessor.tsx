"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

interface ProfessorDetalhe {
	idProfessor: number;
	nomeProfessor: string;
	email: string | null;
	titulacao: string;
	curriculoLattes: string | null;
}

interface DisciplinaVinculada {
	idDisciplina: number;
	nomeDisciplina: string;
}

interface Disponibilidade {
	idDiaSemana: number;
	diaSemana: string;
}

interface Alocacao {
	disciplina: string;
	dia_semana: string;
	curso: string;
}

interface ModalProfessorProps {
	isOpen: boolean;
	onClose: () => void;
	idProfessor: number | null;
}

const titulacaoLabel: Record<string, string> = {
	graduado: "Graduado",
	especialista: "Especialista",
	mestre: "Mestre",
	doutor: "Doutor",
	doutora: "Doutora",
};

export default function ModalProfessor({
	isOpen,
	onClose,
	idProfessor,
}: ModalProfessorProps) {
	const [professor, setProfessor] = useState<ProfessorDetalhe | null>(null);
	const [disciplinas, setDisciplinas] = useState<DisciplinaVinculada[]>([]);
	const [disponibilidade, setDisponibilidade] = useState<Disponibilidade[]>([]);
	const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isOpen || !idProfessor) return;

		const carregarDados = async () => {
			setLoading(true);
			try {
				const [profRes, dispRes, discRes, celRes] = await Promise.allSettled([
					api.get(`/professor/${idProfessor}`),
					api.get(`/disponibilidade/${idProfessor}`),
					api.get("/professorDisciplina"),
					api.get("/celula"),
				]);

				if (profRes.status === "fulfilled") {
					setProfessor(profRes.value.data);
				}

				if (dispRes.status === "fulfilled") {
					setDisponibilidade(
						Array.isArray(dispRes.value.data) ? dispRes.value.data : [],
					);
				} else {
					setDisponibilidade([]);
				}

				if (discRes.status === "fulfilled") {
					const todasDisc: any[] = Array.isArray(discRes.value.data)
						? discRes.value.data
						: [];
					setDisciplinas(
						todasDisc
							.filter((d) => d.idProfessor === idProfessor)
							.map((d) => ({
								idDisciplina: d.idDisciplina,
								nomeDisciplina: d.nomeDisciplina,
							})),
					);
				} else {
					setDisciplinas([]);
				}

				if (celRes.status === "fulfilled") {
					const todasCel: any[] = Array.isArray(celRes.value.data)
						? celRes.value.data
						: [];
					setAlocacoes(
						todasCel
							.filter((c) => c.idProfessor === idProfessor)
							.map((c) => ({
								disciplina: c.disciplina || c.nomeDisciplina,
								dia_semana: c.dia_semana || c.diaSemana,
								curso: c.curso || c.nomeCurso,
							})),
					);
				} else {
					setAlocacoes([]);
				}
			} catch (error) {
			} finally {
				setLoading(false);
			}
		};

		carregarDados();
	}, [isOpen, idProfessor]);

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
			onClick={onClose}
		>
			<div
				className='bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl'
				onClick={(e) => e.stopPropagation()}
			>
				{loading ? (
					<div className='flex items-center justify-center p-12'>
						<span className='text-gray-500 text-lg'>Carregando...</span>
					</div>
				) : professor ? (
					<>
						{/* Header do modal */}
						<div className='bg-blue-900 text-white px-6 py-5 rounded-t-2xl flex items-center justify-between'>
							<div>
								<h2 className='text-xl font-bold'>{professor.nomeProfessor}</h2>
								<span className='text-blue-200 text-sm'>
									{titulacaoLabel[professor.titulacao] || professor.titulacao}
								</span>
							</div>
							<button
								onClick={onClose}
								className='text-white hover:bg-blue-800 rounded-lg p-2 transition-colors'
							>
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						{/* Conteudo */}
						<div className='px-6 py-5 flex flex-col gap-5'>
							{/* Contato */}
							<section>
								<h3 className='text-gray-800 font-semibold text-base mb-2'>
									Contato
								</h3>
								<div className='bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm'>
									<div className='flex gap-2'>
										<span className='text-gray-500 font-medium min-w-[60px]'>
											Email:
										</span>
										<span className='text-gray-800'>
											{professor.email || "Nao informado"}
										</span>
									</div>
									<div className='flex gap-2'>
										<span className='text-gray-500 font-medium min-w-[60px]'>
											Lattes:
										</span>
										{professor.curriculoLattes ? (
											<a
												href={professor.curriculoLattes}
												target='_blank'
												rel='noopener noreferrer'
												className='text-blue-600 hover:underline break-all'
											>
												{professor.curriculoLattes}
											</a>
										) : (
											<span className='text-gray-400'>Nao informado</span>
										)}
									</div>
								</div>
							</section>

							{/* Disponibilidade */}
							<section>
								<h3 className='text-gray-800 font-semibold text-base mb-2'>
									Disponibilidade
								</h3>
								<div className='flex flex-wrap gap-2'>
									{disponibilidade.length > 0 ? (
										disponibilidade.map((d) => (
											<span
												key={d.idDiaSemana}
												className='px-3 py-1.5 bg-green-100 text-green-800 rounded-xl text-sm font-medium border border-green-200'
											>
												{d.diaSemana}
											</span>
										))
									) : (
										<span className='text-gray-400 text-sm'>
											Nenhuma disponibilidade cadastrada
										</span>
									)}
								</div>
							</section>

							{/* Disciplinas que pode lecionar */}
							<section>
								<h3 className='text-gray-800 font-semibold text-base mb-2'>
									Disciplinas que pode lecionar
								</h3>
								<div className='flex flex-wrap gap-2'>
									{disciplinas.length > 0 ? (
										disciplinas.map((d) => (
											<span
												key={d.idDisciplina}
												className='px-3 py-1.5 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium border border-blue-200'
											>
												{d.nomeDisciplina}
											</span>
										))
									) : (
										<span className='text-gray-400 text-sm'>
											Nenhuma disciplina vinculada
										</span>
									)}
								</div>
							</section>

							{/* Disciplinas que esta lecionando */}
							<section>
								<h3 className='text-gray-800 font-semibold text-base mb-2'>
									Lecionando atualmente
								</h3>
								{alocacoes.length > 0 ? (
									<div className='bg-gray-50 rounded-xl overflow-hidden border border-gray-200'>
										<table className='w-full text-sm'>
											<thead>
												<tr className='bg-gray-100 text-gray-600'>
													<th className='text-left px-4 py-2 font-medium'>
														Disciplina
													</th>
													<th className='text-left px-4 py-2 font-medium'>
														Dia
													</th>
													<th className='text-left px-4 py-2 font-medium'>
														Curso
													</th>
												</tr>
											</thead>
											<tbody>
												{alocacoes.map((a, i) => (
													<tr key={i} className='border-t border-gray-200'>
														<td className='px-4 py-2 text-gray-800'>
															{a.disciplina}
														</td>
														<td className='px-4 py-2 text-gray-600'>
															{a.dia_semana}
														</td>
														<td className='px-4 py-2 text-gray-600'>
															{a.curso}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<span className='text-gray-400 text-sm'>
										Nenhuma aula alocada no momento
									</span>
								)}
							</section>
						</div>

						{/* Footer */}
						<div className='px-6 py-4 border-t border-gray-200 flex justify-between items-center'>
							<button
								type='button'
								disabled
								className='px-5 py-2.5 bg-red-100 text-red-400 rounded-xl text-sm font-medium border border-red-200 cursor-not-allowed'
								title='Funcionalidade sera implementada em breve'
							>
								Desativar Professor
							</button>
							<button
								type='button'
								onClick={onClose}
								className='px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors'
							>
								Fechar
							</button>
						</div>
					</>
				) : (
					<div className='flex items-center justify-center p-12'>
						<span className='text-gray-500'>Professor nao encontrado</span>
					</div>
				)}
			</div>
		</div>
	);
}
