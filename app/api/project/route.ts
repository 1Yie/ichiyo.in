import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const projects = await prisma.project.findMany({
			orderBy: { id: 'asc' },
			select: {
				id: true,
				name: true,
				description: true,
				link: true,
				iconLight: true,
				iconDark: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return NextResponse.json(projects);
	} catch (error) {
		console.error('获取项目失败', error);
		return NextResponse.json({ error: '获取项目失败' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
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

		const body = await req.json();
		const { name, description, link, iconLight, iconDark } = body;

		if (!name || !description || !link || !iconLight || !iconDark) {
			return NextResponse.json({ error: '字段不能为空' }, { status: 400 });
		}

		const created = await prisma.project.create({
			data: { name, description, link, iconLight, iconDark },
		});

		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		console.error('创建项目失败', error);
		return NextResponse.json({ error: '创建项目失败' }, { status: 500 });
	}
}
