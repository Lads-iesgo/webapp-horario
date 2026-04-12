import api from "./api";
import type { LoginResponse } from "@/interfaces/auth";

export async function loginRequest(
	email: string,
	senha: string
): Promise<LoginResponse> {
	const response = await api.post<LoginResponse>("/auth/login", {
		email,
		senha,
	});
	return response.data;
}
