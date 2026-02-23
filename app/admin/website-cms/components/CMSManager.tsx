'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrganization } from '@/lib/actions/cms.actions';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import DynamicCMSTable from './DynamicCMSTable';

export default function CMSManager({
    organization,
    footerSections,
    features,
    videos,
    teamMembers,
    legalDocs
}: any) {
    const [orgData, setOrgData] = useState(organization || {});
    const [isSavingOrg, setIsSavingOrg] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOrgSave = async () => {
        setIsSavingOrg(true);
        if (!orgData.id && !orgData._id) {
            toast.error("Organization ID not found to update.");
            setIsSavingOrg(false);
            return;
        }
        const res = await updateOrganization(orgData.id || orgData._id, {
            name: orgData.name,
            email: orgData.email,
            phone: orgData.phone,
            address: orgData.address,
            hours: orgData.hours,
            description: orgData.description,
            tagline: orgData.tagline,
            mission: orgData.mission,
            vision: orgData.vision,
            values: orgData.values,
            milestones: orgData.milestones,
            socials: orgData.socials
        });
        if (res.success) {
            toast.success("Organization details updated.");
        } else {
            toast.error("Failed to update organization.");
        }
        setIsSavingOrg(false);
    };

    if (!mounted) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <Tabs defaultValue="home" className="space-y-6">
            <div className="w-full overflow-x-auto pb-2 -mb-2">
                <TabsList className="bg-background border rounded-none flex h-auto min-w-max justify-start p-1">
                    <TabsTrigger value="home" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Home Page</TabsTrigger>
                    <TabsTrigger value="about" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">About Page</TabsTrigger>
                    <TabsTrigger value="footer" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Footer Sections</TabsTrigger>
                    <TabsTrigger value="legal" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Legal</TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Contact / Built-in</TabsTrigger>
                </TabsList>
            </div>

            {/* HOME PAGE */}
            <TabsContent value="home" className="space-y-6">
                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Home Page Features (Trust Section)</CardTitle>
                        <CardDescription>Manage "Why Parents & Schools Trust Sarvtra Labs" features.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DynamicCMSTable
                            schemaType="feature"
                            initialData={features}
                            fields={[
                                { key: 'title', label: 'Title', type: 'string' },
                                { key: 'description', label: 'Description', type: 'text' },
                                { key: 'iconName', label: 'Icon (Lucide)', type: 'string' },
                                { key: 'order', label: 'Order', type: 'number' }
                            ]}
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Home Page Videos</CardTitle>
                        <CardDescription>Manage "Video Library" items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DynamicCMSTable
                            schemaType="video"
                            initialData={videos}
                            fields={[
                                { key: 'title', label: 'Title', type: 'string' },
                                { key: 'videoUrl', label: 'Video URL (YouTube/Vimeo/Direct)', type: 'video' },
                                { key: 'thumbnail', label: 'Thumbnail Image', type: 'image' },
                                { key: 'duration', label: 'Duration (e.g. 5:32)', type: 'string' },
                                { key: 'views', label: 'Views Count', type: 'number' },
                                { key: 'category', label: 'Category', type: 'string' },
                                { key: 'order', label: 'Order', type: 'number' }
                            ]}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* ABOUT PAGE */}
            <TabsContent value="about" className="space-y-6">
                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Core Identity & Hero Data</CardTitle>
                        <CardDescription>Statements explicitly displayed on the Top About Us Page Hero, Mission, and Vision Section.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>About Us Landing Page Description</Label>
                            <Textarea
                                value={orgData.description || ''}
                                onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                                className="rounded-none focus-visible:ring-primary min-h-[100px]"
                                placeholder="Sarvtra Labs is India's premier robotics education platform..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Mission Statement</Label>
                                <Textarea
                                    value={orgData.mission || ''}
                                    onChange={(e) => setOrgData({ ...orgData, mission: e.target.value })}
                                    className="rounded-none focus-visible:ring-primary min-h-[120px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vision Statement</Label>
                                <Textarea
                                    value={orgData.vision || ''}
                                    onChange={(e) => setOrgData({ ...orgData, vision: e.target.value })}
                                    className="rounded-none focus-visible:ring-primary min-h-[120px]"
                                />
                            </div>
                        </div>
                        <Button
                            className="rounded-none"
                            onClick={handleOrgSave}
                            disabled={isSavingOrg}
                        >
                            {isSavingOrg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save Core Identity
                        </Button>
                    </CardContent>
                </Card>

                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Journey Milestones</CardTitle>
                        <CardDescription>Timeline items shown on the About page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(orgData.milestones || []).map((milestone: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-[120px_1fr_40px] gap-4 items-start bg-muted/20 p-3 border">
                                <div className="space-y-1">
                                    <Label className="text-[10px] md:hidden">Year</Label>
                                    <Input
                                        placeholder="Year"
                                        value={milestone.year || ''}
                                        className="rounded-none w-full"
                                        onChange={e => {
                                            const arr = [...(orgData.milestones || [])];
                                            arr[idx].year = e.target.value;
                                            setOrgData({ ...orgData, milestones: arr });
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] md:hidden">Event</Label>
                                    <Input
                                        placeholder="Event description"
                                        value={milestone.event || ''}
                                        className="rounded-none w-full"
                                        onChange={e => {
                                            const arr = [...(orgData.milestones || [])];
                                            arr[idx].event = e.target.value;
                                            setOrgData({ ...orgData, milestones: arr });
                                        }}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive h-10 w-10 shrink-0 md:mt-0 ml-auto" onClick={() => {
                                    const arr = [...(orgData.milestones || [])];
                                    arr.splice(idx, 1);
                                    setOrgData({ ...orgData, milestones: arr });
                                }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-none text-xs"
                                onClick={() => {
                                    setOrgData({
                                        ...orgData,
                                        milestones: [...(orgData.milestones || []), { year: '', event: '', _type: 'object', _key: Math.random().toString(36).substring(7) }]
                                    });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Milestone
                            </Button>
                            <Button
                                className="rounded-none px-8"
                                onClick={handleOrgSave}
                                disabled={isSavingOrg}
                            >
                                {isSavingOrg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Save Milestones
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Core Values</CardTitle>
                        <CardDescription>Primary organizational values displayed in grid.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(orgData.values || []).map((val: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start bg-muted/20 p-4 border">
                                <div className="space-y-2">
                                    <Label className="text-xs">Lucide Icon</Label>
                                    <Input
                                        placeholder="E.g. Target"
                                        value={val.icon || ''}
                                        className="rounded-none"
                                        onChange={e => {
                                            const arr = [...(orgData.values || [])];
                                            arr[idx].icon = e.target.value;
                                            setOrgData({ ...orgData, values: arr });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Title</Label>
                                    <Input
                                        placeholder="Value Title"
                                        value={val.title || ''}
                                        className="rounded-none"
                                        onChange={e => {
                                            const arr = [...(orgData.values || [])];
                                            arr[idx].title = e.target.value;
                                            setOrgData({ ...orgData, values: arr });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2 relative pr-12">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        placeholder="Short description"
                                        value={val.description || ''}
                                        className="rounded-none"
                                        onChange={e => {
                                            const arr = [...(orgData.values || [])];
                                            arr[idx].description = e.target.value;
                                            setOrgData({ ...orgData, values: arr });
                                        }}
                                    />
                                    <Button variant="ghost" size="icon" className="text-destructive h-10 w-10 absolute right-0 bottom-0" onClick={() => {
                                        const arr = [...(orgData.values || [])];
                                        arr.splice(idx, 1);
                                        setOrgData({ ...orgData, values: arr });
                                    }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-none text-xs"
                                onClick={() => {
                                    setOrgData({
                                        ...orgData,
                                        values: [...(orgData.values || []), { title: '', description: '', icon: '', _type: 'object', _key: Math.random().toString(36).substring(7) }]
                                    });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Value
                            </Button>
                            <Button
                                className="rounded-none px-8"
                                onClick={handleOrgSave}
                                disabled={isSavingOrg}
                            >
                                {isSavingOrg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Save Core Values
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Manage team member directory.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DynamicCMSTable
                            schemaType="teamMember"
                            initialData={teamMembers}
                            fields={[
                                { key: 'name', label: 'Name', type: 'string' },
                                { key: 'role', label: 'Role/Position', type: 'string' },
                                { key: 'bio', label: 'Bio', type: 'text' },
                                { key: 'image', label: 'Profile Image', type: 'image' },
                                { key: 'order', label: 'Order', type: 'number' }
                            ]}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* FOOTER SECTIONS */}
            <TabsContent value="footer" className="space-y-6">
                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Footer Links Categories</CardTitle>
                        <CardDescription>Manage the main columns in the unified footer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DynamicCMSTable
                            schemaType="footerSection"
                            initialData={footerSections}
                            isFooterLinks={true}
                            fields={[
                                { key: 'title', label: 'Display Title', type: 'string' },
                                { key: 'category', label: 'Category ID', type: 'string' },
                                { key: 'order', label: 'Order', type: 'number' }
                            ]}
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>Manage the social media icons shown in the footer and across the site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(orgData.socials || []).map((social: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-muted/20 p-4 border relative pr-12">
                                <div className="space-y-2">
                                    <Label className="text-xs">Platform Name</Label>
                                    <Select
                                        value={social.platform || ''}
                                        onValueChange={val => {
                                            const arr = [...(orgData.socials || [])];
                                            arr[idx].platform = val;
                                            setOrgData({ ...orgData, socials: arr });
                                        }}
                                    >
                                        <SelectTrigger className="rounded-none">
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Facebook">Facebook</SelectItem>
                                            <SelectItem value="Twitter">Twitter / X</SelectItem>
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="YouTube">YouTube</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs">Profile URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={social.url || ''}
                                        className="rounded-none"
                                        onChange={e => {
                                            const arr = [...(orgData.socials || [])];
                                            arr[idx].url = e.target.value;
                                            setOrgData({ ...orgData, socials: arr });
                                        }}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive h-10 w-10 absolute right-2 top-1/2 -translate-y-1/2" onClick={() => {
                                    const arr = [...(orgData.socials || [])];
                                    arr.splice(idx, 1);
                                    setOrgData({ ...orgData, socials: arr });
                                }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-none text-xs"
                                onClick={() => {
                                    setOrgData({
                                        ...orgData,
                                        socials: [...(orgData.socials || []), { platform: '', url: '', _type: 'object', _key: Math.random().toString(36).substring(7) }]
                                    });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Social Link
                            </Button>
                            <Button
                                className="rounded-none px-8"
                                onClick={handleOrgSave}
                                disabled={isSavingOrg}
                            >
                                {isSavingOrg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Save Social Links
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* LEGAL PAGES */}
            <TabsContent value="legal" className="space-y-6">
                <Card className="rounded-none">
                    <CardHeader>
                        <CardTitle>Legal Documents</CardTitle>
                        <CardDescription>Manage Privacy Policy, Terms of Service, etc.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DynamicCMSTable
                            schemaType="legalContent"
                            initialData={legalDocs}
                            isLegalSections={true}
                            fields={[
                                { key: 'title', label: 'Page Title', type: 'string' },
                                { key: 'order', label: 'Order', type: 'number' }
                            ]}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* CONTACT / ORG SETTINGS */}
            <TabsContent value="contact" className="space-y-6">
                <Card className="rounded-none border-primary/20">
                    <CardHeader>
                        <CardTitle>Organization Details</CardTitle>
                        <CardDescription>Core details shown everywhere across the website and footer.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Organization Name</Label>
                                <Input
                                    value={orgData.name || ''}
                                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                    className="rounded-none focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Primary Email</Label>
                                <Input
                                    value={orgData.email || ''}
                                    onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                                    className="rounded-none focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Contact</Label>
                                <Input
                                    value={orgData.phone || ''}
                                    onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                                    className="rounded-none focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Business Hours</Label>
                                <Input
                                    value={orgData.hours || ''}
                                    onChange={(e) => setOrgData({ ...orgData, hours: e.target.value })}
                                    className="rounded-none focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>HQ Address</Label>
                                <Input
                                    value={orgData.address || ''}
                                    onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                                    className="rounded-none focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                        <Button
                            className="rounded-none"
                            onClick={handleOrgSave}
                            disabled={isSavingOrg}
                        >
                            {isSavingOrg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save Setup
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
