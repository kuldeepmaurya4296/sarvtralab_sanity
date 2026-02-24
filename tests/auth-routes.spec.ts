import { test, expect } from '@playwright/test';

// Grouping authenticated routes by Roles
const rolesAndRoutes = [
    {
        role: 'Admin',
        routes: [
            '/admin/dashboard',
            '/admin/blogs',
            '/admin/certificates',
            '/admin/content',
            '/admin/courses',
            '/admin/crm',
            '/admin/govt',
            '/admin/help-support',
            '/admin/plans',
            '/admin/schools',
            '/admin/settings',
            '/admin/students',
            '/admin/teachers',
            '/admin/website-cms',
        ]
    },
    {
        role: 'Govt',
        routes: [
            '/govt/dashboard',
            '/govt/reports',
            '/govt/schools',
            '/govt/settings',
            '/govt/students',
        ]
    },
    {
        role: 'School',
        routes: [
            '/school/dashboard',
            '/school/courses',
            '/school/reports',
            '/school/settings',
            '/school/students',
        ]
    },
    {
        role: 'Student',
        routes: [
            '/student/dashboard',
            '/student/certificates',
            '/student/courses',
            '/student/materials',
            '/student/settings',
            '/student/support',
        ]
    },
    {
        role: 'Teacher',
        routes: [
            '/teacher/dashboard',
            '/teacher/courses',
            '/teacher/materials',
            '/teacher/reports',
            '/teacher/settings',
        ]
    },
    {
        role: 'Support',
        routes: [
            '/helpsupport/dashboard',
            '/helpsupport/knowledge-base',
            '/helpsupport/settings',
            '/helpsupport/students',
            '/helpsupport/tickets',
        ]
    }
];

test.describe("Authenticated Dashboard Accessibility Check", () => {

    /**
     * NOTE:
     * This is a mock authentication block. Before executing this suite against the live DB,
     * replace the `page.goto` hook with the exact user credentials.
     * e.g., page.fill('input[name="email"]', process.env.TEST_ADMIN_USER)
     * 
     * Or utilize playwright's global Setup/Session caching mechanism for speed!
     */

    for (const { role, routes } of rolesAndRoutes) {
        test.describe(`${role} Role Tests`, () => {

            test.beforeEach(async ({ page }) => {
                // Mocking Login Flow (TODO: Update with actual seeded credentials)
                // await page.goto('/login');
                // await page.fill('#email', 'test@test.com');
                // await page.fill('#password', 'Testing!123');
                // await page.click('button[type="submit"]');
                // await page.waitForURL('**/dashboard');
            });

            for (const route of routes) {
                // Skip `.skip` annotation later when test DB is connected
                test.skip(`Should access and render ${route} without 401 Unauthorized errors`, async ({ page }) => {

                    const response = await page.goto(route);

                    // Verify we aren't unceremoniously kicked out or given a runtime block
                    expect(response?.status()).toBe(200);
                    expect(page.url()).toContain(route.split('/')[1]);

                    // Test that layout/dashboard is intact
                    const isDashboardVisible = await page.locator('main').isVisible();
                    expect(isDashboardVisible).toBe(true);
                });
            }
        });
    }
});
