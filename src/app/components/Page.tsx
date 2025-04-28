import type { ReactNode } from "react";
import classNames from "classnames";

export const Page = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <main className={classNames("page", className)}>{children}</main>;
