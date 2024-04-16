"use client"

import React from "react";
import { Menu } from "lucide-react";
import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MainNavLinks from "./MainNavLinks";
import MobileNavLinks from "./MobileNavLinks";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const logOut = () => {
    logout();
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <MainNavLinks />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <MobileNavLinks />
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
