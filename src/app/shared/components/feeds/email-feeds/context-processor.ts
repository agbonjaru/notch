/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

import { EmailService } from "src/app/services/integrations/email/email.service";

/**
 * @description This class handles all functionali related to email feeds contextualization
 */

interface ContextData {
    context_name: string;
    context_entity_id: string; // ID of the item in view
    context_primary_email?: string;
    context_email_list: Array<string>;
}

class EmailContext {

    constructor() {
    }

    /**
     * 
     * @param context_data set based on the feed context
     * 
     */
    process_context_data(context_data: any): ContextData {
        const { name, data } = context_data;
        let return_data: ContextData = {
            context_name : name,
            context_entity_id : data.id,
            context_primary_email : '',
            context_email_list : []
        };

        switch (name) {
            case 'lead':
            case 'salesperson':
            case 'contact':
                return_data.context_primary_email = data.email || '';
                break;
            case 'team':
                return_data.context_email_list = data.email_list || [];
                break;
            case 'company':
            case 'deal':
                return_data.context_primary_email = data.email || '';
                return_data.context_email_list = data.email_list || [];
                break;
            default:

        }

        return return_data;
    }


}

export default new EmailContext;