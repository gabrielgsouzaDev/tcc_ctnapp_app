
"use client";

import {
  Home,
  LogOut,
  PanelLeft,
  Settings,
  ShoppingBasket,
  ShoppingCart,
  User,
  Utensils,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { guardianProfile, studentProfile } from "@/lib/data";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
};

function LogoutConfirmationDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
        <AlertDialogDescription>
          Sua sessão será encerrada e você será redirecionado para a tela inicial.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Sair</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function AppLayout({
  children,
  userType,
}: {
  children: ReactNode;
  userType: "student" | "guardian";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    // Here you can add the Firebase logout logic if necessary
    // Ex: await signOut(auth);
    router.push("/");
  };

  const studentNavItems: NavItem[] = [
    {
      href: "/student/dashboard",
      label: "Início",
      icon: <Home />,
      active: pathname === "/student/dashboard",
    },
    {
      href: "/student/orders",
      label: "Pedidos",
      icon: <ShoppingBasket />,
      active: pathname === "/student/orders",
    },
    {
      href: "/student/balance",
      label: "Saldo",
      icon: <Wallet />,
      active: pathname === "/student/balance",
    }
  ];

  const guardianNavItems: NavItem[] = [
    {
      href: "/guardian/dashboard",
      label: "Início",
      icon: <Home />,
      active: pathname === "/guardian/dashboard",
    },
    {
      href: "/guardian/order",
      label: "Fazer Pedido",
      icon: <ShoppingCart />,
      active: pathname === "/guardian/order",
    }
  ];
  
  const settingsNavItem = {
      href: userType === 'student' ? "/student/settings" : "/guardian/settings",
      label: "Configurações",
      icon: <Settings />,
      active: pathname.includes("/settings"),
  }

  const navItems = userType === "student" ? studentNavItems : guardianNavItems;
  const userName = userType === "student" ? studentProfile.name : guardianProfile.name;
  const userBalance = userType === 'student' ? studentProfile.balance : 0; // Guardian balance not applicable directly
  const userEmail =
    userType === "student" ? "joao.silva@aluno.com" : "maria.silva@resp.com";

  return (
    <SidebarProvider>
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <span className="font-semibold text-xl text-primary px-2">CTNAPP</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={item.active}
                      tooltip={{ children: item.label }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              <SidebarSeparator />
              <SidebarMenu>
                   <SidebarMenuItem>
                      <Link href={settingsNavItem.href}>
                        <SidebarMenuButton
                          isActive={settingsNavItem.active}
                          tooltip={{ children: settingsNavItem.label }}
                        >
                          {settingsNavItem.icon}
                          <span>{settingsNavItem.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  <SidebarMenuItem>
                    <AlertDialogTrigger asChild>
                      <SidebarMenuButton tooltip={{children: 'Sair'}}>
                          <LogOut />
                          <span>Sair</span>
                      </SidebarMenuButton>
                    </AlertDialogTrigger>
                  </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
            <div className="flex items-center gap-4">
              {userType === "student" && (
                 <Link href="/student/balance" className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span>Saldo: R$ {userBalance.toFixed(2)}</span>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://avatar.vercel.sh/${userName}.png`} alt={userName} />
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={settingsNavItem.href}>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
        <LogoutConfirmationDialog onConfirm={handleLogout} />
      </AlertDialog>
    </SidebarProvider>
  );
}
