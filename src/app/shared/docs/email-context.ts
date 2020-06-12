
// Hello guys,

// I need all frontend end developers to pass the following data (depending on the part of the system you're working on) in order to implement the email contextualization:

let context_data: any;

// CONTACT, SALESPERSON, LEAD: 

context_data = {
    name: '', // one of the following 'lead' or 'contact' or 'salesperson'
    data: {
        id: '', // ID of the item in view eg leadId, contactID etc
        email: '' // The email of th item in view
    }
}


// TEAM: 

context_data = {
    name: '', // 'team'
    data: {
        id: '', // team ID
        email_list: [] // Array of emails of team members
    }
}


// COMPANY & DEAL 

context_data = {
    name: '', // 'company' or 'deal'
    data: {
        id: '', // company or deal ID
        email: '', // company email
        email_list: [] // array of contcat emails
    }
}

/**
 * This object should be passed to the @email_context behaviour subject in the email service
 * 
 */