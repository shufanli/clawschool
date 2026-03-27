"use client";

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "small-link";
  className?: string;
}

export default function CTAButton({ children, onClick, disabled, variant = "primary", className = "" }: CTAButtonProps) {
  if (variant === "small-link") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`text-caption text-text-secondary underline disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-[44px] rounded-md border border-border text-body font-medium text-text-secondary
          active:scale-[0.97] transition-transform duration-150 disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[48px] rounded-md accent-gradient text-body font-semibold text-white
        active:scale-[0.97] transition-transform duration-150 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
