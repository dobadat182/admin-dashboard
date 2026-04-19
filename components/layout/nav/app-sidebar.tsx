"use client";

import * as React from "react";

import { NavMain } from "@/components/layout/nav/nav-main";
import { NavProjects } from "@/components/layout/nav/nav-projects";
import { NavSecondary } from "@/components/layout/nav/nav-secondary";
import { NavUser } from "@/components/layout/nav/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    IconLifebuoy,
    IconSend,
    IconFrame,
    IconChartPie,
    IconMap,
    IconCommand,
    IconBuildingStore,
    IconUser,
    IconBox,
    IconTableOptions,
} from "@tabler/icons-react";

const data = {
    user: {
        name: "Moon Light",
        email: "moonlight@gmail.com",
        avatar: "",
    },
    navMain: [
        {
            title: "Orders",
            url: "#",
            icon: <IconBox />,
            isActive: true,
            items: [
                {
                    title: "Drafts",
                    url: "#",
                },
                {
                    title: "Shipping labels",
                    url: "#",
                },
                {
                    title: "Abandoned checkouts",
                    url: "#",
                },
            ],
        },
        {
            title: "Products",
            url: "#",
            icon: <IconBuildingStore />,
            items: [
                {
                    title: "Collections",
                    url: "#",
                },
                {
                    title: "Inventory",
                    url: "#",
                },
                {
                    title: "Purchase orders",
                    url: "#",
                },
                {
                    title: "Transfers",
                    url: "#",
                },
                {
                    title: "Gift cards",
                    url: "#",
                },
            ],
        },
        {
            title: "Customers",
            url: "#",
            icon: <IconUser />,
            items: [
                {
                    title: "Segments",
                    url: "#",
                },
                {
                    title: "Companies",
                    url: "#",
                },
            ],
        },
        {
            title: "Content",
            url: "#",
            icon: <IconTableOptions />,
            items: [
                {
                    title: "Metaobjects",
                    url: "#",
                },
                {
                    title: "Files",
                    url: "#",
                },
                {
                    title: "Menus",
                    url: "#",
                },
                {
                    title: "Blog posts",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: <IconLifebuoy />,
        },
        {
            title: "Feedback",
            url: "#",
            icon: <IconSend />,
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: <IconFrame />,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: <IconChartPie />,
        },
        {
            name: "Travel",
            url: "#",
            icon: <IconMap />,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <span>ML</span>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        Moon Light
                                    </span>
                                    <span className="truncate text-xs">
                                        Enterprise
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
