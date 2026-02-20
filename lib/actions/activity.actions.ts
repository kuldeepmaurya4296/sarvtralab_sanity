
'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';

export async function logActivity(userId: string, action: string, details: string) {
    try {
        await sanityWriteClient.create({
            _type: 'activityLog',
            user: userId,
            action,
            details,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error("Log Activity Error:", e);
    }
}

export async function sendNotification(userId: string, title: string, message: string, type: string = 'info') {
    try {
        await sanityWriteClient.create({
            _type: 'notification',
            userId,
            title,
            message,
            notificationType: type,
            isRead: false,
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Send Notification Error:", e);
    }
}

export async function getNotifications(userId: string) {
    try {
        const notifications = await sanityClient.fetch(
            `*[_type == "notification" && userId == $userId] | order(createdAt desc)[0...20]`,
            { userId }
        );
        return cleanSanityDoc(notifications);
    } catch (e) {
        console.error("Get Notifications Error:", e);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        await sanityWriteClient
            .patch(notificationId)
            .set({ isRead: true })
            .commit();
        return true;
    } catch (e) {
        console.error("Mark Notification Read Error:", e);
        return false;
    }
}

export async function deleteNotification(notificationId: string) {
    try {
        await sanityWriteClient.delete(notificationId);
        return true;
    } catch (e) {
        console.error("Delete Notification Error:", e);
        return false;
    }
}
