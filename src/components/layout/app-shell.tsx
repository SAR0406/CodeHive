
'use client';
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Bell,
  Bot,
  Building2,
  ChevronDown,
  CreditCard,
  Database,
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
        <SidebarHeader>
          <SidebarMenuButton className="gap-2" size="lg" asChild>
            <Link href="/dashboard">
                <CodeHiveIcon className="size-8 text-accent" />
                <span className="font-bold text-lg font-headline text-white">CodeHive</span>
            </Link>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  asChild
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
                <SidebarMenuButton
                  isActive={pathname.startsWith("/settings")}
                  asChild
                >
                  <Link href="/settings">
                    <Settings />
                     <span>Settings</span>
                   </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <LifeBuoy />
                   <span>Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search tasks, templates..." className="pl-9" />
                </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon">
                     <Bell />
                     <span className="sr-only">Notifications</span>
                    </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="relative flex items-center gap-2 rounded-full p-1 h-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} data-ai-hint="person portrait" />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                     <span className="text-sm font-medium">{user?.displayName ?? 'Welcome'}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                         <Star className="size-3 text-yellow-400 fill-current"/>
                         {credits !== null ? `${credits.credits.toLocaleString()}` : '...'}
                      </span>
                  </div>
                  <ChevronDown className="hidden md:block" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                        <Star className="mr-2"/>
                        Credits: {credits !== null ? `${credits.credits.toLocaleString()}` : '...'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link href="/profile"><DropdownMenuItem><User />Profile</DropdownMenuItem></Link>
                    <Link href="/billing"><DropdownMenuItem><CreditCard />Billing</DropdownMenuItem></Link>
                    <Link href="/settings"><DropdownMenuItem><Settings/>Settings</DropdownMenuItem></Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logOut}><LogOut/>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
