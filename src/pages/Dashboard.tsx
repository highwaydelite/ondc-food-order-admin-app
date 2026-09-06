import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { getOrders } from "@/utils/api";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { FilterModal } from "@/components/dashboard/FilterModal";
import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/dashboard/columns";
import { ExportOrdersButton } from "@/components/dashboard/ExportOrders";
import { ApiErrorState } from "@/components/ApiErrorState";
import { retryUnlessClientError } from "@/utils/queryRetry";
import {
  EMPTY_ORDER_FILTERS,
  MIN_SEARCH_LENGTH,
  ORDER_FILTER_LABELS,
  ORDER_SEARCH_FIELDS,
  ORDER_SEARCH_LABELS,
  ORDER_SEARCH_PLACEHOLDERS,
  SEARCH_DEBOUNCE_MS,
  humanizeEnumValue,
  sanitizeOrderFilters,
} from "@/utils/adminEnums";
import type {
  OrderFilterKey,
  OrderFilterState,
  OrderSearchField,
} from "@/utils/adminEnums";
import { formatBusinessDayLabel } from "@/utils/dateRange";
import {
  ActiveFilterChips,
  type FilterChip,
} from "@/components/dashboard/ActiveFilterChips";

type Filters = OrderFilterState;
type SearchTerms = Record<OrderSearchField, string>;

const EMPTY_SEARCH: SearchTerms = {
  orderId: "",
  paymentOrderId: "",
  userMobile: "",
};

/**
 * Below the minimum length the term is treated as absent rather than sent — one or two
 * characters match almost everything and turn every keystroke into a full table scan.
 */
const applicableTerm = (raw: string) =>
  raw.trim().length >= MIN_SEARCH_LENGTH ? raw.trim() : "";

const Dashboard: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sanitised on init so a stale default/preset can never send a removed enum value.
  const [filters, setFilters] = useState<Filters>(() =>
    sanitizeOrderFilters(EMPTY_ORDER_FILTERS)
  );

  // What the user is typing, before debouncing into `filters`.
  const [searchInputs, setSearchInputs] = useState<SearchTerms>(EMPTY_SEARCH);
  const appliedSearch = useRef<SearchTerms>(EMPTY_SEARCH);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next: SearchTerms = {
        orderId: applicableTerm(searchInputs.orderId),
        paymentOrderId: applicableTerm(searchInputs.paymentOrderId),
        userMobile: applicableTerm(searchInputs.userMobile),
      };
      const prev = appliedSearch.current;

      // Typing that does not change the effective term (e.g. still under the minimum)
      // must not reset the page the user is on.
      const unchanged = ORDER_SEARCH_FIELDS.every(
        (field) => prev[field] === next[field]
      );
      if (unchanged) return;

      appliedSearch.current = next;
      setFilters((current) => sanitizeOrderFilters({ ...current, ...next }));
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInputs]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["orders", pagination.pageIndex, pagination.pageSize, filters],
    // `signal` aborts a superseded search while it is still in flight.
    queryFn: ({ signal }) =>
      // page is 1-based on the server, the table is 0-based; both are mandatory.
      getOrders(
        {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          ...filters,
        },
        signal
      ),
    placeholderData: keepPreviousData,
    // 401/403/400 are deterministic — retrying just repeats the same failure.
    retry: retryUnlessClientError,
  });

  const handleApplyFilters = (newFilters: Partial<Filters>) => {
    setFilters((prev) =>
      sanitizeOrderFilters({
        ...prev,
        ...newFilters,
        createdAt: newFilters.createdAt || {
          startDate: undefined,
          endDate: undefined,
        },
      })
    );
    // A narrower result set can have fewer pages than the page we are on.
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setFilters(sanitizeOrderFilters(EMPTY_ORDER_FILTERS));
    setSearchInputs(EMPTY_SEARCH);
    appliedSearch.current = EMPTY_SEARCH;
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearSearchField = (field: OrderSearchField) => {
    setSearchInputs((prev) => ({ ...prev, [field]: "" }));
    appliedSearch.current = { ...appliedSearch.current, [field]: "" };
    setFilters((prev) => sanitizeOrderFilters({ ...prev, [field]: "" }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearEnumField = (field: OrderFilterKey) => {
    setFilters((prev) => sanitizeOrderFilters({ ...prev, [field]: "" }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const chips: FilterChip[] = [
    ...ORDER_SEARCH_FIELDS.filter((field) => filters[field]).map((field) => ({
      key: field,
      label: ORDER_SEARCH_LABELS[field],
      value: filters[field],
      onRemove: () => clearSearchField(field),
    })),
    ...(
      [
        "paymentStatus",
        "orderStatus",
        "issueStatus",
        "settleStatus",
        "transferStatus",
      ] as OrderFilterKey[]
    )
      .filter((field) => filters[field])
      .map((field) => ({
        key: field,
        label: ORDER_FILTER_LABELS[field],
        value: humanizeEnumValue(filters[field]),
        onRemove: () => clearEnumField(field),
      })),
  ];

  if (filters.createdAt?.startDate || filters.createdAt?.endDate) {
    const from = formatBusinessDayLabel(filters.createdAt.startDate);
    const to = formatBusinessDayLabel(filters.createdAt.endDate);
    chips.push({
      key: "createdAt",
      label: "Created",
      value: from && to ? `${from} – ${to}` : from || to,
      onRemove: () =>
        handleApplyFilters({
          createdAt: { startDate: undefined, endDate: undefined },
        }),
    });
  }

  if (isLoading) return <TableLoaderSkeleton />;
  if (isError)
    return (
      <ApiErrorState
        error={error}
        fallback="Something Went Wrong. Cannot fetch orders"
        onRetry={() => refetch()}
      />
    );

  // quote / payment / billing / rpRouteTransfer can each be null — guard every access.
  const transformedOrders = (data?.data?.orders ?? []).map((order: any) => ({
    orderId: order.id,
    paymentOrderId: order.paymentOrderId,
    providerName: order.providerName,
    userName: order.billing?.name ?? "-",
    userPhone: order.billing?.phone ?? "-",
    amount: order.quote?.value ?? order.payment?.amount ?? null,
    createdAt: order.createdAt,
    paymentStatus: order.paymentOrderStatus,
    paymentStatusAt: order.paymentOrderStatusAt,
    orderStatus: order.state,
    orderStatusAt: order.stateUpdatedAt,
    issueStatus: order.issueStatus,
    issueStatusAt: order.issueStatusAt,
    settleStatus: order.payment?.settleStatus ?? "NA",
    settleStatusAt: order.payment?.settleUpdatedAt ?? null,
    // "no transfer record" and "transfer exists but has no settlement status yet"
    // must read differently, so keep them as distinct states rather than one "NA".
    hasTransfer: Boolean(order.rpRouteTransfer),
    transferStatus: order.rpRouteTransfer?.status ?? null,
    transferStatusAt: order.rpRouteTransfer?.statusUpdatedAt ?? null,
    transferSettleStatus: order.rpRouteTransfer?.settlementStatus ?? null,
  }));

  const pendingMinLength = ORDER_SEARCH_FIELDS.some((field) => {
    const typed = searchInputs[field].trim();
    return typed.length > 0 && typed.length < MIN_SEARCH_LENGTH;
  });

  return (
    <div className="bg-white rounded-xl">
      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          {/* Partial, case-insensitive searches — sent as typed, debounced. */}
          <div className="flex flex-wrap gap-3">
            {ORDER_SEARCH_FIELDS.map((field) => (
              <label key={field} className="flex flex-col gap-1">
                <span className="px-1 text-xs text-gray-600">
                  {ORDER_SEARCH_LABELS[field]}
                </span>
                <input
                  type="text"
                  value={searchInputs[field]}
                  onChange={(e) =>
                    setSearchInputs((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  placeholder={ORDER_SEARCH_PLACEHOLDERS[field]}
                  className="h-10 w-52 rounded-md border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-row flex-wrap gap-4">
            <ExportOrdersButton filters={filters} />
            <FilterModal
              filters={filters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {pendingMinLength && (
          <p className="mb-3 text-xs text-gray-500">
            Type at least {MIN_SEARCH_LENGTH} characters to search.
          </p>
        )}

        <ActiveFilterChips chips={chips} onClearAll={handleClearFilters} />

        <DataTable
          columns={columns}
          data={transformedOrders}
          total={data?.data?.total ?? 0}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
};

export default Dashboard;
