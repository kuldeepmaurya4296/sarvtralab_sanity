# Sarvtra Labs - Next-Gen Robotics & STEM Learning Platform

![Sarvtra Labs](https://img.shields.io/badge/Sarvtra-Labs-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![Sanity](https://img.shields.io/badge/CMS-Sanity-F03E2F?style=for-the-badge&logo=sanity)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css)

Sarvtra Labs is an advanced EduTech platform designed to empower students, schools, and government bodies through specialized **Robotics, AI, and STEM education**. Built with a modern tech stack, it provides a seamless learning experience with dedicated portals for all stakeholders.

## 🚀 Key Features

-   **Multi-Role Dashboards**: Specialized portals for Students, Teachers, School Admins, Government Officials, and Super Admins.
-   **CBSE-Aligned Curriculum**: Interactive courses designed in accordance with NCF 2023 and NEP 2020.
-   **Sanity CMS Integration**: Real-time content management and dynamic data fetching.
-   **Seamless Payments**: Integrated with **Razorpay** for secure course enrollments with 0% EMI options.
-   **Advanced Analytics**: Comprehensive progress tracking and performance reports.
-   **Secure Authentication**: Robust role-based access control via **NextAuth.js**.
-   **Premium UI/UX**: Built with Tailwind CSS, Framer Motion, and Lucide Icons for a stunning, responsive experience.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 16.1.6 (App Router), React 19, Lucide React
-   **Styling**: Tailwind CSS 4, Framer Motion
-   **Backend/CMS**: Sanity CMS (next-sanity)
-   **Authentication**: NextAuth.js
-   **Payments**: Razorpay SDK
-   **Forms**: React Hook Form + Zod
-   **Utilities**: date-fns, clsx, tailwind-merge

## 📦 Getting Started

### Prerequisites

-   Node.js 18.x or later
-   npm / yarn / pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/kuldeepmaurya4296/sarvtralab.git
    cd lms-next
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the root directory and add your credentials:
    ```env
    # Sanity CMS
    NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
    NEXT_PUBLIC_SANITY_DATASET=production
    SANITY_API_TOKEN=your_token

    # NextAuth
    NEXTAUTH_SECRET=your_secret
    NEXTAUTH_URL=http://localhost:3000

    # Razorpay
    RAZORPAY_KEY_ID=your_key_id
    RAZORPAY_KEY_SECRET=your_secret
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) to view the platform.

## 📄 Project Structure

-   `/app`: Next.js App Router pages and layouts.
-   `/components`: Reusable UI components organized by feature.
-   `/lib`: Core utility functions, server actions, and Sanity client.
-   `/context`: Global state management for Auth and Notifications.
-   `/sanity`: Schema definitions and CMS configuration.
-   `/public`: Static assets and icons.

## 🛡️ License

Copyright © 2026 Sarvtra Labs. All rights reserved.
