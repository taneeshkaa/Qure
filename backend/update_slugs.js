const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const doctors = await prisma.doctor.findMany({ where: { slug: null } });
    for (const doc of doctors) {
        const nameForSlug = doc.full_name.replace(/^Dr\.\s*/i, '').trim();
        const slug = `dr-${nameForSlug.toLowerCase().replace(/\s+/g, '-')}`;
        await prisma.doctor.update({
            where: { id: doc.id },
            data: { slug }
        });
        console.log(`Updated ${doc.full_name} -> ${slug}`);
    }
}

run().catch(console.error).finally(()=>prisma.$disconnect());
