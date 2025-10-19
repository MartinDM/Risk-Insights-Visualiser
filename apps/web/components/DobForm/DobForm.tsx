"use client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { format } from 'date-fns';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { cn } from '@workspace/ui/lib/utils';
import { FormSchema } from '../../app/utils';
import { useTable } from '@/contexts/TableContext';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';

export type DateRange = { from?: Date | undefined; to?: Date | undefined };

type DobFormValues = {
  dob: DateRange;
};

export const DobForm: React.FC = () => {

  const { setDateRange } = useTable();

  const form = useForm<DobFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { dob: { from: undefined, to: undefined } }, // Ensure dob matches DateRange type
  });

  const handleReset = () => {
    form.reset();
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <>
      <Form {...form}>
        <form className="space-y-2 mb-5">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex font-bold items-center flex-col">
                <h1>Filter by date DOB range</h1>
                <FormLabel> A list of customers born between two dates.</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3  mx-auto font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value && field.value.from ? (
                          field.value.to ? (
                            `${format(field.value.from, 'PPP')} - ${format(field.value.to, 'PPP')}`
                          ) : (
                            format(field.value.from, 'PPP')
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                        <FaRegCalendarAlt className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={field.value}
                      onSelect={(range) => {
                        field.onChange(range);
                        setDateRange(range || { from: undefined, to: undefined });
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center gap-5 mb-4">
            <Button type="button" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
