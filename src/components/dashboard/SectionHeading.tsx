import type React from "react";
interface SectionHeadingProps {
  children: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ children }) => (
  <h3 className="text-lg font-semibold my-2 first:mt-0">{children}</h3>
);
