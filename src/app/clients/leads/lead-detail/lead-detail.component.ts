import { GeneralService } from 'src/app/services/general.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { LeadNavComponent } from './lead-nav/lead-nav.component';
import { EmailService } from 'src/app/services/integrations/email/email.service';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.css']
})
export class LeadDetailComponent implements OnInit {
  info: any;
  toContact: boolean = false;
  toCompany: boolean = false;
  showScore = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    private emailService: EmailService,
    public gs: GeneralService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((res: any) => {
      const { id } = res.params;
      this.leadService.fetchLead(id).subscribe((response: any) => {
        if (response.success) {
          this.info = { ...response.payload };

          // set context
          this.emailService.email_context.next({
            name: 'lead',
            data: {
              id,
              email: this.info.email || this.info.personalEmail
            },
            lead: this.info
          });
          this.leadService.lead_info_from_server.next({ ...response.payload });
          this.leadService.local_lead_info.next({ ...response.payload });
        }
      }, (err: any) => {
        console.log(`Lead Detail Error: ${err.message}`);
      })
    }, (err: any) => {
      console.log(`Lead Detail Error: ${err.message}`);
    });
  }

  toggleScore() {
    this.showScore = !this.showScore;
  }

  /** */
  showCompanyForm() {
    this.toContact = false;
    this.toCompany = true;
  }

  showContactForm() {
    this.toCompany = false;
    this.toContact = true;
  }

  isContact() {
    return this.info && this.info.clientType === 'contact';
  }

  isCompany() {
    return this.info && this.info.clientType === 'company';
  }

  convertToClient() {
    if (!this.leadService.canBeConvertedToClient) {
      console.log('lead Cannot be converted to client');
      return;
    }
  }

  convertToDeal() {
    const { clientId, clientType, firstName, surName, name } = this.leadService.getLeadInfo();
    if (clientId) {

      const queryParameters: NavigationExtras = {
        queryParams: {
          session_id: 'clientNavigation',
          client_id: clientId,
          client_name: clientType === 'contact' ? `${firstName} ${surName}` : name,
          session_name: clientType
        }
      }
      this.router.navigate(['/sales/create-deals'], queryParameters);
    } else console.log(`lead cannot be converted to deal`);
  }

  leadCanBeConvertedToDeal() {
    return this.leadService.canLeadBeConvertedToDeal();
  }
}
