import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GmailService } from 'src/app/services/integrations/email/gmail-service.service';
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { GeneralService } from 'src/app/services/general.service';
import { OfficeService } from 'src/app/services/integrations/email/office.service';
import DateUtils from 'src/app/utils/date';

import EmailHelper from './email-helper';
import EmailAttachmentHelper from './email-attachment';
import EmailAnimations from './animations';
import EmailDeals from './email-deal';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';



@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})

export class EmailComponent implements OnInit {
  /** */
  @Input() component_id: any;

  html_ids: any = {};


  /** */
  userId: number;
  orgId: number;
  user_data: any;

  /** FOR QUOTE/INVOICE SENDING */
  sales_item: any;
  has_sales_item: boolean = false;

  formMessage = {
    class: '',
    message: '',
  }

  response: object;
  current_uri: string;

  /** FOR PROGRESS LOADERS */
  gmailConnecting: boolean = false;
  officeConnecting: boolean = false;
  imapConnecting: boolean = false;


  serviceDisconnecting: boolean = false;

  mailSending: boolean = false;

  /** FOR EMAIL VIEWING */
  currentlyOpenedMail: any = {};
  currentlyOpenedMailExists: boolean = false;

  mailIsReply: boolean;
  mailSubject: string;
  mailBody: string;
  mailDeal: string = '';

  /** EMAIL HELPERS*/
  emailHelper;
  attachmentHelper;
  emailAnimations;
  emailDeals;

  constructor(
    private generalService: GeneralService,
    private emailService: EmailService,
    private gmailService: GmailService,
    private officeService: OfficeService,
    private router: Router,
  ) {

    this.emailHelper = EmailHelper;
    this.attachmentHelper = new EmailAttachmentHelper(emailService);
    this.emailDeals = new EmailDeals(generalService, emailService);

    //
    this.userId = this.emailService.userId;
    this.orgId = this.emailService.orgId;

  }

  ngOnInit() {
    this.emailService.user_data.subscribe(data => {
      this.user_data = { ...data };
    });

    this.emailService.context_primary_email_address.subscribe(email_address => {
      this.emailHelper.inputTo = email_address;
    });

    this.emailService.email_context.subscribe(data => {
      if (!this.generalService.checkIfObjectIsEmpty(data)) {
        if (data.name.toLowerCase() == 'deal') {
          this.emailDeals.selectDeal(data.deal);
        } else {
          this.emailDeals.clearSuggestions();
        }
      }
    })

    this.emailService.sales_item.subscribe(data => {
      if (!this.generalService.checkIfObjectIsEmpty(data)) {
        this.resetForm();
        const item_type = data.type.toLowerCase() === 'quote' ? 'quotation' : 'invoice';
        this.has_sales_item = true;
        this.sales_item = {
          type: data.type,
          id: data.payload[item_type].id,
          payload: data.payload
        }

        this.emailHelper.inputTo = data.payload.client.email;
        document.getElementById('header-nav-new-mail-btn').click();
      }
    });

    this.emailAnimations = new EmailAnimations(this.component_id);

    this.html_ids = {
      email_area: `email-area-${this.component_id}`,
      input_cc: `input-cc-${this.component_id}`,
      input_cc_list: `input-cc-list-${this.component_id}`,
      input_bcc: `input-bcc-${this.component_id}`,
      input_bcc_list: `input-bcc-list-${this.component_id}`,
      file_upload_btn: `fileUploadBtn-${this.component_id}`,
      email_deal: `email-deal-${this.component_id}`,
    }

    this.emailService.selectedEmail.subscribe(email => {
      if (this.user_data.service !== email.service) {
        this.displayFormMessage(0, `You cannot reply mail from a disconnected mailbox`);
        return;
      }

      if (!this.generalService.checkIfObjectIsEmpty(email)) {

        this.mailIsReply = true;
        this.currentlyOpenedMail = this.emailHelper.processCurrentlyOpenedMail(email, this.user_data.serviceKey);

        this.emailHelper.processReplySelection('selectedCcRecipients', email.body.cc);
        this.emailHelper.processReplySelection('selectedBccRecipients', email.body.bcc);

        this.mailSubject = this.currentlyOpenedMail.subject;
        this.emailHelper.inputTo = this.currentlyOpenedMail.from.address;
        this.mailBody = this.currentlyOpenedMail.body;
        this.emailDeals.mailDeal = email.deal.name

        this.emailDeals.selected_deal = email.deal;
        this.currentlyOpenedMailExists = true;
      }
    }, error => {
      console.log(error.message);
    });

    if (this.emailService.getUserData() === undefined) {
      this.emailService.fetchAccessTokenDataFromServer().subscribe(async (response: any) => {
        if (response.success) {
          //
          this.emailService.user_data.next({ ...response.payload });

          if (response.payload.service === 'office') {
            // this.initializeTokenRefresh();
          }
        }

        const googleResponse = this.handleGoogleAccessTokenResponse();
        if (googleResponse) {
          this.gmailConnecting = true;
          this.emailService.saveAccessTokenOnServer({ ...googleResponse })
            .subscribe((response: any) => {
              this.gmailConnecting = false;
              if (response.success) {
                this.emailService.user_data.next({ ...response.payload });
              }
              console.log(`EmailComponent::Google accessToken: `, response);
            });
        }
      }, error => {
        console.log(error.message);
      });
    }

    this.emailAnimations.loadFormElements();
  }

  /** */
  async requestAccessToken(type) {

    if (!this.user_data) {
      this.displayFormMessage(0, 'Cannot connect mail at the moment. Try again later')
      return;
    }

    if (this.user_data.service) {
      this.displayFormMessage(0, `You have already connected an account`);
      return;
    }

    try {
      this.current_uri = this.router.url;
      localStorage.setItem('redirect_uri', this.current_uri);
      switch (type) {
        case 'gmail':
          window.location.href = this.gmailService.getAccessTokenUri();
          break;
        case 'office':
          await this.officeService.signIn();
          if (this.officeService.authenticated) {
            this.officeConnecting = true;
            let token = await this.officeService.getAccessToken();

            if (!token) {
              this.generalService.sweetAlertError('Could not connect account');
              this.officeConnecting = false;
              return;
            }


            const data = this.prepareTokenDataToBeSentToServer(token, 'office');

            // 
            this.officeConnecting = true;
            this.emailService.saveAccessTokenOnServer({ ...data })
              .subscribe((response: any) => {
                this.officeConnecting = false;
                if (response.success) {
                  this.emailService.user_data.next({ ...response['payload'] })
                }
              }, (error: any) => {
                this.officeConnecting = false;
                console.log(`Error: ${error.message}`)
              });
          }
          break;
        default:
          console.log('Email Component: Unknown Type');
      }
    } catch (error) {
      console.log('Email Component: Error', error);
    }
  }

  initializeTokenRefresh() {
    this.refreshToken();
    setInterval(async () => {
      this.refreshToken();
    }, 3500000);
  }

  async refreshToken() {
    console.log('refresh');
    const accessToken = await this.officeService.getAccessToken();
    const data = this.prepareTokenDataToBeSentToServer(accessToken, 'office');

    this.emailService.saveAccessTokenOnServer(data).subscribe(res => {
      // console.log(res);
    })
  }

  /** */

  handleGoogleAccessTokenResponse(): any {
    this.response = this.retrieveResponseObjectFromLocalStorage();

    if (this.response && !this.generalService.checkIfObjectIsEmpty(this.response)) {
      if (this.response['client'] == 'google') {
        this.removeTokenObjectFromLocalStorage();
        return this.prepareTokenDataToBeSentToServer(this.response['code'], 'gmail');
      }
    }

    return null;
  }

  revokeAccess() {
    this.generalService.sweetAlertContinue('Disconnect account').then((response: any) => {
      if (response.value) {
        this.serviceDisconnecting = true;
        this.emailService.revokeUserAccess(this.user_data._id).subscribe((response: any) => {
          this.serviceDisconnecting = false;
          if (response.success) {
            //
            if (this.user_data.service === 'office') {
              // this.officeService.signOut();
            }
            this.emailService.user_data.next({});
            this.displayFormMessage(0, `Account disconnected`);

          } else {
            this.displayFormMessage(0, `Error: Could not disconnect account`);
          }
        }, error => {
          this.serviceDisconnecting = false;
          console.log(error.message);
        })
      }
    })
  }

  /** */
  checkIfFieldIsEmpty() {
    if (!this.user_data.service) {
      this.displayFormMessage(0, `No email account is connected`);
      return true;
    }

    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailPattern.test(this.emailHelper.inputTo.trim())) {
      this.displayFormMessage(0, `Enter a valid recipient`);
      return true;
    }

    if (this.mailSubject === undefined || this.mailSubject.length <= 0) {
      this.displayFormMessage(0, `Enter a valid subject`);
      return true;
    }

    if (!this.mailBody) {
      this.displayFormMessage(0, `Mail body cannot be empty`);
      return true;
    }

    return false;
  }

  resetForm() {
    this.emailHelper.inputTo = '';
    this.mailSubject = '';
    this.mailBody = '';
    this.mailIsReply = false;
    this.emailHelper.inputCc = '';
    this.emailHelper.inputBcc = '';
    this.emailHelper.clearTemporarySelections();
    this.emailHelper.clearSelectedRecipients();
    this.emailDeals.clearSuggestions();
    this.attachmentHelper.selectedAttachments = {};

    this.removeSalesItem();
    document.getElementById('close-email-modal').click();
  }

  /** Removes a sales Item (invoice or uotation attached to the email component) */
  removeSalesItem() {
    this.has_sales_item = false;
    this.sales_item = undefined;
  }

  sendMail() {
    if (this.checkIfFieldIsEmpty()) return;

    this.displayFormMessage(3, `Sending Mail`);

    this.emailHelper.processInputResidue();

    if (this.emailHelper.inputTo == this.currentlyOpenedMail.from) {
      this.mailIsReply = true;
    }

    let replyMailBody: any = {};
    if (this.mailIsReply) {
      const headers = this.currentlyOpenedMail.headers ? this.currentlyOpenedMail.headers : this.currentlyOpenedMail.body.headers;
      replyMailBody = {

        headers,
        prevBody: {
          ...this.currentlyOpenedMail.body,
          service: this.currentlyOpenedMail.service
        },
        dealId: this.currentlyOpenedMail.dealId,
        thread_db_id: this.currentlyOpenedMail.thread_db_id,
        threadId: this.currentlyOpenedMail.threadId,
        messageId: this.currentlyOpenedMail.messageId
      }
    }

    const message = {
      ...this.user_data,
      ...replyMailBody,
      to: this.emailHelper.inputTo.trim(),
      type: this.mailIsReply ? 'reply' : undefined,
      subject: this.mailSubject,
      cc: this.emailHelper.reduceSelectedRecipients('selectedCcRecipients'),
      bcc: this.emailHelper.reduceSelectedRecipients('selectedBccRecipients'),
      body: this.mailBody, //this.emailHelper.processMessageBodyToSend(this.mailIsReply, this.mailBody, replyMailBody.prevBody),
      attachments: this.attachmentHelper.reduceSelectedAttachmentsToList(),
      deal: this.emailDeals.selected_deal,
      dealId: this.emailDeals.selected_deal.id || '-1',
      sales_item: this.sales_item
    }

    delete message.request;
    delete message._id;

    this.toggleMailSendingLoader();

    if (this.has_sales_item) {
      this.emailService.sendSalesItemMail(message, this.sales_item.type).subscribe((response: any) => {
        this.processEmailSendResponse(response);
      }, error => {
        this.displayFormMessage(0, `Error: Sending failed.`);
        this.toggleMailSendingLoader();
      });
    } else {
      this.emailService.sendMail(message, this.user_data.service).subscribe((response: any) => {
        this.processEmailSendResponse(response);
      }, error => {
        this.displayFormMessage(0, `Error: Sending failed.`);
        this.toggleMailSendingLoader();
      });
    }
  }

  /** process server response from an email send */
  processEmailSendResponse(response) {
    this.toggleMailSendingLoader();
    if (response.success) {
      // console.log(response['payload']);
      this.displayFormMessage(1, `Message Sent.`);
      this.resetForm();
      this.emailHelper.clearSelectedRecipients();
    } else {
      this.displayFormMessage(0, `Error: Sending failed.`);
    }
  }


  /** */
  prepareTokenDataToBeSentToServer(accessToken, service) {
    return {
      ...this.user_data,
      accessToken,
      service,
      nextRefreshTime: this.determineNextTokenRefreshTime()
    }
  }

  determineNextTokenRefreshTime() {
    const currentTime = (new DateUtils).getCurrentDateTimestampInSeconds();
    return Number(currentTime) + (60 * 55);
  }

  retrieveResponseObjectFromLocalStorage(): object {
    return JSON.parse(localStorage.getItem('token_response'));
  }

  removeTokenObjectFromLocalStorage() {
    localStorage.removeItem('token_response');
  }

  gmailConnected() {
    return this.user_data.service === 'gmail';
  }

  imapConnected() {
    return this.user_data.service === 'imap';
  }

  officeConnected() {
    return this.user_data.service === 'office';
  }

  /** 
   * 
   * 
   * 
   * 
   * 
  */

  openFileUploadDialog() {
    const fileUploadBtn = document.getElementById(this.html_ids.file_upload_btn);
    fileUploadBtn.click();
  };

  toggleMailSendingLoader() {
    this.mailSending = !this.mailSending;
  }

  flattenEmailRecipients(recipients) {
    const recipientMails = recipients.map(recipient => recipient.address);
    return recipientMails.join();
  }

  determineAlertClass(code) {
    switch (code) {
      case 0: // error
        return `alert alert-danger`;
      case 1: // success
        return `alert alert-success`;
      default:
        return `alert alert-info`;
    }
  }

  displayFormMessage(code, message) {
    this.formMessage.class = this.determineAlertClass(code);
    this.formMessage.message = message;
    setTimeout(() => {
      this.formMessage = {
        class: '',
        message: ''
      }
    }, 2500);
  }
}
