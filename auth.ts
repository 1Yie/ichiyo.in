import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		GitHub({
			allowDangerousEmailAccountLinking: true,
		}),
	],
	pages: {
		signIn: '/auth/login',
		error: '/auth/error',
	},

	callbacks: {
		async signIn({ user }) {
			if (!user.email) return false;

			try {
				const dbUser = await prisma.user.findUnique({
					where: { email: user.email },
				});

				if (dbUser && dbUser.isAdmin) {
					return true; // 允许登录
				}
				return false;
			} catch (error) {
				console.error('SignIn 验证出错:', error);
				return false;
			}
		},

		async session({ session, user }) {
			if (session.user && user) {
				(session.user as any).uid = (user as any).uid;
				(session.user as any).isAdmin = (user as any).isAdmin;
			}
			return session;
		},
	},
});
