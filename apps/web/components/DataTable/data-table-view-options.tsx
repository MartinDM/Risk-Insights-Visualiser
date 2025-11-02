'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  BarChart3,
  Briefcase,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  Settings2,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Person } from '../../app/types/person';
import { LocationInsightsModal } from '../Modals';
import { ProfileModal } from '../Modals/ProfileModal';
import { usePeople } from '@/contexts/PeopleContext';
import { useTable } from '@/contexts/TableContext';

export function DataTableViewOptions() {
  const { table, setValsHidden, valsHidden, selectionCount } = useTable();
  const { refresh, selectedIds, setSelectedIds } = usePeople();
  const router = useRouter();
  const [openInsights, setOpenInsights] = useState<boolean>(false);
  const [openPersonModal, setOpenPersonModal] = useState<boolean>(false);
  const [openLocationModal, setOpenLocationModal] = useState<boolean>(false);

  const rowSelection = table.getState().rowSelection;

  useEffect(() => {
    const rows = table.getSelectedRowModel().rows;
    setSelectedIds(rows.map((row) => (row.original as Person).id));
  }, [rowSelection, setSelectedIds, table]);

  const handleValuesToggle = () => {
    setValsHidden(!valsHidden);
  };

  const handleRiskModal = () => {
    setOpenLocationModal(true);
  };

  const handlePersonProfile = () => {
    setOpenPersonModal(true);
  };

  const handleGroupInsights = () => {
    router.push('/map');
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleValuesToggle}
        variant="outline"
        size="sm"
        className="h-8 border-dashed"
      >
        {valsHidden ? <EyeOff /> : <Eye />}
        {valsHidden ? 'Show values' : 'Hide values'}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <Settings2 />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => column.accessorFn && column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedIds.length === 0 ? (
        <Button disabled variant="outline" size="sm" className="h-8 border-dashed">
          <Settings2 />
          Insights (0)
        </Button>
      ) : (
        <DropdownMenu open={openInsights} onOpenChange={setOpenInsights}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <BarChart3 className="h-4 w-4" />
              Insights ({selectionCount})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {selectionCount === 1 ? (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 ">
                  <User className="h-4 w-4" />
                  <strong>Individual Insights</strong>
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleRiskModal();
                    }}
                  >
                    <Link className="flex cursor-default" href={`risk/${selectedIds[0]}`}>
                      <Briefcase className="mr-2 h-4 text-cyan-600" />
                      Risk Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link className="flex cursor-default" href={`map/${selectedIds[0]}`}>
                      <MapPin className="mr-2 h-4 w-4 text-cyan-600" />
                      Map Visualiser
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handlePersonProfile();
                  }}
                >
                  <Eye className="mr-2 h-4 w-4 text-cyan-600" />
                  View Full Profile
                </DropdownMenuItem>
              </>
            ) : (
              // Multiple people selected - show group insights
              <>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Group Insights
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleGroupInsights}>
                    <Globe className="mr-2 h-4 w-4" />
                    Geographic Distribution
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Button
        variant="outline"
        onClick={() => {
          refresh();
          table.resetRowSelection(); // optional
        }}
      >
        Re-gen people
      </Button>

      <ProfileModal
        isOpen={openPersonModal}
        onOpenChange={setOpenPersonModal}
        personId={selectedIds[0] || ''}
      />

      <LocationInsightsModal
        isOpen={openLocationModal}
        onOpenChange={setOpenLocationModal}
        personId={selectedIds[0] || ''}
      />
    </div>
  );
}
