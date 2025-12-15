import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface Params {
	params: Promise<{ id: string }>;
}

export async function GET(req: Request, props: Params) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	const params = await props.params;
	const { id } = params;

	try {
		const project = await prisma.project.findUnique({
			where: { id: Number(id) },
		});

		if (!project) {
			return NextResponse.json({ error: '未找到该项目' }, { status: 404 });
		}

		return NextResponse.json(project);
	} catch {
		return NextResponse.json({ error: '获取失败' }, { status: 500 });
	}
}

export async function PATCH(req: Request, props: Params) {
	const session = await auth();
	if (!session || !session.user?.id) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	if (!user?.isAdmin) {
		return NextResponse.json({ error: '权限不足' }, { status: 403 });
	}

	const params = await props.params;
	const { id } = params;

	try {
		const body = await req.json();
		const { name, description, link, iconLight, iconDark } = body;

		const dataToUpdate: Partial<{
			name: string;
			description: string;
			link: string;
			iconLight: string;
			iconDark: string;
		}> = {};

		if (name !== undefined) dataToUpdate.name = name;
		if (description !== undefined) dataToUpdate.description = description;
		if (link !== undefined) dataToUpdate.link = link;
		if (iconLight !== undefined) dataToUpdate.iconLight = iconLight;
		if (iconDark !== undefined) dataToUpdate.iconDark = iconDark;

		const updated = await prisma.project.update({
			where: { id: Number(id) },
			data: dataToUpdate,
		});
		return NextResponse.json(updated);
	} catch (error) {
		console.error('修改项目失败:', error);
		return NextResponse.json({ error: '修改失败' }, { status: 500 });
	}
}

export async function DELETE(req: Request, props: Params) {
	const session = await auth();
	if (!session || !session.user?.id) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	if (!user?.isAdmin) {
		return NextResponse.json({ error: '权限不足' }, { status: 403 });
	}

	const params = await props.params;
	const { id } = params;

	try {
		await prisma.project.delete({
			where: { id: Number(id) },
		});
		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json({ error: '删除失败' }, { status: 500 });
	}
}
