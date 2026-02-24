'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Rocket,
} from 'lucide-react';
import { LoginSchema, type LoginInput } from '@salescore/shared';
import { login } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const DEMO_CREDENTIALS = {
  email: 'admin@salescore.demo',
  password: 'demo1234',
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      setUser(result.user);
      toast({ title: 'Bienvenido', description: `Hola, ${result.user.name}` });
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoCredentials = () => {
    setValue('email', DEMO_CREDENTIALS.email, { shouldDirty: true });
    setValue('password', DEMO_CREDENTIALS.password, { shouldDirty: true });
    toast({ title: 'Credenciales demo cargadas' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(6,182,212,0.28),transparent_32%),radial-gradient(circle_at_88%_82%,rgba(245,158,11,0.24),transparent_35%),linear-gradient(135deg,#f8feff_0%,#edf7fb_46%,#fff7e8_100%)]" />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-10 px-6 py-8 lg:grid-cols-2 lg:px-10 lg:py-12">
        <section
          className="hidden rounded-3xl border border-white/70 bg-slate-950 p-9 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 10%, rgba(34,211,238,0.22), transparent 30%), radial-gradient(circle at 90% 85%, rgba(251,191,36,0.15), transparent 34%), linear-gradient(160deg, #020617 0%, #0f172a 100%)',
          }}
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold">SalesCore</p>
                <p className="text-sm text-slate-300">Revenue Command Center</p>
              </div>
            </div>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-200">
              <Rocket className="h-3.5 w-3.5" />
              CRM Demo Ready
            </div>

            <h1 className="mt-6 max-w-lg font-display text-4xl font-semibold leading-tight">
              Convierte conversaciones en ingresos con un CRM hecho para ventas reales.
            </h1>
            <p className="mt-4 max-w-md text-slate-300">
              Organiza clientes, deals y tareas en una vista clara y accionable para todo tu equipo.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="text-lg leading-relaxed text-slate-100">
                "Pasamos de seguimiento manual a pipeline ordenado en menos de 1 semana. El cierre mensual subio fuerte."
              </p>
              <p className="mt-3 text-sm text-slate-300">Ignacio Martinez - CEO, TechVentas AR</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '3x', label: 'Deals cerrados' },
                { value: '15min', label: 'Setup inicial' },
                { value: '100%', label: 'Equipo alineado' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/15 bg-white/5 p-3 text-center">
                  <p className="font-display text-2xl font-semibold text-brand-300">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/82 p-8 shadow-[0_25px_60px_-34px_rgba(15,23,42,0.5)] backdrop-blur-md sm:p-9">
            <div className="mb-7">
              <div className="mb-5 flex items-center gap-2 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-xl font-semibold text-slate-900">SalesCore</span>
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Acceso</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-slate-900">Iniciar sesion</h2>
              <p className="mt-1 text-sm text-slate-500">Entra y continua trabajando en tu pipeline.</p>
            </div>

            <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs text-brand-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Demo disponible</p>
                  <p className="mt-0.5 text-[11px]">admin@salescore.demo / demo1234</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={loadDemoCredentials} className="h-7 text-[11px]">
                  Cargar demo
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  autoComplete="email"
                  {...register('email')}
                  className={errors.email ? 'border-rose-300 focus-visible:ring-rose-400' : ''}
                />
                {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contrasena</Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    onClick={() =>
                      toast({
                        title: 'Recuperacion de clave',
                        description: 'Para demo, usa las credenciales precargadas.',
                      })
                    }
                  >
                    Olvide mi contrasena
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimo 8 caracteres"
                    autoComplete="current-password"
                    {...register('password')}
                    className={errors.password ? 'border-rose-300 pr-10 focus-visible:ring-rose-400' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" variant="brand" className="mt-2 w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Entrar al dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Acceso seguro con tokens y refresco automatico de sesion.
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Tu informacion se mantiene aislada por empresa (multi-tenant).
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              No tienes cuenta?{' '}
              <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">
                Crear cuenta gratis
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
