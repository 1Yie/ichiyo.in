import { prisma } from '@/lib/prisma';

export async function validateRegisterKey(key: string): Promise<boolean> {
	const now = Date.now();
	const record = await prisma.registerKey.findFirst({
		where: {
			key,
			expiresAt: { gt: BigInt(now) },
			isUsed: false,
		},
		orderBy: { expiresAt: 'desc' },
	});

	if (!record) return false;

	await prisma.registerKey.update({
		where: { id: record.id },
		data: { isUsed: true },
	});

	return true;
}
