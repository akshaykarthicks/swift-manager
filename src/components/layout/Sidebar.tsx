
import { Link } from "react-router-dom";
import { X, Layout, CheckCircle, Clock, List, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarNavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
}

const SidebarNavItem = ({ href, icon: Icon, children, isActive }: SidebarNavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-slate-100",
        isActive ? "bg-slate-100 text-primary" : "text-slate-600"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const pathname = window.location.pathname;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">TaskMaster</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            <SidebarNavItem href="/" icon={Layout} isActive={pathname === "/"}>
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem href="/my-tasks" icon={CheckCircle} isActive={pathname === "/my-tasks"}>
              My Tasks
            </SidebarNavItem>
            <SidebarNavItem href="/tasks" icon={List} isActive={pathname === "/tasks"}>
              All Tasks
            </SidebarNavItem>
            <SidebarNavItem href="/upcoming" icon={Clock} isActive={pathname === "/upcoming"}>
              Upcoming
            </SidebarNavItem>
            {isAdmin && (
              <SidebarNavItem href="/team" icon={Users} isActive={pathname === "/team"}>
                Team
              </SidebarNavItem>
            )}
          </div>
        </nav>
        <div className="border-t p-3">
          <SidebarNavItem href="/settings" icon={Settings} isActive={pathname === "/settings"}>
            Settings
          </SidebarNavItem>
        </div>
      </div>
    </aside>
  );
};
