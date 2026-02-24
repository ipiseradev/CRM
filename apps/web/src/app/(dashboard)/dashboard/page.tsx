'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  CalendarRange,
  Info,
  Clock3,
  Wallet,
  Target,
  PhoneCall,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { MetricsSummary, Task, Client, Deal } from '@salescore/shared';
import { DEAL_STAGE_LABELS } from '@salescore/shared';

const STAGE_COLORS: Record<string, string> = {
  NEW: '#111827',
  CONTACTED: '#1f2937',
  QUOTE_SENT: '#374151',
  WAITING: '#4b5563',
  WON: '#6b7280',
  LOST: '#9ca3af',
};

const STAGE_BADGE_VARIANTS: Record<string, 'gray'> = {
  NEW: 'gray',
  CONTACTED: 'gray',
  QUOTE_SENT: 'gray',
  WAITING: 'gray',
  WON: 'gray',
  LOST: 'gray',
};

type FilterPeriod = 'today' | 'week' | 'month' | 'custom';

// Tooltip explanations for metrics
const METRIC_TOOLTIPS = {
  total_clients: 'Total de clientes registrados en tu base de datos',
  active_deals: 'Deals que están en curso en el pipeline',
  won_value: 'Ingresos totalizados de deals marcados como ganados',
  conversion_rate: 'Porcentaje de deals que se ganaron vs el total de deals cerrados',
  pipeline_value: 'Suma del valor de todos los deals activos',
  avg_deal_value: 'Valor promedio de cada deal en el pipeline',
  avg_close_days: 'Días promedio que toma cerrar un deal',
};

function getDeltaLabel(delta: number, positive: string, negative: string): string {
  if (delta > 0) return `+${delta} ${positive}`;
  if (delta < 0) return `${delta} ${negative}`;
  return 'Sin cambios';
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'brand',
  tooltip,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color?: string;
  tooltip?: string;
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    green: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    amber: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    blue: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200',
  };

  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
              {tooltip && (
                <span title={tooltip} className="cursor-help">
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </span>
              )}
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
            {typeof trend === 'number' && (
              <div className="mt-2 flex items-center gap-1.5">
                {trend >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {trend >= 0 ? `+${trend}` : trend}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">vs periodo anterior</span>
              </div>
            )}
          </div>
          <div className={`rounded-xl p-3 ${colorMap[color] || colorMap.brand}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-36 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-2xl bg-slate-200 xl:col-span-2" />
        <div className="h-80 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [metrics, setMetrics] = React.useState<MetricsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [upcomingTasks, setUpcomingTasks] = React.useState<Task[]>([]);
  const [clientsMap, setClientsMap] = React.useState<Record<string, string>>({});
  const [dealsMap, setDealsMap] = React.useState<Record<string, string>>({});

  const [period, setPeriod] = React.useState<FilterPeriod>('month');
  const [customFrom, setCustomFrom] = React.useState('');
  const [customTo, setCustomTo] = React.useState('');

  React.useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ period });
        if (period === 'custom' && customFrom && customTo) {
          query.set('from', customFrom);
          query.set('to', customTo);
        }

        const res = await api.get<{ summary: MetricsSummary } | MetricsSummary>(`/metrics/summary?${query.toString()}`);
        const rawMetrics = 'summary' in res ? res.summary : res;

        setMetrics({
          ...rawMetrics,
          deals_by_stage: rawMetrics.deals_by_stage ?? {},
          recent_deals: rawMetrics.recent_deals ?? [],
          total_clients: rawMetrics.total_clients ?? 0,
          total_deals: rawMetrics.total_deals ?? 0,
          active_deals: rawMetrics.active_deals ?? 0,
          won_value_sum: rawMetrics.won_value_sum ?? 0,
          conversion_rate: rawMetrics.conversion_rate ?? 0,
          pending_tasks: rawMetrics.pending_tasks ?? 0,
          pipeline_value: rawMetrics.pipeline_value ?? 0,
          avg_close_days: rawMetrics.avg_close_days ?? 0,
          avg_deal_value: rawMetrics.avg_deal_value ?? 0,
          whatsapp_connected: rawMetrics.whatsapp_connected ?? true,
          comparison: {
            clients_vs_previous: rawMetrics.comparison?.clients_vs_previous ?? 0,
            active_deals_vs_previous: rawMetrics.comparison?.active_deals_vs_previous ?? 0,
            won_value_vs_previous: rawMetrics.comparison?.won_value_vs_previous ?? 0,
            conversion_vs_previous: rawMetrics.comparison?.conversion_vs_previous ?? 0,
          },
        });
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar metricas');
      } finally {
        setLoading(false);
      }
    };

    if (period === 'custom' && (!customFrom || !customTo)) return;
    fetchMetrics();
  }, [period, customFrom, customTo]);

  React.useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const [tasksRes, clientsRes, dealsRes] = await Promise.all([
          api.get<{ items: Task[] }>('/tasks?filter=upcoming&limit=8'),
          api.get<{ items: Client[] }>('/clients?limit=200'),
          api.get<{ items: Deal[] }>('/deals?limit=200'),
        ]);

        const nextTasks = tasksRes.items
          .filter((task) => !task.done)
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          .slice(0, 4);

        setUpcomingTasks(nextTasks);
        setClientsMap(
          Object.fromEntries(clientsRes.items.map((client) => [client.id, client.name]))
        );
        setDealsMap(
          Object.fromEntries(dealsRes.items.map((deal) => [deal.id, deal.title]))
        );
      } catch {
        setUpcomingTasks([]);
      }
    };

    fetchFollowUps();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-6 text-center">
        <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-sm text-red-500 underline">
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  const chartData = Object.entries(metrics.deals_by_stage ?? {}).map(([stage, count]) => ({
    stageLabel: DEAL_STAGE_LABELS[stage as keyof typeof DEAL_STAGE_LABELS] || stage,
    stageKey: stage,
    count,
  }));

  const distribution = [...chartData].sort((a, b) => b.count - a.count);
  const distributionTotal = distribution.reduce((sum, d) => sum + d.count, 0);

  const conversionPct = metrics.conversion_rate;
  const topStage = distribution[0];
  const monthlyTarget = Math.max(1000000, Math.ceil(metrics.pipeline_value / 500000) * 500000);
  const monthlyProgress = Math.min(100, Math.round((metrics.won_value_sum / monthlyTarget) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Revenue Overview</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Visualiza rendimiento, pipeline y oportunidades accionables.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[{ id: 'today', label: 'Hoy' }, { id: 'week', label: 'Esta semana' }, { id: 'month', label: 'Este mes' }, { id: 'custom', label: 'Personalizado' }].map((item) => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              onClick={() => setPeriod(item.id as FilterPeriod)}
              className={`h-8 ${period === item.id ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900' : ''}`}
            >
              <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
              {item.label}
            </Button>
          ))}
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-slate-100"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Executive Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Pipeline value</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(metrics.pipeline_value)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Etapa con mayor volumen</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {topStage ? `${topStage.stageLabel} (${topStage.count} deals)` : 'Sin datos'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2.5">
                  <p className="text-xs text-slate-600 dark:text-slate-300">Conversion</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{conversionPct}%</p>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2.5">
                  <p className="text-xs text-slate-600 dark:text-slate-300">Pendientes</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{metrics.pending_tasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Acciones Clave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/deals" className="block rounded-xl bg-slate-900 p-3 text-white shadow-md transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                <p className="text-sm font-semibold">Crear nuevo deal</p>
                <p className="text-xs text-white/85 dark:text-slate-600">Accion recomendada</p>
              </Link>
              <Link href="/tasks" className="block rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Revisar tareas pendientes</p>
              </Link>
              <Link href="/clients" className="block rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Agregar nuevo cliente</p>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total clientes"
          value={metrics.total_clients}
          subtitle={getDeltaLabel(metrics.comparison.clients_vs_previous, 'vs mes anterior', 'vs mes anterior')}
          icon={Users}
          trend={metrics.comparison.clients_vs_previous}
          color="blue"
          tooltip={METRIC_TOOLTIPS.total_clients}
        />
        <KpiCard
          title="Deals activos"
          value={metrics.active_deals}
          subtitle={getDeltaLabel(metrics.comparison.active_deals_vs_previous, 'vs semana pasada', 'vs semana pasada')}
          icon={Briefcase}
          trend={metrics.comparison.active_deals_vs_previous}
          color="brand"
          tooltip={METRIC_TOOLTIPS.active_deals}
        />
        <KpiCard
          title="Ganado en periodo"
          value={formatCurrency(metrics.won_value_sum)}
          subtitle="Ingresos cerrados"
          icon={DollarSign}
          trend={Math.round(metrics.comparison.won_value_vs_previous)}
          color="green"
          tooltip={METRIC_TOOLTIPS.won_value}
        />
        <KpiCard
          title="Tasa de conversion"
          value={`${conversionPct}%`}
          subtitle="Deals ganados / total"
          icon={TrendingUp}
          trend={metrics.comparison.conversion_vs_previous}
          color="amber"
          tooltip={METRIC_TOOLTIPS.conversion_rate}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="flex items-center gap-1 cursor-help" title={METRIC_TOOLTIPS.pipeline_value}>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Pipeline value total</p>
                <Info className="h-3 w-3 text-slate-400" />
              </div>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(metrics.pipeline_value)}</p>
            </div>
            <Wallet className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="flex items-center gap-1 cursor-help" title={METRIC_TOOLTIPS.avg_deal_value}>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Valor promedio por deal</p>
                <Info className="h-3 w-3 text-slate-400" />
              </div>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(metrics.avg_deal_value)}</p>
            </div>
            <DollarSign className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="flex items-center gap-1 cursor-help" title={METRIC_TOOLTIPS.avg_close_days}>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiempo promedio de cierre</p>
                <Info className="h-3 w-3 text-slate-400" />
              </div>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.avg_close_days} dias</p>
            </div>
            <Clock3 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Objetivo del mes</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{monthlyProgress}%</p>
              </div>
              <Target className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-slate-900 dark:bg-slate-100" style={{ width: `${monthlyProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {formatCurrency(metrics.won_value_sum)} de {formatCurrency(monthlyTarget)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Deals por etapa (click para abrir)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-sm">No hay datos en este periodo</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis dataKey="stageLabel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    formatter={(value: number) => [value, 'Deals']}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} onClick={(bar) => router.push(`/deals?stage=${bar.stageKey}`)} cursor="pointer">
                    {chartData.map((entry) => (
                      <Cell key={entry.stageKey} fill={STAGE_COLORS[entry.stageKey] || '#06b6d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Distribucion por impacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {distribution.map((item) => {
                  const pct = distributionTotal > 0 ? Math.round((item.count / distributionTotal) * 100) : 0;
                  return (
                    <button
                      key={item.stageKey}
                      onClick={() => router.push(`/deals?stage=${item.stageKey}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: STAGE_COLORS[item.stageKey] || '#06b6d4' }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.stageLabel}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{pct}% ({item.count} deals)</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[item.stageKey] || '#06b6d4' }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Proximos seguimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay seguimientos proximos.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => {
                    const displayName =
                      task.related_type === 'CLIENT'
                        ? clientsMap[task.related_id] || 'Cliente'
                        : dealsMap[task.related_id] || 'Deal';
                    const due = new Date(task.due_date);
                    const hours = due.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                    const initials = displayName
                      .split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <div key={task.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-900/50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                          {initials || 'CL'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {displayName} · {task.related_type === 'CLIENT' ? 'Contacto' : 'Deal'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <PhoneCall className="h-3.5 w-3.5" />
                          {hours}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Ultimos deals</CardTitle>
            <Link href="/deals" className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
              Ver todos {'->'}
            </Link>
          </CardHeader>
          <CardContent>
            {metrics.recent_deals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <Briefcase className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No hay deals recientes en este periodo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recent_deals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="group block rounded-xl border border-transparent p-3 hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-900">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300">{deal.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{deal.client_name}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatRelativeTime(deal.created_at)} · {deal.owner_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {formatCurrency(deal.value)}
                        </p>
                        <Badge variant={STAGE_BADGE_VARIANTS[deal.stage] || 'default'} className="mt-1 text-[11px]">
                          {DEAL_STAGE_LABELS[deal.stage as keyof typeof DEAL_STAGE_LABELS] || deal.stage}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Acciones rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link href="/deals" className="rounded-xl bg-slate-900 p-4 text-white shadow-lg transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                <p className="text-sm font-semibold">Nuevo Deal</p>
                <p className="mt-1 text-xs text-white/85 dark:text-slate-600">Crea una oportunidad ahora</p>
              </Link>
              <Link href="/clients" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                <p className="text-sm font-semibold">Nuevo Cliente</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Agrega un nuevo contacto</p>
              </Link>
              <Link href="/tasks" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                <p className="text-sm font-semibold">Nueva Tarea</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Planifica seguimiento</p>
              </Link>
              <Link href="/deals" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                <p className="text-sm font-semibold">Ver Pipeline</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Analiza etapas y bloqueos</p>
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tareas pendientes</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{metrics.pending_tasks} tareas abiertas para el equipo</p>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  );
}
