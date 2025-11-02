'use client';

import { Person } from '@/app/types/person';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { createPeople } from '../../web/app/utils/helpers';

type PeopleContextType = {
  people: Person[];
  refresh: () => void;
  loaded: boolean;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  getPersonById: (id: string) => Person | undefined;
  selectedPeople: Person[];
};

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);

  const getSelectedPeople = useCallback(
    () => people.filter((p) => selectedIds.includes(p.id)),
    [people, selectedIds],
  );

  useEffect(() => {
    const people = createPeople(20);
    setPeople(people);
    setLoaded(true);
  }, []);

  useEffect(() => {
    setSelectedPeople(getSelectedPeople());
  }, [selectedIds, getSelectedPeople]);

  const refresh = () => {
    setLoaded(false);
    setPeople(createPeople(20));
  };

  const getPersonById = (id: string): Person | undefined => {
    return people.find((p) => p.id === id);
  };

  // Context value is stable enough without useMemo since the functions are defined in the component
  const value = {
    people,
    selectedIds,
    setSelectedIds,
    getPersonById,
    refresh,
    loaded,
    selectedPeople,
  };

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
}

export function usePeople() {
  const ctx = useContext(PeopleContext);
  if (!ctx) throw new Error('usePeople must be used within a PeopleProvider');
  return ctx;
}
