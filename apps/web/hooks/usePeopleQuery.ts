import { useQuery } from '@tanstack/react-query';
import { getPeople } from '@/app/data/people';

export function usePeopleQuery() {
  return useQuery({
    queryKey: ['people'],
    queryFn: getPeople,
  });
}
