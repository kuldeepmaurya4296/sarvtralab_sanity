import { Suspense } from 'react';
import LoginPage from './LoginPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
export const metadata = constructMetadata({
    title: 'Login',
    description: 'Sign in to your Sarvtra Labs account to continue your learning journey.',
});

export default async function Page() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role) {
        const role = session.user.role;
        if (role === 'student') redirect('/student/dashboard');
        if (role === 'teacher') redirect('/teacher/dashboard');
        if (role === 'school') redirect('/school/dashboard');
        if (role === 'govt') redirect('/govt/dashboard');
        if (role === 'superadmin' || role === 'admin') redirect('/admin/dashboard');
        if (role === 'helpsupport') redirect('/helpsupport/dashboard');
    }

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginPage />
        </Suspense>
    );
}
