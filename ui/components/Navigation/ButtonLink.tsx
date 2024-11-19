"use client";
import { ButtonProps } from "@/libs/patternfly/react-core";
import { Link } from "@/i18n/routing";
import { Route } from "next";

export function ButtonLink<T extends string>({
  href,
  variant,
  children,
}: Pick<ButtonProps, "variant" | "children"> & { href: Route<T> | URL }) {
  return (
    <Link className={`pf-v6-c-button pf-m-${variant}`} href={href}>
      {children}
    </Link>
  );
}
