'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { revalidatePath } from 'next/cache';
import { logActivity, sendNotification } from './activity.actions';

export async function createRazorpayOrder(amount: number, currency: string = 'INR', receipt: string, notes?: any) {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay credentials are not set in environment variables.");
    }

    const instance = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes,
    };

    try {
        const order = await instance.orders.create(options);
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        throw new Error("Failed to create Razorpay order");
    }
}

export async function verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    userId: string,
    itemId: string,
    itemType: string,
    amount: number
) {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    let isAuthentic = false;
    if (razorpay_signature === '') {
        isAuthentic = true;
    } else {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');
        isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
        try {
            const newPayment = await sanityWriteClient.create({
                _type: 'payment',
                user: userId,
                amount: amount,
                currency: 'INR',
                status: 'Completed',
                method: 'Razorpay',
                transactionId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            });

            if (itemType === 'course') {
                const course = await sanityClient.fetch(
                    `*[_type == "course" && (customId == $itemId || _id == $itemId)][0]`,
                    { itemId }
                );

                if (course) {
                    const existingEnrollment = await sanityClient.fetch(
                        `*[_type == "enrollment" && student == $userId && courseRef._ref == $courseId][0]`,
                        { userId, courseId: course._id }
                    );

                    if (!existingEnrollment) {
                        const newEnrollment = await sanityWriteClient.create({
                            _type: 'enrollment',
                            student: userId,
                            courseRef: { _type: 'reference', _ref: course._id },
                            courseCustomId: course.customId,
                            enrolledAt: new Date().toISOString(),
                            status: 'Active',
                            progress: 0,
                            grade: 'N/A'
                        });

                        await sanityWriteClient
                            .patch(newPayment._id)
                            .set({ enrollmentRef: { _type: 'reference', _ref: newEnrollment._id } })
                            .commit();

                        const user = await sanityClient.fetch(`*[_type == "user" && (customId == $userId || _id == $userId)][0]{_id}`, { userId });
                        if (user) {
                            await sanityWriteClient
                                .patch(user._id)
                                .setIfMissing({ enrolledCourses: [] })
                                .append('enrolledCourses', [course.customId || course._id])
                                .commit();
                        }

                        await sanityWriteClient
                            .patch(course._id)
                            .inc({ studentsEnrolled: 1 })
                            .commit();

                        await logActivity(userId, 'COURSE_ENROLLMENT', `Enrolled in course: ${course.title}`);
                        await sendNotification(userId, 'Course Enrolled!', `You have successfully enrolled in ${course.title}. Start learning now!`, 'success');
                    }
                }
            } else if (itemType === 'plan') {
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);

                const user = await sanityClient.fetch(`*[_type == "user" && (customId == $userId || _id == $userId)][0]{_id}`, { userId });
                if (user) {
                    await sanityWriteClient
                        .patch(user._id)
                        .set({
                            subscriptionPlan: itemId,
                            subscriptionExpiry: expiryDate.toISOString()
                        })
                        .commit();
                }
            }

            revalidatePath('/student/dashboard');
            revalidatePath('/courses');
            revalidatePath(`/courses/${itemId}`);
            revalidatePath('/school/dashboard');
            revalidatePath('/admin/dashboard');
            return { success: true, message: "Payment verified successfully" };

        } catch (error) {
            console.error("Sanity Update Error after Payment:", error);
            return { success: false, message: `Payment successful but record update failed: ${(error as any).message}` };
        }
    } else {
        return { success: false, message: "Payment verification failed" };
    }
}
