import type { Metadata } from "next"; import { AuthForm } from "@/components/auth-form"; import { AuthPageShell } from "@/components/auth-page-shell";
export const metadata: Metadata = { title: "Inscription" }; export default function RegisterPage() { return <AuthPageShell><AuthForm mode="register" /></AuthPageShell>; }
