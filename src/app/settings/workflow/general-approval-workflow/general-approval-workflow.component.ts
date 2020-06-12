import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-general-approval-workflow',
  templateUrl: './general-approval-workflow.component.html',
  styleUrls: ['./general-approval-workflow.component.css'],
})
export class GeneralApprovalWorkflowComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "Full Name", key: "name" },
      { title: "Creation Date", key: "createdDate" },

      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},

      singleActions: [
        'View',
        "Edit",
        "Delete",
      ],
      bulkActions: [
      ]
    }
  };
  workflowForm: FormGroup;

  message: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private gs: GeneralService
  ) {
    $.getScript('../../../assets/js/datatableScript.js');
  }
  dataFeedBackObsListener = data => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "Delete") {
        //  this.deleteDealWorkflow(data.data)

        } else if (data.action === "Edit") {

        //  this.editDealWorkflow(data.data.id)


        }
        break;
      default:
        break;
    }
  };

  ngOnInit() {
    // forms validation for Adding Leads Lists
    this.workflowForm = this.formBuilder.group({
      workflowName: '',
    });
  }


  /** General */
  submit() {}

  addWorkfow() {

  }

  /**
   * General Approval WorkFlow
   */
}
