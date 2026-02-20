
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
                    schoolId: user.schoolRef?._ref || user.schoolId, // Sanity reference or legacy field
                    enrolledCourses: user.enrolledCourses
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
                token.enrolledCourses = (user as any).enrolledCourses;
            }
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                // Update enrolled courses if provided in session update
                if (session.user.enrolledCourses) {
                    token.enrolledCourses = session.user.enrolledCourses;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                (session.user as any).dbId = token.dbId;
                (session.user as any).schoolId = token.schoolId;
                (session.user as any).enrolledCourses = token.enrolledCourses;
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
