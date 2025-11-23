
'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import {
    Menu, Heart, Home, Package, Wallet, LogOut, Users, Component
} from 'lucide-react';
import { CartSheet } from '@/components/cart/cart-sheet';
import { FavoritesSheet } from '@/components/favorites/favorites-sheet';
import { useAuth } from '@/lib/auth-provider';

const siteConfig = {
  name: "CantApp",
};

// ✅ CORREÇÃO: Usar React.ElementType para compatibilidade com os ícones da Lucide
interface NavLinkType {
  href: string;
  label: string;
  icon: React.ElementType;
}

const STUDENT_LINKS: NavLinkType[] = [
  { href: '/student/dashboard', label: 'Início', icon: Home },
  { href: '/student/orders', label: 'Pedidos', icon: Package },
  { href: '/student/wallet', label: 'Saldo', icon: Wallet },
];

const GUARDIAN_LINKS: NavLinkType[] = [
    { href: '/guardian/dashboard', label: 'Início', icon: Home },
    { href: '/guardian/students', label: 'Alunos', icon: Users },
    { href: '/guardian/canteen', label: 'Cantina', icon: Component },
];

function UserNav() {
    const { user, logout } = useAuth();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={undefined} alt="Avatar" />
                        <AvatarFallback>{user?.name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}> 
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface AppLayoutProps {
  children: ReactNode;
  userType: 'student' | 'guardian';
}

export function AppLayout({ children, userType }: AppLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const links = userType === 'student' ? STUDENT_LINKS : GUARDIAN_LINKS;

  const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <Link
      href={href}
      onClick={() => setIsSidebarOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        { "bg-muted text-primary": pathname === href }
      )}
    >
      {children}
    </Link>
  );

  const sidebarContent = (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span>{siteConfig.name}</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        {sidebarContent}
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-full max-w-xs">
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1"></div>

          <div className="flex items-center gap-2">
            {userType === 'student' && (
              <>
                <FavoritesSheet />
                <CartSheet />
              </>
            )}
          </div>
          <UserNav />
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
