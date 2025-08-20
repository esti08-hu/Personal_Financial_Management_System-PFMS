"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import DropdownUser from "./DropdownUser";

const UserNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // track scroll to toggle scrolled state for background treatment
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/pages/user",
      isActive: pathname === "/pages/user",
    },
    {
      title: "Transaction",
      isActive: pathname.includes("/pages/user/transaction"),
      items: [
        {
          title: "Transaction List",
          href: "/pages/user/transaction/transactionList",
          description: "View all your transactions",
        },
        {
          title: "Add Transaction",
          href: "/pages/user/transaction/addTransaction",
          description: "Record a new transaction",
        },
      ],
    },
    {
      title: "Budget",
      isActive: pathname.includes("/pages/user/budget"),
      items: [
        {
          title: "Manage Budget",
          href: "/pages/user/budget/manageBudget",
          description: "View and edit your budgets",
        },
        {
          title: "Set Budget",
          href: "/pages/user/budget/setBudget",
          description: "Create a new budget",
        },
      ],
    },
    {
      title: "Account",
      isActive: pathname.includes("/pages/user/account"),
      items: [
        {
          title: "Manage Account",
          href: "/pages/user/account/manageAccount",
          description: "View and edit your accounts",
        },
        {
          title: "Add Account",
          href: "/pages/user/account/addAccount",
          description: "Add a new financial account",
        },
      ],
    },
    {
      title: "Report",
      href: "/pages/user/report",
      isActive: pathname === "/pages/user/report",
    },
  ];

  const isLanding = pathname === "/";

  const navBgClass = isLanding
    ? scrolled
      ? "!bg-primary/80 backdrop-blur border-b border-primary/30"
      : "!bg-primary/20 backdrop-blur-sm"
  : scrolled
  ? "!bg-primary/95 backdrop-blur-sm border-b border-gray-200"
  : "!bg-primary/95 backdrop-blur-sm";
  const navStyle: React.CSSProperties = isLanding
    ? scrolled
      ? { background: "hsl(var(--color-primary) / 0.8)" }
      : { background: "hsl(var(--color-primary) / 0.2)" }
    : scrolled
    ? { background: "hsl(var(--color-primary) / 0.95)" }
    : { background: "hsl(var(--color-primary) / 0.95)" };

  return (
  <div style={navStyle} className={`${navBgClass.replace("!bg-primary/95","")} navbar-bg`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/pages/user" className="flex-shrink-0">
            <Image
              width={50}
              height={32}
              src="/images/logo/moneymaster.png"
              alt="MoneyMaster Logo"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block z-100">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1 z-100">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger
                          aria-current={item.isActive ? "page" : undefined}
                          className={cn(
                            "bg-transparent text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white data-[active]:bg-white/10 data-[state=open]:bg-white/10 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md border-b-2 border-transparent",
                            item.isActive && "rounded-none",
                            item.isActive && "active-nav",
                            "cursor-pointer z-1000"
                          )}
                        >
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent
                          className={cn(
                            "bg-primary-foreground shadow-md rounded-md",
                            "border border-border"
                          )}
                        >
                          <ul
                            className={cn(
                              "grid gap-3 p-4",
                              "w-[400px] md:w-[500px] lg:w-[600px]",
                              "md:grid-cols-2"
                            )}
                          >
                            {item.items.map((subItem) => (
                              <li key={subItem.title}>
                                <NavigationMenuLink
                                  asChild
                                  className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                  <Link
                                    href={subItem.href}
                                    aria-current={
                                      pathname === subItem.href || pathname.startsWith(subItem.href)
                                        ? "page"
                                        : undefined
                                    }
                                    className={cn(
                                      "block space-y-1 rounded-md p-3 no-underline transition-colors",
                                      "select-none leading-none outline-none",
                                      "nav-hover-accent nav-focus-accent",
                                      scrolled ? "text-white" : "text-primary",
                                      (pathname === subItem.href || pathname.startsWith(subItem.href)) && "active-nav",
                                      "cursor-pointer"
                                    )}
                                  >
                                    <div className="text-sm font-medium leading-none text-primary">
                                      {subItem.title}
                                    </div>
                                    {subItem.description && (
                                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                        {subItem.description}
                                      </p>
                                    )}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                        <NavigationMenuLink asChild>
                        <Link
                          href={item.href!}
                          aria-current={item.isActive ? "page" : undefined}
                          className={cn(
                            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 border-b-2 border-transparent",
                            item.isActive && "rounded-none",
                            scrolled ? "text-white" : "text-white",
                            item.isActive && "active-nav",
                            "cursor-pointer"
                          )}
                          style={
                            item.isActive
                              ? {
                                  borderBottomColor:
                                    "hsl(var(--color-primary))",
                                }
                              : undefined
                          }
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile menu and user dropdown */}
          <div className="flex items-center space-x-4">
            <DropdownUser />

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-left">Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {navigationItems.map((item) => (
                      <div key={item.title} className="space-y-2">
                        {item.items ? (
                          <div>
                            <h3 className="font-medium text-[#22577A] mb-2">
                              {item.title}
                            </h3>
                            <div className="ml-4 space-y-2">
                              {item.items.map((subItem) => (
                                <Link
                                  key={subItem.title}
                                  href={subItem.href}
                                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={item.href!}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                              item.isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground"
                            )}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default UserNavbar;
