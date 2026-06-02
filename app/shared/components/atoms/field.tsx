interface FieldProps {
  children: React.ReactNode;
  label: string;
}

export function Field({ children, label }: FieldProps) {
  return (
    <dl>
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm">
        {children ?? <span className="text-muted-foreground">-</span>}
      </dd>
    </dl>
  );
}
