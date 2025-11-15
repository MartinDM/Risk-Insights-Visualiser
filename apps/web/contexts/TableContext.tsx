'use client';

import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { Person } from '@/app/types/person';
import { DateRange } from '@/app/types/types';
import {
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  Table,
} from '@tanstack/react-table';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getColumns } from '../../web/components/DataTable/columns';
import { usePeople } from './PeopleContext';

type TableContextType = {
  table: Table<Person>;
  valsHidden: boolean;
  setValsHidden: (value: boolean) => void;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  refresh: () => void;
  selectionCount: number;
};
const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const { people: data, refresh } = usePeople();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [valsHidden, setValsHidden] = useState(false);
  const columns = useMemo(() => getColumns(valsHidden), [valsHidden]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Register table methods
  const features = useMemo(
    () => ({
      getCoreRowModel: getCoreRowModel<Person>(),
      getFilteredRowModel: getFilteredRowModel<Person>(),
      getSortedRowModel: getSortedRowModel<Person>(),
      getPaginationRowModel: getPaginationRowModel<Person>(),
      getFacetedRowModel: getFacetedRowModel<Person>(),
      getFacetedUniqueValues: getFacetedUniqueValues<Person>(),
    }),
    [],
  );

  const table = useReactTable<Person>({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    enableSorting: true,
    enableMultiSort: true,
    enableFilters: true,
    manualPagination: false,
    autoResetPageIndex: false,
    initialState: {
      pagination: { pageSize: 50 },
    },
    ...features,
  });

  const selectionCount = useMemo(
    () => table.getSelectedRowModel().rows.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowSelection, table],
  );

  // Apply date range filter to DOB column when dateRange changes
  useEffect(() => {
    const col = table.getColumn('dob');
    if (!col) return;
    if (dateRange.from || dateRange.to) {
      col.setFilterValue({ from: dateRange.from, to: dateRange.to });
    } else {
      col.setFilterValue(undefined);
    }
  }, [dateRange, table]);

  return (
    <TableContext.Provider
      value={{
        table,
        valsHidden,
        setValsHidden,
        dateRange,
        setDateRange,
        refresh,
        selectionCount,
      }}
    >
      {' '}
      {children}
    </TableContext.Provider>
  );
}

export function useTable(): TableContextType {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error('useTable must be used within a TableProvider');
  return ctx;
}
