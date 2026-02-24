'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckSquare,
  Plus,
  Loader2,
  Calendar,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import {
  CreateTaskSchema,
  type CreateTaskInput,
  type Task,
  type Client,
  type Deal,
} from '@salescore/shared';
import { api } from '@/lib/api';
import { formatDate, isOverdue, isToday } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type TaskFilter = 'all' | 'today' | 'overdue' | 'upcoming';

function TaskFormDialog({
  open,
  onClose,
  onSuccess,
  clients,
  deals,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
  deals: Deal[];
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: { related_type: 'CLIENT' },
  });

  const relatedType = watch('related_type');
  const relatedId = watch('related_id');

  const onSubmit = async (data: CreateTaskInput) => {
    setIsLoading(true);
    try {
      await api.post('/tasks', data);
      toast({ title: 'Tarea creada' });
      reset({ related_type: 'CLIENT' });
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
          <DialogTitle>Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" placeholder="Ej: Llamar para seguimiento" {...register('title')} className={errors.title ? 'border-red-500' : ''} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={relatedType} onValueChange={(v) => { setValue('related_type', v as 'CLIENT' | 'DEAL'); setValue('related_id', ''); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Cliente</SelectItem>
                  <SelectItem value="DEAL">Deal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Relacionado con</Label>
              <Select value={relatedId} onValueChange={(v) => setValue('related_id', v)}>
                <SelectTrigger className={errors.related_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {relatedType === 'CLIENT'
                    ? clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                    : deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)
                  }
                </SelectContent>
              </Select>
              {errors.related_id && <p className="text-xs text-red-500">{errors.related_id.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due_date">Fecha de vencimiento *</Label>
            <Input id="due_date" type="date" {...register('due_date')} className={errors.due_date ? 'border-red-500' : ''} />
            {errors.due_date && <p className="text-xs text-red-500">{errors.due_date.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="brand" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear tarea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: (id: string, done: boolean) => void; onDelete: (id: string) => void }) {
  const overdue = !task.done && isOverdue(task.due_date);
  const today = !task.done && isToday(task.due_date);

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${task.done ? 'bg-gray-50 border-gray-100' : overdue ? 'bg-red-50 border-red-200' : today ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <button
        onClick={() => onToggle(task.id, !task.done)}
        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-brand-400'}`}
      >
        {task.done && <Check className="h-3 w-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500' : today ? 'text-amber-600' : 'text-gray-400'}`}>
            {overdue ? <AlertCircle className="h-3 w-3" /> : today ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            {formatDate(task.due_date)}
          </div>
          <Badge variant={task.related_type === 'CLIENT' ? 'info' : 'purple'} className="text-xs py-0">
            {task.related_type === 'CLIENT' ? 'Cliente' : 'Deal'}
          </Badge>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-300 hover:text-red-400 transition-colors text-xs px-1"
      >
        ✕
      </button>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<TaskFilter>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const fetchAll = React.useCallback(async () => {
    try {
      const [tasksRes, clientsRes, dealsRes] = await Promise.all([
        api.get<{ items: Task[] }>('/tasks?limit=100'),
        api.get<{ items: Client[] }>('/clients?limit=200'),
        api.get<{ items: Deal[] }>('/deals?limit=200'),
      ]);
      setTasks(tasksRes.items);
      setClients(clientsRes.items);
      setDeals(dealsRes.items);
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggle = async (id: string, done: boolean) => {
    try {
      await api.patch(`/tasks/${id}/done`, { done });
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done } : t));
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Tarea eliminada' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'today') return isToday(task.due_date) && !task.done;
    if (filter === 'overdue') return isOverdue(task.due_date) && !task.done;
    if (filter === 'upcoming') return !isOverdue(task.due_date) && !isToday(task.due_date) && !task.done;
    return true;
  });

  const overdueCount = tasks.filter((t) => isOverdue(t.due_date) && !t.done).length;
  const todayCount = tasks.filter((t) => isToday(t.due_date) && !t.done).length;
  const pendingCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  const filterTabs: { key: TaskFilter; label: string; count: number; color?: string }[] = [
    { key: 'all', label: 'Todas', count: tasks.length },
    { key: 'overdue', label: 'Vencidas', count: overdueCount, color: 'text-red-600' },
    { key: 'today', label: 'Hoy', count: todayCount, color: 'text-amber-600' },
    { key: 'upcoming', label: 'Próximas', count: tasks.filter(t => !isOverdue(t.due_date) && !isToday(t.due_date) && !t.done).length },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-500 mt-1">{pendingCount} pendientes · {doneCount} completadas</p>
        </div>
        <Button variant="brand" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Vencidas', value: overdueCount, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Para hoy', value: todayCount, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Pendientes', value: pendingCount, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Completadas', value: doneCount, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                filter === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
              } ${tab.color || ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <CheckSquare className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium text-gray-500">
            {filter === 'overdue' ? '¡Sin tareas vencidas!' :
             filter === 'today' ? 'Sin tareas para hoy' :
             filter === 'upcoming' ? 'Sin tareas próximas' :
             'Sin tareas aún'}
          </p>
          <p className="text-sm mt-1">
            {filter === 'all' ? 'Creá tu primera tarea' : 'Cambiá el filtro para ver otras tareas'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchAll}
        clients={clients}
        deals={deals}
      />
    </div>
  );
}
