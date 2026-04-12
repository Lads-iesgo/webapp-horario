"use client";

import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import FormCadastro from "@/components/FormCadastro";
import InputCadastro from "@/components/InputCadastro";
import SelectCadastro from "@/components/SelectCadastro";

import api from "@/services/api";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function CadastroSala() {
	const { usuario, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && usuario?.nomePerfil.toLowerCase() !== "admin") {
			toast.error("Acesso restrito a administradores");
			router.push("/home");
		}
	}, [isLoading, usuario, router]);

	if (isLoading || usuario?.nomePerfil.toLowerCase() !== "admin") {
		return null;
	}
	const [formData, setFormData] = useState({
		codigoSala: "",
		nomeSala: "",
		capacidadeSala: "",
		tipoSala: "",
		recursos: "",
		localizacao: "",
	});
	const [loading, setLoading] = useState(false);

	const opcoesSala = [
		{ value: "Laboratório", label: "Laboratório" },
		{ value: "Sala", label: "Sala de Aula" },
		{ value: "Auditorio", label: "Auditório" },
		{ value: "Sincrona", label: "Virtual" },
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validações
		if (!formData.codigoSala.trim()) {
			toast.error("Por favor, informe o código da sala");
			return;
		}

		if (!formData.capacidadeSala || parseInt(formData.capacidadeSala) <= 0) {
			toast.error("Por favor, informe uma capacidade válida");
			return;
		}

		if (!formData.tipoSala) {
			toast.error("Por favor, selecione o tipo de sala");
			return;
		}

		try {
			setLoading(true);

			const payload = {
				codigoSala: formData.codigoSala.trim().toUpperCase(),
				nomeSala: formData.nomeSala.trim() || null,
				capacidadeSala: parseInt(formData.capacidadeSala),
				tipoSala: formData.tipoSala,
				recursos: formData.recursos.trim() || null,
				localizacao: formData.localizacao.trim() || null,
			};

			const response = await api.post("/sala", payload);

			const mensagemSucesso =
				response.data?.message ||
				response.data?.msg ||
				"Sala cadastrada com sucesso!";

			toast.success(mensagemSucesso);

			// Limpar formulário
			setFormData({
				codigoSala: "",
				nomeSala: "",
				capacidadeSala: "",
				tipoSala: "",
				recursos: "",
				localizacao: "",
			});
		} catch (error: any) {
			let mensagemErro = "Erro ao cadastrar sala";

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
			<Header title='Cadastro de Sala' />
			<NavBar />
			<FormCadastro onSubmit={handleSubmit}>
				<InputCadastro
					label='Código da Sala *'
					placeHolder='Ex: LAB6'
					type='text'
					value={formData.codigoSala}
					onChange={(e) =>
						setFormData({ ...formData, codigoSala: e.target.value })
					}
				/>
				<InputCadastro
					label='Nome da Sala'
					placeHolder='Ex: Laboratório 6'
					type='text'
					value={formData.nomeSala}
					onChange={(e) =>
						setFormData({ ...formData, nomeSala: e.target.value })
					}
				/>
				<InputCadastro
					label='Capacidade *'
					placeHolder='Ex: 60'
					type='number'
					value={formData.capacidadeSala}
					onChange={(e) =>
						setFormData({ ...formData, capacidadeSala: e.target.value })
					}
				/>
				<SelectCadastro
					label='Tipo de Sala *'
					placeholder='Escolha o tipo de sala'
					options={opcoesSala}
					value={formData.tipoSala}
					onChange={(e) =>
						setFormData({ ...formData, tipoSala: e.target.value })
					}
				/>
				<InputCadastro
					label='Recursos'
					placeHolder='Ex: Microfone, Projetor'
					type='text'
					value={formData.recursos}
					onChange={(e) =>
						setFormData({ ...formData, recursos: e.target.value })
					}
				/>
				<InputCadastro
					label='Localização'
					placeHolder='Ex: Bloco Alpha'
					type='text'
					value={formData.localizacao}
					onChange={(e) =>
						setFormData({ ...formData, localizacao: e.target.value })
					}
				/>
			</FormCadastro>
		</>
	);
}
