import { useState } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { statusOptions } from "./columns";

type Filters = {
  orderStatus: string;
  paymentStatus: string;
  issueStatus: string;
  settleStatus: string;
  createdAt: { startDate?: string; endDate?: string };
};

interface FilterModalProps {
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
}
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function FilterModal({
  filters,
  onApplyFilters,
  onClearFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [open, setOpen] = useState(false);
  const handleFilterChange = (
    key: keyof Filters,
    value: string | { startDate?: string; endDate?: string }
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      orderStatus: "",
      paymentStatus: "",
      issueStatus: "",
      settleStatus: "",
      createdAt: { startDate: "", endDate: "" },
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    setOpen(false);
  };

  const getLabel = (key: string) => {
    if (key === "orderStatus") return "Order Status";
    if (key === "paymentStatus") return "Payment Status";
    if (key === "issueStatus") return "Issue Status";
    if (key === "settleStatus") return "Settlement Status";
    return key;
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-10/12 flex flex-col justify-between">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 px-4 w-full">
          {(
            Object.entries(statusOptions) as [
              keyof Omit<Filters, "createdAt">,
              string[]
            ][]
          ).map(([key, options]) => (
            <div key={key} className="items-center flex flex-wrap gap-2 w-full">
              <label htmlFor={key} className="w-full text-gray-800 px-1">
                {getLabel(key)}
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
                  <SelectValue placeholder={`Select ${getLabel(key)}`} />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {options.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="w-full capitalize"
                    >
                      {option.replace(/_/g, " ").toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Date Range Picker */}
          <div className="items-center flex flex-col gap-2 w-full">
            <label className="w-full text-gray-800 px-1">Created At</label>
            <div className="flex w-full gap-2">
              <DatePicker
                selected={
                  localFilters.createdAt?.startDate
                    ? new Date(localFilters.createdAt.startDate)
                    : undefined
                }
                onChange={(date: any) =>
                  handleFilterChange("createdAt", {
                    ...localFilters.createdAt,
                    startDate: date
                      ? date.toLocaleDateString("en-CA")
                      : undefined,
                  })
                }
                className="border p-2 rounded-md w-full"
                placeholderText="Start Date"
                selectsStart
                startDate={
                  localFilters.createdAt?.startDate
                    ? new Date(localFilters.createdAt.startDate)
                    : undefined
                }
                endDate={
                  localFilters.createdAt?.endDate
                    ? new Date(localFilters.createdAt.endDate)
                    : undefined
                }
              />

              <DatePicker
                selected={
                  localFilters.createdAt?.endDate
                    ? new Date(localFilters.createdAt.endDate)
                    : undefined
                }
                onChange={(date: any) =>
                  handleFilterChange("createdAt", {
                    ...localFilters.createdAt,
                    endDate: date
                      ? date.toLocaleDateString("en-CA")
                      : undefined,
                  })
                }
                className="border p-2 rounded-md w-full"
                placeholderText="End Date"
                selectsEnd
                startDate={
                  localFilters.createdAt?.startDate
                    ? new Date(localFilters.createdAt.startDate)
                    : undefined
                }
                endDate={
                  localFilters.createdAt?.endDate
                    ? new Date(localFilters.createdAt.endDate)
                    : undefined
                }
                minDate={
                  localFilters.createdAt?.startDate
                    ? new Date(localFilters.createdAt.startDate)
                    : undefined
                }
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mb-4 mr-4">
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
