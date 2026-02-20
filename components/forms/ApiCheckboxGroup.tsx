"use client";

import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface OptionItem {
  id: string | number;
  name: string;
}

interface ApiCheckboxGroupProps {
  name: string;
  label: string;
  fetchOptions: () => Promise<OptionItem[]>;
  queryKey: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  required?: boolean;
}

/**
 * Checkbox group that fetches options from a backend endpoint.
 * Displays names to the user, stores and submits IDs when selected.
 */
export function ApiCheckboxGroup({
  name,
  label,
  fetchOptions,
  queryKey,
  value = [],
  onChange,
  error,
  required,
}: ApiCheckboxGroupProps) {
  const { data: options = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchOptions,
    staleTime: 5 * 60 * 1000,
  });

  const handleToggle = (id: string) => {
    const next = value.includes(id)
      ? value.filter((x) => x !== id)
      : [...value, id];
    onChange?.(next);
  };

  return (
    <div>
      <Label>
        {label}
        {required && " *"}
      </Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          options.map((opt) => {
            const idStr = String(opt.id);
            const checked = value.includes(idStr);
            return (
              <label
                key={opt.id}
                className={cn(
                  "cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                )}
              >
                <input
                  type="checkbox"
                  name={name}
                  className="sr-only"
                  checked={checked}
                  onChange={() => handleToggle(idStr)}
                />
                {opt.name}
              </label>
            );
          })
        )}
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
