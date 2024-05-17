// MainNavLinks.tsx
import { School } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MainAdminNavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <Link
        href="/admin"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <School className="h-6 w-6" />
        <span className="sr-only">Dorm</span>
      </Link>
      <Link
        href="/admin"
        className={`transition-colors hover:text-foreground ${pathname === "/admin" ? "text-foreground" : "text-muted-foreground"
          }`}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/manage-user"
        className={`transition-colors hover:text-foreground ${pathname === "/admin/manage-user"
            ? "text-foreground"
            : "text-muted-foreground"
          }`}
      >
        Users
      </Link>
      <Link
        href="/admin/manage-room"
        className={`transition-colors hover:text-foreground ${pathname === "/admin/manage-room"
            ? "text-foreground"
            : "text-muted-foreground"
          }`}
      >
        Rooms
      </Link>
      <Link
        href="/admin/manage-feedback"
        className={`transition-colors hover:text-foreground ${pathname === "/admin/manage-feedback"
            ? "text-foreground"
            : "text-muted-foreground"
          }`}
      >
        Feedbacks
      </Link>
    </nav>
  );
};

export default MainAdminNavLinks;
