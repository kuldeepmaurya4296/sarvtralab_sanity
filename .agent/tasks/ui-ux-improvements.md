# Task: UI/UX Improvements for Public Website

## Objective
Enhance the visual hierarchy, branding consistency, user engagement, and conversion optimization of the main public pages (Hero, Courses, Features, Testimonials).

## 1. Visual Hierarchy & Spacing
- **Headings**: Increase font sizes (`text-5xl` to `text-6xl/7xl` for hero, larger section headings) and apply `font-extrabold`. Use distinct typography tracking if applicable (`tracking-tight`).
- **Vertical Rhythm**: Increase section padding from `py-20` to `py-24 md:py-32`. Increase gap between headers and content blocks (`mb-20`).
- **Readability**: Add `leading-relaxed` or `leading-loose` to all paragraph body texts for better legibility.

## 2. Brand Consistency & CTAs
- **Primary Buttons**: Standardize all primary call-to-actions to the same brand color logic with high contrast. Improve hover effects (`hover:scale-105 hover:shadow-lg transition-all`).
- **Secondary Buttons**: Ensure a uniform outline or ghost style.

## 3. Course Cards Refinement
- **Image Consistency**: Apply `aspect-video` on images.
- **Content Padding**: Increase internal padding (e.g., `p-6` to `p-8`). Add spacing between title, description, and meta stats to resolve tight clusters.
- **Micro-animations**: Add `hover:-translate-y-2 hover:shadow-2xl duration-300` for the entire card, and a subtle scale to the image on hover.

## 4. Hero Section & Conversions
- **Above the Fold**: 
  - Thicker gradient overlay for stronger impact.
  - "Start Free Robotics Trial" as the primary CTA.
  - Action-driven secondary CTA: "View Programs".
  - One-line strong value proposition below the headline.
  - "Scroll down" animated arrow indicator `↓`.
  - Trust indicators: "10,000+ Students | 4.9/5 Rating".
- **Sticky CTA**: Evaluate and conditionally add a sticky CTA component on scroll if required.

## 5. Affected Files
- `components/home/HeroSection.tsx`
- `components/home/CoursesSection.tsx`
- `components/home/FeaturesSection.tsx`
- `components/home/TestimonialsSection.tsx`
- `app/globals.css` (if CTA standards are applied globally)
