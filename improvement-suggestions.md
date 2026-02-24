# Sarvtra Labs Platform Improvement Suggestions

**Date:** 2026-02-24

Drawing from standard `@[performance-profiling]`, `@[webapp-testing]`, and `@[clean-code]` principles, here is a list of improvements to enhance the scalability, maintainability, and end-user experience of the platform.

## 1. Automated Testing Initialization
- **Action**: Transition from Python Playwright (`scripts/playwright_runner.py`) to native Node.js `@playwright/test`.
- **Reason**: Next.js is a React/TypeScript ecosystem. Using `@playwright/test` lets your QA scripts share the same `tsconfig.json` paths and TypeScript types, avoiding context-switching and dependency fragmentation on Python.
- **Workflow**: Create a dedicated test database (e.g. `sanity-dataset-test`) to execute UI modifications (create courses/users) without corrupting production data.

## 2. Dynamic Component Rendering Optimization
- **Action**: Check if all `Image` tags from `next/image` use the `sizes` property effectively, particularly if the component relies on the `fill` property.
- **Reason**: Next.js has previously triggered console warnings for omitted `sizes`, leading to massive unoptimized image downloads on mobile screens. Defining exact image scopes ensures lightning-fast LCP metrics (Core Web Vitals).

## 3. Pre-Fetching and Data Caching
- **Action**: Deeply analyze static (`force-static`) vs dynamic (`force-dynamic`) queries in `lib/actions/`. 
- **Reason**: Certain non-volatile endpoints like courses or blog listings can be fully cached or trigger Sanity webhooks with Incremental Static Regeneration (ISR). This lowers database read counts drastically and accelerates Time to First Byte (TTFB).

## 4. UI/UX Cohesion
- **Action**: Adopt a centralized `Design System` token list in `tailwind.config.ts` reflecting `@[frontend-design]` rules. 
- **Reason**: Avoid inline arbitrary values like `className="text-[#F03E2F]"`. Define colors explicitly (e.g., `text-brand-red`) to ensure seamless switching during Dark/Light mode expansions and preserving the premium aesthetic.

## 5. Clean Code Modularization
- **Action**: Abstract heavily nested Server Actions inside the `lib/actions/` directory into micro-service style function subsets.
- **Reason**: Moving large logic pieces from UI React trees (`app/admin/courses/page.tsx`) to shared service objects stops `client-components` from embedding business rules, improving testability via standalone Unit Tests without rendering React trees.

## 6. Socratic Gate Adherence & Security 
- **Action**: Validate all APIs against OWASP (`@[vulnerability-scanner]`) injection points. Since Razorpay processes direct payments, rate limits must be implemented stringently on `/api/webhook/razorpay` alongside signed-payload verification.

## 7. Notification Consent Model
- **Action**: Consolidate notification permissions natively. Avoid requesting permissions eagerly on page load since browsers penalize such actions; instead, use explicit UI toggles (e.g., "Enable Push Notifications") in the Dashboard settings under `/student/settings`.
