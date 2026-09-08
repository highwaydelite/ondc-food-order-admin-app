const ORDER_HEADERS = [
  "Order ID",
  "Transaction ID",
  "RP Order Id",
  "User Mobile",
  "Amount",
  "Created At",
  "Order Status",
  "Order Status Updated At",
  "Booking Status",
];

const SkeletonRow = ({ columns }: { columns: number }) => (
  <tr className="animate-pulse border-b">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="px-4 py-5">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

interface TableLoaderSkeletonProps {
  /** Columns being loaded. Defaults to the orders table this was written for. */
  headers?: string[];
  rows?: number;
}

function TableLoaderSkeleton({
  headers = ORDER_HEADERS,
  rows = 7,
}: TableLoaderSkeletonProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left table-auto">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-gray-600 text-sm font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <SkeletonRow key={index} columns={headers.length} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default TableLoaderSkeleton;
