import { cn } from "~/shared/utils";

export type PageHeaderProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  actions?: React.ReactNode;
  description?: React.ReactNode;
  title: React.ReactNode;
};

export function PageHeader({ actions, className, description, title, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {actions && <div className="mt-2 flex items-center gap-2 sm:mt-0">{actions}</div>}
    </div>
  );
}
