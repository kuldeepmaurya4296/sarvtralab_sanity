'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getSupportDashboardStats() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'helpsupport' && session.user.role !== 'superadmin')) {
        throw new Error("Unauthorized");
    }
    try {
        // 1. Counters and Recent Tickets
        const results = await sanityClient.fetch(`{
            "openTickets": count(*[_type == "supportTicket" && status == "Open"]),
            "inProgress": count(*[_type == "supportTicket" && status == "In Progress"]),
            "resolvedToday": count(*[_type == "supportTicket" && status == "Resolved" && updatedAt >= $today]),
            "recentTickets": *[_type == "supportTicket"] | order(createdAt desc)[0...5]{
                "id": ticketId,
                subject,
                "student": userRef->name,
                priority,
                status,
                createdAt
            }
        }`, { today: new Date().toISOString().split('T')[0] + 'T00:00:00Z' });

        const recentTickets = results.recentTickets.map((t: any) => ({
            ...t,
            priority: t.priority?.toLowerCase() || 'medium',
            status: t.status?.toLowerCase().replace(' ', '-') || 'open',
            time: formatTimeAgo(t.createdAt)
        }));

        // 2. Ticket Trend (Simulated or via more complex GROQ if needed)
        // For simplicity and since GROQ doesn't handle dayOfWeek as easily as Mongo aggregation in one go without custom functions,
        // we'll fetch the last 7 days of tickets and process in JS.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendTickets = await sanityClient.fetch(
            `*[_type == "supportTicket" && createdAt >= $date]{createdAt, status}`,
            { date: sevenDaysAgo.toISOString() }
        );

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const ticketTrend = days.map((day, index) => {
            const dayTickets = trendTickets.filter((t: any) => new Date(t.createdAt).getDay() === index);
            return {
                name: day,
                tickets: dayTickets.length,
                resolved: dayTickets.filter((t: any) => t.status === 'Resolved').length
            };
        });

        // Rotate ticketTrend so it ends with today
        const todayIdx = new Date().getDay();
        const rotatedTrend = [...ticketTrend.slice(todayIdx + 1), ...ticketTrend.slice(0, todayIdx + 1)];

        return {
            openTickets: results.openTickets,
            inProgress: results.inProgress,
            resolvedToday: results.resolvedToday,
            avgResponseTime: "2.5h",
            recentTickets,
            ticketTrend: rotatedTrend
        };
    } catch (e) {
        console.error("Support Dashboard Stats Error:", e);
        return null;
    }
}

export async function createSupportTicket(data: { subject: string, description: string, priority?: string }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    try {
        const userDoc = await sanityClient.fetch(
            `*[_type == "user" && (customId == $id || _id == $id)][0]{_id}`,
            { id: session.user.id }
        );

        if (!userDoc) throw new Error("User not found in database.");

        const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTicket = await sanityWriteClient.create({
            _type: 'supportTicket',
            ticketId: ticketId,
            userRef: {
                _type: 'reference',
                _ref: userDoc._id
            },
            subject: data.subject,
            description: data.description,
            priority: data.priority || 'Medium',
            status: 'Open',
            createdAt: new Date().toISOString()
        });

        revalidatePath('/student/support');
        revalidatePath('/helpsupport/dashboard');
        return cleanSanityDoc(newTicket);
    } catch (e) {
        console.error("Create Support Ticket Error:", e);
        throw e;
    }
}

export async function getAllTickets() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'helpsupport')) {
        throw new Error("Unauthorized");
    }
    try {
        const tickets = await sanityClient.fetch(
            `*[_type == "supportTicket"] | order(createdAt desc){
                ...,
                userRef->{
                    _id, customId, name, email, schoolName, grade, status, parentName, parentPhone, parentEmail, dateOfBirth, address, city, state, pincode, phone
                }
            }`
        );
        return cleanSanityDoc(tickets);
    } catch (e) {
        console.error("Get All Tickets Error:", e);
        return [];
    }
}

export async function getSupportStaff() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
        throw new Error("Unauthorized");
    }
    try {
        const staff = await sanityClient.fetch(`*[_type == "user" && role == "helpsupport"]`);
        return cleanSanityDoc(staff);
    } catch (e) {
        console.error("Get Support Staff Error:", e);
        return [];
    }
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'helpsupport')) {
        throw new Error("Unauthorized");
    }
    try {
        const ticket = await sanityClient.fetch(
            `*[_type == "supportTicket" && (ticketId == $id || _id == $id)][0]{_id}`,
            { id: ticketId }
        );
        if (!ticket) throw new Error("Ticket not found");

        const updated = await sanityWriteClient
            .patch(ticket._id)
            .set({ status, updatedAt: new Date().toISOString() })
            .commit();

        revalidatePath('/support/tickets');
        return cleanSanityDoc(updated);
    } catch (e) {
        console.error("Update Ticket Status Error:", e);
        return null;
    }
}

function formatTimeAgo(date: string) {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
}

export async function getSupportStudentsData() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'helpsupport' && session.user.role !== 'superadmin')) {
        throw new Error("Unauthorized");
    }
    try {
        const students = await sanityClient.fetch(
            `*[_type == "user" && role == "student"]{
                _id, customId, name, email, schoolName, grade, status, parentName, parentPhone, parentEmail, dateOfBirth, address, city, state, pincode, phone
            }`
        );

        const tickets = await sanityClient.fetch(
            `*[_type == "supportTicket"]{
                userRef->{_id, customId},
                createdAt
            }`
        );

        const studentMap = new Map();

        // Initialize all students
        students.forEach((s: any) => {
            const sId = s.customId || s._id;
            studentMap.set(sId, {
                id: sId,
                name: s.name,
                email: s.email,
                school: s.schoolName || 'Unknown',
                grade: s.grade || 'N/A',
                phone: s.phone || '',
                parentName: s.parentName || '',
                parentPhone: s.parentPhone || '',
                parentEmail: s.parentEmail || '',
                dateOfBirth: s.dateOfBirth || '',
                address: s.address || '',
                city: s.city || '',
                state: s.state || '',
                pincode: s.pincode || '',
                tickets: 0,
                lastTicket: null,
                status: s.status || 'active'
            });
        });

        // Augment with ticket counts
        tickets.forEach((t: any) => {
            const s = t.userRef;
            if (s) {
                const sId = s.customId || s._id;
                if (studentMap.has(sId)) {
                    const entry = studentMap.get(sId);
                    entry.tickets += 1;
                    if (!entry.lastTicket || new Date(t.createdAt) > new Date(entry.lastTicket)) {
                        entry.lastTicket = t.createdAt;
                    }
                }
            }
        });

        return Array.from(studentMap.values());
    } catch (e) {
        console.error("Get Support Students Data Error:", e);
        return [];
    }
}

export async function createSupportStaff(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') throw new Error("Unauthorized");
    try {
        const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);
        const newStaff = await sanityWriteClient.create({
            _type: 'user',
            customId: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'helpsupport',
            department: data.department,
            status: data.status || 'available',
            ticketsResolved: 0,
            ticketsPending: 0,
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
        });
        revalidatePath('/admin/help-support');
        return cleanSanityDoc(newStaff);
    } catch (error) {
        console.error("Create support staff error:", error);
        throw error;
    }
}

export async function updateSupportStaff(id: string, updates: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') throw new Error("Unauthorized");
    try {
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        } else {
            delete updates.password;
        }

        const updated = await sanityWriteClient.patch(id).set(updates).commit();
        revalidatePath('/admin/help-support');
        return cleanSanityDoc(updated);
    } catch (error) {
        console.error("Update support staff error:", error);
        throw error;
    }
}

export async function deleteSupportStaff(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') throw new Error("Unauthorized");
    try {
        await sanityWriteClient.delete(id);
        revalidatePath('/admin/help-support');
        return true;
    } catch (error) {
        console.error("Delete support staff error:", error);
        throw error;
    }
}

export async function getSupportProfile() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'helpsupport') throw new Error("Unauthorized");
    try {
        const user = await sanityClient.fetch(`*[_type == "user" && (_id == $id || customId == $id)][0]`, { id: session.user.id });
        return cleanSanityDoc(user);
    } catch (error) {
        console.error("Get support profile error:", error);
        throw error;
    }
}

export async function updateSupportProfile(updates: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'helpsupport') throw new Error("Unauthorized");
    try {
        if (updates.newPassword) {
            const user = await sanityClient.fetch(`*[_type == "user" && (_id == $id || customId == $id)][0]`, { id: session.user.id });
            if (!updates.currentPassword) throw new Error("Current password required");
            const isValid = await bcrypt.compare(updates.currentPassword, user.password);
            if (!isValid) throw new Error("Invalid current password");
            updates.password = await bcrypt.hash(updates.newPassword, 10);
            delete updates.newPassword;
            delete updates.currentPassword;
        }

        const userDoc = await sanityClient.fetch(`*[_type == "user" && (_id == $id || customId == $id)][0]{_id}`, { id: session.user.id });
        if (!userDoc) throw new Error("User not found");
        const updated = await sanityWriteClient.patch(userDoc._id).set(updates).commit();
        revalidatePath('/helpsupport/settings');
        return cleanSanityDoc(updated);
    } catch (error) {
        console.error("Update support profile error:", error);
        throw error;
    }
}

export async function getSupportKnowledgeBaseData() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'helpsupport' && session.user.role !== 'superadmin')) {
        throw new Error("Unauthorized");
    }
    try {
        const categories = await sanityClient.fetch(`
            *[_type == "supportCategory"] | order(order asc) {
                title,
                "icon": iconName,
                "articles": *[_type == "supportArticle" && categoryId == ^._id] {
                    title,
                    views
                }
            }
        `);

        // If no data exists yet, return the default skeleton data for demo purposes,
        // or just return empty. Let's return the categories if they exist, otherwise empty array.
        return categories;
    } catch (e) {
        console.error("Get Support Knowledge Base Error:", e);
        return [];
    }
}
