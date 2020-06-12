import { Component, OnInit } from '@angular/core';
import { EmailClientService } from 'src/app/services/integrations/email/email-client.service';
import EmailHelper from 'src/app/shared/components/integration/email/email-helper';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-email-lookup',
  templateUrl: './email-lookup.component.html',
  styleUrls: ['./email-lookup.component.css']
})
export class EmailLookupComponent implements OnInit {

  email_helper = EmailHelper;

  constructor(
    private emailClientService: EmailClientService,
  ) { }

  ngOnInit() {

  }

  getSuggestions() {
    if (this.email_helper.inputText.length <= 0 || this.email_helper.inputText == undefined) {
      this.email_helper.clearSuggestedUsers();
      return;
    }

    if (this.email_helper.selectedRecipientGroup !== undefined) {
      const leads_lookup = this.emailClientService.fetchClientsByWildcard(this.email_helper.inputText, 'leads');
      const contacts_lookup = this.emailClientService.fetchClientsByWildcard(this.email_helper.inputText, 'contacts');
      const companies_lookup = this.emailClientService.fetchClientsByWildcard(this.email_helper.inputText, 'companies');

      forkJoin([leads_lookup, contacts_lookup, companies_lookup]).subscribe ( (responses : any) => {
        let suggested_users = [];

        if (responses[0].success) {
          suggested_users = [ ...suggested_users, ...responses[0].payload];
        }

        if (responses[1].success) {
          suggested_users = [ ...suggested_users, ...responses[1].payload];
        }

        if (responses[2].success) {
          suggested_users = [ ...suggested_users, ...responses[2].payload];
        }

        this.email_helper.suggestedUsers = [ ...suggested_users ];
      });
    } else {
      this.email_helper.displayAlert(`Please select recipient group`);
    }
  }

}
