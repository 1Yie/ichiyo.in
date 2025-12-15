import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	/**
	 * 扩展 Session 包含的内容
	 */
	interface Session {
		user: {
			uid: number;
		} & DefaultSession['user'];
	}
}
