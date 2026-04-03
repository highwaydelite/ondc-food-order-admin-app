import { Copy } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface TruncatedUUIDProps {
  uuid: string;
  showChars?: number; // optional: number of chars from end
  isLink?: boolean;
}

export function TruncatedUUID({ uuid, showChars = 8 }: TruncatedUUIDProps) {
  const [copied, setCopied] = useState(false);

  const visiblePart = uuid.slice(-showChars);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // ⬅️ this prevents Link navigation
    await navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group inline-flex items-center gap-1">
      {/* Visible truncated text */}
      {/* <span
        className={clsx(
          " text-sm",
          isLink
            ? "text-blue-600 hover:underline cursor-pointer"
            : "text-gray-700"
        )}
      >
        {visiblePart}
      </span> */}

      {/* Copy icon */}

      {/* Tooltip */}
      {/* <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block">
        <div className="bg-black z-50 text-white text-xs rounded px-2 py-1 font-mono whitespace-nowrap shadow">
          {uuid}
        </div>
      </div> */}

      <Tooltip>
        <TooltipTrigger>{visiblePart}</TooltipTrigger>
        <TooltipContent>{uuid}</TooltipContent>
      </Tooltip>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-gray-800"
        title="Copy UUID"
      >
        <Copy size={14} />
      </button>
      {/* Copied feedback */}
      {copied && <span className="text-xs text-green-600 ml-1">Copied</span>}
    </div>
  );
}
