'use client';

import { Person } from '@/app/types/person';
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { usePeopleQuery } from '../hooks/usePeopleQuery';
import { useQueryClient } from '@tanstack/react-query';

type PeopleContextType = {
  people: Person[];
  isLoading: boolean;
  error: unknown;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectedPeople: Person[];
  getPersonById: (id: string) => Person | undefined;
  refresh: () => void;
};

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data, isLoading, error } = usePeopleQuery();
  const people = useMemo(() => data ?? [], [data]);

  const selectedPeople = useMemo(
    () => people.filter((p) => selectedIds.includes(p.id)),
    [people, selectedIds],
  );

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
