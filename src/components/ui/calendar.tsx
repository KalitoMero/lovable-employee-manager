
import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomCaption({ displayMonth, currMonth, setCurrMonth }: CaptionProps & { currMonth: Date, setCurrMonth: (date: Date) => void }) {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate a range of years from 1920 to current year + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 6 }, (_, i) => currentYear - i + 5).reverse();
  
  const handleMonthChange = (monthValue: string) => {
    const newMonth = new Date(currMonth);
    newMonth.setMonth(months.indexOf(monthValue));
    setCurrMonth(newMonth);
  };
  
  const handleYearChange = (yearValue: string) => {
    const newMonth = new Date(currMonth);
    newMonth.setFullYear(parseInt(yearValue, 10));
    setCurrMonth(newMonth);
  };
  
  return (
    <div className="flex justify-between items-center px-2">
      {/* Month dropdown */}
      <Select
        value={format(displayMonth, "MMMM")}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="h-8 w-[110px] text-xs border-none focus:ring-0">
          <SelectValue placeholder={format(displayMonth, "MMMM")} />
        </SelectTrigger>
        <SelectContent position="popper" className="pointer-events-auto">
          {months.map((month) => (
            <SelectItem key={month} value={month} className="text-xs">
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Year dropdown */}
      <Select
        value={format(displayMonth, "yyyy")}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="h-8 w-[70px] text-xs border-none focus:ring-0">
          <SelectValue placeholder={format(displayMonth, "yyyy")} />
        </SelectTrigger>
        <SelectContent position="popper" className="pointer-events-auto max-h-60 overflow-y-auto">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="text-xs">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "buttons",
  fromYear,
  toYear,
  ...props
}: CalendarProps) {
  const [currMonth, setCurrMonth] = React.useState<Date>(props.defaultMonth || new Date());
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: captionLayout === "dropdown-buttons" 
          ? "flex justify-center pt-1 relative items-center"
          : "flex justify-between pt-1 relative items-center",
        caption_label: captionLayout === "dropdown-buttons" 
          ? "hidden"
          : "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: captionLayout === "dropdown-buttons" 
          ? (captionProps) => <CustomCaption {...captionProps} currMonth={currMonth} setCurrMonth={setCurrMonth} />
          : undefined,
      }}
      defaultMonth={currMonth}
      month={currMonth}
      onMonthChange={setCurrMonth}
      fromYear={fromYear}
      toYear={toYear}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
