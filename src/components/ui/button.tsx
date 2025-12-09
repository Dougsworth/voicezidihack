import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_-4px_hsl(220_25%_15%_/_0.1)] hover:shadow-[0_8px_30px_-6px_hsl(220_25%_15%_/_0.15)] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_4px_20px_-4px_hsl(220_25%_15%_/_0.1)]",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_4px_20px_-4px_hsl(220_25%_15%_/_0.1)]",
        ghost: 
          "hover:bg-accent/10 hover:text-accent",
        link: 
          "text-primary underline-offset-4 hover:underline",
        coral:
          "bg-gradient-to-br from-[hsl(15,85%,55%)] to-[hsl(45,95%,55%)] text-white hover:opacity-90 shadow-[0_8px_30px_-6px_hsl(220_25%_15%_/_0.15)] hover:shadow-[0_0_40px_hsl(175_65%_35%_/_0.2)] hover:-translate-y-0.5",
        ocean:
          "bg-gradient-to-br from-[hsl(175,65%,35%)] to-[hsl(195,70%,45%)] text-white hover:opacity-90 shadow-[0_8px_30px_-6px_hsl(220_25%_15%_/_0.15)] hover:shadow-[0_0_40px_hsl(175_65%_35%_/_0.2)] hover:-translate-y-0.5",
        warm:
          "bg-[hsl(45,95%,55%)] text-[hsl(220,25%,15%)] hover:bg-[hsl(45,95%,50%)] shadow-[0_4px_20px_-4px_hsl(220_25%_15%_/_0.1)] hover:-translate-y-0.5",
        hero:
          "bg-[hsl(15,85%,55%)] text-white hover:bg-[hsl(15,85%,50%)] shadow-[0_8px_30px_-6px_hsl(220_25%_15%_/_0.15)] hover:shadow-[0_0_40px_hsl(175_65%_35%_/_0.2)] hover:-translate-y-1 text-lg",
        heroSecondary:
          "bg-white text-[hsl(220,25%,15%)] border-2 border-[hsl(40,25%,85%)] hover:border-[hsl(175,65%,35%)] hover:bg-[hsl(40,35%,90%)] shadow-[0_4px_20px_-4px_hsl(220_25%_15%_/_0.1)] hover:-translate-y-0.5 text-lg",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        xl: "h-16 px-10 text-xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
