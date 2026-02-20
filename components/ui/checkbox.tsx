"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-input text-primary focus:ring-ring",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
