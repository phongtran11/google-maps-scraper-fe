import { Link, type LinkProps } from "react-router";

import { cn } from "~/shared/utils";

import { buttonBase, buttonVariants } from "./button";

export interface ButtonLinkProps extends LinkProps {
  size?: keyof typeof buttonVariants.size;
  variant?: keyof typeof buttonVariants.variant;
}

export function ButtonLink({
  className,
  size = "default",
  variant = "default",
  ...props
}: ButtonLinkProps) {
  const isIconOnly = size === "icon";

  return (
    <Link
      className={cn(
        buttonBase,
        buttonVariants.variant[variant],
        !isIconOnly && buttonVariants.size[size],
        isIconOnly && buttonVariants.size.icon,
        className,
      )}
      {...props}
    />
  );
}
