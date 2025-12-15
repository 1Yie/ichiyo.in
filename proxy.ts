import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // 这里导入你在 auth.ts 或 lib/auth.ts 中导出的 auth

export default auth((req) => {
	// req.auth 是 Auth.js 自动注入的 Session 对象
	// 如果为 null，说明未登录或 Token 无效
	const isLoggedIn = !!req.auth;

	const { nextUrl } = req;
	const pathname = nextUrl.pathname;

	const isLoginPage = pathname === '/auth/login';
	const isDashboardPage = pathname.startsWith('/dashboard');

	// 未登录用户访问受保护页面 (Dashboard) -> 重定向到登录页
	if (isDashboardPage && !isLoggedIn) {
		const loginUrl = new URL('/auth/login', nextUrl);
		// 记录用户原本想去的页面，登录后跳回
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}

	// 体验优化：已登录用户访问登录页 -> 重定向到仪表盘
	if (isLoginPage && isLoggedIn) {
		return NextResponse.redirect(new URL('/dashboard', nextUrl));
	}

	// 其他情况直接放行
	return NextResponse.next();
});

// 配置匹配规则
export const config = {
	matcher: [
		/*
		 * 匹配所有路径，除了:
		 * 1. api (API 路由)
		 * 2. _next/static (静态文件)
		 * 3. _next/image (图片优化文件)
		 * 4. favicon.ico (浏览器图标)
		 * 5. public 文件夹下的静态资源 (可选)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
