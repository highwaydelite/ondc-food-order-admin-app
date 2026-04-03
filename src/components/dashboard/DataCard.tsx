import type React from "react";
interface DataCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  children,
  className = "",
}) => (
  <div className={`bg-muted/30 rounded-lg p-2 ${className}`}>{children}</div>
);
