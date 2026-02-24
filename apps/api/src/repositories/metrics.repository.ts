import { query } from '../config/db';
import { MetricsSummary } from '@salescore/shared';

export type MetricsPeriod = 'today' | 'week' | 'month' | 'custom';

export interface MetricsRangeInput {
  period?: MetricsPeriod;
  from?: string;
  to?: string;
}

interface DateRanges {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getDateRanges(input: MetricsRangeInput): DateRanges {
  const now = new Date();
  const period = input.period ?? 'month';

  if (period === 'today') {
    const currentStart = startOfDay(now);
    const currentEnd = addDays(currentStart, 1);
    const previousStart = addDays(currentStart, -1);
    const previousEnd = currentStart;
    return { currentStart, currentEnd, previousStart, previousEnd };
  }

  if (period === 'week') {
    const today = startOfDay(now);
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const currentStart = addDays(today, mondayOffset);
    const currentEnd = addDays(currentStart, 7);
    const previousStart = addDays(currentStart, -7);
    const previousEnd = currentStart;
    return { currentStart, currentEnd, previousStart, previousEnd };
  }

  if (period === 'custom' && input.from && input.to) {
    const fromDate = startOfDay(new Date(input.from));
    const toDate = startOfDay(new Date(input.to));

    if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime()) && fromDate <= toDate) {
      const currentStart = fromDate;
      const currentEnd = addDays(toDate, 1);
      const spanMs = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - spanMs);
      const previousEnd = currentStart;
      return { currentStart, currentEnd, previousStart, previousEnd };
    }
  }

  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = addMonths(currentStart, 1);
  const previousStart = addMonths(currentStart, -1);
  const previousEnd = currentStart;
  return { currentStart, currentEnd, previousStart, previousEnd };
}

export const metricsRepository = {
  async getSummary(companyId: string, input: MetricsRangeInput = {}): Promise<MetricsSummary> {
    const { currentStart, currentEnd, previousStart, previousEnd } = getDateRanges(input);

    const clientsResult = await query<{ current: string; previous: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as current,
         COUNT(*) FILTER (WHERE created_at >= $4 AND created_at < $5) as previous
       FROM clients
       WHERE company_id = $1`,
      [companyId, currentStart.toISOString(), currentEnd.toISOString(), previousStart.toISOString(), previousEnd.toISOString()]
    );
    const total_clients = parseInt(clientsResult.rows[0]?.current || '0', 10);
    const previous_clients = parseInt(clientsResult.rows[0]?.previous || '0', 10);

    const dealsResult = await query<{
      total: string;
      active: string;
      previous_active: string;
      previous_total: string;
      won_sum: string;
      previous_won_sum: string;
      pipeline_value: string;
      avg_deal_value: string;
      avg_close_days: string;
      won_count: string;
      previous_won_count: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as total,
         COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3 AND stage NOT IN ('WON','LOST')) as active,
         COUNT(*) FILTER (WHERE created_at >= $4 AND created_at < $5) as previous_total,
         COUNT(*) FILTER (WHERE created_at >= $4 AND created_at < $5 AND stage NOT IN ('WON','LOST')) as previous_active,
         COALESCE(SUM(value) FILTER (WHERE created_at >= $2 AND created_at < $3 AND stage = 'WON'), 0) as won_sum,
         COALESCE(SUM(value) FILTER (WHERE created_at >= $4 AND created_at < $5 AND stage = 'WON'), 0) as previous_won_sum,
         COALESCE(SUM(value) FILTER (WHERE created_at >= $2 AND created_at < $3 AND stage NOT IN ('WON','LOST')), 0) as pipeline_value,
         COALESCE(AVG(value) FILTER (WHERE created_at >= $2 AND created_at < $3), 0) as avg_deal_value,
         COALESCE(AVG((close_date::date - created_at::date)) FILTER (WHERE created_at >= $2 AND created_at < $3 AND stage = 'WON' AND close_date IS NOT NULL), 0) as avg_close_days,
         COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3 AND stage = 'WON') as won_count,
         COUNT(*) FILTER (WHERE created_at >= $4 AND created_at < $5 AND stage = 'WON') as previous_won_count
       FROM deals
       WHERE company_id = $1`,
      [companyId, currentStart.toISOString(), currentEnd.toISOString(), previousStart.toISOString(), previousEnd.toISOString()]
    );

    const total_deals = parseInt(dealsResult.rows[0]?.total || '0', 10);
    const active_deals = parseInt(dealsResult.rows[0]?.active || '0', 10);
    const previous_active_deals = parseInt(dealsResult.rows[0]?.previous_active || '0', 10);
    const previous_total_deals = parseInt(dealsResult.rows[0]?.previous_total || '0', 10);

    const won_value_sum = parseFloat(dealsResult.rows[0]?.won_sum || '0');
    const previous_won_value_sum = parseFloat(dealsResult.rows[0]?.previous_won_sum || '0');
    const pipeline_value = parseFloat(dealsResult.rows[0]?.pipeline_value || '0');
    const avg_deal_value = parseFloat(dealsResult.rows[0]?.avg_deal_value || '0');
    const avg_close_days = Math.round(parseFloat(dealsResult.rows[0]?.avg_close_days || '0') * 10) / 10;

    const won_count = parseInt(dealsResult.rows[0]?.won_count || '0', 10);
    const previous_won_count = parseInt(dealsResult.rows[0]?.previous_won_count || '0', 10);

    const conversion_rate = total_deals > 0 ? Math.round((won_count / total_deals) * 100) : 0;
    const previous_conversion_rate = previous_total_deals > 0 ? Math.round((previous_won_count / previous_total_deals) * 100) : 0;

    const stageResult = await query<{ stage: string; count: string }>(
      `SELECT stage, COUNT(*) as count
       FROM deals
       WHERE company_id = $1
         AND created_at >= $2
         AND created_at < $3
       GROUP BY stage`,
      [companyId, currentStart.toISOString(), currentEnd.toISOString()]
    );
    const deals_by_stage: Record<string, number> = {};
    for (const row of stageResult.rows) {
      deals_by_stage[row.stage] = parseInt(row.count, 10);
    }

    const tasksResult = await query<{ pending: string }>(
      `SELECT COUNT(*) as pending
       FROM tasks
       WHERE company_id = $1
         AND done = false`,
      [companyId]
    );
    const pending_tasks = parseInt(tasksResult.rows[0]?.pending || '0', 10);

    const recentDealsResult = await query<{
      id: string;
      title: string;
      client_name: string;
      value: string;
      stage: string;
      created_at: string;
      owner_name: string;
    }>(
      `SELECT
         d.id,
         d.title,
         c.name as client_name,
         d.value,
         d.stage,
         d.created_at,
         COALESCE((SELECT u.name FROM users u WHERE u.company_id = d.company_id ORDER BY u.created_at ASC LIMIT 1), 'Equipo Comercial') as owner_name
       FROM deals d
       LEFT JOIN clients c ON c.id = d.client_id
       WHERE d.company_id = $1
         AND d.created_at >= $2
         AND d.created_at < $3
       ORDER BY d.created_at DESC
       LIMIT 10`,
      [companyId, currentStart.toISOString(), currentEnd.toISOString()]
    );

    const recent_deals = recentDealsResult.rows.map((r) => ({
      id: r.id,
      title: r.title,
      client_name: r.client_name || 'Cliente',
      owner_name: r.owner_name || 'Equipo Comercial',
      value: parseFloat(r.value),
      stage: r.stage,
      created_at: r.created_at,
    }));

    return {
      total_clients,
      total_deals,
      active_deals,
      deals_by_stage,
      won_value_sum,
      conversion_rate,
      pipeline_value,
      avg_deal_value,
      avg_close_days,
      pending_tasks,
      whatsapp_connected: true,
      comparison: {
        clients_vs_previous: total_clients - previous_clients,
        active_deals_vs_previous: active_deals - previous_active_deals,
        won_value_vs_previous: Math.round((won_value_sum - previous_won_value_sum) * 100) / 100,
        conversion_vs_previous: conversion_rate - previous_conversion_rate,
      },
      recent_deals,
    };
  },
};

