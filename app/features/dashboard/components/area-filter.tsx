export interface AreaFilterProps {
  /** The list of area labels to display as filter chips. */
  areas: readonly string[];
  /** The currently selected area, or empty string for "all". */
  activeArea: string;
  /** Called with the clicked area label; the parent toggles selection. */
  onAreaChange: (area: string) => void;
}

export function AreaFilter({ areas, activeArea, onAreaChange }: AreaFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {areas.map((a) => (
        <button
          key={a}
          onClick={() => onAreaChange(a)}
          className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            activeArea === a
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
