import type { Metadata } from "next"; import { AuthForm } from "@/components/auth-form"; import { AuthPageShell } from "@/components/auth-page-shell";
export const metadata: Metadata = { title: "Connexion" }; export default function LoginPage() { return <AuthPageShell><AuthForm mode="login" /></AuthPageShell>; }
