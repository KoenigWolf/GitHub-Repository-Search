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

export { Card };
