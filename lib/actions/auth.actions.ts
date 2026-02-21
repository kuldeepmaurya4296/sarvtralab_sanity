'use server';

import { sanityWriteClient } from '@/lib/sanity';
import bcrypt from 'bcryptjs';
import { getNextStudentId } from './student.actions';

export async function registerUser(data: any) {
    try {
        if (!data.email) throw new Error("Email is required");

        const existingUser = await sanityWriteClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: data.email }
        );

        if (existingUser) {
            return { error: 'User already exists' };
        }

        let schoolId = data.schoolId || '';
        let schoolName = data.schoolName || '';
        let schoolRef = undefined;

        if (data.createNewSchool && data.newSchoolName && data.newSchoolEmail) {
            if (!data.newSchoolEmail) throw new Error("School email is required");

            const existingSchool = await sanityWriteClient.fetch(
                `*[_type == "user" && email == $email && role == "school"][0]`,
                { email: data.newSchoolEmail }
            );

            if (existingSchool) {
                return { error: `School with email ${data.newSchoolEmail} already exists.` };
            }

            const schoolPassword = await bcrypt.hash('school123', 10);
            const schoolCustomId = `sch-${Date.now()}`;

            const newSchool = await sanityWriteClient.create({
                _type: 'user',
                customId: schoolCustomId,
                name: data.newSchoolName,
                email: data.newSchoolEmail,
                password: schoolPassword,
                role: 'school',
                schoolName: data.newSchoolName,
                schoolCode: `CODE-${Date.now().toString().slice(-6)}`,
                principalName: 'Principal Name',
                schoolType: 'private',
                board: 'CBSE',
                address: 'Address not provided',
                city: 'City',
                state: 'State',
                pincode: '000000',
                phone: '0000000000',
                assignedCourses: [],
                status: 'active',
                subscriptionPlan: 'basic',
                createdAt: new Date().toISOString()
            });

            schoolId = schoolCustomId;
            schoolName = data.newSchoolName;
            schoolRef = { _type: 'reference', _ref: newSchool._id };
        } else if (schoolId === 'no_school') {
            schoolId = '';
            schoolName = schoolName || 'Independent Learner';
        } else if (schoolId && !schoolName) {
            const school = await sanityWriteClient.fetch(
                `*[_type == "user" && (customId == $id || _id == $id) && role == "school"][0]`,
                { id: schoolId }
            );
            if (school) {
                schoolName = school.name;
                schoolRef = { _type: 'reference', _ref: school._id };
            }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const role = data.role || 'student';
        const userCustomId = role === 'student' ? await getNextStudentId() : `usr-${Date.now()}`;

        const newUser = await sanityWriteClient.create({
            _type: 'user',
            ...data,
            customId: userCustomId,
            password: hashedPassword,
            role: data.role || 'student',
            schoolId: schoolId || undefined,
            schoolName: schoolName || undefined,
            schoolRef: schoolRef,
            createdAt: new Date().toISOString()
        });

        const { password, ...userWithoutPassword } = newUser;
        return { user: { ...userWithoutPassword, id: userCustomId, _id: newUser._id } };
    } catch (error: any) {
        console.error("Register Error:", error);
        return { error: error.message || 'Registration failed' };
    }
}

export async function loginUser(email: string, pass: string): Promise<any | null> {
    try {
        if (!email) return null;

        const user = await sanityWriteClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
        );

        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...rest } = user;
            return { ...rest, id: user.customId || user._id };
        }
        return null;
    } catch (error) {
        console.error("Login Error:", error);
        return null;
    }
}
