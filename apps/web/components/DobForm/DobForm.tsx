'use client';
import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Calendar } from '@workspace/ui/components/calendar';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { FormSchema } from '../../app/data/schema';
import { useTable } from '@/contexts/TableContext';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';

type DobFormValues = z.infer<typeof FormSchema>;

export const DobForm: React.FC = () => {
  const { setDateRange } = useTable();
  const [defaultMonth, setDefaultMonth] = React.useState<Date>(new Date(1980, 0));

  const form = useForm<DobFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { dob: { from: undefined, to: undefined } },
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
                          'p-2 mx-auto font-normal',
                          !field.value?.from && 'text-muted-foreground',
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
                      defaultMonth={defaultMonth}
                      selected={
                        field.value?.from
                          ? { from: field.value.from, to: field.value.to }
                          : undefined
                      }
                      onSelect={(range) => {
                        let finalRange = range;
                        // If from is selected and to is not, set to to today
                        if (range?.from && !range?.to) {
                          finalRange = { from: range.from, to: new Date() };
                        }
                        // Update defaultMonth to the latest selected date (from or to)
                        if (finalRange?.to) {
                          setDefaultMonth(finalRange.to);
                        } else if (finalRange?.from) {
                          setDefaultMonth(finalRange.from);
                        }
                        field.onChange(finalRange);
                        setDateRange(finalRange || { from: undefined, to: undefined });
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
