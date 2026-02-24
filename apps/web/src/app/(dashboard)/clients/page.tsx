'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  X,
  UserPlus,
} from 'lucide-react';
import { CreateClientSchema, type CreateClientInput, type Client } from '@salescore/shared';
import { api } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ClientsTableSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/empty-state';
import { toast } from '@/hooks/use-toast';

const PAGE_SIZE = 15;

function ClientFormDialog({
  open,
  onClose,
  onSuccess,
  editClient,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editClient?: Client | null;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: editClient
      ? { name: editClient.name, phone: editClient.phone, email: editClient.email || '', notes: editClient.notes || '' }
      : {},
  });

  React.useEffect(() => {
    if (editClient) {
      reset({ name: editClient.name, phone: editClient.phone, email: editClient.email || '', notes: editClient.notes || '' });
    } else {
      reset({ name: '', phone: '', email: '', notes: '' });
    }
  }, [editClient, reset]);

  const onSubmit = async (data: CreateClientInput) => {
    setIsLoading(true);
    try {
      if (editClient) {
        await api.patch(`/clients/${editClient.id}`, data);
        toast({ title: 'Cliente actualizado', variant: 'default' });
      } else {
        await api.post('/clients', data);
        toast({ title: 'Cliente creado', variant: 'default' });
      }
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
          <DialogTitle>{editClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" placeholder="Juan Pérez" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
            <Input id="phone" placeholder="+54 11 1234-5678" {...register('phone')} className={errors.phone ? 'border-red-500' : ''} />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="juan@empresa.com" {...register('email')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              placeholder="Información adicional..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="brand" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editClient ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editClient, setEditClient] = React.useState<Client | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setOffset(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(offset));
      const res = await api.get<{ items: Client[]; total: number }>(`/clients?${params}`);
      setClients(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      toast({ 
        title: 'Error al cargar clientes', 
        description: err instanceof Error ? err.message : 'Error desconocido', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, offset]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/clients/${deleteId}`);
      toast({ title: 'Cliente eliminado', description: 'El cliente ha sido eliminado correctamente.' });
      fetchClients();
    } catch (err: unknown) {
      toast({ 
        title: 'Error al eliminar', 
        description: err instanceof Error ? err.message : 'No se pudo eliminar el cliente', 
        variant: 'destructive' 
      });
    } finally {
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{total} clientes registrados</p>
        </div>
        <Button variant="brand" onClick={() => { setEditClient(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <ClientsTableSkeleton />
          ) : clients.length === 0 ? (
            debouncedSearch ? (
              <EmptyState
                icon={Search}
                title="Sin resultados"
                description={`No se encontraron clientes que coincidan con "${debouncedSearch}"`}
                actionLabel="Limpiar filtro"
                onAction={() => setSearch('')}
              />
            ) : (
              <EmptyState
                icon={UserPlus}
                title="No hay clientes aún"
                description="Creá tu primer cliente para comenzar a gestionar tu pipeline de ventas."
                actionLabel="Crear cliente"
                onAction={() => { setEditClient(null); setDialogOpen(true); }}
              />
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Teléfono</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Email</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Creado</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold flex-shrink-0">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <button
                              onClick={() => router.push(`/clients/${client.id}`)}
                              className="text-sm font-medium text-gray-900 hover:text-brand-600 transition-colors text-left"
                            >
                              {client.name}
                            </button>
                            {client.notes && (
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">{client.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {client.email ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {client.email}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(client.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/clients/${client.id}`)}
                            className="h-8 px-2 text-gray-500 hover:text-brand-600"
                          >
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditClient(client); setDialogOpen(true); }}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-brand-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(client.id)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <ClientFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditClient(null); }}
        onSuccess={fetchClients}
        editClient={editClient}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar cliente?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Esta acción no se puede deshacer. Se eliminarán también los deals y tareas asociados.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
