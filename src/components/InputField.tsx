"use client";

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  unit?: string;
  hint?: string;
  type?: "number" | "text";
  step?: string;
  min?: string;
  max?: string;
}

export default function InputField({
  label,
  value,
  onChange,
  unit,
  hint,
  type = "number",
  step,
  min,
  max,
}: InputFieldProps) {
  return (
    <div>
      <label className="input-label">
        {label}
        {hint && (
          <span className="ml-2 font-normal normal-case tracking-normal text-[var(--color-text-muted)]/60">
            ({hint})
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          min={min}
          max={max}
          className={`input-field ${unit ? "pr-16" : ""}`}
        />
        {unit && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1 rounded-md">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}
