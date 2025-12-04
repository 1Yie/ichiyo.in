import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
	verifyPassword,
	hashPassword,
	generateToken,
	getTokenExpirationInSeconds,
} from '@/lib/auth';

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ code: 'MISSING_FIELDS', message: '缺少邮箱或密码' },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			return NextResponse.json(
				{ code: 'INVALID_CREDENTIALS', message: '无效的邮箱或密码' },
				{ status: 401 }
			);
		}

		const { isValid, needsUpdate } = await verifyPassword(
			password,
			user.hashpassword
		);

		if (!isValid) {
			return NextResponse.json(
				{ code: 'INVALID_CREDENTIALS', message: '无效的邮箱或密码' },
				{ status: 401 }
			);
		}

		if (needsUpdate) {
			const newHash = await hashPassword(password);
			await prisma.user.update({
				where: { id: user.id },
				data: { hashpassword: newHash },
			});
		}

		const token = await generateToken({
			uid: user.uid,
			email: user.email,
			id: user.id,
		});

		const response = NextResponse.json({
			success: true,
			token,
		});

		const expiresInSeconds = getTokenExpirationInSeconds();

		response.cookies.set('token', token, {
			httpOnly: true,
			path: '/',
			maxAge: expiresInSeconds,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		});

		return response;
	} catch (error) {
		console.error('登录错误:', error);
		return NextResponse.json(
			{ code: 'INTERNAL_ERROR', message: '服务器内部错误' },
			{ status: 500 }
		);
	}
}
