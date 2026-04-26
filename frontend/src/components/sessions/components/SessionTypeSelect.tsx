import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SESSION_TYPE_LABELS } from "shared/constants";
import type { SessionType } from "shared/types";

interface SessionTypeSelectProps {
  value: SessionType | "";
  onChange: (value: SessionType) => void;
}

export function SessionTypeSelect({ value, onChange }: SessionTypeSelectProps) {
  return (
    <Select value={value} onValueChange={(nextValue) => onChange(nextValue as SessionType)}>
      <SelectTrigger id="sessionType">
        <SelectValue placeholder="Select session type" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SESSION_TYPE_LABELS).map(([optionValue, label]) => (
          <SelectItem key={optionValue} value={optionValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
