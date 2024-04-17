// MobileNavLinks.tsx
import Link from "next/link";
import { School } from "lucide-react";
import { usePathname } from "next/navigation";

const MobileAdminNavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="grid gap-6 text-lg font-medium">
      <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold">
        <School className="h-6 w-6" />
        <span className="sr-only">Dorm</span>
      </Link>
      <Link
        href="/admin"
        className={`hover:text-foreground ${
          pathname === "/admin" ? "" : "text-muted-foreground"
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/manage-user"
        className={`hover:text-foreground ${
          pathname === "/admin/manage-user" ? "" : "text-muted-foreground"
        }`}
      >
        Users
      </Link>
      <Link
        href="/admin/manage-contract"
        className={`hover:text-foreground ${
          pathname === "/admin/manage-contract" ? "" : "text-muted-foreground"
        }`}
      >
        Contracts
      </Link>
      <Link
        href="/admin/manage-invoice"
        className={`hover:text-foreground ${
          pathname === "/admin/manage-invoice" ? "" : "text-muted-foreground"
        }`}
      >
        Invoices
      </Link>
      <Link
        href="/admin/manage-room"
        className={`hover:text-foreground ${
          pathname === "/admin/manage-room" ? "" : "text-muted-foreground"
        }`}
      >
        Rooms
      </Link>
      <Link
        href="/admin/manage-feedback"
        className={`hover:text-foreground ${
          pathname === "/admin/manage-feedback" ? "" : "text-muted-foreground"
        }`}
      >
        Feedbacks
      </Link>
    </nav>
  );
};

export default MobileAdminNavLinks;
