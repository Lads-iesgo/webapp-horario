export interface CursoUsuario {
	idCurso: number;
	isCoordenador: boolean;
}

export interface Usuario {
	idUsuario: number;
	nomeUsuario: string;
	emailUsuario: string;
	nomePerfil: Perfil;
	cursos: CursoUsuario[];
}

export interface LoginResponse {
	token: string;
	usuario: Usuario;
}

export type Perfil = "Admin" | "Coordenador" | "Professor";
