import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	let payload;
	try {
		payload = verifyToken(token);
		if (!payload) {
			return NextResponse.json({ error: '无效身份' }, { status: 401 });
		}
	} catch {
		return NextResponse.json({ error: '无效身份' }, { status: 401 });
	}

	try {
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
