"use client";

import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import FormCadastro from "@/components/FormCadastro";
import InputCadastro from "@/components/InputCadastro";

import api from "@/services/api";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function CadastroCurso() {
	const { usuario, isLoading } = useAuth();
	const router = useRouter();
	const [nomeCurso, setNomeCurso] = useState("");
	const [descricaoCurso, setDescricaoCurso] = useState("");
	const [quantidadeSemestres, setQuantidadeSemestres] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isLoading && usuario?.nomePerfil.toLowerCase() !== "admin") {
			toast.error("Acesso restrito a administradores");
			router.push("/home");
		}
	}, [isLoading, usuario, router]);

	if (isLoading || usuario?.nomePerfil.toLowerCase() !== "admin") {
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!nomeCurso.trim()) {
			toast.error("Nome do curso é obrigatório");
			return;
		}

		if (!quantidadeSemestres || parseInt(quantidadeSemestres) <= 0) {
			toast.error("Quantidade de semestres inválida");
			return;
		}

		try {
			setLoading(true);

			const payload = {
				nomeCurso: nomeCurso.trim(),
				duracaoSemestres: parseInt(quantidadeSemestres),
			};

			await api.post("/curso", payload);

			toast.success("Curso cadastrado com sucesso!");

			// Limpar os campos
			setNomeCurso("");
			setDescricaoCurso("");
			setQuantidadeSemestres("");
		} catch (error: any) {
			let mensagemErro = "Erro ao cadastrar curso";

			if (error.response?.data?.message) {
				mensagemErro = error.response.data.message;
			} else if (error.response?.data?.error) {
				mensagemErro = error.response.data.error;
			}

			toast.error(mensagemErro);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Header title='Cadastro de Curso' />
			<NavBar />
			<FormCadastro onSubmit={handleSubmit}>
				<InputCadastro
					label='Nome do Curso'
					placeHolder='Ex: Sistema de Informação'
					type='text'
					value={nomeCurso}
					onChange={(e) => setNomeCurso(e.target.value)}
					disabled={loading}
				/>
				<InputCadastro
					label='Descriçao Curso'
					placeHolder='Ex: Curso voltado para...'
					type='text'
					value={descricaoCurso}
					onChange={(e) => setDescricaoCurso(e.target.value)}
					disabled={loading}
				/>
				<InputCadastro
					label='Quantidade de Semestres'
					placeHolder='Ex: 8'
					type='number'
					value={quantidadeSemestres}
					onChange={(e) => setQuantidadeSemestres(e.target.value)}
					disabled={loading}
				/>
			</FormCadastro>
		</>
	);
}
