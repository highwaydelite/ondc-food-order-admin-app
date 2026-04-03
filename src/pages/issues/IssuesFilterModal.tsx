import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const statusOptions = {
  issueStatus: ["OPEN", "CLOSED", "PROCESSING", "RESOLVED"],
};

type Filters = {
  issueStatus: string;
  // createdAt: { startDate: string; endDate: string }
};

interface FilterModalProps {
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
}
import "react-datepicker/dist/react-datepicker.css";

export function IssuesFilterModal({
  filters,
  onApplyFilters,
  onClearFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleFilterChange = (
    key: keyof Filters,
    value: string //|{ startDate?: string; endDate?: string }
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      issueStatus: "",
      // createdAt: { startDate: '', endDate: '' },
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-10/12 flex flex-col justify-between">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 p-4 w-full">
          {(
            Object.entries(statusOptions) as [
              keyof Omit<Filters, "createdAt">,
              string[]
            ][]
          ).map(([key, options]) => (
            <div key={key} className="items-center flex flex-wrap gap-2 w-full">
              <label htmlFor={key} className="w-full text-gray-800 px-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <Select
                value={
                  typeof localFilters[key] === "string"
                    ? (localFilters[key] as string)
                    : ""
                }
                onValueChange={(value) => handleFilterChange(key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${key}`} />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {options.map((option) => (
                    <SelectItem key={option} value={option} className="w-full">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button
            onClick={handleApply}
            className="bg-yellow-300 hover:bg-yellow-400 text-black"
          >
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
