'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';

export interface LibraryFolderType {
    id: string;
    name: string;
    parentId: string | null;
    path: string;
    createdAt: string;
}

export interface LibraryContentType {
    id: string;
    title: string;
    type: 'Video' | 'PDF' | 'Image' | 'Doc' | 'Other';
    url?: string;
    fileUrl?: string;
    folderId: string;
    size: string;
    lastModified: string;
    status: 'Published' | 'Draft' | 'Archived';
    courseIds: string[];
    description?: string;
}

export async function getLibraryContents(folderId: string = 'root') {
    try {
        const results = await sanityClient.fetch(`{
            "folder": *[_type == "libraryFolder" && (customId == $folderId || _id == $folderId)][0],
            "subfolders": *[_type == "libraryFolder" && parentId == $folderId],
            "files": *[_type == "libraryContent" && folderId == $folderId]
        }`, { folderId });

        // Get breadcrumbs
        const breadcrumbs = [];
        let current = results.folder;

        while (current) {
            breadcrumbs.unshift({ id: current.customId || current._id, name: current.name });
            if (current.parentId && current.parentId !== 'root') {
                current = await sanityClient.fetch(
                    `*[_type == "libraryFolder" && (customId == $parentId || _id == $parentId)][0]`,
                    { parentId: current.parentId }
                );
            } else {
                if (current.parentId === 'root') {
                    breadcrumbs.unshift({ id: 'root', name: 'Home' });
                }
                current = null;
            }
        }

        if (folderId === 'root' && breadcrumbs.length === 0) {
            breadcrumbs.push({ id: 'root', name: 'Home' });
        }

        return {
            folder: cleanSanityDoc(results.folder) || (folderId === 'root' ? { id: 'root', name: 'Home', parentId: null } : null),
            folders: cleanSanityDoc(results.subfolders),
            files: cleanSanityDoc(results.files),
            breadcrumbs
        };
    } catch (e) {
        console.error("Library Service GetContents Error:", e);
        return { folder: null, folders: [], files: [], breadcrumbs: [] };
    }
}

export async function createLibraryFolder(name: string, parentId: string) {
    try {
        const customId = `fold-${Date.now()}`;
        const newFolder = await sanityWriteClient.create({
            _type: 'libraryFolder',
            customId,
            name,
            parentId,
            path: '',
            createdAt: new Date().toISOString()
        });
        return cleanSanityDoc(newFolder);
    } catch (e) {
        console.error("Library Service CreateFolder Error:", e);
        throw e;
    }
}

export async function uploadLibraryContent(contentData: Omit<LibraryContentType, 'id' | 'lastModified' | 'status'>) {
    try {
        const customId = `cnt-${Date.now()}`;
        const newContent = await sanityWriteClient.create({
            _type: 'libraryContent',
            customId,
            ...contentData,
            lastModified: new Date().toISOString().split('T')[0],
            status: 'Published',
            createdAt: new Date().toISOString()
        });
        return cleanSanityDoc(newContent);
    } catch (e) {
        console.error("Library Service UploadContent Error:", e);
        throw e;
    }
}

export async function deleteLibraryItem(id: string, type: 'folder' | 'file') {
    try {
        if (type === 'folder') {
            const deleteRecursive = async (fid: string) => {
                // Find all content in this folder
                const contents = await sanityClient.fetch(`*[_type == "libraryContent" && folderId == $fid]{_id}`, { fid });
                for (const c of contents) {
                    await sanityWriteClient.delete(c._id);
                }
                // Find all subfolders
                const subfolders = await sanityClient.fetch(`*[_type == "libraryFolder" && parentId == $fid]{_id, customId}`, { fid });
                for (const sub of subfolders) {
                    await deleteRecursive(sub.customId || sub._id);
                }
                // Delete the folder itself
                const folder = await sanityClient.fetch(`*[_type == "libraryFolder" && (customId == $fid || _id == $fid)][0]{_id}`, { fid });
                if (folder) await sanityWriteClient.delete(folder._id);
            };
            await deleteRecursive(id);
        } else {
            const content = await sanityClient.fetch(`*[_type == "libraryContent" && (customId == $id || _id == $id)][0]{_id}`, { id });
            if (content) await sanityWriteClient.delete(content._id);
        }
        return { success: true };
    } catch (e) {
        console.error("Library Service DeleteItem Error:", e);
        throw e;
    }
}

export async function renameLibraryItem(id: string, type: 'folder' | 'file', newName: string) {
    try {
        if (type === 'folder') {
            const folder = await sanityClient.fetch(`*[_type == "libraryFolder" && (customId == $id || _id == $id)][0]{_id}`, { id });
            if (folder) {
                await sanityWriteClient.patch(folder._id).set({ name: newName }).commit();
            }
        } else {
            const content = await sanityClient.fetch(`*[_type == "libraryContent" && (customId == $id || _id == $id)][0]{_id}`, { id });
            if (content) {
                await sanityWriteClient.patch(content._id).set({ title: newName }).commit();
            }
        }
        return { success: true };
    } catch (e) {
        console.error("Library Service RenameItem Error:", e);
        throw e;
    }
}

// Keep the object for backwards compatibility where it's used as a service object in client-side code (if any)
// No, actually, 'use server' shouldn't export objects.
// I'll update the callers.

