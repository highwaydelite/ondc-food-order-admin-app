import { useEffect, useState } from "react";
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
import {
  ALL_OPTION,
  ORDER_FILTER_HINTS,
  ORDER_FILTER_LABELS,
  ORDER_FILTER_OPTIONS,
  humanizeEnumValue,
  sanitizeEnumValue,
} from "@/utils/adminEnums";
import type { OrderFilterKey } from "@/utils/adminEnums";
import { BusinessDayRangePicker } from "../BusinessDayRangePicker";

type Filters = {
  orderStatus: string;
  paymentStatus: string;
  issueStatus: string;
  settleStatus: string;
  transferStatus: string;
  createdAt: { startDate?: string; endDate?: string };
};

interface FilterModalProps {
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
}

const EMPTY: Filters = {
  orderStatus: "",
  paymentStatus: "",
  issueStatus: "",
  settleStatus: "",
  transferStatus: "",
  createdAt: { startDate: undefined, endDate: undefined },
};

/**
 * Every enum is validated strictly server-side now, so values are sanitised on the way
 * in (a stale preset holding a removed value such as `NACK` falls back to "All") and
 * "All" is represented by an empty value that the query builder omits entirely —
 * sending `orderStatus=` would be a 400.
 */
const sanitize = (filters: Filters): Filters => ({
  ...EMPTY,
  ...filters,
  paymentStatus: sanitizeEnumValue("paymentStatus", filters?.paymentStatus),
  orderStatus: sanitizeEnumValue("orderStatus", filters?.orderStatus),
  issueStatus: sanitizeEnumValue("issueStatus", filters?.issueStatus),
  settleStatus: sanitizeEnumValue("settleStatus", filters?.settleStatus),
  transferStatus: sanitizeEnumValue("transferStatus", filters?.transferStatus),
  createdAt: {
    startDate: filters?.createdAt?.startDate || undefined,
    endDate: filters?.createdAt?.endDate || undefined,
  },
});

export function FilterModal({
  filters,
  onApplyFilters,
  onClearFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(() =>
    sanitize(filters)
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(sanitize(filters));
  }, [filters]);

  const handleFilterChange = (
    key: keyof Filters,
    value: string | { startDate?: string; endDate?: string }
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(sanitize(localFilters));
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFilters(EMPTY);
    onClearFilters();
    setOpen(false);
  };

  const activeCount =
    (Object.keys(ORDER_FILTER_OPTIONS) as OrderFilterKey[]).filter(
      (key) => localFilters[key]
    ).length +
    (localFilters.createdAt?.startDate || localFilters.createdAt?.endDate
      ? 1
      : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative ml-auto">
          Filters
          {activeCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-medium text-black">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-10/12 flex flex-col justify-between">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 px-4 w-full overflow-y-auto">
          {(
            Object.entries(ORDER_FILTER_OPTIONS) as [
              OrderFilterKey,
              readonly string[]
            ][]
          ).map(([key, options]) => (
            <div key={key} className="items-center flex flex-wrap gap-2 w-full">
              <label htmlFor={key} className="w-full text-gray-800 px-1">
                {ORDER_FILTER_LABELS[key]}
                {ORDER_FILTER_HINTS[key] && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {ORDER_FILTER_HINTS[key]}
                  </span>
                )}
              </label>
              <Select
                value={localFilters[key] || ALL_OPTION}
                onValueChange={(value) =>
                  handleFilterChange(key, value === ALL_OPTION ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={`Select ${ORDER_FILTER_LABELS[key]}`}
                  />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value={ALL_OPTION} className="w-full">
                    All
                  </SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option} value={option} className="w-full">
                      {humanizeEnumValue(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Created At — IST business days; converted to exact UTC instants on request. */}
          <div className="items-center flex flex-col gap-2 w-full">
            <label className="w-full text-gray-800 px-1">Created At</label>
            <BusinessDayRangePicker
              className="w-full"
              value={localFilters.createdAt}
              onChange={(range) => handleFilterChange("createdAt", range)}
            />
          
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
