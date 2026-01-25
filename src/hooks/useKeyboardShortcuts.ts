import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcut sets for common operations
export const commonShortcuts = {
  selectAll: (action: () => void): KeyboardShortcut => ({
    key: 'a',
    ctrl: true,
    action,
    description: 'Select all items',
    preventDefault: true,
  }),

  deselectAll: (action: () => void): KeyboardShortcut => ({
    key: 'Escape',
    action,
    description: 'Clear selection',
  }),

  delete: (action: () => void): KeyboardShortcut => ({
    key: 'Delete',
    action,
    description: 'Delete selected items',
  }),

  refresh: (action: () => void): KeyboardShortcut => ({
    key: 'r',
    ctrl: true,
    action,
    description: 'Refresh data',
    preventDefault: true,
  }),

  search: (action: () => void): KeyboardShortcut => ({
    key: '/',
    action,
    description: 'Focus search',
    preventDefault: true,
  }),

  newItem: (action: () => void): KeyboardShortcut => ({
    key: 'n',
    ctrl: true,
    action,
    description: 'Create new item',
    preventDefault: true,
  }),

  help: (action: () => void): KeyboardShortcut => ({
    key: '?',
    shift: true,
    action,
    description: 'Show keyboard shortcuts',
  }),

  filter: (action: () => void): KeyboardShortcut => ({
    key: 'f',
    ctrl: true,
    action,
    description: 'Toggle filters',
    preventDefault: true,
  }),
};

// Hook for displaying keyboard shortcuts help dialog
export function useKeyboardShortcutsHelp(shortcuts: KeyboardShortcut[]) {
  return shortcuts.map(shortcut => {
    const keys: string[] = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.meta) keys.push('Cmd');
    keys.push(shortcut.key);

    return {
      keys: keys.join(' + '),
      description: shortcut.description,
    };
  });
}
