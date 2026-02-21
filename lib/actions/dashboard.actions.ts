'use server';

import { sanityClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

/* -------------------------------------------------------------------------- */
/*                               School Dashboard                             */
/* -------------------------------------------------------------------------- */

export async function getSchoolDashboardStats(schoolId: string) {
    try {
        // Fetch school user and linked school entity if any
        const results = await sanityClient.fetch(`{
            "schoolUser": *[_type == "user" && role == "school" && (customId == $schoolId || _id == $schoolId)][0],
            "students": *[_type == "user" && role == "student" && (schoolRef._ref == $schoolId || schoolId == $schoolId)],
            "courses": *[_type == "course"]{_id, customId, title}
        }`, { schoolId });

        if (!results.schoolUser) throw new Error("School not found");

        const school = results.schoolUser;
        const students = results.students || [];
        const totalStudents = students.length;
        const activeStudents = students.filter((s: any) => s.enrolledCourses?.length > 0).length;
        const coursesAssigned = school.assignedCourses?.length || 0;

        let totalEnrolled = 0;
        let totalCompleted = 0;
        const courseStats: Record<string, { enrolled: number, completed: number }> = {};

        students.forEach((s: any) => {
            const enrolled = s.enrolledCourses || [];
            const completed = s.completedCourses || [];
            totalEnrolled += enrolled.length;
            totalCompleted += completed.length;

            enrolled.forEach((cId: string) => {
                if (!courseStats[cId]) courseStats[cId] = { enrolled: 0, completed: 0 };
                courseStats[cId].enrolled++;
            });
            completed.forEach((cId: string) => {
                if (!courseStats[cId]) courseStats[cId] = { enrolled: 0, completed: 0 };
                courseStats[cId].completed++;
            });
        });

        const completionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
        const courseEnrollment = results.courses
            .filter((c: any) => courseStats[c.customId] || courseStats[c._id])
            .map((c: any) => ({
                course: c.title,
                enrolled: (courseStats[c.customId]?.enrolled || 0) + (courseStats[c._id]?.enrolled || 0),
                completed: (courseStats[c.customId]?.completed || 0) + (courseStats[c._id]?.completed || 0)
            })).slice(0, 5);

        const topPerformers = [...students]
            .sort((a, b) => (b.completedCourses?.length || 0) - (a.completedCourses?.length || 0))
            .slice(0, 3)
            .map(s => ({ name: s.name, completed: s.completedCourses?.length || 0 }));

        // Monthly Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const growthData = students
            .filter((s: any) => new Date(s.createdAt) >= sixMonthsAgo)
            .reduce((acc: any, s: any) => {
                const month = new Date(s.createdAt).toISOString().slice(0, 7);
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

        const chartData = Object.keys(growthData).sort().map(month => ({
            name: month,
            students: growthData[month]
        }));

        const planDetails = school.subscriptionPlan
            ? await sanityClient.fetch(`*[_type == "plan" && (customId == $p || _id == $p)][0]`, { p: school.subscriptionPlan })
            : null;

        return {
            schoolName: school.name || "Unknown School",
            principalName: school.principalName || "Not Set",
            email: school.email,
            totalStudents,
            activeStudents,
            coursesAssigned,
            completionRate,
            topPerformers,
            courseEnrollment,
            chartData,
            subscription: {
                planName: school.subscriptionPlan || 'Basic',
                expiry: school.subscriptionExpiry || 'N/A',
                details: cleanSanityDoc(planDetails)
            }
        };
    } catch (e) {
        console.error("School Dashboard Stats Error:", e);
        throw e;
    }
}

/* -------------------------------------------------------------------------- */
/*                                Admin Dashboard                             */
/* -------------------------------------------------------------------------- */

export async function getAdminDashboardStats() {
    try {
        const results = await sanityClient.fetch(`{
            "totalStudents": count(*[_type == "user" && role == "student"]),
            "totalSchools": count(*[_type == "user" && role == "school"]),
            "totalTeachers": count(*[_type == "user" && role == "teacher"]),
            "payments": *[_type == "payment" && status == "Completed"].amount,
            "foundationCount": count(*[_type == "course" && category == "foundation"]),
            "intermediateCount": count(*[_type == "course" && category == "intermediate"]),
            "advancedCount": count(*[_type == "course" && category == "advanced"]),
            "recentSchools": *[_type == "user" && role == "school"] | order(createdAt desc)[0...5]{
                "id": customId,
                name,
                city,
                totalStudents,
                subscriptionPlan
            },
            "progressValues": *[_type == "enrollment"].progress,
            "topCourses": *[_type == "course"][0...5]{
                _id,
                title,
                "enrolled": count(*[_type == "enrollment" && (courseRef._ref == ^._id)]),
                "completed": count(*[_type == "enrollment" && (courseRef._ref == ^._id) && status == "Completed"])
            },
            "totalLeads": count(*[_type == "lead"]),
            "convertedLeads": count(*[_type == "lead" && status == "Converted"])
        }`);

        const totalRevenue = (results.payments || []).reduce((acc: number, curr: number) => acc + (curr || 0), 0);
        const avgProgress = results.progressValues?.length > 0
            ? results.progressValues.reduce((acc: number, curr: number) => acc + (curr || 0), 0) / results.progressValues.length
            : 0;

        // Monthly Growth (requires more complex GROQ or post-processing)
        // For simplicity, we'll fetch recent counts and simulate or do a simplified version
        const growthResult = await sanityClient.fetch(`*[_type == "user" && (role == "student" || role == "school")] | order(createdAt asc){createdAt, role}`);
        const growthMap: any = {};
        growthResult.forEach((u: any) => {
            const month = u.createdAt.slice(0, 7);
            if (!growthMap[month]) growthMap[month] = { name: month, students: 0, schools: 0 };
            if (u.role === 'student') growthMap[month].students++;
            if (u.role === 'school') growthMap[month].schools++;
        });

        return {
            totalStudents: results.totalStudents,
            totalSchools: results.totalSchools,
            totalTeachers: results.totalTeachers,
            totalRevenue: totalRevenue,
            avgCompletionRate: avgProgress.toFixed(1),
            pieData: [
                { name: 'Foundation', value: results.foundationCount },
                { name: 'Intermediate', value: results.intermediateCount },
                { name: 'Advanced', value: results.advancedCount }
            ],
            recentSchools: results.recentSchools,
            chartData: Object.values(growthMap).slice(-6),
            courseEnrollment: results.topCourses.map((c: any) => ({
                course: c.title,
                enrolled: c.enrolled,
                completed: c.completed
            })),
            crmStats: {
                totalLeads: results.totalLeads,
                convertedLeads: results.convertedLeads,
                conversionRate: results.totalLeads > 0 ? ((results.convertedLeads / results.totalLeads) * 100).toFixed(1) : "0"
            }
        };
    } catch (e) {
        console.error("Admin Dashboard Stats Error:", e);
        return null;
    }
}

/* -------------------------------------------------------------------------- */
/*                                Govt Dashboard                              */
/* -------------------------------------------------------------------------- */

export async function getGovtDashboardStats() {
    try {
        const results = await sanityClient.fetch(`{
            "totalSchools": count(*[_type == "user" && role == "school"]),
            "totalStudents": count(*[_type == "user" && role == "student"]),
            "progressValues": *[_type == "enrollment"].progress,
            "schools": *[_type == "user" && role == "school"] | order(createdAt desc)[0...10]{
                "id": customId,
                name,
                city,
                totalStudents
            },
            "reportsCount": count(*[_type == "report"]),
            "grades": *[_type == "user" && role == "student"].grade
        }`);

        const avgProgress = results.progressValues?.length > 0
            ? results.progressValues.reduce((acc: number, curr: number) => acc + (curr || 0), 0) / results.progressValues.length
            : 0;

        const gradeCounts: any = {};
        results.grades.forEach((g: string) => {
            if (g) gradeCounts[g] = (gradeCounts[g] || 0) + 1;
        });

        const growthResult = await sanityClient.fetch(`*[_type == "user" && role == "student"] | order(createdAt asc){createdAt}`);
        const growthMap: any = {};
        growthResult.forEach((u: any) => {
            const month = new Date(u.createdAt).toLocaleString('default', { month: 'short' });
            if (!growthMap[month]) growthMap[month] = { date: month, students: 0 };
            growthMap[month].students++;
        });

        // Ensure we have at least some data for the chart if no students exist
        const monthlyGrowth = Object.values(growthMap).length > 0
            ? Object.values(growthMap)
            : [{ date: 'Jan', students: 0 }];

        return {
            totalSchools: results.totalSchools,
            totalStudents: results.totalStudents,
            avgCompletion: `${avgProgress.toFixed(1)}%`,
            reportsCount: results.reportsCount,
            schools: results.schools,
            gradeDistribution: Object.keys(gradeCounts).map(g => ({ grade: g, students: gradeCounts[g] })),
            monthlyGrowth
        };
    } catch (e) {
        console.error("Govt Dashboard Stats Error:", e);
        return null;
    }
}

/* -------------------------------------------------------------------------- */
/*                               Teacher Dashboard                            */
/* -------------------------------------------------------------------------- */

export async function getTeacherDashboardStats(teacherId: string) {
    try {
        const teacher = await sanityClient.fetch(
            `*[_type == "user" && role == "teacher" && (customId == $id || _id == $id)][0]`,
            { id: teacherId }
        );
        if (!teacher) throw new Error("Teacher not found");

        const teacherRef = teacher._id;
        const results = await sanityClient.fetch(`{
            "courses": *[_type == "course" && instructorRef._ref == $teacherRef],
            "materials": count(*[_type == "material" && instructor == $teacherId])
        }`, { teacherRef, teacherId });

        const courses = results.courses || [];
        const courseIds = courses.map((c: any) => c._id);

        const enrollments = await sanityClient.fetch(
            `*[_type == "enrollment" && courseRef._ref in $courseIds]`,
            { courseIds }
        );

        const totalStudents = new Set(enrollments.map((e: any) => e.student)).size;
        const avgCompletion = enrollments.length > 0
            ? (enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.length).toFixed(1)
            : "0";

        // Trend
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const trendData = enrollments
            .filter((e: any) => new Date(e.enrolledAt) >= sixMonthsAgo)
            .reduce((acc: any, e: any) => {
                const month = new Date(e.enrolledAt).toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

        return {
            totalCourses: courses.length,
            totalStudents,
            totalMaterials: results.materials,
            avgCompletion,
            trendData: Object.keys(trendData).map(month => ({ name: month, students: trendData[month] })),
            recentCourses: courses.slice(0, 5).map((c: any) => ({
                id: c.customId || c._id,
                title: c.title,
                students: enrollments.filter((e: any) => e.courseRef?._ref === c._id).length,
                progress: 0,
                nextClass: new Date().toISOString()
            }))
        };
    } catch (e) {
        console.error("Teacher Dashboard Stats Error:", e);
        throw e;
    }
}
