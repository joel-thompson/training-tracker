import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ItemInputRowProps {
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder: string;
  disabled?: boolean;
  showRemove?: boolean;
  ariaLabel?: string;
  removeLabel?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

export function ItemInputRow({
  value,
  onChange,
  onRemove,
  onBlur,
  onKeyDown,
  placeholder,
  disabled = false,
  showRemove = true,
  ariaLabel,
  removeLabel = "Remove item",
  name,
  autoComplete = "off",
  autoFocus = false,
}: ItemInputRowProps) {
  return (
    <div className="flex gap-2">
      <Input
        aria-label={ariaLabel ?? placeholder}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={1000}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {showRemove && onRemove && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
