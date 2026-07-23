import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

async function main() {
  const start = Date.now();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log(JSON.stringify({ ok: false, error: 'DATABASE_URL missing' }));
    process.exit(1);
  }

  const host = url.match(/@([^/?]+)/)?.[1] ?? 'unknown';
  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    const userCount = await prisma.user.count();
    console.log(
      JSON.stringify({
        ok: true,
        host,
        latencyMs: Date.now() - start,
        userCount,
      }),
    );
    await prisma.$disconnect();
  } catch (err) {
    console.log(
      JSON.stringify({
        ok: false,
        host,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    process.exit(1);
  }
}

void main();
