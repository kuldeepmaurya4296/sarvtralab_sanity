import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSectionData {
  category: string;
  title: string;
  links: FooterLink[];
  order?: number;
}

export interface OrgData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  socials?: { platform: string; url: string }[];
}

interface FooterProps {
  footerSections?: FooterSectionData[];
  organization?: OrgData;
}

const defaultFooterLinks = {
  courses: [
    { label: 'Foundation Track (4-6)', href: '/courses?category=foundation' },
    { label: 'Intermediate Track (7-10)', href: '/courses?category=intermediate' },
    { label: 'Advanced Track (11-12)', href: '/courses?category=advanced' },
    { label: 'School Programs', href: '/schools' }
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press Kit', href: '/press' }
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/#faqs' },
    { label: 'Privacy Policy', href: '/privacy' }
  ],
  dashboards: [
    { label: 'Student Dashboard', href: '/student/dashboard' },
    { label: 'School Dashboard', href: '/school/dashboard' },
    { label: 'Govt Portal', href: '/govt/dashboard' },
    { label: 'Super Admin', href: '/admin/dashboard' }
  ]
};

const Footer = ({ footerSections, organization }: FooterProps) => {
  const sectionsToRender = footerSections?.length
    ? [...footerSections].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
      { title: 'COURSES', links: defaultFooterLinks.courses },
      { title: 'COMPANY', links: defaultFooterLinks.company },
      { title: 'SUPPORT', links: defaultFooterLinks.support },
      { title: 'PORTALS', links: defaultFooterLinks.dashboards },
    ];

  const org = organization || {
    name: 'Sarvtra Labs',
    email: 'connect@pushpako2.com',
    phone: '+91-8085613350',
    address: 'Bhopal, Madhya Pradesh',
    hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    socials: []
  };

  return (
    <footer className="bg-background text-foreground border-t-[8px] border-primary font-sans relative overflow-hidden">
      {/* Massive Typographic Hero Section in Background */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none opacity-[0.02] select-none z-0 overflow-hidden">
        <span className="text-[25vw] font-black tracking-tighter uppercase whitespace-nowrap text-foreground leading-none">SARVTRA</span>
      </div>

      <div className="container mx-auto px-4 lg:px-12 pt-16 pb-8 relative z-10">

        {/* Compact Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-8 mb-12 border-b border-border pb-12">

          {/* Brand Vision */}
          <div className="xl:col-span-8 space-y-6 pr-0 xl:pr-24">
            <Link href="/" className="inline-flex items-center gap-2 group border-b-2 border-transparent hover:border-primary transition-all duration-300 pb-1">
              <span className="font-display text-4xl lg:text-5xl font-black uppercase tracking-tight">
                <span className="text-foreground">{org.name?.split(' ')[0] || 'Sarvtra'}</span>
                <span className="text-primary ml-2">{org.name?.split(' ').slice(1).join(' ') || 'Labs'}</span>
              </span>
            </Link>

            <p className="text-lg lg:text-2xl font-semibold tracking-tight leading-loose text-foreground/80 max-w-4xl font-display">
              EMPOWERING THE <span className="text-primary italic">NEXT GENERATION</span> OF INNOVATORS WITH HANDS-ON K-12 ROBOTICS EDUCATION.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              {[
                { Icon: Facebook, label: "Facebook", href: org.socials?.find((s: any) => s.platform === 'Facebook')?.url || '#' },
                { Icon: Twitter, label: "Twitter", href: org.socials?.find((s: any) => s.platform === 'Twitter')?.url || '#' },
                { Icon: Instagram, label: "Instagram", href: org.socials?.find((s: any) => s.platform === 'Instagram')?.url || '#' },
                { Icon: Linkedin, label: "LinkedIn", href: org.socials?.find((s: any) => s.platform === 'LinkedIn')?.url || '#' },
                { Icon: Youtube, label: "YouTube", href: org.socials?.find((s: any) => s.platform === 'YouTube')?.url || '#' },
              ].map(({ Icon, label, href }, index) => (
                <a
                  key={index}
                  href={href}
                  aria-label={`Follow us on ${label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-14 h-14 border border-border flex items-center justify-center overflow-hidden hover:border-primary transition-all duration-500"
                  style={{ borderRadius: '0px' }}
                >
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary transition-all duration-300 group-hover:h-full z-0"></span>
                  <Icon className="w-6 h-6 z-10 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="xl:col-span-4 flex flex-col justify-end space-y-6 xl:border-l xl:border-border xl:pl-8 mt-8 xl:mt-0">
            <div className="space-y-2">
              <h5 className="font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Direct Line</h5>
              <a href={`tel:${(org.phone || '+91-8085613350').replace(/[^0-9+]/g, '')}`} className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground hover:text-primary transition-colors block font-display tracking-tight">
                {org.phone || '+91-8085613350'}
              </a>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">{org.hours || 'Mon - Sat: 9:00 AM - 6:00 PM'}</span>
            </div>

            <div className="space-y-1 border-t border-border pt-4">
              <h5 className="font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Digital Inbox</h5>
              <a href={`mailto:${org.email || 'connect@pushpako2.com'}`} className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors block break-all">
                {org.email || 'connect@pushpako2.com'}
              </a>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">24H Response Time</span>
            </div>

            <div className="space-y-1 border-t border-border pt-4">
              <h5 className="font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Headquarters</h5>
              <p className="text-sm font-medium text-foreground max-w-[250px] leading-snug">
                {org.address || 'Bhopal, Madhya Pradesh'}
              </p>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 mb-12">
          {sectionsToRender.map((section: any, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6 border-b border-foreground/10 pb-3 inline-block w-full">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {(section.links || []).map((link: any, linkIdx: number) => (
                  <li key={linkIdx} className="group flex items-center">
                    <ArrowUpRight className="w-4 h-4 mr-2 text-primary opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    <Link href={link.href} className="text-foreground/80 hover:text-foreground font-semibold uppercase text-xs tracking-wider transition-all duration-300 group-hover:translate-x-2 block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Absolute Bottom Strip */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-8 border-t border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <p>© {new Date().getFullYear()} {org.name?.toUpperCase() || 'SARVTRA LABS'}. THE FUTURE IS NOW.</p>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
            <Link href="/terms" className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-foreground hover:after:w-full after:transition-all">
              TERMS
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-foreground hover:after:w-full after:transition-all">
              PRIVACY
            </Link>
            <Link href="/refund" className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-foreground hover:after:w-full after:transition-all">
              REFUND POLICY
            </Link>
            <Link href="/site-map" className="hover:text-foreground transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-foreground hover:after:w-full after:transition-all">
              SITEMAP
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
