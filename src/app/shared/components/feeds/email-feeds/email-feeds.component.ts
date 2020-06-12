import { Component, OnInit } from '@angular/core';
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { GeneralService } from 'src/app/services/general.service';
import EmailContext from './context-processor';
import ClientProcessor from './client-processor';
import { forkJoin } from 'rxjs';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { CompaniesService } from 'src/app/services/client-services/companies.service';

@Component({
  selector: 'app-email-feeds',
  templateUrl: './email-feeds.component.html',
  styleUrls: ['./email-feeds.component.css']
})
export class EmailFeedsComponent implements OnInit {
  clientsProcessor: any;

  isShowRecipients: boolean = false;

  messages: Array<any>;
  threads: any;
  attachments: Array<any>;
  orgId: number;
  userId: any;

  selectedMessage: any;
  constructor(
    private emailService: EmailService,
    private leadService: LeadService,
    private contactService: ContactsService,
    private companiesService: CompaniesService,
    private generalService: GeneralService
  ) { }

  ngOnInit() {
    this.userId = this.emailService.userId;
    this.orgId = this.emailService.orgId;
    this.clientsProcessor = new ClientProcessor;

    this.emailService.new_email.subscribe(data => {
      if (!this.generalService.checkIfObjectIsEmpty(data)) {
        const messages = [ ...this.messages, { ...data }];
        const thread_messages = this.sortMessagesByThread(messages);
        thread_messages.sort((a, b) => Number(b.createdOn) - Number(a.createdOn));
        this.setMessages(thread_messages);
      }
    });

    this.emailService.email_context.subscribe((context: any) => {
      if (!this.generalService.checkIfObjectIsEmpty(context)) {

        const context_data = EmailContext.process_context_data(context);
        this.emailService.context_primary_email_address.next(context_data.context_primary_email);

        const email_list: Array<string> = [context_data.context_primary_email, ...context_data.context_email_list];

        // prepare query strings
        const email_query_string: string = `clientEmail=${email_list.join()}`;
        const user_query_string: string = `orgId=${this.orgId}&userId=${this.userId}`;

        // fetch thread requests
        const fetch_threads_by_emails = this.emailService.filterThreads(email_query_string);
        const fetch_threads_by_user = this.emailService.filterThreads(user_query_string);

        forkJoin([fetch_threads_by_emails, fetch_threads_by_user]).subscribe((responses: any) => {
          let threads = [], thread_ids = [];

          if (responses[0].success) {
            threads = [...threads, ...responses[0].payload]
          }

          if (responses[1].success) {
            threads = [...threads, ...responses[1].payload]
          }

          this.threads = this.transformThreadArrayIntoObject(threads);
          thread_ids = threads.map(thread => thread.threadId);

          const thread_query_string: string = `threadId=${thread_ids.join()}`;

          this.emailService.filterMessages(thread_query_string).subscribe((response: any) => {
            if (response.success) {
              const threadMessages = this.sortMessagesByThread(response.payload);
              this.setMessages(threadMessages);
            }
          }, error => {
            console.log(error.message);
          })
        }, (error: any) => {
          console.log(error.message);
        });
      }
    });

  }

  setMessages(messages) {
    this.messages = messages;
  }

  sortMessagesByThread(messages) {
    let threadMap = {};
    let threadMessage = [];

    messages.forEach(message => {
      const { threadId } = message;
      threadMap[threadId] = { ...message };
    });

    for (let threadId in threadMap) {
      let message = threadMap[threadId];
      message = {
        ...message,
        ...this.processMailBody(message.service, message),
        date: `${message.createdOn}000`
      }

      threadMessage = [
        message,
        ...threadMessage
      ];
    }

    return threadMessage;
  }

  transformThreadArrayIntoObject(data: Array<any>): any {
    let threads: any = {};
    data.forEach(datum => {
      threads = {
        ...threads,
        [datum.threadId]: { ...datum }
      }
    });

    return threads;
  }


  /**
   * 
   * @param service the connected email service e.g 'gmail'
   * @param message the message from the dataabase
   */
  processMailBody(service: string, message: any) {
    let processedBody = {};
    switch (service) {
      case 'office':
        processedBody = {
          content: message.body.body.content.replace(/\n[>]+/g, '\n'),
          subject: message.body.subject,
          sender: message.body.from.name,
          snippet: message.body.body.content.substr(0, 15),
          recipient: message.body.to[0].address,
          cc_recipients: message.body.cc.map(recipient => recipient.address),
          bcc_recipients: message.body.bcc.map(recipient => recipient.address)
        }
        break;
      case 'gmail':
        let body;
        if (!message.body.body) {
          body = '';
        } else {
          body = message.body.body.text === undefined ? message.body.body : message.body.body.text;
        }

        processedBody = {
          content: body.replace(/\n[>]+/g, '\n'),
          subject: message.body.subject,
          sender: message.body.from == message.sender ? message.body.to : message.body.from,
          snippet: body.substr(0, 15),
          recipient: message.body.to,
          cc_recipients: message.body.cc,
          bcc_recipients: message.body.bcc,
        }
        break;
      case 'imap':
        let mail_body;
        if (typeof message.body === 'string') {
          mail_body = message.body;
        } else {
          mail_body = typeof message.body.text === "string" ? message.body.text : message.body.text.text;
        }

        processedBody = {
          content: mail_body.replace(/\n[>]+/g, '\n'),
          subject: message.subject || message.headers.subject,
          sender: message.sender,
          snippet: mail_body.substr(0, 15)
        }
      default:
    }

    return processedBody;
  }

  updateMessageReadStatus(message: any, index: number) {
    if (message.status === 'read') return;

    this.emailService.updateMessage({ ...message, status: 'read' }).subscribe((response: any) => {
      if (response.success) {
        this.messages[index] = { ...this.messages[index], ...response.payload };
      }
    }, (error: any) => {
      console.log(`Error: ${error.message}`);
    });
  }

  /** */

  closeEmailView() {
    const emailViewModal = document.getElementById('viewEmailModal');
    emailViewModal.style.display = "none";
    this.selectedMessage = {};
  }

  viewMessage(index) {
    const threadId = this.messages[index].threadId;
    this.selectedMessage = {
      ...this.messages[index],
      dealId: this.threads[threadId] ? this.threads[threadId].deal.id : '-1',
      dealName: this.threads[threadId] ?this.threads[threadId].deal.name : '',
      index
    };

    const { recipient, cc_recipients, bcc_recipients } = this.selectedMessage;
    this.clientsProcessor.fetch_clients_information(
      [recipient, ...cc_recipients, ...bcc_recipients],
      this.leadService, this.contactService, this.companiesService
    );

    this.emailService.filterAttachments(`threadId=${this.selectedMessage.threadId}`).subscribe(res => {
      if (res['success']) {
        this.attachments = res['payload'].map(attachment => {
          const name = attachment.name.split(':')[1];
          return {
            ...attachment,
            name: `${name.substr(0, 4)}...${name.substr(-6)}`
          }
        });
      }
    });

    this.updateMessageReadStatus(this.selectedMessage, index);
    //
    const emailViewModal = document.getElementById('viewEmailModal');
    emailViewModal.style.display = "flex";

  }

  reply(index) {
    const threadId = this.messages[index].threadId;
    const threadInfo = {
      dealId: this.threads[threadId] ? this.threads[threadId].deal.id : '-1',
      deal: this.threads[threadId] ? this.threads[threadId].deal : {},
      thread_db_id: this.threads[threadId] ? this.threads[threadId]._id : ''
    }

    this.selectedMessage = { ...this.messages[index], ...threadInfo };
    this.updateMessageReadStatus(this.selectedMessage, index);
    this.emailService.selectedEmail.next(this.selectedMessage);
    this.closeEmailView();
  }

  toggleShowRecipients() {
    this.isShowRecipients = !this.isShowRecipients;
  }

}
