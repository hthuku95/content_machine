import { useState, useCallback } from 'react';

export interface SelectionState<T = string> {
  selectedIds: Set<T>;
  isSelected: (id: T) => boolean;
  toggleSelection: (id: T) => void;
  selectAll: (ids: T[]) => void;
  clearSelection: () => void;
  selectRange: (startId: T, endId: T, allIds: T[]) => void;
  selectedCount: number;
}

export function useSelection<T = string>(): SelectionState<T> {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  const isSelected = useCallback((id: T) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const toggleSelection = useCallback((id: T) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectRange = useCallback((startId: T, endId: T, allIds: T[]) => {
    const startIndex = allIds.indexOf(startId);
    const endIndex = allIds.indexOf(endId);

    if (startIndex === -1 || endIndex === -1) return;

    const [min, max] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
    const rangeIds = allIds.slice(min, max + 1);

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      rangeIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    selectRange,
    selectedCount: selectedIds.size,
  };
}
