import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { DealPipelineWorkflowService } from 'src/app/services/settings-services/deal-pipeline-workflow.service';
import DateUtils from 'src/app/utils/date';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-deals-pipeline-workflow',
  templateUrl: './deals-pipeline-workflow.component.html',
  styleUrls: ['./deals-pipeline-workflow.component.css'],
})
export class DealsPipelineWorkflowComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      // { title: "checkbox", key: "checkbox" },
      { title: "Name", key: "name" },
      { title: "Creation Date", key: "createdDate" },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},

      singleActions: [
        "Edit",
        {title: 'Activate', showIf:(fieldText,rowData) => rowData.status === 0},
        {title: 'Deactivate', showIf:(fieldText,rowData) => rowData.status === 1},

      ],
      bulkActions: [
      ]
    }
  };
  dealPipelineWorkflowForm: FormGroup;
  message: any = {};
  allWorkflowDeal: any;
  disBtn = false
  dateUtils = new DateUtils;

  constructor(
    private gs: GeneralService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dealWorkflow: DealPipelineWorkflowService
  ) {}
  dataFeedBackObsListener = data => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "Activate" || data.action === 'Deactivate') {
          this.updateWorkflowStatus(data.data)

        } else if (data.action === "Edit") {

          this.editDealWorkflow(data.data.id)


        }
        break;
      default:
        break;
    }
  };

  ngOnInit() {
    // Scroll To top
    $('html,body').animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Industry
    this.dealPipelineWorkflowForm = this.formBuilder.group({
      dealWorkflowName: ['', Validators.required],
    });
    this.loadAllWorkflow();
  }



  // convenience getter for easy access to form fields
  get DealPipelineWorkflow() {
    return this.dealPipelineWorkflowForm.controls;
  }

  submitted = false;
  addDealWorkflow() {
    this.submitted = true;
    if (!this.getDisBtn()) {
        const workflowData = {
          id: 0,
          name: this.dealPipelineWorkflowForm.value.dealWorkflowName,
          orgID: this.gs.orgID,
        };
        this.disBtn = true;
        this.dealWorkflow.createDealWorkflow(workflowData).subscribe(
          (result: any) => {
            if (result) {
              this.disBtn = false;
              document.getElementById('closeAddWorkflow').click();
              this.loadAllWorkflow(false);
              this.dealPipelineWorkflowForm.reset();
              this.gs.sweetAlertSucess(result.message)
            }
          }, error => {
            if (error) {
              this.disBtn = false;
              this.dealPipelineWorkflowForm.reset();
              document.getElementById('closeAddWorkflow').click();
              const msg = error.error.message ? error.error.message : 'Error occured try again';
              this.gs.sweetAlertError(msg)
            }
          }
        );
    }
  }

  getDisBtn() {
   return this.dealPipelineWorkflowForm.invalid ||  !(
     this.dealPipelineWorkflowForm.value.dealWorkflowName.trim().length)
  }

  loadAllWorkflow(auto = true) {
    this.dealWorkflow.getDealsPipelineWorkflow().subscribe((data: any) => {
      this.allWorkflowDeal = data;
      this.dataTable.dataChangedObs.next(true)
      if(auto) {
        $.getScript('../../../assets/js/datatableScript.js');
      }
    });
  }

  editDealWorkflow(id) {
    this.router.navigate(['settings/deals-workflow', id]);
  }


  // For Deleting Sequencing on the list
  updateWorkflowStatus({name, id, status, stageOrder}) {
   const msg = status === 0 ? 'Activate' : 'Deactive' 
   const observable = this.dealWorkflow.updateDealWorkflowStatus(id)
    this.gs.sweetAlertAsync("question",`${msg} ${name}`, observable)
    .then(res =>  {
        if(res.value && res.value.status) {
          if(res.value.status === 'success') {
            console.log('success', res.value);
            this.loadAllWorkflow(false);
            this.gs.sweetAlertSucess(res.value.message)
          } else {
            this.gs.sweetAlertError(this.gs.getErrMsg(res.value.error));
            console.log('success', res.value);
          }
        }
    })
  }

  
}
