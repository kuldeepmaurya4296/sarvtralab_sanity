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
/*                    School Courses & Plans Dashboard Data                    */
/* -------------------------------------------------------------------------- */

export async function getSchoolCoursesAndPlansData(schoolId: string) {
    try {
        const results = await sanityClient.fetch(`{
            "schoolUser": *[_type == "user" && role == "school" && (customId == $schoolId || _id == $schoolId)][0],
            "students": *[_type == "user" && role == "student" && (schoolRef._ref == $schoolId || schoolId == $schoolId)]{
                _id, customId, name, email, grade, enrolledCourses, completedCourses, createdAt, status
            },
            "courses": *[_type == "course"]{
                _id, customId, title, description, category, level, duration, price, grade, image, rating, studentsEnrolled,
                curriculum
            },
            "enrollments": *[_type == "enrollment"]{
                _id, student, courseCustomId, courseRef, enrolledAt, status, progress, grade, completionDate
            },
            "payments": *[_type == "payment" && status == "Completed"]{
                _id, user, amount, currency, status, method, transactionId, _createdAt
            },
            "allPlans": *[_type == "plan"]{
                _id, customId, name, description, price, period, features, popular, planType, status
            }
        }`, { schoolId });

        if (!results.schoolUser) throw new Error("School not found");

        const school = results.schoolUser;
        const students = results.students || [];
        const allCourses = results.courses || [];
        const enrollments = results.enrollments || [];
        const payments = results.payments || [];
        const allPlans = results.allPlans || [];

        // ── Student IDs for this school ──
        const studentIds = new Set(students.map((s: any) => s.customId || s._id));
        const studentMap: Map<string, any> = new Map(students.map((s: any) => [s.customId || s._id, s]));

        // ── Enrollments belonging to this school's students ──
        const schoolEnrollments = enrollments.filter((e: any) => studentIds.has(e.student));

        // ── Payments by this school's students ──
        const schoolPayments = payments.filter((p: any) => studentIds.has(p.user));
        const totalStudentSpend = schoolPayments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

        // ── Build course-level purchase analytics ──
        const courseEnrollmentMap: Record<string, {
            courseId: string;
            enrolledStudents: { id: string; name: string; email: string; grade: string; enrolledAt: string; progress: number; status: string }[];
            completedCount: number;
            activeCount: number;
            droppedCount: number;
            avgProgress: number;
        }> = {};

        schoolEnrollments.forEach((e: any) => {
            const cId = e.courseCustomId || e.courseRef?._ref || '';
            if (!courseEnrollmentMap[cId]) {
                courseEnrollmentMap[cId] = {
                    courseId: cId,
                    enrolledStudents: [],
                    completedCount: 0,
                    activeCount: 0,
                    droppedCount: 0,
                    avgProgress: 0
                };
            }
            const student = studentMap.get(e.student);
            courseEnrollmentMap[cId].enrolledStudents.push({
                id: e.student,
                name: student?.name || 'Unknown',
                email: student?.email || '',
                grade: student?.grade || 'N/A',
                enrolledAt: e.enrolledAt || '',
                progress: e.progress || 0,
                status: e.status || 'Active'
            });
            if (e.status === 'Completed') courseEnrollmentMap[cId].completedCount++;
            else if (e.status === 'Dropped') courseEnrollmentMap[cId].droppedCount++;
            else courseEnrollmentMap[cId].activeCount++;
        });

        // Calculate avg progress per course
        Object.values(courseEnrollmentMap).forEach(c => {
            if (c.enrolledStudents.length > 0) {
                c.avgProgress = Math.round(
                    c.enrolledStudents.reduce((sum, s) => sum + s.progress, 0) / c.enrolledStudents.length
                );
            }
        });

        // ── Purchased courses with full details ──
        const purchasedCourses = allCourses
            .filter((c: any) => {
                const cId = c.customId || c._id;
                return courseEnrollmentMap[cId] || courseEnrollmentMap[c._id];
            })
            .map((c: any) => {
                const cId = c.customId || c._id;
                const stats = courseEnrollmentMap[cId] || courseEnrollmentMap[c._id] || {
                    enrolledStudents: [], completedCount: 0, activeCount: 0, droppedCount: 0, avgProgress: 0
                };
                return {
                    id: c.customId || c._id,
                    title: c.title,
                    description: c.description,
                    category: c.category,
                    level: c.level,
                    duration: c.duration,
                    price: c.price,
                    grade: c.grade,
                    image: c.image,
                    rating: c.rating,
                    totalEnrolled: stats.enrolledStudents.length,
                    activeCount: stats.activeCount,
                    completedCount: stats.completedCount,
                    droppedCount: stats.droppedCount,
                    avgProgress: stats.avgProgress,
                    students: stats.enrolledStudents,
                    curriculum: c.curriculum
                };
            })
            .sort((a: any, b: any) => b.totalEnrolled - a.totalEnrolled);

        // ── Plan subscription details ──
        const activePlanId = school.subscriptionPlan;
        const activePlan = activePlanId
            ? allPlans.find((p: any) => (p.customId === activePlanId) || (p._id === activePlanId))
            : null;

        const subscriptionExpiry = school.subscriptionExpiry ? new Date(school.subscriptionExpiry) : null;
        const now = new Date();
        let daysRemaining = 0;
        let isExpired = false;
        let expiryFormatted = 'N/A';

        if (subscriptionExpiry) {
            daysRemaining = Math.ceil((subscriptionExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            isExpired = daysRemaining < 0;
            expiryFormatted = subscriptionExpiry.toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        }

        // ── Plan beneficiaries (students benefiting from this plan) ──
        // Students who have active enrollments are plan beneficiaries
        const beneficiaries = students
            .filter((s: any) => (s.enrolledCourses?.length || 0) > 0)
            .map((s: any) => ({
                id: s.customId || s._id,
                name: s.name,
                email: s.email,
                grade: s.grade || 'N/A',
                coursesEnrolled: s.enrolledCourses?.length || 0,
                coursesCompleted: s.completedCourses?.length || 0,
                joinedAt: s.createdAt || ''
            }));

        // ── Summary stats ──
        const totalCoursesWithEnrollments = purchasedCourses.length;
        const totalEnrollments = schoolEnrollments.length;
        const totalCompletedEnrollments = schoolEnrollments.filter((e: any) => e.status === 'Completed').length;
        const overallCompletionRate = totalEnrollments > 0
            ? Math.round((totalCompletedEnrollments / totalEnrollments) * 100) : 0;
        const overallAvgProgress = schoolEnrollments.length > 0
            ? Math.round(schoolEnrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / schoolEnrollments.length)
            : 0;

        // ── Monthly enrollment trend ──
        const monthlyTrend: Record<string, number> = {};
        schoolEnrollments.forEach((e: any) => {
            if (e.enrolledAt) {
                const month = new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
            }
        });

        return {
            school: {
                name: school.name,
                email: school.email,
                principalName: school.principalName || 'Not Set',
            },
            summary: {
                totalStudents: students.length,
                totalCoursesWithEnrollments,
                totalEnrollments,
                totalCompletedEnrollments,
                overallCompletionRate,
                overallAvgProgress,
                totalStudentSpend,
                beneficiaryCount: beneficiaries.length,
            },
            purchasedCourses: cleanSanityDoc(purchasedCourses),
            plan: activePlan ? {
                id: activePlan.customId || activePlan._id,
                name: activePlan.name,
                description: activePlan.description,
                price: activePlan.price,
                period: activePlan.period || 'yearly',
                features: activePlan.features || [],
                status: isExpired ? 'expired' : 'active',
                expiryDate: expiryFormatted,
                daysRemaining: Math.max(daysRemaining, 0),
                isExpired,
                popular: activePlan.popular || false,
            } : null,
            beneficiaries: cleanSanityDoc(beneficiaries),
            allPlans: cleanSanityDoc(allPlans.filter((p: any) => p.status === 'active')),
            monthlyTrend: Object.entries(monthlyTrend).map(([month, count]) => ({ month, enrollments: count })),
        };
    } catch (e) {
        console.error("School Courses & Plans Data Error:", e);
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
            "courses": *[_type == "course" && instructor._ref == $teacherRef],
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
