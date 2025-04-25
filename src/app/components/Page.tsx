import type { ReactNode } from "react";

export const Page = ({ children }: { children: ReactNode }) => (
  <main className="page">{children}</main>
);
