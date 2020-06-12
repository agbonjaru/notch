/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

import { LeadService } from 'src/app/services/client-services/leads.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

/**
 * This Helper class handles client related tasks for the email feed
**/

export default class ClientProcessor {
    lead_service: LeadService;
    clients_data: any;
    /**
     * Retrieve client information based on email addresses 
     * @param email_list Comma separated list of emails 
     * @param lead_service 
     * @param contact_service
     * @param company_service 
     */

    fetch_clients_information(email_list: Array<string>, lead_service: LeadService, contact_service: ContactsService, company_service: CompaniesService){
        this.clients_data = undefined;
        this.lead_service = lead_service;

        const fetch_leads = lead_service.filterLead(`email=${email_list.join()}`);
        const fetch_contacts = contact_service.getContactsByFilter(`email=${email_list.join()}`);
        const fetch_companies = company_service.getCompaniesByFilter(`email=${email_list.join()}`);

        forkJoin([fetch_companies, fetch_contacts, fetch_leads]).subscribe((responses: any) => {
            let companies_information: any = {}, contacts_information: any = {}, leads_information: any = {};
            if (responses[0].success) {
                companies_information = { ...this.process_response(responses[0].payload, 0)}
            }
            
            if (responses[1].success) {
                contacts_information = { ...this.process_response(responses[1].payload, 1)}
            }
            
            if (responses[2].success) {
                leads_information = { ...this.process_response(responses[2].payload, 2)}
            }

            this.clients_data = {
                ...companies_information,
                ...contacts_information,
                ...leads_information
            }
        });
    }

    process_response(data: Array<any>, index): any {
        const paths = ['/clients/companies-view', '/clients/contacts-view', '/clients/leads'];
        let processed_response: any = {};

        data.forEach((datum: any) => {
            processed_response = {
                ...processed_response,
                [datum.email]: {
                    id: datum.id,
                    email: datum.email,
                    path: paths[index]
                }
            };
        });

        return processed_response;
    }

    get_client_page_path(email: string) {
        if(!this.clients_data[email]) {
            this.lead_service.captureLead({sourceValue: email, source: 'email'});
            return window.location.pathname;
        }

        const {id, path} = this.clients_data[email];
        return `${path}/${id}`;
    }
}