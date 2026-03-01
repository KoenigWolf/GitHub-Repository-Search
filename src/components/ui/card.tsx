import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Component = "div", hover = false, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-lg border border-border bg-card",
          hover && "transition-shadow hover:shadow-md",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          {
            "p-4": padding === "sm",
            "p-4 sm:p-6": padding === "md",
            "p-6 sm:p-8": padding === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
CardContent.displayName = "CardContent";

export { Card, CardContent };
