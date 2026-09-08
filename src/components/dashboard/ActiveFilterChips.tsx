import { X } from "lucide-react";

export type FilterChip = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onClearAll: () => void;
}

/**
 * Makes it obvious why the table is narrowed — especially for the search boxes, which
 * now match partially and can quietly cut the result set down.
 */
export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  chips,
  onClearAll,
}) => {
  if (!chips.length) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex items-center gap-1 rounded-full border bg-gray-50 py-1 pl-3 pr-1 text-xs text-gray-700"
        >
          <span className="text-gray-500">{chip.label}:</span>
          <span className="font-medium">{chip.value}</span>
          <button
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
            className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-gray-500 underline hover:text-gray-700"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilterChips;
