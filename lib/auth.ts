
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sanityWriteClient } from "@/lib/sanity";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                // Query user from Sanity
                const user = await sanityWriteClient.fetch(
                    `*[_type == "user" && email == $email][0]`,
                    { email: credentials.email }
                );

                if (!user) {
                    throw new Error("User not found");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.customId || user._id, // Prefer customId (usr-...)
                    dbId: user._id, // Sanity document ID
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    schoolId: user.schoolRef?._ref || user.schoolId,
                    schoolName: user.schoolName,
                    phone: user.phone,
                    grade: user.grade,
                    parentName: user.parentName,
                    parentPhone: user.parentPhone,
                    parentEmail: user.parentEmail,
                    address: user.address,
                    city: user.city,
                    state: user.state,
                    pincode: user.pincode,
                    enrolledCourses: user.enrolledCourses,
                    profileCompleted: user.profileCompleted || false
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.dbId = (user as any).dbId;
                token.schoolId = (user as any).schoolId;
                token.schoolName = (user as any).schoolName;
                token.phone = (user as any).phone;
                token.grade = (user as any).grade;
                token.parentName = (user as any).parentName;
                token.parentPhone = (user as any).parentPhone;
                token.parentEmail = (user as any).parentEmail;
                token.address = (user as any).address;
                token.city = (user as any).city;
                token.state = (user as any).state;
                token.pincode = (user as any).pincode;
                token.enrolledCourses = (user as any).enrolledCourses;
                token.profileCompleted = (user as any).profileCompleted;
            }
            if (trigger === "update" && session) {
                // The session object here is the data passed to update()
                // Handle both { user: { ... } } and direct { ... } payloads
                const updateData = session.user || session;

                if (updateData.name) token.name = updateData.name;

                if (updateData.profileCompleted !== undefined) {
                    token.profileCompleted = updateData.profileCompleted;
                }

                // Map all other profile fields if provided
                const profileFields = [
                    'phone', 'grade', 'schoolId', 'schoolName',
                    'parentName', 'parentPhone', 'parentEmail',
                    'address', 'city', 'state', 'pincode',
                    'enrolledCourses'
                ];

                profileFields.forEach(field => {
                    if (updateData[field] !== undefined) {
                        token[field] = updateData[field];
                    }
                });
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                (session.user as any).dbId = token.dbId;
                (session.user as any).schoolId = token.schoolId;
                (session.user as any).schoolName = token.schoolName;
                (session.user as any).phone = token.phone;
                (session.user as any).grade = token.grade;
                (session.user as any).parentName = token.parentName;
                (session.user as any).parentPhone = token.parentPhone;
                (session.user as any).parentEmail = token.parentEmail;
                (session.user as any).address = token.address;
                (session.user as any).city = token.city;
                (session.user as any).state = token.state;
                (session.user as any).pincode = token.pincode;
                (session.user as any).enrolledCourses = token.enrolledCourses;
                (session.user as any).profileCompleted = token.profileCompleted;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Error code passed in query string as ?error=
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
