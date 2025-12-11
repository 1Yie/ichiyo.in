import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { hashPassword } from '@/lib/auth';

export async function POST() {
	try {
		// 检查初始化开关是否已禁用
		const initSetting = await prisma.systemSettings.findUnique({
			where: { key: 'init_api_enabled' },
		});

		if (initSetting && initSetting.value === 'false') {
			return NextResponse.json(
				{
					success: false,
					message: '初始化API已被禁用',
					error: 'API_DISABLED',
				},
				{ status: 403 }
			);
		}

		// 检查用户数量
		const userCount = await prisma.user.count();

		if (userCount === 0) {
			// 没有用户，创建默认超级管理员
			const hashedPassword = await hashPassword('password');

			const adminUser = await prisma.user.create({
				data: {
					id: 'admin',
					email: 'admin@admin.com',
					hashpassword: hashedPassword,
					isAdmin: true,
					isSuperAdmin: true,
				},
				select: {
					uid: true,
					id: true,
					email: true,
					isAdmin: true,
					isSuperAdmin: true,
				},
			});

			// 设置初始化完成标记
			await prisma.systemSettings.upsert({
				where: { key: 'init_completed' },
				update: { value: 'true' },
				create: {
					key: 'init_completed',
					value: 'true',
					description: '标记系统是否已完成初始化',
				},
			});

			return NextResponse.json({
				success: true,
				message: '已创建默认超级管理员账号',
				action: 'created_admin',
				user: {
					uid: adminUser.uid,
					id: adminUser.id,
					email: adminUser.email,
					isAdmin: adminUser.isAdmin,
					isSuperAdmin: adminUser.isSuperAdmin,
				},
			});
		} else {
			// 有用户，检查是否有超级管理员
			const superAdminCount = await prisma.user.count({
				where: { isSuperAdmin: true },
			});

			if (superAdminCount === 0) {
				// 没有超级管理员，将uid=1的用户设为超级管理员
				const firstUser = await prisma.user.findFirst({
					where: { uid: 1 },
				});

				if (!firstUser) {
					return NextResponse.json(
						{
							success: false,
							message: '未找到uid=1的用户',
							error: 'USER_NOT_FOUND',
						},
						{ status: 404 }
					);
				}

				const updatedUser = await prisma.user.update({
					where: { uid: 1 },
					data: {
						isAdmin: true,
						isSuperAdmin: true,
					},
					select: {
						uid: true,
						id: true,
						email: true,
						isAdmin: true,
						isSuperAdmin: true,
					},
				});

				// 设置初始化完成标记
				await prisma.systemSettings.upsert({
					where: { key: 'init_completed' },
					update: { value: 'true' },
					create: {
						key: 'init_completed',
						value: 'true',
						description: '标记系统是否已完成初始化',
					},
				});

				return NextResponse.json({
					success: true,
					message: `已将用户 ${updatedUser.id} (uid=1) 设为超级管理员`,
					action: 'promoted_uid_1',
					user: {
						uid: updatedUser.uid,
						id: updatedUser.id,
						email: updatedUser.email,
						isAdmin: updatedUser.isAdmin,
						isSuperAdmin: updatedUser.isSuperAdmin,
					},
				});
			} else {
				return NextResponse.json({
					success: false,
					message: '系统已有超级管理员，无需初始化',
					action: 'no_action_needed',
				});
			}
		}
	} catch (error) {
		console.error('初始化错误:', error);
		return NextResponse.json(
			{
				success: false,
				message: '初始化过程中发生错误',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		// 检查初始化开关状态
		const initSetting = await prisma.systemSettings.findUnique({
			where: { key: 'init_api_enabled' },
		});

		const isEnabled = !initSetting || initSetting.value !== 'false';

		// 检查初始化完成状态
		const initCompleted = await prisma.systemSettings.findUnique({
			where: { key: 'init_completed' },
		});

		const userCount = await prisma.user.count();
		const superAdminCount = await prisma.user.count({
			where: { isSuperAdmin: true },
		});

		const needsInit = userCount === 0 || superAdminCount === 0;

		return NextResponse.json({
			userCount,
			superAdminCount,
			needsInit,
			isEnabled,
			initCompleted: initCompleted?.value === 'true',
			status: needsInit ? 'needs_init' : 'initialized',
		});
	} catch (error) {
		console.error('获取初始化状态错误:', error);
		return NextResponse.json(
			{
				error: '获取状态失败',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
