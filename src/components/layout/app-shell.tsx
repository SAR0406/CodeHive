
'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Bell,
  Bot,
  Building2,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Home,
  LayoutTemplate,
  Library,
  LifeBuoy,
  LogOut,
  Search,
  Settings,
  User,
  Star
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { CodeHiveIcon } from '../icons';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/builder', icon: Building2, label: 'AI Builder' },
  { href: '/bot', icon: Bot, label: 'AI Bot' },
  { href: '/marketplace', icon: LayoutTemplate, label: 'Marketplace' },
  { href: '/templates', icon: Library, label: 'Templates' },
  { href: '/learn', icon: GraduationCap, label: 'Learn & Mentor' },
];

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { user, credits, logOut } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <CodeHiveIcon className="size-8 text-accent" />
            <span className="font-headline text-xl font-semibold text-sidebar-foreground">CodeHive</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: 'Settings', side: 'right' }} isActive={pathname.startsWith('/settings')}>
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: 'Support', side: 'right' }}>
                <Link href="#">
                  <LifeBuoy />
                  <span>Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 w-full px-4 pt-4 md:px-6 md:pt-6">
          <div className="flex h-16 shrink-0 items-center gap-4 rounded-xl border border-border bg-card/60 px-4 shadow-lg backdrop-blur-xl md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            <div className="flex flex-shrink-0 items-center gap-2">
              <div className="relative hidden w-full max-w-sm md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input placeholder="Search tasks, templates..." className="pl-9" />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2 rounded-full p-1 h-auto">
                    <Avatar className="h-9 w-9 border-2 border-border">
                      <AvatarImage src={user?.user_metadata.avatar_url ?? `https://picsum.photos/seed/${user?.id}/40/40`} alt={user?.user_metadata.full_name ?? "User"} data-ai-hint="person portrait" />
                      <AvatarFallback>{user?.user_metadata.full_name?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left lg:block">
                      <p className="text-sm font-medium">{user?.user_metadata.full_name ?? 'Welcome'}</p>
                      <div className="text-xs text-amber-400 flex items-center gap-1">
                        <Star className="size-3 fill-current"/>
                        <span>{credits !== null ? `${credits.balance.toLocaleString()}` : '...'}</span>
                      </div>
                    </div>
                    <ChevronDown className="ml-1 hidden size-4 text-muted-foreground lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                   <DropdownMenuLabel className="font-normal text-xs text-amber-400 flex items-center gap-1">
                        <Star className="size-3 fill-current"/>
                        <span>Credits: {credits !== null ? `${credits.balance.toLocaleString()}` : '...'}</span>
                         <span className="text-muted-foreground text-xs">(In Escrow: {credits !== null ? credits.escrow_balance : '...'})</span>
                    </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing"><CreditCard className="mr-2" />Billing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2" />Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logOut}>
                    <LogOut className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
