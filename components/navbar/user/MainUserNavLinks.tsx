// MainNavLinks.tsx
import { School } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MainUserNavLinks = () => {
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
        href="/request"
        className={`transition-colors hover:text-foreground ${pathname === "/request" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Request
      </Link>
    </nav>
  );
};

export default MainUserNavLinks;
