'use client';
import { DobForm } from '@/components/DobForm/DobForm';
import { useTable } from '@/contexts/TableContext';
import { flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

// Local date range state removed; now sourced from context
import { DataTableToolbar } from './data-table-toolbar';

export function DataTable() {
  const { table } = useTable();
  const hasData = table.getFilteredRowModel().rows.length > 0;
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="w-full">
      {/* <DobForm /> */}
      {hasData ? (
        <>
          <p className="text-right text-xs font-bold">
            Found {table.getFilteredRowModel().rows.length} results
          </p>
          <p className="text-right text-sm font-semibold text-zinc-200 mb-2">
            {selectedCount} selected
          </p>
        </>
      ) : (
        <p className="text-center py-4">Loading...</p>
      )}

      <div className="flex items-center py-4">
        <DataTableToolbar />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
