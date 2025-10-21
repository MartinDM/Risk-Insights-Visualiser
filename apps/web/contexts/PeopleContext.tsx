'use client';

import { Person } from '@/app/types/person';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createPeople } from '../../web/app/utils/helpers';

type PeopleContextType = {
  people: Person[];
  getPersonById: (id: string) => Person | undefined;
  refresh: () => void;
  loaded: boolean;
};
const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const people = createPeople(20);
    setPeople(people);
    setLoaded(true);
  }, []);

  const refresh = () => {
    setLoaded(false);
    setPeople(createPeople(20));
  };

  const getPersonById: (id: string) => Person | undefined = (id: string) =>
    people.find((p) => p.id === id);

  // Context value is stable enough without useMemo since the functions are defined in the component
  const value = { people, getPersonById, refresh, loaded };

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
}

export function usePeople() {
  const ctx = useContext(PeopleContext);
  if (!ctx) throw new Error('usePeople must be used within a PeopleProvider');
  return ctx;
}
