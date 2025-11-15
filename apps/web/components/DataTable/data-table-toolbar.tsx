'use client';
import { X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { DataTableViewOptions } from './data-table-view-options';

import { risk } from '../../app/data/data';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { useTable } from '@/contexts/TableContext';

export function DataTableToolbar() {
  const { table } = useTable();
  const isFiltered = table.getState().columnFilters.length > 0;
  const riskColumn = table.getColumn('risk');
  return (
    <div className="flex items-center space-between">
      <div className="flex flex-1 items-center space-x-2 mr-2">
        <Input
          placeholder="Filter people..."
          value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table?.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {riskColumn && (
          <DataTableFacetedFilter column={riskColumn} title="Risk" options={risk} />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3 border-dashed"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions />
    </div>
  );
}
