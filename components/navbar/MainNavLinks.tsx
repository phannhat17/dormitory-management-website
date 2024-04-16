// MainNavLinks.tsx
import Link from "next/link";
import { School } from "lucide-react";
import { usePathname } from "next/navigation";

const MainNavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <School className="h-6 w-6" />
        <span className="sr-only">Dorm</span>
      </Link>
      <Link
        href="/"
        className={`transition-colors hover:text-foreground ${pathname === "/" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Dashboard
      </Link>
      <Link
        href="/contract"
        className={`transition-colors hover:text-foreground ${pathname === "/contract" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Contract
      </Link>
      <Link
        href="/invoice"
        className={`transition-colors hover:text-foreground ${pathname === "/invoice" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Invoice
      </Link>
    </nav>
  );
};

export default MainNavLinks;
