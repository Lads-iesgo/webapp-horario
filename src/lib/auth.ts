export const AUTH_TOKEN_COOKIE = "auth-token";
export const AUTH_USER_COOKIE = "auth-user";

export const PUBLIC_ROUTES = ["/login"];
export const PROFESSOR_ALLOWED_ROUTES = ["/home", "/"];

export function setCookie(name: string, value: string, maxAgeSeconds: number) {
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; max-age=${maxAgeSeconds}`;
}

export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(
		new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
	);
	return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
	document.cookie = `${name}=; path=/; max-age=0`;
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const base64 = token.split(".")[1];
		const json = atob(base64);
		return JSON.parse(json);
	} catch {
		return null;
	}
}
