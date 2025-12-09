import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink = ({ to, children, className, onClick }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "transition-colors hover:text-foreground/80 text-foreground/60",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavLink;