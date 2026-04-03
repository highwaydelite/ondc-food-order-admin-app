import type React from "react";

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  icon,
}) => (
  <div className="flex items-center">
    {icon}
    <div>
      <span className="text-sm text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  </div>
);
