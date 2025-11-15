import { z } from 'zod';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  UserSearch,
  WifiOff,
  Navigation,
} from 'lucide-react';

export const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  risk: z.number().int().min(0).max(100),
  accountNumber: z.string(),
  salary: z.number(),
  bio: z.string(),
  dob: z.string(), // ISO date string
  location: z.object({
    city: z.string(),
    coords: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
});

export const tags = [
  {
    value: 'In transit',
    label: 'In transit',
    icon: Navigation,
  },
  {
    value: 'Off grid',
    label: 'Off grid',
    icon: WifiOff,
  },
  {
    value: 'For review',
    label: 'For review',
    icon: UserSearch,
  },
];

export const risk = [
  {
    label: 'Low',
    value: 'Low',
    icon: ArrowDown,
  },
  {
    label: 'Medium',
    value: 'Medium',
    icon: ArrowRight,
  },
  {
    label: 'High',
    value: 'High',
    icon: ArrowUp,
  },
];
