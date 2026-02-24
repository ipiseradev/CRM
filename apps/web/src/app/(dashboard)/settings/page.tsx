'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  Building2,
  Palette,
  Save,
  Loader2,
  TrendingUp,
  User,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const BrandingSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (ej: #6366f1)'),
});

type BrandingInput = z.infer<typeof BrandingSchema>;

const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Slate', value: '#475569' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [branding, setBranding] = React.useState<BrandingInput>({
    name: user?.companyName || '',
    logo_url: '',
    primary_color: '#6366f1',
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BrandingInput>({
    resolver: zodResolver(BrandingSchema),
    defaultValues: branding,
  });

  const watchedColor = watch('primary_color');
  const watchedName = watch('name');
  const watchedLogoUrl = watch('logo_url');

  React.useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get<{ name: string; logo_url: string | null; primary_color: string }>('/auth/branding');
        const data = {
          name: res.name || user?.companyName || '',
          logo_url: res.logo_url || '',
          primary_color: res.primary_color || '#6366f1',
        };
        setBranding(data);
        setValue('name', data.name);
        setValue('logo_url', data.logo_url);
        setValue('primary_color', data.primary_color);
      } catch {
        // Use defaults
      }
    };
    fetchBranding();
  }, [user, setValue]);

  const onSubmit = async (data: BrandingInput) => {
    setIsLoading(true);
    try {
      await api.patch('/auth/branding', data);
      toast({ title: 'Configuración guardada', description: 'Los cambios se aplicaron correctamente' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Personalizá tu cuenta y empresa</p>
      </div>

      {/* Branding preview */}
      <Card className="overflow-hidden">
        <div className="h-2" style={{ backgroundColor: watchedColor || '#6366f1' }} />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: watchedColor || '#6366f1' }}
            >
              {watchedLogoUrl ? (
                <img src={watchedLogoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <TrendingUp className="h-7 w-7" />
              )}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{watchedName || 'Tu Empresa'}</p>
              <p className="text-sm text-gray-500">Vista previa del branding</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Branding de la empresa
          </CardTitle>
          <CardDescription>Personalizá el nombre y apariencia de tu empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre de la empresa</Label>
              <Input
                id="name"
                placeholder="Mi Empresa SRL"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logo_url">URL del logo (opcional)</Label>
              <Input
                id="logo_url"
                type="url"
                placeholder="https://mi-empresa.com/logo.png"
                {...register('logo_url')}
                className={errors.logo_url ? 'border-red-500' : ''}
              />
              {errors.logo_url && <p className="text-xs text-red-500">{errors.logo_url.message}</p>}
              <p className="text-xs text-gray-400">Ingresá la URL de una imagen PNG o SVG</p>
            </div>

            <div className="space-y-2">
              <Label>Color principal</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  {...register('primary_color')}
                  className="h-10 w-16 p-1 cursor-pointer"
                />
                <Input
                  value={watchedColor}
                  onChange={(e) => setValue('primary_color', e.target.value)}
                  placeholder="#6366f1"
                  className="w-32 font-mono text-sm"
                />
              </div>
              {errors.primary_color && <p className="text-xs text-red-500">{errors.primary_color.message}</p>}
              <div className="flex gap-2 flex-wrap mt-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.name}
                    onClick={() => setValue('primary_color', color.value)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${watchedColor === color.value ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="brand" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Información de cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Nombre</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{user?.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{user?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Empresa</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{user?.companyName}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rol</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-3.5 w-3.5 text-brand-500" />
                <p className="text-sm font-semibold text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo info */}
      <Card className="border-brand-200 bg-brand-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900">SalesCore Demo</p>
              <p className="text-xs text-brand-700 mt-1">
                Esta es una versión demo con datos de ejemplo. Todos los datos son ficticios y se generaron automáticamente para mostrar las capacidades del sistema.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Multi-tenant', 'JWT Auth', 'PostgreSQL', 'Next.js 14', 'TypeScript'].map((tag) => (
                  <span key={tag} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
