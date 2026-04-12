"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/interfaces/auth";
import { loginRequest } from "@/services/authService";
import {
	AUTH_TOKEN_COOKIE,
	AUTH_USER_COOKIE,
	setCookie,
	getCookie,
	deleteCookie,
	parseJwtPayload,
} from "@/lib/auth";

interface AuthContextData {
	usuario: Usuario | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, senha: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [usuario, setUsuario] = useState<Usuario | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const token = getCookie(AUTH_TOKEN_COOKIE);
		const userJson = getCookie(AUTH_USER_COOKIE);

		if (token && userJson) {
			const payload = parseJwtPayload(token);
			if (payload && typeof payload.exp === "number" && payload.exp * 1000 > Date.now()) {
				try {
					setUsuario(JSON.parse(userJson));
				} catch {
					deleteCookie(AUTH_TOKEN_COOKIE);
					deleteCookie(AUTH_USER_COOKIE);
				}
			} else {
				deleteCookie(AUTH_TOKEN_COOKIE);
				deleteCookie(AUTH_USER_COOKIE);
			}
		}

		setIsLoading(false);
	}, []);

	const login = useCallback(
		async (email: string, senha: string) => {
			const { token, usuario: user } = await loginRequest(email, senha);

			const payload = parseJwtPayload(token);
			const maxAge =
				payload && typeof payload.exp === "number"
					? payload.exp - Math.floor(Date.now() / 1000)
					: 8 * 60 * 60;

			setCookie(AUTH_TOKEN_COOKIE, token, maxAge);
			setCookie(AUTH_USER_COOKIE, JSON.stringify(user), maxAge);

			setUsuario(user);
			router.push("/home");
		},
		[router]
	);

	const logout = useCallback(() => {
		deleteCookie(AUTH_TOKEN_COOKIE);
		deleteCookie(AUTH_USER_COOKIE);
		setUsuario(null);
		router.push("/login");
	}, [router]);

	return (
		<AuthContext.Provider
			value={{
				usuario,
				isAuthenticated: !!usuario,
				isLoading,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context || Object.keys(context).length === 0) {
		throw new Error("useAuth deve ser usado dentro de um AuthProvider");
	}
	return context;
}
