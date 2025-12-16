import { Textarea } from "@/components/ui/textarea";

interface CharCountTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  rows: number;
  id?: string;
}

export function CharCountTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
  rows,
  id,
}: CharCountTextareaProps) {
  return (
    <>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
      <p className="text-muted-foreground mt-2 text-xs">
        {value.length}/{maxLength} characters
      </p>
    </>
  );
}

