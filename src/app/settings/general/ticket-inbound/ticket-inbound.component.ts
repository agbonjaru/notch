import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { TicketBulkService } from 'src/app/services/settings-services/ticket-bulk.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-ticket-inbound',
  templateUrl: './ticket-inbound.component.html',
  styleUrls: ['./ticket-inbound.component.css']
})
export class TicketInboundComponent implements OnInit {
  whatsappIncomingAPI = environment.chatServiceUrl+'/bots/whatsapp/incoming'
  spinnerType: string;
  spinnerStyle: any = {};
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  isLoading: boolean = false;
  showWhatsappForm = false;
  showWebScript = false;
  orgEmail: any;
  message: any = {};
  allticketInbound: any;
  statusText: any = {};
  ticketInboundForm: FormGroup;
  inBoundComms = {twilloSid: '', twilloToken: '', twilloWhatsAppNo: '', fbAccessToken: '', email: ''}
  constructor(
    private fb: FormBuilder,
    private gs: GeneralService,
    private ticketBulk: TicketBulkService) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    this.spinnerStyle = { top: '25%' };
    this.orgEmail = this.gs.orgEmailTicket;

    // $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
    this.createForm();
    this.loadTicketInbound();
    this.loadInboundComms();
  }

  // convenience getter for easy access to form fields
  get f() { return this.ticketInboundForm.controls; }

  createForm() {
    this.ticketInboundForm = this.fb.group({
      bulkSMS: [''],
      bulkEmail: [''],
      inboundSMS: [''],
      inboundEmail: [''],
      inboundWhatsApp: [''],
      orgID: [''],
      id: [''],
    });
  }

  setFormValues(data) {
    if (data == null) {
      this.f.inboundSMS.setValue(false);
      this.f.inboundEmail.setValue(false);
      this.f.inboundWhatsApp.setValue(false);
    } else {
      this.f.id.setValue(data.id);
      this.f.bulkSMS.setValue(data.bulkSMS);
      this.f.bulkEmail.setValue(data.bulkEmail);
      this.f.inboundSMS.setValue(data.inboundSMS);
      this.f.inboundEmail.setValue(data.inboundEmail);
      this.f.inboundWhatsApp.setValue(data.inboundWhatsApp);
    }
  }

  onSubmit() {
    if (this.ticketInboundForm.invalid) return;
    this.processForm();
  }

  processForm() {
    this.isLoading = !this.isLoading;
    this.f.orgID.setValue(this.gs.orgID.toString());
    const payload = this.ticketInboundForm.value;

    this.ticketBulk
      .createTicketBulk(payload)
      .subscribe((res) => {
        this.message.header = 'Submitted';
        this.message.text = res.message;
        this.message.type = 'success';
        this.gs.alert(this.message);
      }, (error) => {
        this.message.header = 'Failed';
        this.message.text = error.message;
        this.message.type = 'error';
        this.gs.alert(this.message);
      }).add(() => {
        this.isLoading = !this.isLoading;
        this.retry('spin');
      });
  }

  loadTicketInbound() {
    this.ticketInboundForm.reset();
    this.ticketBulk
      .getIntegrationsByCompany()
      .subscribe((data: any) => {
        if (data == null) {
          this.setFormValues(null);
        } else {
          this.setFormValues(data);
        }
      }, (error) => {
        this.errorLoader();
      }).add(() => {
        setTimeout(() => {
          this.showSpinner = false;
        }, 5000);
      });
  }
  loadInboundComms() {
    this.ticketBulk.getInboundComms().subscribe((res: any) => {
      this.inBoundComms = {...this.inBoundComms, ...res};
    })
  }
  toggleWhatspp() {
    this.showWhatsappForm = !this.showWhatsappForm
  }
  toggleWebScript() {
    this.showWebScript = !this.showWebScript
  }
  loadingInbound = false;
  saveInboundComms() {
    this.loadingInbound = true;
    const inboundcomm = {...this.inBoundComms, twilloWhatsAppNo: this.inBoundComms.twilloWhatsAppNo.replace(/\s/g, '')}
    const payload = {...this.inBoundComms, email: this.orgEmail}
    this.ticketBulk.saveInboundComms(payload).subscribe((res: any) => {
    this.loadingInbound = false;
    this.loadInboundComms();
      this.gs.sweetAlertSucess(res.message)
    }, err => {
    this.loadingInbound = false;
      this.gs.sweetAlertError(this.gs.getErrMsg(err))
    })
  }
  get getWebScript() {
    return `<script type="text/javascript">
                (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://test.notchcx.com:444/live-chat/${this.gs.orgID}';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s1.setAttribute('id', 'notch-crm-chatLink-id')
                s0.parentNode.insertBefore(s1,s0);
                })();
          </script>`
  }
  errorLoader() {
    this.spinnerType = "errorCard";
    this.setSpinnerStatus = "We couldn't load this view.";
  }

  retry(spinnerType) {
    this.showSpinner = true;
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";

    setTimeout(() => {
      this.ngOnInit();
    }, 2000);
  }
}
