"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosError } from "axios";

export default function LoginPage() {
	const { login, isLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();

		if (!email.trim() || !senha.trim()) {
			toast.error("Preencha todos os campos");
			return;
		}

		setSubmitting(true);
		try {
			await login(email, senha);
		} catch (error) {
			if (error instanceof AxiosError && error.response?.data?.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error("Erro ao fazer login. Tente novamente.");
			}
		} finally {
			setSubmitting(false);
		}
	}

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-100'>
				<div className='animate-spin rounded-full h-10 w-10 border-4 border-blue-900 border-t-transparent' />
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
			<div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
				<div className='flex flex-col items-center mb-8'>
					<Image
						src='/logo-iesgo.png'
						width={140}
						height={53}
						alt='Logo IESGO'
						style={{ width: "auto", height: "auto" }}
						priority
					/>
					<h1 className='text-2xl font-bold text-blue-900 mt-4'>
						Grade Horários
					</h1>
					<p className='text-gray-500 text-sm mt-1'>
						Faça login para acessar o sistema
					</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-5'>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Email
						</label>
						<input
							id='email'
							type='email'
							placeholder='seu@email.com'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
							disabled={submitting}
						/>
					</div>

					<div>
						<label
							htmlFor='senha'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Senha
						</label>
						<input
							id='senha'
							type='password'
							placeholder='Sua senha'
							value={senha}
							onChange={(e) => setSenha(e.target.value)}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
							disabled={submitting}
						/>
					</div>

					<button
						type='submit'
						disabled={submitting}
						className='w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{submitting ? "Entrando..." : "Entrar"}
					</button>
				</form>
			</div>
		</div>
	);
}
