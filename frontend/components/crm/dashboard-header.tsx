"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/search/GlobalSearch";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Skip 'dashboard' as the first segment and start from there
    if (segment === "dashboard") {
      breadcrumbs.push({
        label: "Dashboard",
        href: "/dashboard",
        isLast: segments.length === 1,
      });
    } else if (segment === "clients") {
      breadcrumbs.push({
        label: "Clients",
        href: "/dashboard/clients",
        isLast,
      });
    } else if (segment === "policies") {
      breadcrumbs.push({
        label: "Policies",
        href: "/dashboard/policies",
        isLast,
      });
    } else if (segment === "activities") {
      breadcrumbs.push({
        label: "Activities",
        href: "/dashboard/activities",
        isLast,
      });
    } else if (segment === "new") {
      breadcrumbs.push({
        label: "New",
        href: currentPath,
        isLast,
      });
    } else if (segment !== "dashboard") {
      // This is likely an ID, we can show "Details" or skip
      breadcrumbs.push({
        label: "Details",
        href: currentPath,
        isLast,
      });
    }
  });

  return breadcrumbs;
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={crumb.href}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:block w-64">
          <GlobalSearch />
        </div>

        {/* Action Button */}
        {action && (
          <Button asChild className="gap-2">
            <Link href={action.href}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
