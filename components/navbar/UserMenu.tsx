// UserMenu.tsx
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUser } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define the props interface
interface UserMenuProps {
  onLogout: () => void;  // Function that takes no arguments and returns nothing
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <CircleUser className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={pathname === "/profile" ? "font-semibold" : ""}>
          <Link href="/profile">My Account</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
