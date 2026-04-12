import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const PROFESSOR_ALLOWED = ["/home", "/"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("auth-token")?.value;
	const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

	// Sem token + rota privada → login
	if (!token && !isPublicRoute) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Com token + rota pública (login) → home
	if (token && isPublicRoute) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	// Com token + rota privada → verificar perfil
	if (token && !isPublicRoute) {
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));

			// Token expirado
			if (payload.exp * 1000 < Date.now()) {
				const response = NextResponse.redirect(
					new URL("/login", request.url)
				);
				response.cookies.delete("auth-token");
				response.cookies.delete("auth-user");
				return response;
			}

			// Professor só pode acessar /home e /
			if (
				payload.nomePerfil === "Professor" &&
				!PROFESSOR_ALLOWED.includes(pathname)
			) {
				return NextResponse.redirect(new URL("/home", request.url));
			}
		} catch {
			// Token malformado → limpar e redirecionar
			const response = NextResponse.redirect(
				new URL("/login", request.url)
			);
			response.cookies.delete("auth-token");
			response.cookies.delete("auth-user");
			return response;
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
	],
};
