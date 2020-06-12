import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
// import 'bootstrap';
import { GeneralService } from 'src/app/services/general.service';
import { MessagingService } from 'src/app/services/settings-services/messaging.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css'],
})
export class MessagingComponent implements OnInit {

  spinnerType: string;
  spinnerStyle: any = {};
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  isLoading: boolean = false;

  chatForm: FormGroup;
  smsForm: FormGroup;
  whatsappForm: FormGroup;
  changeForm: FormGroup;
  allChat: any;
  allSms: any;
  allWhatsapp: any;
  allmessagingbyId: any;
  message: any = {};
  id: any;

  idLoadWhatsapp = false;
  idLoadChat = false;
  idLoadSms = false;
  name: any;

  @ViewChild('closeModal') closeModal;

  constructor(
    private messaging: MessagingService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private gs: GeneralService
  ) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    this.spinnerStyle = { top: '25%' };
    // $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
    // Scroll T o
    $('html,body').animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Chat Template
    this.chatForm = this.formBuilder.group({
      chatName: ['', Validators.required],
      chatDiscription: ['', Validators.required],
    });

    // forms validation for Adding Sms Template
    this.smsForm = this.formBuilder.group({
      smsName: ['', Validators.required],
      smsDiscription: ['', Validators.required],
    });

    // forms validation for Adding WhatsApp Template
    this.whatsappForm = this.formBuilder.group({
      whatsappName: ['', Validators.required],
      whatsappDiscription: ['', Validators.required],
    });

    // forms validation for Adding Changes Template
    this.changeForm = this.formBuilder.group({
      changeName: '',
      changeDiscription: '',
      changeId: '',
    });

    // Load Sales Competitors Territory List
    this.loadChatList();
    this.loadWhatsappList();
    this.loadSmsList();
    this.getbyId(this.id);
  }


  /*
   * EMAIL TEMPLATE
   **/

  // convenience getter for easy access to form fields
  get chat() {
    return this.chatForm.controls;
  }

  submitChat() {
    this.addChat();
    // this.chatForm.reset();
  }

  // Load Eamil List
  loadChatList() {
    this.messaging
      .getMessageByCategory('CHAT')
      .subscribe((data: any) => {
        console.log(data, 'result chat list');
        this.allChat = data;
        this.showSpinner = false;
      }, (error) => {
        this.errorLoader();
      });
  }

  // add Chat(s)
  addChat() {
    this.isLoading = true;
    // stop here if form is invalid
    if (this.chatForm.invalid) {
      return;
    }
    // Submitting the Chat Json to the server
    const messagingData = {
      category: 'CHAT',
      orgID: this.gs.orgID,
      content: this.chatForm.value.chatDiscription,
      id: 0,
      name: this.chatForm.value.chatName,
    };

    // console.log(messagingData);
    this.messaging.createMessage(messagingData).subscribe(
      (result: any) => {
        // console.log(result, ' results');
        this.message.header = 'Submitted';
        this.message.text = result.message;
        this.message.type = 'success';
        this.gs.alert(this.message);

        this.isLoading = false;
      }, (error) => {
        // console.log(error.error.error.message, 'Error Message');
        this.message.header = 'Failed';
        this.message.text = error.message;
        this.message.type = 'error';
        this.gs.alert(this.message);
      }).add(() => {
        $('#ModalCenter .close').click();
        this.retry('jsBin');
      });
  }

  // Get Message Template By ID For Chat
  loadChatById(id) {
    this.idLoadChat = true;
    this.messaging.getMessageById(id).subscribe((data: any) => {
      console.log(data, 'result message by id list');
      this.allmessagingbyId = data;
      // forms validation for Adding Industry
      this.changeForm = this.formBuilder.group({
        changeName: this.allmessagingbyId.name,
        changeDiscription: this.allmessagingbyId.content,
        changeId: this.allmessagingbyId.id,
      });
    });
  }

  /*
   * SMS TEMPLATE
   **/

  // convenience getter for easy access to form fields
  get sms() {
    return this.smsForm.controls;
  }

  submitSms() {
    this.addSms();
  }

  // Load Email List
  loadSmsList() {
    // this.showSpinner = true;
    this.messaging
      .getMessageByCategory('SMS')
      .subscribe((data: any) => {
        // console.log(data, 'result sms list');
        this.allSms = data;
      }, error => {
        this.errorLoader();
      }).add(() => {
        // this.showSpinner = false;
      });
  }

  // add Chat(s)
  addSms() {
    this.isLoading = true;
    if (this.smsForm.invalid) return;

    // Submitting the Chat Json to the server
    const messagingData = {
      category: 'SMS',
      orgID: this.gs.orgID,
      content: this.smsForm.value.smsDiscription,
      id: 0,
      name: this.smsForm.value.smsName,
    };

    this.messaging
      .createMessage(messagingData)
      .subscribe(
        (result: any) => {
          this.message.header = 'Submitted';
          this.message.text = result.message;
          this.message.type = 'success';
          this.gs.alert(this.message);
        },
        error => {
          this.message.header = 'Failed';
          this.message.text = error.message;
          this.message.type = 'error';
          this.gs.alert(this.message);
        }
      ).add(() => {
        this.isLoading = false;
        $('#ModalCenter2 .close').click();
        this.smsForm.reset();
        this.loadSmsList();
      });
  }

  // Get Message Template By ID For SMS
  loadSmsById(id) {
    this.idLoadSms = true;
    this.messaging.getMessageById(id).subscribe((data: any) => {
      console.log(data, 'result message by id list');
      this.allmessagingbyId = data;
      // forms validation for Adding Industry
      this.changeForm = this.formBuilder.group({
        changeName: this.allmessagingbyId.name,
        changeDiscription: this.allmessagingbyId.content,
        changeId: this.allmessagingbyId.id,
      });
    });
  }

  /*
   * WHATSAPP TEMPLATE
   **/

  // convenience getter for easy access to form fields
  get whatsapp() {
    return this.whatsappForm.controls;
  }

  submitWhatsapp() {
    this.addWhatsapp();
  }

  // Load WHATSAPP List
  loadWhatsappList() {
    this.messaging
      .getMessageByCategory('WHATSAPP')
      .subscribe((data: any) => {
        // console.log(data, 'result Whatsapp list');
        this.allWhatsapp = data;
      });
  }

  // add WHATSAPP(s)
  addWhatsapp() {
    this.isLoading = true;
    if (this.whatsappForm.invalid) return;

    // Submitting the Chat Json to the server
    const messagingData = {
      category: 'WHATSAPP',
      orgID: this.gs.orgID,
      content: this.whatsappForm.value.whatsappDiscription,
      id: 0,
      name: this.whatsappForm.value.whatsappName,
    };

    this.messaging.createMessage(messagingData).subscribe(
      (result: any) => {
        // console.log(result, ' results');
        this.message.header = 'Submitted';
        this.message.text = result.message;
        this.message.type = 'success';
        this.gs.alert(this.message);
      },
      error => {
        // console.log(error.error.error.message, 'Error Message');
        this.message.header = 'Failed';
        this.message.text = error.message;
        this.message.type = 'error';
        this.gs.alert(this.message);
      }
    ).add(() => {
      this.isLoading = false;
      $('#ModalCenter3 .close').click();
      this.loadWhatsappList();
      this.whatsappForm.reset();
    });
  }

  // Get Message Template By ID For WhatsApp
  loadWhatsappById(id) {
    this.idLoadWhatsapp = true;
    this.messaging
      .getMessageById(id)
      .subscribe((data: any) => {
        // console.log(data, 'result message by id list');
        this.allmessagingbyId = data;
        // forms validation for Adding Industry
        this.changeForm.setValue({
          changeName: this.allmessagingbyId.name,
          changeDiscription: this.allmessagingbyId.content,
          changeId: this.allmessagingbyId.id,
        });
      });
  }

  /*
   * Generl Messaging Functions
   */

  // update Message(s)
  updateMessage() {
    this.isLoading = true;
    // Submitting the Chat Json to the server
    const UpdateMessagingData = {
      category: this.allmessagingbyId.category,
      orgID: this.allmessagingbyId.orgID,
      content: this.changeForm.value.changeDiscription,
      id: this.changeForm.value.changeId,
      name: this.changeForm.value.changeName,
    };

    // console.log(UpdateMessagingData, 'update changeForm');
    this.messaging
      .updateMassage(UpdateMessagingData)
      .subscribe(
        (result: any) => {
          console.log(result, ' Update results');
          if (result) {
            this.message.header = 'Updated';
            this.message.text = result.message;
            this.message.type = 'success';
            this.gs.alert(this.message);
            this.idLoadChat = false;
            this.idLoadSms = false;
            this.idLoadWhatsapp = false;
            this.changeForm.reset();
          }
        },
        error => {
          console.log(error.error.error.message, 'Error Message');
          if (error) {
            this.message.header = 'Failed';
            this.message.text = error.message;
            this.message.type = 'error';
            this.gs.alert(this.message);
          }
        }
      ).add(() => {
        this.isLoading = false;
        this.retry('jsBin');
      });
  }

  // Clone Message(s)
  cloneMessage(id) {
    console.log(id, 'log id for clone');
    this.messaging
      .cloneMessage(id)
      .subscribe(
        (data: any) => {
          console.log(data, 'Cloned data');
          if (data) {
            this.message.header = 'Cloned';
            this.message.text = data.message;
            this.message.type = 'success';
            this.gs.alert(this.message);
          }
        },
        error => {
          console.log(error.error.error.message, 'Error Message');
          if (error) {
            this.message.header = 'Failed';
            this.message.text = error.message;
            this.message.type = 'error';
            this.gs.alert(this.message);
          }
        }
      ).add(() => {
        this.retry('jsBin');
      });
  }

  getbyId(id) {
    console.log(id, 'id for bgt by ID');
    if (id != null) {
      console.log(id, 'inside load by ID');
      this.loadWhatsappById(id);
      this.loadChatById(id);
      this.loadSmsById(id);
    }
  }

  // Swit Message Template for delete confirmation
  deleteMessageConfirm(id) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then(result => {
        console.log(result);
        if (result.value) {
          console.log(result, '1');
          this.deleteMessage(id);
          this.message.header = 'Deleted';
          this.message.text = result.value.message;
          this.message.type = 'success';
          this.gs.alert(this.message);
        } else if (
          // Read more about handling dismissals
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire('Delete Action Cancelled');
        }
      }).finally(() => {
        this.retry('jsBin');
      });
  }

  // For Deleting Message Template on the list
  deleteMessage(id) {
    console.log(id);
    this.messaging.deleteMessage(id).subscribe((data: any) => {
      console.log(data, 'data delete roles');
    });
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
