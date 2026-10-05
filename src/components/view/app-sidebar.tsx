'use client';

import { Command, Home, Settings, Users, BarChart3, Inbox } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { paths } from '@/lib/paths';
import Link from 'next/link';
import { NavUser } from './nav-user';
import { useAuthContext } from '@/auth/hooks';
import { Separator } from '../ui/separator';

// Menu items. Items without a `url` are placeholders for pages not built yet.
const items: { title: string; url?: string; icon: typeof Home }[] = [
  { title: 'Dashboard', url: paths.dashbord.root, icon: Home },
  { title: 'Analytics', icon: BarChart3 },
  { title: 'Customers', icon: Users },
  { title: 'Inbox', icon: Inbox },
];

const itemsFooter: { title: string; url?: string; icon: typeof Home }[] = [
  { title: 'Settings', icon: Settings },
];

function NavItem({ item }: { item: (typeof items)[number] }) {
  return (
    <SidebarMenuItem>
      {item.url ? (
        <SidebarMenuButton asChild>
          <Link href={item.url}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton disabled className="opacity-50">
          <item.icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { user } = useAuthContext();
  return (
    <Sidebar collapsible="icon" className="bg-white text-primary-first">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={paths.dashbord.root}>
                <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-3" />
                </div>
                <div className="grid flex-1 text-left text-base leading-tight">
                  <span className="truncate font-bold">FAdmin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* <Separator /> */}

      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 py-2">
              {items.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="space-y-1 py-2">
          {itemsFooter.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
          <Separator />
          <NavUser
            user={{
              avatar: '',
              ...user,
            }}
          />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
