import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST() {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;
	if (!token) {
		return NextResponse.json(
			{ success: false, message: 'no token provided' },
			{ status: 401 }
		);
	}

	try {
		verifyToken(token);
		const response = NextResponse.json({ success: true });
		response.cookies.set('token', '', {
			httpOnly: true,
			path: '/',
			maxAge: 0,
		});
		return response;
	} catch {
		return NextResponse.json(
			{ success: false, message: 'token not a valid token' },
			{ status: 401 }
		);
	}
}
