// Sanity schema index — barrel export of all document types
import user from './user';
import course from './course';
import school from './school';
import plan from './plan';
import payment from './payment';
import enrollment from './enrollment';
import certificate from './certificate';
import assignment from './assignment';
import submission from './submission';
import material from './material';
import activityLog from './activityLog';
import attendance from './attendance';
import report from './report';
import supportTicket from './supportTicket';
import lead from './lead';
import notification from './notification';
import { libraryFolder, libraryContent } from './library';
import organization from './organization';
import faq from './faq';
import testimonial from './testimonial';
import teamMember from './teamMember';
import feature from './feature';
import job from './job';
import blogPost from './blogPost';
import pressRelease from './pressRelease';
import video from './video';
import supportCategory from './supportCategory';
import supportArticle from './supportArticle';
import navLink from './navLink';
import footerSection from './footerLink';
import legalContent from './legalContent';

export const schemaTypes = [
    user,
    course,
    school,
    plan,
    payment,
    enrollment,
    certificate,
    assignment,
    submission,
    material,
    activityLog,
    attendance,
    report,
    supportTicket,
    lead,
    notification,
    libraryFolder,
    libraryContent,
    organization,
    faq,
    testimonial,
    teamMember,
    feature,
    job,
    blogPost,
    pressRelease,
    video,
    supportCategory,
    supportArticle,
    navLink,
    footerSection,
    legalContent,
];
