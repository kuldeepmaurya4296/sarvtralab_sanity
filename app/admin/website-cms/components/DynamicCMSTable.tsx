'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDoc, updateDoc, deleteDoc, uploadAssetToSanity } from '@/lib/actions/cms.actions';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Upload } from 'lucide-react';

export default function DynamicCMSTable({
    schemaType,
    initialData,
    fields,
    isFooterLinks = false,
    isLegalSections = false
}: {
    schemaType: string,
    initialData: any[],
    fields: any[],
    isFooterLinks?: boolean,
    isLegalSections?: boolean
}) {
    const [data, setData] = useState(initialData || []);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingObj, setIsUploadingObj] = useState<Record<string, boolean>>({});
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingObj({ ...isUploadingObj, [key]: true });
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await uploadAssetToSanity(data);
            if (res.success) {
                setFormData({ ...formData, [key]: res.url });
                toast.success("File uploaded to Sanity successfully.");
            } else {
                toast.error(`Upload failed: ${res.error}`);
            }
        } catch (err: any) {
            toast.error("Upload failed.");
        } finally {
            setIsUploadingObj({ ...isUploadingObj, [key]: false });
        }
    };

    // For footer links sub-documents
    const [subLinks, setSubLinks] = useState<any[]>([]);

    const handleOpenCreate = () => {
        setEditingItem(null);
        setFormData({});
        setSubLinks([]);
        setIsOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingItem(item);
        setFormData(item);
        if (isFooterLinks) setSubLinks(item.links || []);
        if (isLegalSections) setSubLinks(item.sections || []);
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this specific content piece?")) return;
        const res = await deleteDoc(id);
        if (res.success) {
            setData(data.filter(d => (d.id || d._id) !== id));
            toast.success("Deleted successfully.");
        } else {
            toast.error("Error deleting item.");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Create a cleaned payload by removing internal Sanity fields
        const payload: any = {};
        Object.keys(formData).forEach(key => {
            // Skip fields starting with _ (internal sanity) or id/createdAt/updatedAt (client logic)
            if (!key.startsWith('_') && !['id', 'createdAt', 'updatedAt'].includes(key)) {
                payload[key] = formData[key];
            }
        });

        if (isFooterLinks) {
            payload.links = subLinks.map(l => ({
                ...l,
                _type: 'object',
                _key: l._key || Math.random().toString(36).substring(7)
            }));
        }
        if (isLegalSections) {
            payload.sections = subLinks.map(l => ({
                ...l,
                _type: 'object',
                _key: l._key || Math.random().toString(36).substring(7)
            }));
        }

        if (editingItem) {
            const id = editingItem._id || editingItem.id;
            const res = await updateDoc(id, payload);
            if (res.success) {
                setData(data.map(d => (d._id || d.id) === id ? { ...d, ...payload } : d));
                toast.success("Updated successfully.");
                setIsOpen(false);
            } else {
                console.error("Update Error:", res.error);
                toast.error(`Failed to update: ${res.error || 'Unknown error'}`);
            }
        } else {
            const res = await createDoc(schemaType, payload);
            if (res.success) {
                toast.success("Created successfully.");
                window.location.reload();
            } else {
                console.error("Create Error:", res.error);
                toast.error(`Failed to create: ${res.error || 'Unknown error'}`);
            }
        }
        setIsSaving(false);
    };

    const addSubItem = () => {
        if (isFooterLinks) setSubLinks([...subLinks, { label: '', href: '' }]);
        if (isLegalSections) setSubLinks([...subLinks, { heading: '', subheading: '', paragraph: '' }]);
    };

    const removeFooterLink = (index: number) => {
        setSubLinks(subLinks.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleOpenCreate} className="rounded-none gap-2">
                    <Plus className="w-4 h-4" /> Add Item
                </Button>
            </div>

            <div className="border border-border/50 overflow-x-auto">
                <Table className="min-w-[600px]">
                    <TableHeader className="bg-muted/50 text-xs uppercase">
                        <TableRow>
                            {fields.map(f => (
                                <TableHead key={f.key}>{f.label}</TableHead>
                            ))}
                            {isFooterLinks && <TableHead>Links Count</TableHead>}
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, idx) => (
                            <TableRow key={`${item.id || item._id || schemaType}-${idx}`}>
                                {fields.map(f => (
                                    <TableCell key={f.key} className="max-w-[200px] truncate">
                                        {item[f.key]?.toString()}
                                    </TableCell>
                                ))}
                                {isFooterLinks && (
                                    <TableCell>{(item.links || []).length} links</TableCell>
                                )}
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item._id || item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={fields.length + 2} className="text-center py-8 text-muted-foreground">
                                    No data available. Add a new item.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="rounded-none sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Create'} Record</DialogTitle>
                        <DialogDescription>
                            Provide details for the {schemaType} content piece. All changes are saved directly to Sanity CDN.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {fields.map(f => (
                            <div key={f.key} className="space-y-2">
                                <Label>{f.label}</Label>
                                {f.type === 'text' ? (
                                    <Textarea
                                        className="rounded-none"
                                        value={formData[f.key] || ''}
                                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                    />
                                ) : f.type === 'number' ? (
                                    <Input
                                        className="rounded-none"
                                        type="number"
                                        value={formData[f.key] || 0}
                                        onChange={e => setFormData({ ...formData, [f.key]: Number(e.target.value) })}
                                    />
                                ) : f.type === 'image' || f.type === 'video' || f.type === 'url' ? (
                                    <div className="space-y-3 p-3 border bg-muted/10">
                                        <div className="flex flex-col space-y-2 relative">
                                            <Label className="text-xs text-muted-foreground flex items-center justify-between">
                                                <span>Upload from Device (No Size Limits via Sanity Assets)</span>
                                                {isUploadingObj[f.key] && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    type="file"
                                                    className="rounded-none file:mr-4 file:py-1 file:px-4 file:rounded-none file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                                    onChange={(e) => handleFileUpload(e, f.key)}
                                                    disabled={isUploadingObj[f.key]}
                                                />
                                                {isUploadingObj[f.key] && (
                                                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                                        <span className="text-xs font-semibold animate-pulse">Uploading...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-center text-xs text-muted-foreground font-medium uppercase tracking-widest my-2 relative">
                                            <span className="bg-background px-2">OR</span>
                                            <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border"></div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <Label className="text-xs text-muted-foreground">Paste Public Link (YouTube, Vimeo, Drive, Base64)</Label>
                                            <Input
                                                className="rounded-none"
                                                placeholder="https://..."
                                                value={formData[f.key] || ''}
                                                onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                            />
                                        </div>
                                        {formData[f.key] && (
                                            <div className="text-xs text-primary truncate border-l-2 border-primary pl-2 py-1 mt-2">
                                                Current File: {formData[f.key]}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Input
                                        className="rounded-none"
                                        value={formData[f.key] || ''}
                                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}

                        {/* Special case for footer section embedded links array */}
                        {isFooterLinks && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <Label>Child Links</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addSubItem} className="rounded-none h-7">
                                        <Plus className="w-3 h-3 mr-1" /> Add Link
                                    </Button>
                                </div>
                                {subLinks.map((link, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start bg-muted/20 p-3 border">
                                        <div className="grid grid-cols-1 gap-2 flex-1">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] sm:hidden">Label</Label>
                                                <Input
                                                    placeholder="Label (e.g. About Us)"
                                                    value={link.label || ''}
                                                    className="rounded-none h-9 text-sm w-full"
                                                    onChange={e => {
                                                        const newLinks = [...subLinks];
                                                        newLinks[idx].label = e.target.value;
                                                        setSubLinks(newLinks);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] sm:hidden">URL</Label>
                                                <Input
                                                    placeholder="URL (e.g. /about)"
                                                    value={link.href || ''}
                                                    className="rounded-none h-9 text-sm w-full"
                                                    onChange={e => {
                                                        const newLinks = [...subLinks];
                                                        newLinks[idx].href = e.target.value;
                                                        setSubLinks(newLinks);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive ml-auto" onClick={() => removeFooterLink(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isLegalSections && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <Label>Legal Sections</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addSubItem} className="rounded-none h-7">
                                        <Plus className="w-3 h-3 mr-1" /> Add Section
                                    </Button>
                                </div>
                                {subLinks.map((section, idx) => (
                                    <div key={idx} className="grid grid-cols-1 gap-2 items-start bg-muted/20 p-3 border relative pr-10">
                                        <Input
                                            placeholder="Heading"
                                            value={section.heading || ''}
                                            className="rounded-none h-9 text-sm font-bold"
                                            onChange={e => {
                                                const newArr = [...subLinks];
                                                newArr[idx].heading = e.target.value;
                                                setSubLinks(newArr);
                                            }}
                                        />
                                        <Input
                                            placeholder="Sub-heading"
                                            value={section.subheading || ''}
                                            className="rounded-none h-8 text-xs italic"
                                            onChange={e => {
                                                const newArr = [...subLinks];
                                                newArr[idx].subheading = e.target.value;
                                                setSubLinks(newArr);
                                            }}
                                        />
                                        <Textarea
                                            placeholder="Content Paragraph"
                                            value={section.paragraph || ''}
                                            className="rounded-none text-sm min-h-[80px]"
                                            onChange={e => {
                                                const newArr = [...subLinks];
                                                newArr[idx].paragraph = e.target.value;
                                                setSubLinks(newArr);
                                            }}
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive absolute top-2 right-2" onClick={() => setSubLinks(subLinks.filter((_, i) => i !== idx))}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-none" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button className="rounded-none" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
