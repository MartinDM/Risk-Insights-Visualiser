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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (queryData) setPeople(queryData);
  }, [queryData]);

  const mutation = useMutation({
    // Returns the updates immediately in-state
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Person> }) => {
      console.log('Updating person:', id, 'with updates:', updates);
      // Simulate a tiny delay for use with the mutation pattern
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id, ...updates };
    },

    // Update state immediately - runs before mutationFn - Used for applying the update optimistically
    // before waiting for the async operation to complete
    onMutate: async ({ id, updates }: { id: string; updates: Partial<Person> }) => {
      console.log('⚡ Applying update');

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['people'] });

      // Update the UI
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    },

    onSuccess: () => {
      console.log('Update applied');
    },
  });

  const selectedPeople = useMemo(
    () => people.filter((p) => selectedIds.includes(p.id)),
    [people, selectedIds],
  );

  const addTagToPerson = useCallback(
    (id: string, updates: Partial<Person>) => {
      // Trigger the mutation (which handles optimistic update in onMutate)
      mutation.mutate({ id, updates });
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
