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
];
