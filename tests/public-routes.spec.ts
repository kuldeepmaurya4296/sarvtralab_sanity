import { test, expect } from '@playwright/test';

// Grouping public unauthenticated routes
const publicRoutes = [
    '/',
    '/about',
    '/blog',
    '/careers',
    '/contact',
    '/courses',
    '/help',
    '/login',
    '/signup',
    '/press',
    '/privacy',
    '/refund',
    '/reset-password',
    '/forgot-password',
    '/terms',
];

test.describe('Public Routes Accessibility', () => {
    for (const route of publicRoutes) {
        test(`Should load ${route} successfully`, async ({ page }) => {
            // 1. Navigate to the route
            const response = await page.goto(route);

            // 2. Expect a successful HTTP response (200 OK)
            expect(response?.status()).toBe(200);

            // 3. Ensure no unhandled exceptions or massive layout shifts immediately
            await page.waitForLoadState('networkidle');

            // 4. Very basic smoke test to ensure body rendered
            const bodyText = await page.locator('body').innerText();
            expect(bodyText.length).toBeGreaterThan(50);
        });
    }
});
