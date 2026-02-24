'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Loader2,
  Briefcase,
  DollarSign,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  CreateDealSchema,
  type CreateDealInput,
  type Deal,
  type Client,
  DEAL_STAGES,
  DEAL_STAGE_LABELS,
} from '@salescore/shared';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const STAGE_COLORS: Record<string, string> = {
  NEW: 'border-t-indigo-500',
  CONTACTED: 'border-t-blue-500',
  QUOTE_SENT: 'border-t-amber-500',
  WAITING: 'border-t-purple-500',
  WON: 'border-t-emerald-500',
  LOST: 'border-t-red-500',
};

const STAGE_BG: Record<string, string> = {
  NEW: 'bg-indigo-50',
  CONTACTED: 'bg-blue-50',
  QUOTE_SENT: 'bg-amber-50',
  WAITING: 'bg-purple-50',
  WON: 'bg-emerald-50',
  LOST: 'bg-red-50',
};

const STAGE_BADGE_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'purple' | 'success' | 'destructive'> = {
  NEW: 'default',
  CONTACTED: 'info',
  QUOTE_SENT: 'warning',
  WAITING: 'purple',
  WON: 'success',
  LOST: 'destructive',
};

function DealFormDialog({
  open,
  onClose,
  onSuccess,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateDealInput>({
    resolver: zodResolver(CreateDealSchema),
    defaultValues: { stage: 'NEW', value: 0 },
  });

  const selectedClientId = watch('client_id');
  const selectedStage = watch('stage');

  const onSubmit = async (data: CreateDealInput) => {
    setIsLoading(true);
    try {
      await api.post('/deals', data);
      toast({ title: 'Deal creado exitosamente' });
      reset({ stage: 'NEW', value: 0 });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cliente *</Label>
            <Select value={selectedClientId} onValueChange={(v) => setValue('client_id', v)}>
              <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccioná un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && <p className="text-xs text-red-500">{errors.client_id.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Título del deal *</Label>
            <Input id="title" placeholder="Ej: Venta de software CRM" {...register('title')} className={errors.title ? 'border-red-500' : ''} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="value">Valor (ARS)</Label>
              <Input id="value" type="number" min="0" step="100" placeholder="0" {...register('value')} />
            </div>
            <div className="space-y-1.5">
              <Label>Etapa</Label>
              <Select value={selectedStage} onValueChange={(v) => setValue('stage', v as CreateDealInput['stage'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{DEAL_STAGE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="close_date">Fecha estimada de cierre</Label>
            <Input id="close_date" type="date" {...register('close_date')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="brand" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear deal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function KanbanCard({ deal, onMoveStage, onClick }: { deal: Deal; onMoveStage: (id: string, stage: string) => void; onClick: () => void }) {
  const currentIndex = DEAL_STAGES.indexOf(deal.stage as typeof DEAL_STAGES[number]);
  const nextStage = DEAL_STAGES[currentIndex + 1];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-700 line-clamp-2">{deal.title}</p>
      </div>
      {deal.client_name && (
        <p className="text-xs text-gray-500 mt-1 truncate">{deal.client_name}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
        {deal.close_date && (
          <span className="text-xs text-gray-400">{formatDate(deal.close_date)}</span>
        )}
      </div>
      {nextStage && deal.stage !== 'WON' && deal.stage !== 'LOST' && (
        <button
          onClick={(e) => { e.stopPropagation(); onMoveStage(deal.id, nextStage); }}
          className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-brand-600 hover:text-brand-700 py-1 rounded border border-brand-200 hover:bg-brand-50 transition-colors"
        >
          Mover a {DEAL_STAGE_LABELS[nextStage]}
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export default function DealsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [view, setView] = React.useState<'kanban' | 'list'>('kanban');

  const stageFilterRaw = (searchParams.get('stage') || searchParams.get('status') || '').toUpperCase();
  const stageFilter =
    stageFilterRaw === 'GANADO'
      ? 'WON'
      : stageFilterRaw === 'PERDIDO'
      ? 'LOST'
      : DEAL_STAGES.includes(stageFilterRaw as typeof DEAL_STAGES[number])
      ? stageFilterRaw
      : '';

  const fetchDeals = React.useCallback(async () => {
    try {
      const query = new URLSearchParams({ limit: '100' });
      if (stageFilter) query.set('stage', stageFilter);
      const [dealsRes, clientsRes] = await Promise.all([
        api.get<{ items: Deal[] }>(`/deals?${query.toString()}`),
        api.get<{ items: Client[] }>('/clients?limit=200'),
      ]);
      setDeals(dealsRes.items);
      setClients(clientsRes.items);
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleMoveStage = async (dealId: string, newStage: string) => {
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
      setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage as Deal['stage'] } : d));
      toast({ title: `Deal movido a ${DEAL_STAGE_LABELS[newStage as keyof typeof DEAL_STAGE_LABELS]}` });
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    }
  };

  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalValue = deals.reduce((sum, d) => sum + Number(d.value), 0);
  const wonValue = deals.filter(d => d.stage === 'WON').reduce((sum, d) => sum + Number(d.value), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Deals</h1>
          <p className="text-gray-500 mt-1">
            {deals.length} deals - {formatCurrency(totalValue)} en pipeline - {formatCurrency(wonValue)} ganado
          </p>
          {stageFilter && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700">
              Filtrando por etapa: {DEAL_STAGE_LABELS[stageFilter as keyof typeof DEAL_STAGE_LABELS] || stageFilter}
              <button onClick={() => router.push('/deals')} className="font-semibold hover:text-brand-800">
                Limpiar
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'list' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Lista
            </button>
          </div>
          <Button variant="brand" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Deal
          </Button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = dealsByStage[stage] || [];
              const stageValue = stageDeals.reduce((sum, d) => sum + Number(d.value), 0);
              return (
                <div key={stage} className="w-64 flex-shrink-0">
                  <div className={`rounded-t-lg border-t-4 ${STAGE_COLORS[stage]} bg-white border border-gray-200 border-t-0 px-3 py-2 mb-2`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{DEAL_STAGE_LABELS[stage]}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_BG[stage]}`}>
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(stageValue)}</p>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {stageDeals.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-400">Sin deals</p>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <KanbanCard
                          key={deal.id}
                          deal={deal}
                          onMoveStage={handleMoveStage}
                          onClick={() => router.push(`/deals/${deal.id}`)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <CardContent className="p-0">
            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Briefcase className="h-10 w-10 mb-3 opacity-40" />
                <p className="font-medium">No hay deals</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Deal</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Cliente</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Etapa</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Valor</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Cierre</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                          <p className="text-xs text-gray-400">{formatDate(deal.created_at)}</p>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-600">{deal.client_name || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={STAGE_BADGE_VARIANTS[deal.stage] || 'default'} className="text-xs">
                            {DEAL_STAGE_LABELS[deal.stage as keyof typeof DEAL_STAGE_LABELS] || deal.stage}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <span className="text-sm text-gray-500">{deal.close_date ? formatDate(deal.close_date) : '—'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/deals/${deal.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <DealFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchDeals}
        clients={clients}
      />
    </div>
  );
}

