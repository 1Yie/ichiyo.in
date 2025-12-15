import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
	const isLoggedIn = !!req.auth;

	const { nextUrl } = req;
	const pathname = nextUrl.pathname;

	const isLoginPage = pathname === '/auth/login';
	const isDashboardPage = pathname.startsWith('/dashboard');

	if (isDashboardPage && !isLoggedIn) {
		const loginUrl = new URL('/auth/login', nextUrl);
		// 记录用户原本想去的页面，登录后跳回
		loginUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (isLoginPage && isLoggedIn) {
		const callbackUrl = nextUrl.searchParams.get('callbackUrl') || '/dashboard';
		return NextResponse.redirect(new URL(callbackUrl, nextUrl));
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		/*
		 * 匹配所有路径，除了:
		 * 1. api (API 路由)
		 * 2. _next/static (静态文件)
		 * 3. _next/image (图片优化文件)
		 * 4. favicon.ico (浏览器图标)
		 * 5. public 文件夹下的静态资源
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
