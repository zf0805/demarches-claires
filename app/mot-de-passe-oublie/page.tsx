import type { Metadata } from "next"; import { AuthForm } from "@/components/auth-form"; import { AuthPageShell } from "@/components/auth-page-shell";
export const metadata: Metadata = { title: "Mot de passe oublié" }; export default function ForgotPage() { return <AuthPageShell><AuthForm mode="request-reset" /></AuthPageShell>; }
