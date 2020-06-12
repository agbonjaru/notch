import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { MessagingService } from 'src/app/services/settings-services/messaging.service';

@Component({
  selector: 'app-sequencing-view',
  templateUrl: './sequencing-view.component.html',
  styleUrls: ['./sequencing-view.component.css'],
})
export class SequencingViewComponent implements OnInit {
  sequenceStepForm: FormGroup;

  changeForm: FormGroup;

  editSequenceForm: FormGroup;

  sequenceStepTemplateForm: FormGroup;

  sequenceName: any;

  allEmail: any;

  allmessagingbyId: any;

  allSequencebyId: any;

  allMailSequencebyId: any;

  message: any = {};

  id: any;

  idLoadEmail = false;

  name: any;

  allSequence: any;

  editSequence = false;

  constructor(
    private messaging: MessagingService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private gs: GeneralService
  ) {
    $.getScript('../../../assets/js/datatableScript.js');
    this.route.params.subscribe(params => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    // Scroll To top
    $('html,body').animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Industry
    this.editSequenceForm = this.formBuilder.group({
      editSequenceName: [''],
      editSequenceId: 0,
    });

    // forms validation for Adding Industry
    this.sequenceStepForm = this.formBuilder.group({
      sequenceStepTitle: ['', Validators.required],
      sequenceStepFrequency: ['', Validators.required],
      sequenceStepDate: ['', Validators.required],
      sequenceStepTime: ['', Validators.required],
      sequenceStepDays: ['', Validators.required],
    });

    this.sequenceStepTemplateForm = this.formBuilder.group({
      sequenceStepTemplate: ['', Validators.required],
    });

    // forms validation for Adding Industry
    this.changeForm = this.formBuilder.group({
      changeName: '',
      changeDiscription: '',
      changeId: '',
    });

    // Load Mail Sequncing List
    this.loadEmailList();
    this.loadSequenceById(this.id);
    this.LoadMailSequencingByParentId(this.id);
  }


  getFrequency() {
    const x = document.getElementById('tunji');
    if (x.style.visibility === 'hidden') {
      x.style.visibility = 'visible';
    } else {
      x.style.visibility = 'hidden';
    }
  }

  /*
   * EMAIL TEMPLATE
   **/

  // Load Eamil List
  loadEmailList() {
    this.messaging.getMessageByCategory('EMAIL').subscribe((data: any) => {
      console.log(data, 'result email list');
      this.allEmail = data;
    });
  }

  // Get Message Template By ID For Email
  loadEmailById(id) {
    this.idLoadEmail = true;
    this.messaging.getMessageById(id).subscribe((data: any) => {
      console.log(data, 'result message by id list');
      this.allmessagingbyId = data;
      this.sequenceStepTemplateForm = this.formBuilder.group({
        sequenceStepTemplate: this.allmessagingbyId.content,
      });
    });
  }

  /*
   * EMAIL SEQUENCING TEMPLATE
   **/

  // Get Sequencing By ID
  loadSequenceById(id) {
    this.messaging.getSequenceById(id).subscribe((data: any) => {
      console.log(data, 'result message by id list');
      this.allSequencebyId = data;
      this.sequenceName = data.name;
      this.editSequenceForm = this.formBuilder.group({
        editSequenceName: this.allSequencebyId.name,
        editSequenceId: this.allSequencebyId.id,
      });
    });
  }

  editSequenceInput() {
    this.editSequence = true;
  }

  // add Sequencing(s)
  updtaeSequencing() {
    // Submitting the Email Json to the server
    try {
      const updtaeSequencingData = {
        id: this.editSequenceForm.value.editSequenceId,
        name: this.editSequenceForm.value.editSequenceName,
        orgID: this.gs.orgID,
      };
      console.log(updtaeSequencingData);
      this.messaging.createSequence(updtaeSequencingData).subscribe(
        (result: any) => {
          console.log(result, ' results');
          if (result) {
            this.message.header = 'Submitted';
            this.message.text = result.message;
            this.message.type = 'success';
            this.gs.alert(this.message);
            this.editSequence = false;
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
    } catch (error) {
      if (error) {
        this.message.header = 'Failed';
        this.message.text = error.message;
        this.message.type = 'error';
        this.gs.alert(this.message);
      }
    }
  }

  get sequenceStep() {
    return this.sequenceStepForm.controls;
  }

  // add Sequencing(s)
  addSequencingStep() {
    console.log(this.sequenceStepForm.value.sequenceStepFrequency, 'Frequency');

    // Submitting the Email Json to the server
    try {
      const sequencingStepData = {
        content: this.sequenceStepTemplateForm.value.sequenceStepTemplate,
        daysInterval: this.sequenceStepForm.value.sequenceStepDays,
        execDate: this.sequenceStepForm.value.sequenceStepDate,
        execTime: this.sequenceStepForm.value.sequenceStepTime,
        id: 0,
        orgID: this.gs.orgID,
        parentID: this.editSequenceForm.value.editSequenceId,
        position: 0,
        title: this.sequenceStepForm.value.sequenceStepTitle,
      };
      console.log(sequencingStepData, 'sequencingStepData');
      this.messaging.createMailSequence(sequencingStepData).subscribe(
        (result: any) => {
          console.log(result, ' results');
          if (result) {
            this.message.header = 'Submitted';
            this.message.text = result.message;
            this.message.type = 'success';
            this.gs.alert(this.message);
            this.editSequence = false;
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
    } catch (error) {
      if (error) {
        this.message.header = 'Failed';
        this.message.text = error.message;
        this.message.type = 'error';
        this.gs.alert(this.message);
      }
    }
  }

  submitSeq() {
    this.addSequencingStep();
    this.sequenceStepForm.reset();
    this.sequenceStepTemplateForm.reset();
  }

  LoadMailSequencingByParentId(id) {
    this.messaging.getMailSequencingByParentId(id).subscribe((data: any) => {
      console.log(data, 'result Mail Seq by by id list');
      this.allMailSequencebyId = data;
    });
  }
}
