import { NextRequest, NextResponse } from 'next/server';
import { getLibraryContents, createLibraryFolder, uploadLibraryContent, deleteLibraryItem, renameLibraryItem } from '@/lib/services/library-service';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId') || 'root';

    try {
        const data = await getLibraryContents(folderId);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        let result;
        if (action === 'createFolder') {
            const { name, parentId } = body;
            result = await createLibraryFolder(name, parentId);
        } else if (action === 'upload') {
            const { contentData } = body;
            result = await uploadLibraryContent(contentData);
        } else if (action === 'delete') {
            const { id, type } = body;
            result = await deleteLibraryItem(id, type);
        } else if (action === 'rename') {
            const { id, type, newName } = body;
            result = await renameLibraryItem(id, type, newName);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
