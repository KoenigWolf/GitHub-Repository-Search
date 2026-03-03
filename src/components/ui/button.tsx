import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
  ghost:
    "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs rounded-md",
  md: "h-10 px-4 py-2 rounded-md",
  lg: "h-11 px-8 text-base rounded-md",
  icon: "h-10 w-10 rounded-md",
};

/**
 * ボタンのスタイルを生成する関数
 * Button コンポーネント以外（<a> タグなど）でも同じスタイルを適用できる
 */
export function buttonVariants({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        suppressHydrationWarning
        className={buttonVariants({
          variant,
          size,
          ...(className !== undefined && { className }),
        })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
