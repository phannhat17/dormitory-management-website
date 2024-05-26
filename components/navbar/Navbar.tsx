"use client";

import { logout } from "@/actions/admin/auth/logout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import MainAdminNavLinks from "@/components/navbar/admin/MainAdminNavLinks";
import MobileAdminNavLinks from "@/components/navbar/admin/MobileAdminNavLinks";

import MainUserNavLinks from "@/components/navbar/user/MainUserNavLinks";
import MobileUserNavLinks from "@/components/navbar/user/MobileUserNavLinks";

import UserMenu from "@/components/navbar/UserMenu";
import { useCurrentUser } from "@/hooks/use-current-user";

const Navbar = () => {
  const logOut = () => {
    logout();
  };
  const user = useCurrentUser();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      {user?.role === "ADMIN" ? (
        <MainAdminNavLinks />
      ) : user?.role === "STUDENT" ? (
        <MainUserNavLinks />
      ) : null}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          {user?.role === "ADMIN" ? (
            <MobileAdminNavLinks />
          ) : user?.role === "STUDENT" ? (
            <MobileUserNavLinks />
          ) : null}
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <UserMenu onLogout={logOut} />
      </div>
    </header>
  );
};

export default Navbar;
