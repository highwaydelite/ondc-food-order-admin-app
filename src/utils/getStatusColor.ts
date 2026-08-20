export function getStatusColor(status: string) {
  switch (status) {
    // Common Statuses
    case "INITIATED":
    case "NONE":
    case "Created":
    case "OPEN":
      return "border border-[#A0AEC0] bg-[#E2E8F0] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Gray
    case "PENDING":
    case "OPENED":
    case "In_progress":
    case "Pending":
    case "PROCESSING":
      return "border border-[#FACC15] bg-[#FEF3C7] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Yellow
    case "ACTIVE":
    case "SUCCESS":
    case "SETTLED":
    case "Completed":
    case "RESOLVED":
      case 'PROCESSED':
      return "border border-[#3CD856] bg-[#DCFCE7] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Green
    case "SOFT_CANCEL":
    case "ESCALATED_TO_SELLER":
      return "border border-[#F97316] bg-[#FFEDD5] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Orange
    case "CANCELLED":
    case "Cancelled":
    case "HAS_UNSETTLED":
      return "border border-[#FA5A7D] bg-[#FFE2E5] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Red
    case "EXPIRED":
    case "CORRECTION_REQUESTED":
      return "border border-[#FEE140] bg-[#FFF6C4] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Light Yellow
    case "FAILURE":
    case "FAILED":
    case "NOT_SETTLED":
      return "border border-[#DC2626] bg-[#FECACA] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Dark Red
    case "DONE":
    case "CORRECTION_APPROVED":
    case "Accepted":
    case "SUCCESS":
      return "border border-[#4F46E5] bg-[#E0E7FF] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Blue
    case "CLOSED":
      return "border border-[#4B5563] bg-[#D1D5DB] text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Dark Gray

    default:
      return "border border-black bg-white text-black text-[11px] font-light px-3 py-1 rounded w-fit"; // Default Black & White
  }
}
