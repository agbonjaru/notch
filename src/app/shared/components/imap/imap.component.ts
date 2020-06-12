import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { EmailService } from 'src/app/services/integrations/email/email.service';

@Component({
  selector: 'app-imap',
  templateUrl: './imap.component.html',
  styleUrls: ['./imap.component.css']
})
export class ImapComponent implements OnInit {

  imap_is_connecting: boolean = false; 
  imap_message_class: string ='';
  imap_message: string ='';


  imap_form = new FormGroup({
    imap_username: new FormControl(''),
    imap_password: new FormControl('')
  });

  constructor(
    private email_service: EmailService
  ) { 

  }

  ngOnInit() {
  }

  connect_imap_user () {
    const user_data: any = this.email_service.getUserData();

    if (user_data && user_data.service) {
      this.displayMessage(0, `You have already connected an account`);
      return;
    }

    const data = {
      username: this.imap_form.value.imap_username,
      password: this.imap_form.value.imap_password,
      service: 'imap'
    }

    this.imap_is_connecting = true;

    this.email_service.saveImapUser(data).subscribe((response : any) => {
      this.imap_is_connecting = false;
      if (response.success) {
        this.displayMessage(1, `Account Successfully Integrated`);
        setTimeout(() => this.email_service.user_data.next({ ...response.payload }), 300);
      } else {
        this.displayMessage(0, response.payload.message);
      }
    }, (error: any) => {
      this.imap_is_connecting = false;
      console.log(`Error ${error.message}`);
    }); 
  }

  determineAlertClass(code) {
    switch (code) {
      case 0: // error
        return `alert alert-danger`;
        break;
      case 1: // success
        return `alert alert-success`;
        break;
      default:
        return `alert alert-info`;
    }
  }

  displayMessage(code, message) {
    this.imap_message_class = this.determineAlertClass(code);
    this.imap_message = message;

    setTimeout(() => {
      this.imap_message = '';
      this.imap_message_class = '';
    }, 2500);
  }
}
