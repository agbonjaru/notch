/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */

import  { LeadDetailComponent }  from './lead-detail/lead-detail.component'

export const LeadChildRoutes = [
    {
        path: ":id",
        component: LeadDetailComponent
    }
]