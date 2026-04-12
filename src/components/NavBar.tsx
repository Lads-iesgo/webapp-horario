"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function NavBar() {
	const [isOpen, setIsOpen] = useState(false);
	const { usuario, logout } = useAuth();

	const perfil = usuario?.nomePerfil.toLowerCase();
	const isAdmin = perfil === "admin";
	const isProfessor = perfil === "professor";

	return (
		<>
			{/* Botão Menu Mobile */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='lg:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-3 rounded-lg shadow-lg'
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
						d='M4 6h16M4 12h16M4 18h16'
					/>
				</svg>
			</button>

			{/* Overlay para mobile */}
			{isOpen && (
				<div
					className='lg:hidden fixed inset-0 bg-black/50 z-40'
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* NavBar */}
			<div
				className={`
                    fixed bg-blue-900 top-0 h-screen overflow-y-auto z-50 transition-transform duration-300
                    w-72 left-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
			>
				<div className='flex flex-col h-full'>
					{/* Botão Fechar Mobile */}
					<button
						onClick={() => setIsOpen(false)}
						className='lg:hidden absolute top-4 right-4 text-white hover:bg-blue-800 rounded-lg p-2 transition-colors'
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

					{/* Logo e título no topo */}
					<div className='flex flex-col items-center py-8'>
						<Image
							src='/logo-iesgo.png'
							width={120}
							height={45}
							alt='Logo IESGO'
							className='mb-2'
							style={{ width: "auto", height: "auto" }}
						/>
						<h2 className='text-white text-xl font-semibold tracking-wide uppercase text-center px-4'>
							Grade Horários
						</h2>
					</div>

					{/* Links de navegação */}
					<nav className='flex-1 px-4 py-4'>
						<ul className='space-y-2'>
							<li>
								<Link
									href='/home'
									onClick={() => setIsOpen(false)}
									className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
								>
									<span className='text-lg'>Home</span>
								</Link>
							</li>
							{isAdmin && (
								<>
									<li>
										<Link
											href='/cadastroCurso'
											onClick={() => setIsOpen(false)}
											className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
										>
											<span className='text-lg'>
												Cadastro Curso
											</span>
										</Link>
									</li>
									<li>
										<Link
											href='/cadastroSala'
											onClick={() => setIsOpen(false)}
											className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
										>
											<span className='text-lg'>
												Cadastrar Sala
											</span>
										</Link>
									</li>
									<li>
										<Link
											href='/professores'
											onClick={() => setIsOpen(false)}
											className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
										>
											<span className='text-lg'>
												Professores
											</span>
										</Link>
									</li>
								</>
							)}
							{!isProfessor && (
								<>
									<li>
										<Link
											href='/cadastroDisciplina'
											onClick={() => setIsOpen(false)}
											className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
										>
											<span className='text-lg'>
												Cadastro Disciplina
											</span>
										</Link>
									</li>
									<li>
										<Link
											href='/cadastroProfessor'
											onClick={() => setIsOpen(false)}
											className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
										>
											<span className='text-lg'>
												Cadastro Professor
											</span>
										</Link>
									</li>
									<li>
										<Link
											href='/vincularDisciplinaProfessor'
											onClick={() => setIsOpen(false)}
											className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
										>
											<span className='text-lg'>
												Vincular Professor a Disciplina
											</span>
										</Link>
									</li>
								</>
							)}
						</ul>
					</nav>

					{/* Info do usuário e logout */}
					{usuario && (
						<div className='px-4 py-4 border-t border-blue-800'>
							<div className='px-4 py-2 mb-2'>
								<p className='text-white text-sm font-medium truncate'>
									{usuario.nomeUsuario}
								</p>
								<span className='inline-block mt-1 text-xs bg-blue-700 text-blue-100 px-2 py-0.5 rounded-full'>
									{usuario.nomePerfil}
								</span>
							</div>
							<button
								onClick={logout}
								className='flex items-center w-full text-gray-300 hover:bg-red-700 hover:text-white rounded-lg px-4 py-3 transition-colors'
							>
								<svg
									className='w-5 h-5 mr-3'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
									/>
								</svg>
								<span className='text-lg'>Sair</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
