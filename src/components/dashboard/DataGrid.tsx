import type React from "react";
interface DataGridProps {
  children: React.ReactNode;
  columns?: number;
}

export const DataGrid: React.FC<DataGridProps> = ({
  children,
  columns = 2,
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
    {children}
  </div>
);
