'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';

export async function submitAssignment(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
        throw new Error("Unauthorized");
    }
    try {
        const customId = `sub-${Date.now()}`;
        const submission = await sanityWriteClient.create({
            _type: 'submission',
            ...data,
            customId,
            student: session.user.id,
            submittedAt: new Date().toISOString(),
            status: 'Submitted'
        });
        revalidatePath('/student/assignments');
        return cleanSanityDoc(submission);
    } catch (e) {
        console.error("Submit Assignment Error:", e);
        throw e;
    }
}

export async function gradeSubmission(submissionId: string, gradeData: { score: number, feedback: string }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'teacher' && session.user.role !== 'school')) {
        throw new Error("Unauthorized");
    }
    try {
        const submission = await sanityClient.fetch(
            `*[_type == "submission" && (customId == $id || _id == $id)][0]{_id}`,
            { id: submissionId }
        );
        if (!submission) throw new Error("Submission not found");

        const updated = await sanityWriteClient
            .patch(submission._id)
            .set({
                ...gradeData,
                status: 'Graded'
            })
            .commit();

        revalidatePath('/teacher/assignments');
        return cleanSanityDoc(updated);
    } catch (e) {
        console.error("Grade Submission Error:", e);
        throw e;
    }
}

export async function getSubmissionsByAssignment(assignmentId: string) {
    try {
        const submissions = await sanityClient.fetch(
            `*[_type == "submission" && assignmentId == $assignmentId] | order(submittedAt desc){
                ...,
                studentRef->{
                    name
                }
            }`,
            { assignmentId }
        );
        return cleanSanityDoc(submissions);
    } catch (e) {
        console.error("Get Submissions Error:", e);
        return [];
    }
}
