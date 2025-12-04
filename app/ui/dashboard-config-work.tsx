'use client';

import { Suspense, use } from 'react';
import { useState, useMemo } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { request } from '@/hooks/use-request';
import type { Project } from '@/types/config';
import DashboardLayout from '@/app/ui/dashboard-layout';

type SortField = 'id' | 'name' | 'description' | 'link' | 'none';
type SortOrder = 'asc' | 'desc';

async function fetchProjectsData(): Promise<Project[]> {
	const res = await request('/api/project', {
		method: 'GET',
		credentials: 'include',
		cache: 'no-store',
	});
	if (!res) {
		toast.error('获取作品失败');
		throw new Error('获取作品失败');
	}
	return Array.isArray(res) ? res : [];
}

function ProjectList({
	projectsPromise,
}: {
	projectsPromise: Promise<Project[]>;
}) {
	const initialProjects = use(projectsPromise);
	const [projects, setProjects] = useState(initialProjects);

	const router = useRouter();

	const [sortField, setSortField] = useState<SortField>('id');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (deleteId === null) return;
		setDeleting(true);
		try {
			const res = await request(`/api/project/${deleteId}`, {
				method: 'DELETE',
				credentials: 'include',
				cache: 'no-store',
			});
			if (!res) {
				toast.error('删除失败');
				throw new Error('删除失败');
			}

			setProjects((prev) => prev.filter((project) => project.id !== deleteId));

			toast.success(`ID 为 ${deleteId} 的作品已被删除`);
		} catch (err) {
			console.error(err);
			toast.error('服务器未能成功响应删除请求');
		} finally {
			setDeleting(false);
			setShowDeleteDialog(false);
			setDeleteId(null);
		}
	};

	const handleSort = (field: SortField) => {
		if (field === sortField) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortOrder('asc');
		}
	};

	const sortedProjects = useMemo(() => {
		if (sortField === 'none') return projects;

		return [...projects].sort((a, b) => {
			let aVal = a[sortField];
			let bVal = b[sortField];

			if (aVal === undefined || aVal === null) aVal = '';
			if (bVal === undefined || bVal === null) bVal = '';

			if (sortField === 'id') {
				return sortOrder === 'asc'
					? Number(aVal) - Number(bVal)
					: Number(bVal) - Number(aVal);
			}

			return sortOrder === 'asc'
				? String(aVal).localeCompare(String(bVal))
				: String(bVal).localeCompare(String(aVal));
		});
	}, [projects, sortField, sortOrder]);

	const renderSortIcon = (field: SortField) => {
		const isActive = field === sortField;
		return (
			<>
				<ArrowUp
					className={cn(
						'inline-block h-4 w-4',
						isActive && sortOrder === 'asc'
							? 'text-foreground/90'
							: 'text-gray-300'
					)}
				/>
				<ArrowDown
					className={cn(
						'inline-block h-4 w-4',
						isActive && sortOrder === 'desc'
							? 'text-foreground/90'
							: 'text-gray-300'
					)}
				/>
			</>
		);
	};

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead
							className="text-foreground/90 cursor-pointer select-none"
							onClick={() => handleSort('id')}
						>
							ID {renderSortIcon('id')}
						</TableHead>
						<TableHead className="text-foreground/90">图标</TableHead>
						<TableHead
							className="text-foreground/90 cursor-pointer select-none"
							onClick={() => handleSort('name')}
						>
							名称 {renderSortIcon('name')}
						</TableHead>
						<TableHead
							className="text-foreground/90 cursor-pointer select-none"
							onClick={() => handleSort('description')}
						>
							描述 {renderSortIcon('description')}
						</TableHead>
						<TableHead
							className="text-foreground/90 cursor-pointer select-none"
							onClick={() => handleSort('link')}
						>
							链接 {renderSortIcon('link')}
						</TableHead>
						<TableHead className="text-foreground/90 text-right">
							操作
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedProjects.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={6}
								className="text-muted-foreground dark:text-muted text-center"
							>
								暂无作品
							</TableCell>
						</TableRow>
					) : (
						sortedProjects.map((project) => (
							<TableRow key={project.id}>
								<TableCell className="text-foreground/90">
									{project.id}
								</TableCell>
								<TableCell>
									<Image
										src={project.iconLight}
										alt={`${project.name} icon light`}
										width={32}
										height={32}
										className="h-12 w-auto rounded dark:hidden"
										unoptimized
										priority
									/>
									<Image
										src={project.iconDark}
										alt={`${project.name} icon dark`}
										width={32}
										height={32}
										className="hidden h-12 w-auto rounded dark:inline"
										unoptimized
										priority
									/>
								</TableCell>
								<TableCell className="text-foreground/90">
									{project.name}
								</TableCell>
								<TableCell className="text-foreground/90">
									{project.description}
								</TableCell>
								<TableCell>
									<a
										href={project.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground/90 hover:underline"
									>
										{project.link}
									</a>
								</TableCell>
								<TableCell className="space-x-2 text-right">
									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											router.push(`/dashboard/config/work/${project.id}`)
										}
									>
										编辑
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={() => {
											setDeleteId(project.id);
											setShowDeleteDialog(true);
										}}
									>
										删除
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确定要删除这条作品？</AlertDialogTitle>
						<AlertDialogDescription>删除后将无法恢复。</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} disabled={deleting}>
							{deleting ? '删除中...' : '确认删除'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export default function DashboardConfigWorkSuspenseWrapper() {
	const projectsPromise = fetchProjectsData();
	const router = useRouter();

	return (
		<DashboardLayout
			breadcrumbs={[
				{ label: '仪表盘', href: '/dashboard' },
				{ label: '作品', href: '/dashboard/config/work' },
			]}
		>
			<div className="mr-2 mb-4 ml-2 flex items-center justify-between">
				<h1 className="text-foreground/90 text-2xl font-bold">作品列表</h1>
				<Button onClick={() => router.push('/dashboard/config/work/new')}>
					<Pencil className="mr-1 h-4 w-4" />
					新建作品
				</Button>
			</div>

			<div className="bg-muted/50 dark:bg-muted/50 rounded-xl p-4">
				<Suspense
					fallback={
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-foreground/90 cursor-pointer select-none">
										ID
									</TableHead>
									<TableHead className="text-foreground/90">图标</TableHead>
									<TableHead className="text-foreground/90 cursor-pointer select-none">
										名称
									</TableHead>
									<TableHead className="text-foreground/90 cursor-pointer select-none">
										描述
									</TableHead>
									<TableHead className="text-foreground/90 cursor-pointer select-none">
										链接
									</TableHead>
									<TableHead className="text-foreground/90 text-right">
										操作
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Array.from({ length: 3 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-4 w-6 rounded" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-12 w-12 rounded" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-24 rounded" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-48 rounded" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-32 rounded" />
										</TableCell>
										<TableCell className="space-x-2 text-right">
											<Skeleton className="inline-block h-8 w-16 rounded" />
											<Skeleton className="inline-block h-8 w-16 rounded" />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					}
				>
					<ProjectList projectsPromise={projectsPromise} />
				</Suspense>
			</div>
		</DashboardLayout>
	);
}
