import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
	try {
		// 获取用户认证信息
		const token = request.cookies.get('token')?.value;
		const user = await authenticateToken(token);

		if (!user) {
			return NextResponse.json(
				{ success: false, message: '未登录' },
				{ status: 401 }
			);
		}

		// 检查用户是否为超级管理员
		const userRecord = await prisma.user.findUnique({
			where: { email: user.email },
			select: { isSuperAdmin: true },
		});

		if (!userRecord?.isSuperAdmin) {
			return NextResponse.json(
				{ success: false, message: '权限不足，需要超级管理员权限' },
				{ status: 403 }
			);
		}

		const { enabled } = await request.json();

		// 更新初始化API开关设置
		await prisma.systemSettings.upsert({
			where: { key: 'init_api_enabled' },
			update: {
				value: enabled ? 'true' : 'false',
				updatedAt: new Date(),
			},
			create: {
				key: 'init_api_enabled',
				value: enabled ? 'true' : 'false',
				description: '控制初始化API是否启用',
			},
		});

		return NextResponse.json({
			success: true,
			message: `初始化API已${enabled ? '启用' : '禁用'}`,
			enabled,
		});
	} catch (error) {
		console.error('更新初始化设置错误:', error);
		return NextResponse.json(
			{
				success: false,
				message: '更新设置失败',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		// 获取用户认证信息
		const token = request.cookies.get('token')?.value;
		const user = await authenticateToken(token);

		if (!user) {
			return NextResponse.json(
				{ success: false, message: '未登录' },
				{ status: 401 }
			);
		}

		// 检查用户是否为超级管理员
		const userRecord = await prisma.user.findUnique({
			where: { email: user.email },
			select: { isSuperAdmin: true },
		});

		if (!userRecord?.isSuperAdmin) {
			return NextResponse.json(
				{ success: false, message: '权限不足，需要超级管理员权限' },
				{ status: 403 }
			);
		}

		// 获取初始化API开关状态
		const initSetting = await prisma.systemSettings.findUnique({
			where: { key: 'init_api_enabled' },
		});

		const enabled = !initSetting || initSetting.value !== 'false';

		return NextResponse.json({
			success: true,
			enabled,
		});
	} catch (error) {
		console.error('获取初始化设置错误:', error);
		return NextResponse.json(
			{
				success: false,
				message: '获取设置失败',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
