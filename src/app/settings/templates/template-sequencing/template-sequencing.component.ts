import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { MessagingService } from 'src/app/services/settings-services/messaging.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-template-sequencing',
  templateUrl: './template-sequencing.component.html',
  styleUrls: ['./template-sequencing.component.css'],
})
export class TemplateSequencingComponent implements OnInit {


  spinnerType: string;
  spinnerStyle: any = {};
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  isLoading: boolean = false;

  emailForm: FormGroup;
  changeForm: FormGroup;
  sequenceForm: FormGroup;
  allEmail: any;
  allmessagingbyId: any;
  message: any = {};
  id: any;
  idLoadEmail = false;
  name: any;
  allSequence: any;
  allMailSequencebyId: any;
  idLoadSequence = false;

  constructor(
    private messaging: MessagingService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private gs: GeneralService
  ) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    this.spinnerStyle = { top: '25%' };
    // $.getScript('../../../assets/js/datatableScript.js');
    this.route.params.subscribe(params => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    // Scroll To top
    $('html,body').animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Industry
    this.sequenceForm = this.formBuilder.group({
      sequenceName: ['', Validators.required],
    });

    // forms validation for Adding Industry
    this.emailForm = this.formBuilder.group({
      emailName: ['', Validators.required],
      emailDiscription: ['', Validators.required],
    });

    // forms validation for Adding Industry
    this.changeForm = this.formBuilder.group({
      changeName: '',
      changeDiscription: '',
      changeId: '',
    });

    // Load Sales Competitors Territory List
    this.loadEmailList();
    this.loadSequencingList();
    this.getbyId(this.id);
    this.getbySeqId(this.id);
  }



  /*
   * EMAIL TEMPLATE
   **/

  // convenience getter for easy access to form fields
  get email() {
    return this.emailForm.controls;
  }

  submitEmail() {
    this.addEmail();
  }

  // Load Eamil List
  loadEmailList() {
    this.messaging
      .getMessageByCategory('EMAIL')
      .subscribe((data: any) => {
        console.log(data, 'result email list');
        this.allEmail = data;
        this.showSpinner = false;
      });
  }

  // add Email(s)
  addEmail() {
    this.isLoading = true;
    // stop here if form is invalid
    if (this.emailForm.invalid) return;

    const messagingData = {
      category: 'EMAIL',
      orgID: this.gs.orgID,
      content: this.emailForm.value.emailDiscription,
      id: 0,
      name: this.emailForm.value.emailName,
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
        $('#ModalCenter3 .close').click();
        this.loadEmailList();
        this.emailForm.reset();
      });
  }

  // update Email(s)
  updateEmail() {
    this.isLoading = true;

    const messagingData = {
      category: this.allmessagingbyId.category,
      orgID: this.allmessagingbyId.orgID,
      content: this.changeForm.value.changeDiscription,
      id: this.changeForm.value.changeId,
      name: this.changeForm.value.changeName,
    };

    this.messaging
      .createMessage(messagingData)
      .subscribe(
        (result: any) => {
          console.log(result, ' Update results');
          if (result) {
            this.message.header = 'Updated';
            this.message.text = result.message;
            this.message.type = 'success';
            this.gs.alert(this.message);
            this.idLoadEmail = false;
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
        this.loadEmailList();
      });
  }

  // Clone Email(s)
  cloneEmail(id) {
    console.log(id, 'log id for clone');
    this.messaging.cloneMessage(id).subscribe(
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
      this.loadEmailList();
    });
  }

  // Get Message Template By ID For Email
  loadEmailById(id) {
    this.idLoadEmail = true;
    this.messaging.getMessageById(id).subscribe((data: any) => {
      console.log(data, 'result message by id list');
      this.allmessagingbyId = data;
      // forms validation for Adding Industry
      this.changeForm.setValue({
        changeName: this.allmessagingbyId.name,
        changeDiscription: this.allmessagingbyId.content,
        changeId: this.allmessagingbyId.id,
      });
    });
  }

  getbyId(id) {
    console.log(id, 'id for bgt by ID');
    if (id != null) {
      this.loadEmailById(id);
    }
  }

  // Swit Email Template for delete confirmation
  deleteEmailConfirm(id) {
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
          this.deleteEmail(id);
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
        this.loadEmailList();
      });
  }

  // For Deleting Email Template on the list
  deleteEmail(id) {
    console.log(id);
    this.messaging.deleteMessage(id).subscribe((data: any) => {
      console.log(data, 'data delete roles');
    }).add(() => {
      this.loadEmailList();
    });
  }

  /*
   * EMAIL SEQUENCING TEMPLATE
   **/
  get sequence() {
    return this.sequenceForm.controls;
  }

  submitSequencing() {
    this.addSequencing();
    // this.sequenceForm.reset();
  }

  // add Sequencing(s)
  addSequencing() {
    // stop here if form is invalid
    if (this.sequenceForm.invalid) return;

    const sequencingData = {
      id: 0,
      name: this.sequenceForm.value.sequenceName,
      orgID: this.gs.orgID,
    };

    // console.log(sequencingData);
    this.messaging
      .createSequence(sequencingData)
      .subscribe(
        (result: any) => {
          console.log(result, ' results');
          if (result) {
            this.message.header = 'Submitted';
            this.message.text = result.message;
            this.message.type = 'success';
            this.gs.alert(this.message);
          }
        },
        error => {
          console.log(error.error.error.message, 'Error Email');
          if (error) {
            this.message.header = 'Failed';
            this.message.text = error.message;
            this.message.type = 'error';
            this.gs.alert(this.message);
          }
        }
      );
  }

  // Clone Sequencing(s)
  cloneSequencing(id) {
    // console.log(id, 'log id for clone');
    this.messaging.cloneSequence(id).subscribe(
      (data: any) => {
        // console.log(data, 'Cloned data');
        if (data) {
          this.message.header = 'Cloned';
          this.message.text = data.message;
          this.message.type = 'success';
          this.gs.alert(this.message);
        }
      },
      error => {
        // console.log(error.error.error.message, 'Error Message');
        if (error) {
          this.message.header = 'Failed';
          this.message.text = error.message;
          this.message.type = 'error';
          this.gs.alert(this.message);
        }
      }).add(() => {
        this.loadSequencingList();
      });
  }

  // Load Sequencing List
  loadSequencingList() {
    this.messaging
      .getSequencingByOrg()
      .subscribe((data: any) => {
        // console.log(data, 'result email list');
        this.allSequence = data;
      }, (error) => {
        this.errorLoader();
      });
  }

  edit(id) {
    // router to the edit page\
    // console.log(id);
    this.router.navigate(['settings/template-sequencing', id]);
  }

  // Get Sequencing By ID
  loadSequenceById(id) {
    this.messaging.getSequenceById(id).subscribe((data: any) => {
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

  getbySeqId(id) {
    // console.log(id, 'id for Seq by ID');
    if (id != null) {
      this.loadSequenceById(id);
    }
  }

  // Swit Sequencing for delete confirmation
  deleteSequenceConfirm(id) {
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
          this.deleteSequence(id);
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
        this.loadSequencingList();
      });
  }

  // For Deleting Sequencing on the list
  deleteSequence(id) {
    console.log(id);
    this.messaging.deleteSequencing(id).subscribe((data: any) => {
      console.log(data, 'data delete roles');
    }).add(() => {
      this.loadSequencingList();
    });
  }

  LoadMailSequencingByParentId(id) {
    this.idLoadSequence = true;
    this.messaging.getMailSequencingByParentId(id).subscribe((data: any) => {
      console.log(data, 'result Mail Seq by by id list');
      this.allMailSequencebyId = data;
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
