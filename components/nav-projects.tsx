'use client';

import { type LucideIcon } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavProjects({
	projects,
	label,
}: {
	projects: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
	label: string;
}) {
	const router = useRouter();
	return (
		<SidebarGroup>
			<SidebarGroupLabel>{label}</SidebarGroupLabel>
			<SidebarMenu>
				{projects.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild tooltip={item.name}>
							<button
								className="flex w-full cursor-pointer"
								onClick={() => router.push(item.url)}
							>
								<item.icon />
								<span className="group-data-[collapsible=icon]:hidden">
									{item.name}
								</span>
							</button>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
