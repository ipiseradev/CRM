
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  FileText,
  MessageCircle,
  PhoneCall,
  Users,
  Loader2,
  DollarSign,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import {
  CreateActivitySchema,
  type CreateActivityInput,
  type Deal,
  type Activity,
  DEAL_STAGES,
  DEAL_STAGE_LABELS,
  ACTIVITY_TYPE_LABELS,
} from '@salescore/shared';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function ActivityForm({ dealId, onSuccess }: { dealId: string; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateActivityInput>({
    resolver: zodResolver(CreateActivitySchema),
    defaultValues: { related_type: 'DEAL', related_id: dealId, type: 'NOTE', content: '' },
  });
  const activityType = watch('type');

  const onSubmit = async (data: CreateActivityInput) => {
    setIsLoading(true);
    try {
      await api.post('/activities', data);
      toast({ title: 'Actividad registrada' });
      reset({ related_type: 'DEAL', related_id: dealId, type: 'NOTE', content: '' });
      onSuccess();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input type="hidden" {...register('related_type')} value="DEAL" />
      <input type="hidden" {...register('related_id')} value={dealId} />
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
        placeholder="Registrá una nota, llamada, mensaje..."
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

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = React.useState<Deal | null>(null);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAll = React.useCallback(async () => {
    try {
      const [dealRes, activitiesRes] = await Promise.all([
        api.get<{ deal: Deal } | Deal>(`/deals/${dealId}`),
        api.get<{ items: Activity[] }>(`/activities?related_type=DEAL&related_id=${dealId}&limit=50`),
      ]);
      const resolvedDeal = 'deal' in dealRes ? dealRes.deal : dealRes;
      setDeal(resolvedDeal);
      setActivities(activitiesRes.items);
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleMoveStage = async (newStage: string) => {
    if (!deal) return;
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
      setDeal({ ...deal, stage: newStage as Deal['stage'] });
      toast({ title: `Movido a ${DEAL_STAGE_LABELS[newStage as keyof typeof DEAL_STAGE_LABELS]}` });
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Deal no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/deals')}>
          Volver a deals
        </Button>
      </div>
    );
  }

  const currentIndex = DEAL_STAGES.indexOf(deal.stage as typeof DEAL_STAGES[number]);
  const nextStage = DEAL_STAGES[currentIndex + 1];
  const prevStage = DEAL_STAGES[currentIndex - 1];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push('/deals')} className="text-gray-500">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Pipeline
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
            <Badge variant={STAGE_BADGE_VARIANTS[deal.stage] || 'default'}>
              {DEAL_STAGE_LABELS[deal.stage as keyof typeof DEAL_STAGE_LABELS] || deal.stage}
            </Badge>
          </div>
          {deal.client_name && (
            <button
              onClick={() => router.push(`/clients`)}
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              {deal.client_name}
            </button>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(deal.value)}</p>
          {deal.close_date && (
            <p className="text-sm text-gray-500 mt-1">Cierre: {formatDate(deal.close_date)}</p>
          )}
        </div>
      </div>

      {/* Stage pipeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {DEAL_STAGES.map((stage, idx) => {
              const isActive = stage === deal.stage;
              const isPast = DEAL_STAGES.indexOf(deal.stage as typeof DEAL_STAGES[number]) > idx;
              return (
                <React.Fragment key={stage}>
                  <button
                    onClick={() => handleMoveStage(stage)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : isPast
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {DEAL_STAGE_LABELS[stage]}
                  </button>
                  {idx < DEAL_STAGES.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {nextStage && deal.stage !== 'WON' && deal.stage !== 'LOST' && (
            <Button
              variant="brand"
              size="sm"
              className="mt-3"
              onClick={() => handleMoveStage(nextStage)}
            >
              Mover a {DEAL_STAGE_LABELS[nextStage]}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Detalles del deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 font-semibold">{formatCurrency(deal.value)}</span>
              </div>
              {deal.close_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">Cierre: {formatDate(deal.close_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Creado: {formatDate(deal.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleMoveStage('WON')}
                disabled={deal.stage === 'WON'}
              >
                <span className="text-emerald-500 mr-2">✓</span>
                Marcar como Ganado
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:border-red-300"
                onClick={() => handleMoveStage('LOST')}
                disabled={deal.stage === 'LOST'}
              >
                <span className="mr-2">✗</span>
                Marcar como Perdido
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityForm dealId={dealId} onSuccess={fetchAll} />

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
