'use client';

import { Person } from '@/app/types/person';
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { usePeopleQuery } from '../hooks/usePeopleQuery';
import { useQueryClient } from '@tanstack/react-query';

type PeopleContextType = {
  people: Person[];
  isLoading: boolean;
  error: unknown;
  selectedIds: string[];
  addTagToPerson: (id: string, updates: Partial<Person>) => void;
  setSelectedIds: (ids: string[]) => void;
  selectedPeople: Person[];
  getPersonById: (id: string) => Person | undefined;
  refresh: () => void;
};

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: queryData, isLoading, error } = usePeopleQuery();
  const [people, setPeople] = useState<Person[]>(queryData || []);

  useEffect(() => {
    if (queryData) setPeople(queryData);
  }, [queryData]);

  useEffect(() => {
    console.log(people);
  }, [people]);

  const selectedPeople = useMemo(
    () => people.filter((p) => selectedIds.includes(p.id)),
    [people, selectedIds],
  );

  const addTagToPerson = useCallback((id: string, updates: Partial<Person>) => {
    console.log('Applying tag:', updates, 'to person:', id);
    // Optimistic update - immediately update local state
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    // TODO: Add actual API mutation here when backend is ready
    // Example:
    // mutate({ id, updates }, {
    //   onError: () => {
    //     // Revert on error
    //     setPeople(queryData || []);
    //   }
    // });
  }, []);

  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['people'] });
  };

  const getPersonById = useCallback(
    (id: string) => people.find((p) => p.id === id),
    [people],
  );

  const value: PeopleContextType = {
    people,
    isLoading,
    error,
    selectedIds,
    addTagToPerson,
    setSelectedIds,
    selectedPeople,
    getPersonById,
    refresh,
  };

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
}

export function usePeople() {
  const ctx = useContext(PeopleContext);
  if (!ctx) throw new Error('usePeople must be used within a PeopleProvider');
  return ctx;
}
