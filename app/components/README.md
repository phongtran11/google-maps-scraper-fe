# Components

Atomic design structure for the UI component library.

## Directory responsibilities

| Layer | Dir | Responsibility |
|---|---|---|
| **Atoms** | `atoms/` | Primitive, single-purpose UI elements. Cannot be broken down further. Props map 1:1 to a single HTML element. |
| **Molecules** | `molecules/` | Composed of 2+ atoms and/or native elements. Has a distinct UI purpose (card, alert, dialog). May include sub-components. |
| **Organisms** | `organisms/` | Complex, self-contained sections composed of molecules and atoms. Represents a meaningful chunk of UI (table, form, data grid). |

## When adding a new component

1. Place it in the correct layer based on the rules above.
2. Use **named imports** — never `import * as React`:
   ```ts
   import { forwardRef } from "react";
   import type { ComponentProps, ReactNode } from "react";
   ```
3. Only use `forwardRef` if the underlying element benefits from a ref (interactive elements, scrollable containers, measurement targets). Skip it for simple presentational leaf components (descriptions, captions).
4. Define variants as a `const` object and derive a type from it:
   ```ts
   const fooVariants = {
     variant: { default: "...", outline: "..." },
     size: { sm: "...", md: "..." },
   } as const;
   ```
5. Use `cn()` from `~/lib/utils` to merge classes (it combines `clsx` + `tailwind-merge`).
6. Use design tokens (`bg-primary`, `text-muted-foreground`, `border-border`, etc.) — never hardcode colors.
7. Export the component, its variants object, and its prop types:
   ```ts
   export { Foo, fooVariants };
   export type { FooProps };
   ```
8. Add re-exports to the layer's `index.ts` barrel file.
9. If the component has sub-parts (e.g. Card → CardHeader, CardContent), define them in the same file.

## Example template

```tsx
import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

const fooVariants = {
  variant: {
    default: "bg-card text-card-foreground",
    outline: "border border-border bg-transparent",
  },
  size: {
    sm: "text-sm px-2 py-1",
    md: "text-base px-4 py-2",
  },
} as const;

interface FooProps extends ComponentProps<"div"> {
  variant?: keyof typeof fooVariants.variant;
  size?: keyof typeof fooVariants.size;
}

const Foo = forwardRef<HTMLDivElement, FooProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(fooVariants.variant[variant], fooVariants.size[size], className)}
      {...props}
    />
  ),
);
Foo.displayName = "Foo";

export { Foo, fooVariants };
export type { FooProps };
```
