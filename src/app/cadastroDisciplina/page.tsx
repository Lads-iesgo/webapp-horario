"use client";

import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import InputCadastro from "@/components/InputCadastro";
import SelectCadastro from "@/components/SelectCadastro";
import FormCadastro from "@/components/FormCadastro";

import api from "@/services/api";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Curso {
	idCurso: number;
	nomeCurso: string;
}

export default function CadastroDisciplina() {
	const { usuario } = useAuth();
	const [nomeDisciplina, setNomeDisciplina] = useState("");
	const [idCurso, setIdCurso] = useState("");
	const [codigoDisciplina, setCodigoDisciplina] = useState("");
	const [semestreDisciplina, setSemestreDisciplina] = useState("");
	const [modalidade, setModalidade] = useState("");
	const [tipoSala, setTipoSala] = useState("");
	const [cargaHoraria, setCargaHoraria] = useState("");
	const [cursos, setCursos] = useState<Curso[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingCursos, setLoadingCursos] = useState(true);

	const isAdmin = usuario?.nomePerfil.toLowerCase() === "admin";

	const modalidades = [
		{ value: "Presencial", label: "Presencial" },
		{ value: "Online", label: "Online" },
		{ value: "Hibrido", label: "Híbrido" },
	];

	const tiposSala = [
		{ value: "Laboratório", label: "Laboratório" },
		{ value: "Sala", label: "Sala" },
		{ value: "Sincrona", label: "Síncrona" },
	];

	// Coordenador: auto-resolver idCurso pelo curso onde é coordenador
	useEffect(() => {
		if (!isAdmin && usuario) {
			const cursoCoordenador = usuario.cursos.find(c => c.isCoordenador);
			if (cursoCoordenador) {
				setIdCurso(String(cursoCoordenador.idCurso));
			}
			setLoadingCursos(false);
		}
	}, [isAdmin, usuario]);

	// Admin: carregar todos os cursos para o dropdown
	useEffect(() => {
		if (isAdmin) {
			carregarCursos();
		}
	}, [isAdmin]);

	const carregarCursos = async () => {
		try {
			setLoadingCursos(true);
			const response = await api.get<Curso[]>("/curso");
			setCursos(response.data);
		} catch (error) {
			toast.error("Erro ao carregar lista de cursos");
		} finally {
			setLoadingCursos(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!nomeDisciplina.trim()) {
			toast.error("Nome da disciplina é obrigatório");
			return;
		}

		if (!idCurso) {
			toast.error(isAdmin ? "Selecione um curso" : "Nenhum curso vinculado ao seu perfil de coordenador");
			return;
		}

		if (!semestreDisciplina || parseInt(semestreDisciplina) <= 0) {
			toast.error("Semestre da disciplina é obrigatório");
			return;
		}

		if (!modalidade) {
			toast.error("Selecione a modalidade");
			return;
		}

		if (!tipoSala) {
			toast.error("Selecione o tipo de sala");
			return;
		}

		if (!cargaHoraria || parseInt(cargaHoraria) <= 0) {
			toast.error("Carga horária inválida");
			return;
		}

		try {
			setLoading(true);

			const payloadDisciplina = {
				codigoDisciplina: codigoDisciplina.trim() || null,
				nomeDisciplina: nomeDisciplina.trim(),
				cargaHoraria: parseInt(cargaHoraria),
				modalidade: modalidade,
				tipoSala: tipoSala,
				semestreDisciplina: parseInt(semestreDisciplina),
				idCurso: parseInt(idCurso),
			};

			// Cadastrar a disciplina com todos os dados
			const response = await api.post("/disciplina", payloadDisciplina);

			toast.success("Disciplina cadastrada com sucesso!");

			// Limpar os campos
			setNomeDisciplina("");
			setCodigoDisciplina("");
			setSemestreDisciplina("");
			setIdCurso("");
			setModalidade("");
			setTipoSala("");
			setCargaHoraria("");
		} catch (error: any) {
			let mensagemErro = "Erro ao cadastrar disciplina";

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
			<Header title='Cadastro de Disciplina' />
			<NavBar />
			<FormCadastro onSubmit={handleSubmit}>
				<InputCadastro
					label='Nome da Disciplina *'
					placeHolder='Ex: Práticas Orientadas'
					type='text'
					value={nomeDisciplina}
					onChange={(e) => setNomeDisciplina(e.target.value)}
					disabled={loading}
				/>
				<InputCadastro
					label='Código da Disciplina'
					placeHolder='Ex: PO001'
					type='text'
					value={codigoDisciplina}
					onChange={(e) => setCodigoDisciplina(e.target.value)}
					disabled={loading}
				/>

				{isAdmin && (
					<SelectCadastro
						label='Curso da Disciplina *'
						value={idCurso}
						onChange={(e) => setIdCurso(e.target.value)}
						disabled={loading || loadingCursos}
						placeholder={
							loadingCursos ? "Carregando cursos..." : "Selecione um curso"
						}
						options={cursos.map((curso) => ({
							value: curso.idCurso,
							label: curso.nomeCurso,
						}))}
					/>
				)}

				<InputCadastro
					label='Semestre da Disciplina *'
					placeHolder='Ex: 1'
					type='number'
					value={semestreDisciplina}
					onChange={(e) => setSemestreDisciplina(e.target.value)}
					disabled={loading}
				/>

				<SelectCadastro
					label='Modalidade da Disciplina *'
					value={modalidade}
					onChange={(e) => setModalidade(e.target.value)}
					disabled={loading}
					placeholder='Selecione a modalidade'
					options={modalidades}
				/>

				<SelectCadastro
					label='Tipo de Sala *'
					value={tipoSala}
					onChange={(e) => setTipoSala(e.target.value)}
					disabled={loading}
					placeholder='Selecione o tipo de sala'
					options={tiposSala}
				/>

				<InputCadastro
					label='Carga Horária *'
					placeHolder='Ex: 120'
					type='number'
					value={cargaHoraria}
					onChange={(e) => setCargaHoraria(e.target.value)}
					disabled={loading}
				/>
			</FormCadastro>
		</>
	);
}
