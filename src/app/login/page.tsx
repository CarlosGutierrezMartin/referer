'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;
                setMessage('Revisa tu email para confirmar tu cuenta.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0B]">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#818CF8] mb-4">
                        <BookOpen className="w-6 h-6 text-[#0A0A0B]" />
                    </div>
                    <h1 className="text-xl font-semibold text-[#F4F4F5] tracking-tight">Referer</h1>
                    <p className="text-sm text-[#71717A] mt-1">La capa de verdad</p>
                </div>

                <Card variant="elevated" padding="lg">
                    <CardHeader>
                        <CardTitle>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</CardTitle>
                        <CardDescription>
                            {isSignUp
                                ? 'Empieza a verificar tu contenido'
                                : 'Accede a tu panel'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-6">
                        {/* Google Login */}
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full mb-6"
                            onClick={handleGoogleLogin}
                            isLoading={isLoading}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar con Google
                        </Button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#27272A]" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-[#141416] text-[#71717A]">o con email</span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-[#F87171] bg-[#F87171]/10 p-3 rounded-xl border border-[#F87171]/20">
                                    {error}
                                </p>
                            )}

                            {message && (
                                <p className="text-sm text-[#4ADE80] bg-[#4ADE80]/10 p-3 rounded-xl border border-[#4ADE80]/20">
                                    {message}
                                </p>
                            )}

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                {isSignUp ? 'Crear cuenta' : 'Acceder'}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>

                        <p className="text-center text-sm text-[#71717A] mt-6">
                            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="text-[#F4F4F5] font-medium hover:text-[#818CF8] transition-colors"
                            >
                                {isSignUp ? 'Accede' : 'Regístrate'}
                            </button>
                        </p>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-[#52525B] mt-8">
                    Al continuar, aceptas nuestros términos y política de privacidad.
                </p>
            </div>
        </div>
    );
}
