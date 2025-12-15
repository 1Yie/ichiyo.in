// auth.ts
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

	callbacks: {
		async session({ session, user }) {
			if (session.user && user) {
				(session.user as any).uid = (user as any).uid;
			}
			return session;
		},
	},
});
