import { useState } from 'react';
import type { FormEvent } from 'react';
import { Paper, InputBase, IconButton, CircularProgress } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({ onSearch, isLoading = false, placeholder = 'Search YouTube videos...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <InputBase
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
        sx={{ ml: 1, flex: 1 }}
        inputProps={{ 'aria-label': 'search youtube videos' }}
      />
      <IconButton type="submit" disabled={isLoading || !query.trim()} aria-label="search">
        {isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
      </IconButton>
    </Paper>
  );
}
