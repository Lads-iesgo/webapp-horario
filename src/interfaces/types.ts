export interface CelulaViewInterface {
	idCelula: number;
	idCurso: number;
	curso: string;
	idDisciplina: number;
	codigoDisciplina: string;
	disciplina: string;
	modalidade: string;
	tipo_sala: string;
	idProfessor: number;
	professor: string;
	titulacao: string;
	idDiaSemana: number;
	dia_semana: string;
	idGrade: number;
	idSala: number | null;
	codigoSala: string | null;
	nomeSala: string | null;
	anoLetivo: number;
	semestreLetivo: number;
	semestreCelula: number;
	duracaoSemestres: number;
	criadoEm?: string | null;
}

export interface CelulaCursoViewInterface {
	idCurso: number;
	nomeCurso: string;
	nomeDisciplina: string;
	modadalidade: string;
	nomeProfessor: string;
	titulacao: string;
	dia_semana: string;
	semestre: string;
}

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (conteudo: string) => void;
	dia: string;
	semestre: string;
	idGrade?: number;
	idCelula?: number;
	idCurso: number;
}

export interface Professor {
	idProfessor: number;
	nomeProfessor: string;
	titulacao?: string;
}

export interface ModalData {
	dia: string;
	semestre: string;
	chave: string;
}

export interface DisponibilidadeDiasProps {
	onChange?: (diasSelecionados: string[]) => void;
}

export interface Disciplina {
	idDisciplina: number;
	codigoDisciplina: string;
	nomeDisciplina: string;
	cargaHoraria: number;
	modalidade: "Presencial" | "Online" | "Hibrido";
	tipoSala: "Laboratório" | "Sala" | "Sincrona";
	semestreDisciplina?: number;
	periodo?: number;
}

export interface DisciplinaSelectorProps {
	courseId?: number;
	onChange?: (disciplinasIds: number[], professorId: number | null) => void;
	className?: string;
}

export interface ModalDeleteProps {
	isOpen: boolean;
	onClose: () => void;
	onDelete: () => void;
	onUpdate: () => void;
	conteudo: string;
	idCelula: number;
	idDisciplina: number;
	idProfessor: number;
	dia: string;
	semestre: string;
	idGrade?: number;
	idCurso: number;
}

export interface FormCadastroProps {
	children?: React.ReactNode;
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
	className?: string;
}

// Renamed to avoid conflict with InputCadastroPropsAlt below
export interface InputCadastroProps {
	label: string;
	type: string;
	placeHolder: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // More specific type
	disabled?: boolean;
}

export interface ButtonCadastroProps {
	text: string;
	onClick?: () => void;
	textColor?: string;
	bgColor?: string;
	style?: string;
}

export interface FormProps {
	children: React.ReactNode;
	className?: string;
}

export interface Curso {
	idCurso: number;
	nomeCurso: string;
}

export interface Grade {
	idGrade: number;
	idCurso: number;
	anoLetivo: number;
	semestreLetivo: number;
	criadoEm?: string | null;
}

export interface SelectCadastroProps {
	label: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	disabled?: boolean;
	options: { value: string | number; label: string }[];
	placeholder?: string;
}
