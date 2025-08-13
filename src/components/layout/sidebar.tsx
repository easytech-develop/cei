"use client";

import {
  AlertTriangle,
  BanknoteArrowDown,
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  Database,
  FileText,
  HelpCircle,
  List,
  Moon,
  Plus,
  Send,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Star,
  Sun,
  Upload,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  hasNotification?: boolean;
  roles?: string[];
  subItems?: Array<{
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
  }>;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "share",
    icon: Share2,
    label: "Compartilhar",
    subItems: [
      {
        id: "share-link",
        icon: Share2,
        label: "Compartilhar Link",
        href: "/share/link",
      },
      {
        id: "share-file",
        icon: Upload,
        label: "Compartilhar Arquivo",
        href: "/share/file",
      },
      {
        id: "share-email",
        icon: Send,
        label: "Compartilhar por Email",
        href: "/share/email",
      },
    ],
  },
  {
    id: "upload",
    icon: Upload,
    label: "Upload",
    subItems: [
      {
        id: "upload-file",
        icon: Upload,
        label: "Upload de Arquivo",
        href: "/upload/file",
      },
      {
        id: "upload-bulk",
        icon: Database,
        label: "Upload em Lote",
        href: "/upload/bulk",
      },
      {
        id: "upload-sync",
        icon: Send,
        label: "Sincronizar",
        href: "/upload/sync",
      },
    ],
  },
  {
    id: "favorites",
    icon: Star,
    label: "Favoritos",
    href: "/favorites",
  },
  {
    id: "add",
    icon: Plus,
    label: "Adicionar",
    subItems: [
      {
        id: "add-user",
        icon: Users,
        label: "Adicionar Usuário",
        href: "/add/user",
      },
      {
        id: "add-document",
        icon: FileText,
        label: "Adicionar Documento",
        href: "/add/document",
      },
      {
        id: "add-report",
        icon: BarChart3,
        label: "Adicionar Relatório",
        href: "/add/report",
      },
    ],
  },
  {
    id: "mobile",
    icon: Smartphone,
    label: "Mobile",
    href: "/mobile",
  },
  {
    id: "expenses",
    icon: BanknoteArrowDown,
    label: "Despesas",
    subItems: [
      {
        id: "expenses-list",
        icon: List,
        label: "Listar Despesas",
        href: "/expenses",
      },
      {
        id: "expenses-add",
        icon: Plus,
        label: "Adicionar Despesa",
        href: "/expenses/add",
      },
    ],
  },
  {
    id: "database",
    icon: Database,
    label: "Banco de Dados",
    href: "/database",
  },
  {
    id: "calendar",
    icon: Calendar,
    label: "Calendário",
    href: "/calendar",
  },
  {
    id: "send",
    icon: Send,
    label: "Enviar",
    href: "/send",
  },
  {
    id: "config",
    icon: Settings,
    label: "Configurações",
    roles: ["ADMIN"],
    subItems: [
      {
        id: "users",
        icon: Users,
        label: "Usuários",
        href: "/users",
      },
      {
        id: "roles",
        icon: UserCog,
        label: "Roles",
        href: "/roles",
      },
      {
        id: "permissions",
        icon: Shield,
        label: "Permissões",
        href: "/permissions",
      },
    ],
  },
  {
    id: "alerts",
    icon: AlertTriangle,
    label: "Alertas",
    hasNotification: true,
    subItems: [
      {
        id: "alerts-system",
        icon: AlertTriangle,
        label: "Alertas do Sistema",
        href: "/alerts/system",
      },
      {
        id: "alerts-user",
        icon: Bell,
        label: "Notificações",
        href: "/alerts/notifications",
      },
      {
        id: "alerts-help",
        icon: HelpCircle,
        label: "Ajuda",
        href: "/alerts/help",
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleItemClick = (item: SidebarItem) => {
    if (item.href) {
      window.location.href = item.href;
    }
  };

  // Renderiza um placeholder até o componente estar montado
  if (!mounted) {
    return (
      <div className="fixed left-0 top-0 h-full bg-sidebar w-16">
        <div className="flex flex-col h-full items-center py-4 space-y-4">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Trigger fixa no topo esquerdo quando colapsada */}
      {isCollapsed && (
        <div className="fixed top-4 left-4 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full hover:bg-sidebar-accent transition-all duration-200 bg-sidebar border border-sidebar-border"
                onClick={() => setIsCollapsed(false)}
              >
                <ChevronLeft className={cn(
                  "h-4 w-4 text-sidebar-foreground transition-all duration-200",
                  isCollapsed && "rotate-180"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expandir Sidebar</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Sidebar expandida */}
      {!isCollapsed && (
        <div className="fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-50 w-16">
          <div className="flex flex-col h-full items-center py-4 space-y-4">
            {/* Botão de colapsar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full hover:bg-sidebar-accent transition-all duration-200"
                  onClick={() => setIsCollapsed(true)}
                >
                  <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Colapsar Sidebar</TooltipContent>
            </Tooltip>

            {/* Itens da sidebar */}
            <div className="flex flex-col space-y-2 flex-1">
              {sidebarItems
                .filter((item) => {
                  if (item.roles) {
                    return item.roles.some((role) =>
                      session?.user.roles.some((r) => r.slug === role),
                    );
                  }
                  return true;
                })
                .map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                  />
                ))}
            </div>

            {/* Botões de tema */}
            <div className="flex flex-col space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-10 h-10 rounded-full transition-all duration-200",
                      theme === "dark" &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Modo Escuro</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-10 h-10 rounded-full transition-all duration-200",
                      theme === "light" &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Modo Claro</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface SidebarItemProps {
  item: SidebarItem;
  onClick: () => void;
}

function SidebarItem({ item, onClick }: SidebarItemProps) {
  const Icon = item.icon;
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Pequeno delay para evitar fechamento acidental
    setTimeoutId(timeout);
  };

  if (item.subItems) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full hover:bg-sidebar-accent transition-all duration-200 relative"
            >
              <Icon className="h-4 w-4 text-sidebar-foreground" />
              {item.hasNotification && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-sidebar" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="center"
            className="w-min p-2 bg-sidebar border-sidebar-border"
          >
            <div className="space-y-1">
              {item.subItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <Button
                    key={subItem.id}
                    variant="ghost"
                    className="w-full justify-start h-8 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    asChild
                  >
                    <Link href={subItem.href}>
                      <SubIcon className="h-4 w-4 mr-2" />
                      {subItem.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </div>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full hover:bg-sidebar-accent transition-all duration-200 relative"
          onClick={onClick}
          asChild
        >
          <Link href={item.href ?? ""}>
            <Icon className="h-4 w-4 text-sidebar-foreground" />
            {item.hasNotification && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-sidebar" />
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
