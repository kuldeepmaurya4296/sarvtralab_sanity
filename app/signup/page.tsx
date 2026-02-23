import SignupPage from './SignupPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
    title: 'Sign Up',
    description: 'Create your Sarvtra Labs account and start your journey into robotics and coding.',
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

    return <SignupPage />;
}
