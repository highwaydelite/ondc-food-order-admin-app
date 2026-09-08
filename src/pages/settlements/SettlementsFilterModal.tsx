import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { BusinessDayRangePicker } from "@/components/BusinessDayRangePicker";

/**
 * NOTE: this is the ONDC settlement enum used by `GET /ret11/settlement/all` — a
 * different enum from the order `settleStatus` in `@/utils/adminEnums`, which was
 * corrected separately. Do not merge the two lists.
 */
const statusOptions = {
  settleStatus: [
    "INITIATED",
    "SETTLED",
    "NOT_SETTLED",
    "REINITIATED",
    "HAS_UNSETTLED",
    "REPORT_VERIFIED",
    "NACK",
    "NIL",
  ],
  // sellerStatus: ["INITIATED", "SETTLED", "NOT_SETTLED"],
  // selfStatus: ["INITIATED", "SETTLED", "NOT_SETTLED"],
  type: ["NP_NP", "NIL", "MISC"],
};

// Updated Filters type to match backend DTO
export type SettlementFilters = {
  settleStatus: string;
  sellerStatus: string;
  selfStatus: string;
  type: string;
  createdAt: { startDate: string; endDate: string };
  // transactionId: string;
  // messageId: string;
  // bppId: string;
  // receiverAppId: string;
  // cityCode: string;
  // reconAccord: string; // "true", "false", or ""
};

interface FilterModalProps {
  filters: SettlementFilters;
  onApplyFilters: (filters: SettlementFilters) => void;
  onClearFilters: () => void;
}

export function SettlementsFilterModal({
  filters,
  onApplyFilters,
  onClearFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<SettlementFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Update local filters when external filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof SettlementFilters,
    value:
      | string
      | { startDate?: string; endDate?: string }
      | { min?: string; max?: string }
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]:
        typeof value === "object" &&
        value !== null &&
        typeof prev[key] === "object" &&
        prev[key] !== null
          ? { ...(prev[key] as object), ...value }
          : value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters: SettlementFilters = {
      settleStatus: "",
      sellerStatus: "",
      selfStatus: "",
      type: "",
      createdAt: { startDate: "", endDate: "" },
      // transactionId: "",
      // messageId: "",
      // bppId: "",
      // receiverAppId: "",
      // cityCode: "",
      // reconAccord: "",
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const formatLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      settleStatus: "Settlement Status",
      sellerStatus: "Seller Status",
      selfStatus: "Self Status",
      type: "Settlement Type",
      transactionId: "Transaction ID",
      messageId: "Message ID",
      bppId: "BPP ID",
      receiverAppId: "Receiver App ID",
      cityCode: "City Code",
      // reconAccord: 'Recon Accord'
    };
    return (
      labelMap[key] ||
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;

    // Count status filters
    Object.keys(statusOptions).forEach((key) => {
      if (localFilters[key as keyof typeof statusOptions]) count++;
    });

    // Count search filters
    const searchFields = [
      "transactionId",
      "messageId",
      "bppId",
      "receiverAppId",
      "cityCode",
    ];
    searchFields.forEach((field) => {
      if (localFilters[field as keyof SettlementFilters]) count++;
    });

    // Count date filters
    if (localFilters.createdAt.startDate || localFilters.createdAt.endDate)
      count++;

    // Count recon accord filter
    // if (localFilters.reconAccord) count++;

    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-100 ">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            {/* <Filter className="w-5 h-5" /> */}
            Filters
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 py-4 px-4">
          {/* Search Filters */}
          {/* <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
              Search Filters
            </h3> */}
          {/* Receiver App ID */}
          {/* <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Receiver App ID</label>
              <Input
                type="text"
                placeholder="Enter receiver app ID"
                value={localFilters.receiverAppId}
                onChange={(e) => handleFilterChange('receiverAppId', e.target.value)}
                className="w-full"
              />
            </div> */}
          {/* </div> */}

          {/* Status Filters */}
          <div className="space-y-4">
            {(
              Object.entries(statusOptions) as [
                keyof typeof statusOptions,
                string[]
              ][]
            ).map(([key, options]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {formatLabel(key)}
                </label>
                <Select
                  value={localFilters[key] || "ALL"}
                  onValueChange={(value) =>
                    handleFilterChange(key, value === "ALL" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${formatLabel(key)}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All {formatLabel(key)}</SelectItem>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Recon Accord Filter */}
          {/* <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Reconciliation</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Recon Accord</label>
              <Select
                value={localFilters.reconAccord || "ALL"}
                onValueChange={(value) => handleFilterChange('reconAccord', value === "ALL" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Recon Accord" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="true">Accord</SelectItem>
                  <SelectItem value="false">No Accord</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* Date Filters */}
          <div className="space-y-4 py-4">
            {/* Created At Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Created At
              </label>

              <BusinessDayRangePicker
                className="w-full"
                value={localFilters.createdAt}
                onChange={(range) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    createdAt: {
                      startDate: range.startDate ?? "",
                      endDate: range.endDate ?? "",
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>
        <div className=" p-4 flex justify-between items-center pt-4 border-t mt-auto sticky bottom-0 left-0 w-full bg-white z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 mr-2"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 ml-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
