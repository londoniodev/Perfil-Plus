import { NextResponse } from 'next/server';
import { prisma } from '@alvarosky/database';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'cm7mman6x000208jsf3h9h2k1';

    try {
        const rawThemes = await prisma.theme.findMany({
            where: { tenantId, published: true },
            include: {
                courses: {
                    where: { published: true }
                }
            }
        });

        return NextResponse.json({ success: true, count: rawThemes.length, rawThemes });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
