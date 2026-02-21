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
                schoolCode: data.schoolCode || `CODE-${Date.now().toString().slice(-6)}`,
                principalName: data.principalName || 'Principal Name',
                schoolType: (data.schoolType || 'private').toLowerCase(),
                board: data.board || 'CBSE',
                address: data.address || 'Address not provided',
                city: data.city || 'City',
                state: data.state || 'State',
                pincode: data.pincode || '000000',
                phone: data.phone || '0000000000',
                websiteUrl: data.website || '',
                assignedCourses: [],
                status: 'active',
                subscriptionPlan: data.subscriptionPlan || 'basic',
                profileCompleted: true,
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

        // Ensure fields are correctly mapped for school role
        const extraFields: any = {};
        if (role === 'school') {
            extraFields.schoolName = data.name; // For schools, the name field is the school name
            extraFields.websiteUrl = data.website || '';
            extraFields.profileCompleted = true;
            // Also ensure numeric fields or specific enums are correct
            if (data.schoolType) extraFields.schoolType = data.schoolType.toLowerCase();
        }

        const newUser = await sanityWriteClient.create({
            _type: 'user',
            ...data,
            ...extraFields,
            customId: userCustomId,
            password: hashedPassword,
            role: role,
            schoolId: schoolId || undefined,
            schoolName: schoolName || extraFields.schoolName || undefined,
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
