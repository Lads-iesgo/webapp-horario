import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Sistema de Horários",
	description: "Gerenciamento de grade de horários",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='pt-BR'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthProvider>
					{children}
				</AuthProvider>
				<Toaster
					position='top-center'
					toastOptions={{
						duration: 4000,
						style: {
							background: "#fff",
							color: "#363636",
							borderRadius: "10px",
							padding: "16px",
						},
						success: {
							iconTheme: {
								primary: "#4ade80",
								secondary: "#fff",
							},
						},
						error: {
							iconTheme: {
								primary: "#ef4444",
								secondary: "#fff",
							},
						},
					}}
				/>
			</body>
		</html>
	);
}
