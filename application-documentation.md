# Sarvtra Labs Application Documentation

## 1. Overview
Sarvtra Labs is a comprehensive Next-Gen Robotics & STEM Learning Platform built on top of Next.js 16 (App Router) and Sanity CMS. The platform serves multiple stakeholders in the education ecosystem: Students, Teachers, School Administrators, Government Officials, and internal Super Admins.

## 2. Technology Stack
- **Framework:** Next.js 16.1.6 (App Router) with React 19
- **Styling:** Tailwind CSS 4, Framer Motion for animations
- **Database / CMS:** Sanity CMS
- **Authentication:** NextAuth.js
- **Payment Gateway:** Razorpay
- **Form Handling:** React Hook Form + Zod validation
- **State Management:** React Context API (Auth and Notifications)

## 3. Architecture Overview
The application follows a standard modular monolithic Next.js architecture:
- `app/`: Contains the Next.js routes, server components, and API execution contexts.
- `lib/`: Contains backend logic, server actions, utility functions, and Sanity DB querying.
- `components/`: Contains reusable frontend React components grouped by logical entities.
- `sanity/`: Contains the database schema models and configuration for the Sanity studio.
- `context/`: Wraps the application state for notifications and user sessions.

## 4. Route Flow & Role-Based Access
The application leverages deep route segregation for various roles:
- `/admin/*`: Super Admin portal for CMS control, CRM, plans, and global entity management.
- `/school/*`: Portal for school administrators to manage their students and teachers.
- `/student/*`: Student dashboard to view courses, certificates, and learning materials.
- `/teacher/*`: Teacher dashboard for grading, reports, and course material management.
- `/govt/*`: Specific reporting interface for government officials.
- `/helpsupport/*`: CRM dashboard for support agents to manage tickets.

Each role group handles its own authentication routing via NextAuth session validation.

## 5. Security & Authentication
Authentication relies on `NextAuth.js`. Users log in, and their JWT token carries role claims. The application checks the session role either via a high-order component or server-side layout fetch, restricting access to unauthorized path fragments. 

## 6. Integration Points
- **Sanity CMS:** Stores structured content (blogs, courses, users, certificates). Used as the primary headless CMS.
- **Razorpay SDK:** Processes course plan purchases safely utilizing webhooks for capturing transactions.
