import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: ((query: string) => void) | null;
  registerOnSearch: (callback: ((query: string) => void) | null) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQueryState] = useState('');
  const [onSearch, setOnSearch] = useState<((query: string) => void) | null>(null);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    if (onSearch) {
      onSearch(query);
    }
  }, [onSearch]);

  const registerOnSearch = useCallback((callback: ((query: string) => void) | null) => {
    setOnSearch(() => callback);
  }, []);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, onSearch, registerOnSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
