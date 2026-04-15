/**
 * Converte a primeira letra de cada palavra para maiúscula.
 * Ex: "joão pedro da silva" → "João Pedro da Silva"
 */

// Preposições/artigos que devem permanecer em minúsculo (exceto se forem a primeira palavra)
const PALAVRAS_MINUSCULAS = new Set([
	"da", "de", "do", "das", "dos", "e", "a", "o", "as", "os", "em", "na", "no", "nas", "nos",
]);

// Regex para detectar números romanos (I, II, III, IV, V, VI, VII, VIII, IX, X, etc.)
const ROMANO_REGEX = /^(m{0,3})(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/i;

function isRomano(palavra: string): boolean {
	return palavra.length > 0 && ROMANO_REGEX.test(palavra);
}

export function capitalizeWords(text: string): string {
	if (!text || typeof text !== "string") return text;

	return text
		.toLowerCase()
		.split(" ")
		.map((palavra, index) => {
			if (!palavra) return palavra;
			if (isRomano(palavra)) return palavra.toUpperCase();
			if (index > 0 && PALAVRAS_MINUSCULAS.has(palavra)) return palavra;
			return palavra.charAt(0).toUpperCase() + palavra.slice(1);
		})
		.join(" ");
}

// Campos que NÃO devem ser capitalizados
const CAMPOS_IGNORADOS = new Set([
	"email", "emailUsuario", "senha", "token",
	"codigoDisciplina", "codigoCurso", "codigoSala",
	"curriculoLattes", "curriculo_lattes",
	"modalidade",
	"nomePerfil",
	"message", "error", "msg",
	"baseURL", "Authorization",
]);

/**
 * Aplica capitalizeWords recursivamente em todos os campos string de um objeto,
 * exceto os campos na lista de ignorados.
 */
export function capitalizeResponseData(data: unknown): unknown {
	if (data === null || data === undefined) return data;

	if (Array.isArray(data)) {
		return data.map((item) => capitalizeResponseData(item));
	}

	if (typeof data === "object") {
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
			if (typeof value === "string" && !CAMPOS_IGNORADOS.has(key)) {
				result[key] = capitalizeWords(value);
			} else if (typeof value === "object" && value !== null) {
				result[key] = capitalizeResponseData(value);
			} else {
				result[key] = value;
			}
		}
		return result;
	}

	return data;
}
