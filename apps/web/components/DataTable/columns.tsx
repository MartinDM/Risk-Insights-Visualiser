'use client';
import { Person } from '@/app/types/person';
import { dateRangeFilter } from '@/app/utils/helpers';
import { Column, ColumnDef, Row, Table } from '@tanstack/react-table';
import { Info } from 'lucide-react';

import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const getRiskByScore = (risk: number) => {
  if (risk < 33) return 'Low';
  if (risk < 66) return 'Medium';
  return 'High';
};

/* ==== ColumnHelper migration (step 1 & 2) ==================================

// (Using manual column definitions until all columns are migrated to columnHelper.)
const columnHelper = createColumnHelper<Person>();

import { createColumnHelper } from '@tanstack/react-table';
const columnHelper = createColumnHelper<Person>();

// 1. Id column (accessor)
const idColumn = columnHelper.accessor('id', {
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Id" />
  ),
  cell: ({ row }) => {
    const id = row.getValue('id') as string;
    return <div className="font-medium">{id}</div>;
  },
  sortingFn: 'alphanumeric',
});

// 2. Account Number column (accessor)
const accountNumberColumn = columnHelper.accessor('accountNumber', {
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Account Number" />
  ),
  cell: ({ row }) => {
    const acct = row.getValue('accountNumber') as string;
    return <div className="font-medium">{acct}</div>;
  },
  sortingFn: 'alphanumeric',
});

// (Optional) Convert the select checkbox column later with:
// const selectColumn = columnHelper.display({ id: 'select', header: ..., cell: ... })

// Usage inside getColumns (replace the manual objects for these two):
// export const getColumns = (valsHidden: boolean): ColumnDef<Person>[] => [
//   /* existing manual select column (or selectColumn if converted) */
//   idColumn,
//   accountNumberColumn,
//   // ...keep remaining manual columns for now
// ];

export const getColumns = (valsHidden: boolean): ColumnDef<Person>[] => [
  {
    id: 'select',
    header: ({ table }: { table: Table<Person> }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(checked: boolean) => table.toggleAllRowsSelected(!!checked)}
        aria-label="Select all"
        className="translate-y-[2px] m-2 border-2 border-white"
      />
    ),
    cell: ({ row }: { row: Row<Person> }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked: boolean) => row.toggleSelected(!!checked)}
        aria-label="Select row"
        className="translate-y-[2px] m-2 border-2 border-amber-400"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      const id = row.getValue('id') as string;
      return <div className="font-medium">{id}</div>;
    },
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'name',
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      return <div className={'font-medium'}>{row.getValue('name')}</div>;
    },
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'risk',
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} title="Risk" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      const riskScore = row.getValue('risk') as number;
      const risk = getRiskByScore(riskScore);
      const riskColor =
        risk === 'Low'
          ? 'text-green-500'
          : risk === 'Medium'
            ? 'text-yellow-500'
            : 'text-red-500';
      return <div className={riskColor + ' font-medium'}>{riskScore}</div>;
    },
    sortingFn: 'alphanumeric',
    filterFn: (row, id, value) => {
      return value.includes(getRiskByScore(row.getValue(id) as number));
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      const location = row.getValue('location') as Person['location'];
      return (
        <div className="font-medium">
          {location.city}, {location.coords.lat}, {location.coords.lng}
        </div>
      );
    },
    filterFn: (row: Row<Person>, id: string, value: string[]) => {
      return value.includes((row.getValue(id) as Person['location']).city);
    },
  },
  {
    accessorKey: 'salary',
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} title="Salary" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      if (valsHidden) return '---';
      const salary = parseFloat(row.getValue('salary'));
      const formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(salary);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'accountNumber',
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} title="Account Number" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      const accountNumber = row.getValue('accountNumber') as string;
      return <div className="font-medium">{accountNumber}</div>;
    },
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'dob',
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      const dob = row.getValue('dob') as string;
      return <div className="font-medium">{dob}</div>;
    },
    sortingFn: 'datetime',
    filterFn: dateRangeFilter,
  },
  {
    id: 'actions',
    cell: ({ row }: { row: Row<Person> }) => <DataTableRowActions row={row} />,
  },
  {
    accessorKey: 'bio',
    enableSorting: false,
    header: ({ column }: { column: Column<Person> }) => (
      <DataTableColumnHeader column={column} disableSorting title="Bio" />
    ),
    cell: ({ row }: { row: Row<Person> }) => {
      const bio = row.getValue('bio') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info />
          </TooltipTrigger>
          <TooltipContent>
            <p>{bio}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
];
