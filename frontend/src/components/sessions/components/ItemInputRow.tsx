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
}: ItemInputRowProps) {
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={1000}
        disabled={disabled}
      />
      {showRemove && onRemove && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
