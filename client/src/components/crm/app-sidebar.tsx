"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppSidebarProps {
  user?: {
    email?: string | null;
  };
  onSignOut?: () => void;
}

const navigation = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    exact: true,
  },
  {
    id: "clients",
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
    exact: false,
  },
  {
    id: "policies",
    title: "Policies",
    href: "/dashboard/policies",
    icon: FileText,
    exact: false,
  },
  {
    id: "activities",
    title: "Activities",
    href: "/dashboard/activities",
    icon: Activity,
    exact: false,
  },
];

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const userEmail = user?.email || "User";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-4",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-heading text-lg font-bold text-primary-foreground">A</span>
          </div>
          {!isCollapsed && (
            <span className="font-heading text-xl font-semibold text-sidebar-foreground">
              AgenSee
            </span>
          )}
        </Link>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SidebarTrigger className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" />
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-2 py-4">
        {/* Search Button */}
        {!isCollapsed && (
          <div className="mb-2 px-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-auto rounded border border-sidebar-border bg-sidebar px-1.5 py-0.5 text-[10px] text-sidebar-foreground/50">
                /
              </kbd>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        {/* Settings Link */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <Settings className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">Settings</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Menu */}
        <div className="mt-2 border-t border-sidebar-border pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 h-auto hover:bg-sidebar-accent",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Avatar className="h-8 w-8 border border-sidebar-border">
                  <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium text-sidebar-foreground">
                        {userEmail.split("@")[0]}
                      </span>
                      <span className="text-xs text-sidebar-foreground/50 truncate max-w-[140px]">
                        {userEmail}
                      </span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4 text-sidebar-foreground/50" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isCollapsed ? "center" : "start"}
              side="top"
              className="w-56"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">Signed in as</p>
                <p className="text-sm text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onSignOut}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
