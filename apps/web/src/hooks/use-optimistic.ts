'use client';

import { useState, useCallback } from 'react';

interface OptimisticState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

interface UseOptimisticOptions<T, R> {
  fetchFn: () => Promise<T[]>;
  createFn?: (data: R) => Promise<T>;
  updateFn?: (id: string, data: Partial<R>) => Promise<T>;
  deleteFn?: (id: string) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useOptimistic<T extends { id: string }, R>({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  onSuccess,
  onError,
}: UseOptimisticOptions<T, R>) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: [],
    isLoading: true,
    error: null,
  });

  // Fetch initial data
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error fetching data';
      setState(prev => ({ ...prev, isLoading: false, error }));
    }
  }, [fetchFn]);

  // Create with optimistic update
  const create = useCallback(async (newData: R) => {
    if (!createFn) return;

    // Create temporary optimistic item
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      ...newData,
      created_at: new Date().toISOString(),
    } as unknown as T;

    // Add optimistic item to state
    setState(prev => ({
      ...prev,
      data: [optimisticItem, ...prev.data],
    }));

    try {
      const created = await createFn(newData);
      
      // Replace temp item with real item
      setState(prev => ({
        ...prev,
        data: prev.data.map(item => 
          item.id === tempId ? created : item
        ),
      }));
      
      onSuccess?.();
    } catch (err) {
      // Rollback on error
      setState(prev => ({
        ...prev,
        data: prev.data.filter(item => item.id !== tempId),
      }));
      
      const error = err instanceof Error ? err.message : 'Error creating item';
      onError?.(error);
    }
  }, [createFn, onSuccess, onError]);

  // Update with optimistic update
  const update = useCallback(async (id: string, updates: Partial<R>) => {
    if (!updateFn) return;

    // Store previous state for rollback
    const previousData = [...state.data];

    // Apply optimistic update
    setState(prev => ({
      ...prev,
      data: prev.data.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));

    try {
      await updateFn(id, updates);
      onSuccess?.();
    } catch (err) {
      // Rollback on error
      setState({ data: previousData, isLoading: false, error: null });
      
      const error = err instanceof Error ? err.message : 'Error updating item';
      onError?.(error);
    }
  }, [updateFn, state.data, onSuccess, onError]);

  // Delete with optimistic update
  const remove = useCallback(async (id: string) => {
    if (!deleteFn) return;

    // Store previous state for rollback
    const previousData = [...state.data];

    // Apply optimistic delete
    setState(prev => ({
      ...prev,
      data: prev.data.filter(item => item.id !== id),
    }));

    try {
      await deleteFn(id);
      onSuccess?.();
    } catch (err) {
      // Rollback on error
      setState({ data: previousData, isLoading: false, error: null });
      
      const error = err instanceof Error ? err.message : 'Error deleting item';
      onError?.(error);
    }
  }, [deleteFn, state.data, onSuccess, onError]);

  return {
    ...state,
    refresh,
    create,
    update,
    remove,
  };
}

// Helper hook for simple optimistic toggle (like marking tasks done/undone)
export function useOptimisticToggle<T extends { id: string; done: boolean }>() {
  const [toggling, setToggling] = useState<string | null>(null);

  const toggle = useCallback(async (
    item: T,
    toggleFn: (id: string, done: boolean) => Promise<void>
  ) => {
    const newDone = !item.done;
    setToggling(item.id);
    
    try {
      await toggleFn(item.id, newDone);
    } finally {
      setToggling(null);
    }
  }, []);

  return { toggle, toggling };
}

export default useOptimistic;
