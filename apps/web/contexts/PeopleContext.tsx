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
import { useQueryClient, useMutation } from '@tanstack/react-query';

type PeopleContextType = {
  people: Person[];
  isLoading: boolean;
  error: unknown;
  selectedIds: string[];
  editTagById: (ids: string[], updates: Partial<Person>) => void;
  setSelectedIds: (ids: string[]) => void;
  selectedPeople: Person[];
  getPersonById: (id: string) => Person | undefined;
  refresh: () => void;
};

type PersonUpdates = Partial<Person>;

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: queryData, isLoading, error } = usePeopleQuery();
  const [people, setPeople] = useState<Person[]>(queryData || []);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (queryData) setPeople(queryData);
  }, [queryData]);

  const mutation = useMutation({
    // Simulate a server update for multiple ids
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: PersonUpdates }) => {
      console.log('Updating people:', ids, 'with updates:', updates);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { ids, updates };
    },

    // Optimistic update for all ids provided
    onMutate: async ({ ids, updates }: { ids: string[]; updates: PersonUpdates }) => {
      console.log('⚡ Applying update to ids:', ids);
      // Cancel any outgoing refetches to avoid clobbering
      await queryClient.cancelQueries({ queryKey: ['people'] });

      // Update local context state
      setPeople((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, ...updates } : p)),
      );

      // Keep React Query cache in sync (if other consumers read directly from the cache)
      queryClient.setQueryData<Person[] | undefined>(['people'], (prev) =>
        prev ? prev.map((p) => (ids.includes(p.id) ? { ...p, ...updates } : p)) : prev,
      );
    },

    onSuccess: () => {
      console.log('Update applied');
    },
  });

  const selectedPeople = useMemo(
    () => people.filter((p) => selectedIds.includes(p.id)),
    [people, selectedIds],
  );

  const editTagById = useCallback(
    (ids: string[], updates: Partial<Person>) => {
      // Trigger the mutation (which handles optimistic update in onMutate)
      mutation.mutate({ ids, updates });
    },
    [mutation],
  );

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
    editTagById,
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
