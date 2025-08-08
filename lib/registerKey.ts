import prisma from "@/lib/prisma";

export async function validateRegisterKey(key: string): Promise<boolean> {
  const now = Date.now();
  const record = await prisma.registerKey.findFirst({
    where: {
      key,
      expiresAt: { gt: BigInt(now) },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (!record) return false;

  await prisma.registerKey.delete({ where: { id: record.id } });
  return true;
}
