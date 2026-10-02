export function F({ label, name, type = "text", defaultValue, rows, min, max, required, className = "" }: {
  label: string; name: string; type?: string; defaultValue?: string | number | null; rows?: number; min?: number; max?: number; required?: boolean; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>
      {rows ? (
        <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className="input resize-y" />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue ?? ""} min={min} max={max} required={required} className="input" />
      )}
    </label>
  );
}
export const formGrid = "grid gap-3 sm:grid-cols-2";
