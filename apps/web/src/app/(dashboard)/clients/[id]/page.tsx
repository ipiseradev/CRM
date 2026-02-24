'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Phone,
  Mail,
  FileText,
  Briefcase,
  MessageCircle,
  PhoneCall,
  Users,
  Calendar,
  Plus,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import {
  CreateActivitySchema,
  type CreateActivityInput,
  type Client,
  type Deal,
  type Activity,
  type Task,
  DEAL_STAGE_LABELS,
  ACTIVITY_TYPE_LABELS,
} from '@salescore/shared';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const STAGE_BADGE_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'purple' | 'success' | 'destructive'> = {
  NEW: 'default',
  CONTACTED: 'info',
  QUOTE_SENT: 'warning',
  WAITING: 'purple',
  WON: 'success',
  LOST: 'destructive',
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  NOTE: FileText,
  CALL: PhoneCall,
  WHATSAPP: MessageCircle,
  MEETING: Users,
};

const ACTIVITY_COLORS: Record<string, string> = {
  NOTE: 'bg-gray-100 text-gray-600',
  CALL: 'bg-blue-100 text-blue-600',
  WHATSAPP: 'bg-green-100 text-green-600',
  MEETING: 'bg-purple-100 text-purple-600',
};

function ActivityForm({
  clientId,
  onSuccess,
}: {
  clientId: string;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateActivityInput>({
    resolver: zodResolver(CreateActivitySchema),
    defaultValues: { related_type: 'CLIENT', related_id: clientId, type: 'NOTE', content: '' },
  });

  const activityType = watch('type');

  const onSubmit = async (data: CreateActivityInput) => {
    setIsLoading(true);
    try {
      await api.post('/activities', data);
      toast({ title: 'Actividad registrada' });
      reset({ related_type: 'CLIENT', related_id: clientId, type: 'NOTE', content: '' });
      onSuccess();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input type="hidden" {...register('related_type')} value="CLIENT" />
      <input type="hidden" {...register('related_id')} value={clientId} />
      <div className="flex gap-2 flex-wrap">
        {(['NOTE', 'CALL', 'WHATSAPP', 'MEETING'] as const).map((type) => {
          const Icon = ACTIVITY_ICONS[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => setValue('type', type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                activityType === type
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}
            >
              <Icon className="h-3 w-3" />
              {ACTIVITY_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
      <textarea
        {...register('content')}
        rows={3}
        placeholder="Escribí una nota, resultado de llamada, mensaje de WhatsApp..."
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
      />
      {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      <Button type="submit" variant="brand" size="sm" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
        Registrar actividad
      </Button>
    </form>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = React.useState<Client | null>(null);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAll = React.useCallback(async () => {
    try {
      const [clientRes, dealsRes, activitiesRes, tasksRes] = await Promise.all([
        api.get<{ client: Client } | Client>(`/clients/${clientId}`),
        api.get<{ items: Deal[] }>(`/deals?client_id=${clientId}&limit=50`),
        api.get<{ items: Activity[] }>(`/activities?related_type=CLIENT&related_id=${clientId}&limit=50`),
        api.get<{ items: Task[] }>(`/tasks?related_type=CLIENT&related_id=${clientId}&limit=50`),
      ]);
      const resolvedClient = 'client' in clientRes ? clientRes.client : clientRes;
      setClient(resolvedClient);
      setDeals(dealsRes.items);
      setActivities(activitiesRes.items);
      setTasks(tasksRes.items);
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Cliente no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/clients')}>
          Volver a clientes
        </Button>
      </div>
    );
  }

  const clientName = (client.name ?? '').trim();
  const clientInitial = clientName.charAt(0).toUpperCase() || '?';
  const clientPhoneDigits = (client.phone ?? '').replace(/\D/g, '');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/clients')} className="text-gray-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Clientes
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold">
            {clientInitial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clientName || 'Sin nombre'}</h1>
            <p className="text-gray-500 text-sm mt-0.5">Cliente desde {formatDate(client.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://wa.me/${clientPhoneDigits}`, '_blank')}
            disabled={!clientPhoneDigits}
          >
            <MessageCircle className="h-4 w-4 mr-1.5 text-green-500" />
            WhatsApp
          </Button>
          {client.email && (
            <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${client.email}`)}>
              <Mail className="h-4 w-4 mr-1.5" />
              Email
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{client.email}</span>
                </div>
              )}
              {client.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{client.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Deals</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Actividades</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg col-span-2">
                <p className="text-xl font-bold text-emerald-700">
                  {formatCurrency(deals.filter(d => d.stage === 'WON').reduce((sum, d) => sum + Number(d.value), 0))}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Total ganado</p>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tareas ({tasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">Sin tareas</p>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className={`flex items-start gap-2 text-xs ${task.done ? 'opacity-50' : ''}`}>
                      <div className={`h-4 w-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                        {task.done && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <div>
                        <p className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</p>
                        <p className="text-gray-400">{formatDate(task.due_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Deals ({deals.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/deals')}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Nuevo deal
              </Button>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Sin deals aún</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => router.push(`/deals/${deal.id}`)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(deal.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                        <Badge variant={STAGE_BADGE_VARIANTS[deal.stage] || 'default'} className="text-xs">
                          {DEAL_STAGE_LABELS[deal.stage as keyof typeof DEAL_STAGE_LABELS] || deal.stage}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityForm clientId={clientId} onSuccess={fetchAll} />

              {activities.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {activities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type] || FileText;
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${ACTIVITY_COLORS[activity.type] || 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700">
                              {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                            </span>
                            <span className="text-xs text-gray-400">{formatRelativeTime(activity.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{activity.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activities.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">Sin actividades registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
