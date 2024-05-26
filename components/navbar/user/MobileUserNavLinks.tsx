// MobileNavLinks.tsx
import { School } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MobileUserNavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="grid gap-6 text-lg font-medium">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <School className="h-6 w-6" />
        <span className="sr-only">Dorm</span>
      </Link>
      <Link href="/" className={`hover:text-foreground ${pathname === "/" ? "" : "text-muted-foreground"}`}>
        Dashboard
      </Link>
      <Link
        href="/request"
        className={`hover:text-foreground ${pathname === "/request" ? "" : "text-muted-foreground"}`}
      >
        Request
      </Link>
    </nav>
  );
};

export default MobileUserNavLinks;
