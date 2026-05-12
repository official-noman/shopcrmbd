import * as React from "react";

export function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        {...props}
        ref={ref}
        className={[
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none",
          "placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100",
          className ?? ""
        ].join(" ")}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

export function Button({
  children,
  variant = "primary",
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400"
      : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 disabled:text-slate-400";
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`${base} ${styles} ${props.className ?? ""}`}
    >
      {loading && variant === "primary" ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100",
        className
      ].join(" ")}
    />
  );
}

export function TakaIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 18V3" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      <path d="M12 18l-3 3" />
      <path d="M12 18l3 3" />
    </svg>
  );
}
