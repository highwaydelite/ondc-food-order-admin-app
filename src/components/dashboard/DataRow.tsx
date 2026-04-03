import type React from "react";

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DataRow: React.FC<DataRowProps> = ({
  label,
  value,
  onClick,
  className,
}) => (
  <div className="py-3 border-b last:border-b-0">
    <p className="text-sm text-muted-foreground">{label}</p>
    <div
      className={`font-medium text-base ${className} ${
        onClick ? "text-blue-600 hover:underline cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {value}
    </div>
  </div>
);
