import { createPeople } from '../../app/utils/helpers';
import { Person } from '@/app/types/person';

export async function getPeople(): Promise<Person[]> {
  return createPeople(50);
}
