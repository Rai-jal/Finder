"use client";

import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export interface OptionItem {
  id: string | number;
  name: string;
}

interface ApiSelectFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  fetchOptions: () => Promise<OptionItem[]>;
  queryKey: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * Select field that fetches options from a backend endpoint.
 * Displays names to the user, stores and submits the ID when selected.
 */
export function ApiSelectField({
  name,
  label,
  placeholder = "Select...",
  fetchOptions,
  queryKey,
  value,
  onChange,
  error,
  required,
}: ApiSelectFieldProps) {
  const { data: options = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchOptions,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      <Select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={isLoading}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={String(opt.id)}>
            {opt.name}
          </option>
        ))}
      </Select>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
