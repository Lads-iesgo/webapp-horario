import axios from "axios";
import { capitalizeResponseData } from "@/utils/capitalize";

const api = axios.create({
	baseURL: "http://localhost:3333",
	timeout: 15000,
});

api.interceptors.request.use((config) => {
	if (typeof document !== "undefined") {
		const match = document.cookie.match(/(?:^|;\s*)auth-token=([^;]*)/);
		const token = match ? decodeURIComponent(match[1]) : null;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

api.interceptors.response.use(
	(response) => {
		if (response.data) {
			response.data = capitalizeResponseData(response.data);
		}
		return response;
	},
	(error) => {
		if (typeof window !== "undefined" && error.response?.status === 401) {
			document.cookie = "auth-token=; path=/; max-age=0";
			document.cookie = "auth-user=; path=/; max-age=0";
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

export default api;
