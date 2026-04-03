type StatusType = 'ticketStatus' | 'orderStatus' | 'issueStatus' | 'reconStatus' |'settleStatus' ;

const statusColors: Record<StatusType, Record<string, string>> = {
    ticketStatus: {
      INITIATED: 'border border-blue-500 text-blue-500',
      ACTIVE: 'border border-green-500 text-green-500',
      CANCELLED: 'border border-red-500 text-red-500',
      EXPIRED: 'border border-gray-500 text-gray-500',
      FAILURE: 'border border-yellow-500 text-yellow-500',
    },
    orderStatus: {
      INITIATED: 'border border-blue-500 text-blue-500',
      PENDING: 'border border-yellow-500 text-yellow-500',
      SUCCESS: 'border border-green-500 text-green-500',
      FAILURE: 'border border-red-500 text-red-500',
    },
    issueStatus: {
      NONE: 'border border-gray-500 text-gray-500',
      OPENED: 'border border-blue-500 text-blue-500',
      ESCALATED_TO_SELLER: 'border border-orange-500 text-orange-500',
      CLOSED: 'border border-green-500 text-green-500',
    },
    reconStatus: {
      NONE: 'border border-gray-500 text-gray-500',
      INITIATED: 'border border-blue-500 text-blue-500',
      SETTLED: 'border border-green-500 text-green-500',
      CORRECTION: 'border border-orange-500 text-orange-500',
      CORRECTION_APPROVED:'border border-green-300 text-green-500',
    },
    settleStatus: {
      NOT_SETTLED: 'border border-gray-500 text-gray-500',
      INITIATED: 'border border-blue-500 text-blue-500',
      SETTLED: 'border border-green-500 text-green-500',
      CORRECTION: 'border border-orange-500 text-orange-500',
    },
  };
  

export const getStatusLabel = (statusType: StatusType, status: string) => {
  const colorClass = statusColors[statusType]?.[status] || 'bg-gray-200 text-black';
  return (
      <span className={`px-2 py-1 rounded-md text-sm font-medium ${colorClass}`}>{status}</span>
  )
};
