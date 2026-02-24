import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) return;

  // If no columns specified, use all keys from first item
  const cols = columns || (Object.keys(data[0]) as (keyof T)[]).map(key => ({
    key,
    label: String(key),
  }));

  // Build header
  const header = cols.map(c => c.label).join(',');

  // Build rows
  const rows = data.map(row => 
    cols.map(c => {
      const value = row[c.key];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export clients to CSV
 */
export function exportClientsToCSV(clients: Array<{
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  created_at: string;
}>): void {
  const data = clients.map(c => ({
    Nombre: c.name,
    Teléfono: c.phone,
    Email: c.email || '',
    Notas: c.notes || '',
    'Fecha de creación': format(new Date(c.created_at), 'dd/MM/yyyy', { locale: es }),
  }));

  exportToCSV(data, `clientes_${format(new Date(), 'yyyy-MM-dd')}`);
}

/**
 * Export deals to CSV
 */
export function exportDealsToCSV(deals: Array<{
  title: string;
  client_name?: string;
  value: number;
  stage: string;
  close_date?: string;
  created_at: string;
}>): void {
  const data = deals.map(d => ({
    Título: d.title,
    Cliente: d.client_name || '',
    Valor: d.value,
    Etapa: d.stage,
    'Fecha de cierre': d.close_date ? format(new Date(d.close_date), 'dd/MM/yyyy', { locale: es }) : '',
    'Fecha de creación': format(new Date(d.created_at), 'dd/MM/yyyy', { locale: es }),
  }));

  exportToCSV(data, `deals_${format(new Date(), 'yyyy-MM-dd')}`);
}

/**
 * Export tasks to CSV
 */
export function exportTasksToCSV(tasks: Array<{
  title: string;
  related_type: string;
  done: boolean;
  due_date: string;
  created_at: string;
}>): void {
  const data = tasks.map(t => ({
    Título: t.title,
    Relacionado: t.related_type,
    Estado: t.done ? 'Completada' : 'Pendiente',
    'Fecha de vencimiento': format(new Date(t.due_date), 'dd/MM/yyyy', { locale: es }),
    'Fecha de creación': format(new Date(t.created_at), 'dd/MM/yyyy', { locale: es }),
  }));

  exportToCSV(data, `tareas_${format(new Date(), 'yyyy-MM-dd')}`);
}

/**
 * Export metrics summary to CSV
 */
export function exportMetricsToCSV(metrics: {
  total_clients: number;
  total_deals: number;
  active_deals: number;
  won_value_sum: number;
  conversion_rate: number;
  pipeline_value: number;
  avg_deal_value: number;
  avg_close_days: number;
  pending_tasks: number;
}): void {
  const data = [
    { Métrica: 'Total de clientes', Valor: metrics.total_clients },
    { Métrica: 'Total de deals', Valor: metrics.total_deals },
    { Métrica: 'Deals activos', Valor: metrics.active_deals },
    { Métrica: 'Valor ganado', Valor: metrics.won_value_sum },
    { Métrica: 'Tasa de conversión (%)', Valor: metrics.conversion_rate },
    { Métrica: 'Valor del pipeline', Valor: metrics.pipeline_value },
    { Métrica: 'Valor promedio por deal', Valor: metrics.avg_deal_value },
    { Métrica: 'Días promedio de cierre', Valor: metrics.avg_close_days },
    { Métrica: 'Tareas pendientes', Valor: metrics.pending_tasks },
  ];

  exportToCSV(data, `metricas_${format(new Date(), 'yyyy-MM-dd')}`);
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print-friendly helper
 */
export function printPage(): void {
  window.print();
}

/**
 * Generate print styles
 */
export function getPrintStyles(): string {
  return `
    @media print {
      body * {
        visibility: hidden;
      }
      #printable, #printable * {
        visibility: visible;
      }
      #printable {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
      @page {
        margin: 1cm;
      }
    }
  `;
}
