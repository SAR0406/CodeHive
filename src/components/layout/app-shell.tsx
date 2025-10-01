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
    
      
        
          
            
                 CodeHiveIcon className="size-8 text-accent" />
                CodeHive
            
          
        
        
          
            {navItems.map((item) => (
              
                 (pathname.startsWith(item.href))}
                  
                    
                      
                       
                          
                          item.label}
                        
                      
                    
                  
                
              
            ))}
          
        
        
          
            
              
                 
                  
                    
                      
                       
                           Settings
                         
                      
                    
                  
                
              
            
              
                
                  
                   Support
                   
                
              
            
          
        
      
      
        
          
            
              
                
                 className="md:hidden" />
                
                 
                  
                   tasks, templates..." className="pl-9" />
                
                
                  
                  
                     Notifications
                    
                  
                
                 className="relative flex items-center gap-2 rounded-full p-1 h-auto">
                  
                    
                     alt={user?.displayName ?? "User"} data-ai-hint="person portrait" />
                     {user?.displayName?.charAt(0) ?? 'U'}
                  
                  
                     
                      {user?.displayName ?? 'Welcome'}
                      
                         
                         {credits !== null ? `${credits.credits.toLocaleString()}` : '...'}
                      
                     
                  
                  
                    
                  
                

                
                  
                    My Account
                   
                   
                        
                        Credits: {credits !== null ? `${credits.credits.toLocaleString()}` : '...'}
                   
                   
                  
                    Profile
                  
                    Billing
                  
                    Settings
                  
                  
                    Logout
                  
                
              
            
          
        
        {children}
      
    
  );
}
