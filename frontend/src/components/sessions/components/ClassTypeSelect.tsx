import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_TYPE_LABELS } from "./constants";
import type { ClassType } from "shared/types";

interface ClassTypeSelectProps {
  value: ClassType | "";
  onChange: (value: ClassType) => void;
}

export function ClassTypeSelect({ value, onChange }: ClassTypeSelectProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as ClassType)}>
      <SelectTrigger id="classType">
        <SelectValue placeholder="Select class type" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CLASS_TYPE_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

