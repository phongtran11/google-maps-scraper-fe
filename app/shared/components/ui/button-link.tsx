import { type VariantProps } from "class-variance-authority";
import { Link, type LinkProps } from "react-router";

import { cn } from "~/shared/utils";

import { buttonVariants } from "../ui/button";

export type ButtonLinkProps = LinkProps & VariantProps<typeof buttonVariants> & {};

export function ButtonLink({ className, size, variant, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
