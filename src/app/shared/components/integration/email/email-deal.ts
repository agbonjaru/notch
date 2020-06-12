/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/

import { GeneralService } from "src/app/services/general.service";
import { EmailService } from "src/app/services/integrations/email/email.service";

class EmailDeals {
  team_id: string;

  selected_deal: any = {};
  suggested_deals: Array<any> = [];
  mailDeal: string = "";

  general_service: GeneralService;
  email_service: EmailService;

  constructor(general_service: GeneralService, email_service: EmailService) {
    this.email_service = email_service;
    this.general_service = general_service;

    if (this.general_service.user) {
      this.team_id = this.general_service.user.teamID;
    }
  }

  clearSuggestions() {
    this.suggested_deals = [];
    this.selected_deal = {
      id: "-1",
      name: "",
      companyId: "",
      contactIds: [],
    };

    this.mailDeal = "";
  }

  getSuggestions(value: string) {
    if (!value.trim()) {
      this.clearSuggestions();
      return;
    }

    this.email_service.fetchDeals(value).subscribe(
      (response: any) => {
        if (this.mailDeal && !this.selected_deal.name) {
          this.suggested_deals = [...response].map((deal) => ({
            id: deal.code,
            name: deal.name,
            companyId: deal.companyID,
            contactIds: deal.contacts.map((contact) => contact.id),
          }));
        }
      },
      (error: any) => {
        console.log(`Error: ${error.message}`);
      }
    );
  }

  selectDeal(deal) {
    this.suggested_deals = [];
    this.mailDeal = deal.name;
    this.selected_deal = deal;
  }
}

export default EmailDeals;
