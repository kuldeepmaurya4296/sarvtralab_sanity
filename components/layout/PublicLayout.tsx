import Header from './Header';
import Footer from './Footer';
import SmoothScroll from './SmoothScroll';
import { getNavLinks, getFooterSections, getOrganizationDetails } from '@/lib/actions/content.actions';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const defaultNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'For Schools', href: '/schools' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' }
];

const defaultFooterSections = [
  {
    category: 'courses',
    title: 'Courses',
    links: [
      { label: 'Foundation Track (4-6)', href: '/courses?category=foundation' },
      { label: 'Intermediate Track (7-10)', href: '/courses?category=intermediate' },
      { label: 'Advanced Track (11-12)', href: '/courses?category=advanced' },
      { label: 'School Programs', href: '/schools' }
    ]
  },
  {
    category: 'company',
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press Kit', href: '/press' }
    ]
  },
  {
    category: 'support',
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/#faqs' },
      { label: 'Privacy Policy', href: '/privacy' }
    ]
  },
  {
    category: 'dashboards',
    title: 'Dashboards',
    links: [
      { label: 'Student Dashboard', href: '/student/dashboard' },
      { label: 'School Dashboard', href: '/school/dashboard' },
      { label: 'Govt Portal', href: '/govt/dashboard' },
      { label: 'Super Admin', href: '/admin/dashboard' }
    ]
  }
];

const PublicLayout = async ({ children }: PublicLayoutProps) => {
  // Fetch data from Sanity
  const [navLinksData, footerSectionsData, orgData] = await Promise.all([
    getNavLinks(),
    getFooterSections(),
    getOrganizationDetails()
  ]);

  // Use Sanity data or fallbacks
  const navLinks = navLinksData && navLinksData.length > 0
    ? navLinksData
    : defaultNavLinks;

  const footerSections = footerSectionsData && footerSectionsData.length > 0
    ? footerSectionsData
    : defaultFooterSections;

  const organization = orgData;

  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col">
        <Header navLinks={navLinks} />
        <main id="main-content" className="flex-1 pt-16 md:pt-20 outline-none" tabIndex={-1}>
          {children}
        </main>
        <Footer footerSections={footerSections} organization={organization} />
      </div>
    </SmoothScroll>
  );
};

export default PublicLayout;
