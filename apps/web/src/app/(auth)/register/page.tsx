'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { RegisterSchema, type RegisterInput } from '@salescore/shared';
import { register as registerFn } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const passwordValue = watch('password') || '';

  const passwordScore = React.useMemo(() => {
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    return score;
  }, [passwordValue]);

  const onSubmit = async (data: RegisterInput) => {
    if (data.password !== confirmPassword) {
      toast({ title: 'Error', description: 'Las contrasenas no coinciden.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerFn(data);
      setUser(result.user);
      toast({ title: 'Cuenta creada', description: `Bienvenido ${result.user.name}` });
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(6,182,212,0.25),transparent_35%),radial-gradient(circle_at_84%_82%,rgba(245,158,11,0.2),transparent_35%),linear-gradient(145deg,#f8feff_0%,#edf7fb_48%,#fff8ed_100%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-3xl border border-white/70 bg-white/65 p-10 shadow-xl backdrop-blur-md lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-slate-900">SalesCore</p>
              <p className="text-sm text-slate-500">CRM para ventas consultivas</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-xl font-display text-4xl font-semibold leading-tight text-slate-900">
            Construye un pipeline claro y escalable desde el primer dia.
          </h1>
          <p className="mt-4 max-w-lg text-slate-600">
            Crea tu espacio, invita al equipo y sigue cada oportunidad con visibilidad completa.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              'Multi-tenant listo',
              'Auth segura con JWT',
              'Dashboard en tiempo real',
              'Flujo completo de clientes y deals',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-3xl border border-white/80 bg-white/82 p-7 shadow-[0_24px_58px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md sm:p-9">
          <div className="mb-7">
            <div className="mb-5 flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-slate-900">SalesCore</span>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Onboarding</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-slate-900">Crear cuenta</h2>
            <p className="mt-1 text-sm text-slate-500">Configura tu workspace y empieza a vender mejor.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Nombre de la empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Mi Empresa SA"
                  {...register('companyName')}
                  className={errors.companyName ? 'border-rose-300 focus-visible:ring-rose-400' : ''}
                />
                {errors.companyName && <p className="text-xs text-rose-500">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Tu nombre</Label>
                <Input
                  id="name"
                  placeholder="Juan Perez"
                  {...register('name')}
                  className={errors.name ? 'border-rose-300 focus-visible:ring-rose-400' : ''}
                />
                {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@empresa.com"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-rose-300 focus-visible:ring-rose-400' : ''}
              />
              {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 8 caracteres"
                  autoComplete="new-password"
                  {...register('password')}
                  className={errors.password ? 'border-rose-300 pr-10 focus-visible:ring-rose-400' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
              <div className="mt-1.5 space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      passwordScore <= 1
                        ? 'bg-rose-400'
                        : passwordScore <= 2
                        ? 'bg-amber-400'
                        : passwordScore <= 3
                        ? 'bg-sky-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(passwordScore / 4) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Usa mayusculas, numeros y simbolos para una clave mas fuerte.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite tu contrasena"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={
                  confirmPassword && passwordValue !== confirmPassword
                    ? 'border-rose-300 focus-visible:ring-rose-400'
                    : ''
                }
              />
              {confirmPassword && passwordValue !== confirmPassword && (
                <p className="text-xs text-rose-500">Las contrasenas no coinciden.</p>
              )}
              {confirmPassword && passwordValue === confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Contrasena confirmada.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              Al crear la cuenta aceptas los terminos y la politica de privacidad.
            </div>

            <Button type="submit" variant="brand" className="mt-2 w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando workspace...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Datos protegidos con autenticacion y controles multi-tenant.
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Iniciar sesion
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

