'use client';
import { Ban } from 'lucide-react';
import DashboardLayout from '@/app/ui/dashboard-layout';

export default function DashboardError() {
	return (
		<DashboardLayout breadcrumbs={[{ label: '仪表盘', href: '/dashboard' }]}>
			<div className="bg-diagonal-stripes flex-1 rounded-xl p-4">
				<div className="flex h-full w-full items-center justify-center rounded-xl">
					<div className="flex flex-col items-center justify-center gap-2">
						<Ban className="text-foreground/90 h-18 w-18" />
						<h1 className="text-foreground/90 text-lg">访问的路径不存在</h1>
						<p className="text-foreground/90 text-sm">
							请检查路径是否正确，或者联系管理员。
						</p>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
