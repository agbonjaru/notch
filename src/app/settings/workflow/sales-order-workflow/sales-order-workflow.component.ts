import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as $ from "jquery";
import { GeneralService } from "src/app/services/general.service";
import Swal from "sweetalert2";

import { SalesOrderWorkflowService } from "./../../../services/settings-services/sales-order-workflow.service";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-sales-order-workflow",
  templateUrl: "./sales-order-workflow.component.html",
  styleUrls: ["./sales-order-workflow.component.css"],
})
export class SalesOrderWorkflowComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Index", key: "index" },
      { title: "Full Name", key: "name" },
      { title: "Creation Date", key: "createdDate" },

      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},

      singleActions: [
        {
          title: "Edit",
          showIf: (a, b) => this.gs.isAuthorized("EDIT_SALESORDER_WORKFLOW"),
        },
      ],
      bulkActions: [],
    },
  };
  salesOrderWorkflowForm: FormGroup;

  salesOrderStagesForm: FormGroup;

  message: any = {};

  allSalesWorkFlow: any;

  allSalesStages: any;

  pattern = /^[\w-_ \-]*$/;

  constructor(
    public gs: GeneralService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salesOrder: SalesOrderWorkflowService
  ) {}

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        // if (data.action === "Delete") {
        //   this.deleteSalesWorkflow(data.data);
        // } else
        if (data.action === "Edit") {
          this.editSalesWorkflow(data.data.id);
        }
        break;
      default:
        break;
    }
  };
  ngOnInit() {
    // Scroll To top
    $("html,body").animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Industry
    this.salesOrderWorkflowForm = this.formBuilder.group({
      salesWorkflowName: ["", Validators.required],
      dealAttach: "",
    });

    // forms validation for Adding Industry
    this.salesOrderStagesForm = this.formBuilder.group({
      salesStagesName: ["", Validators.required],
    });

    this.loadAllStages();
    this.loadAllWorkflow(true);
  }

  // convenience getter for easy access to form fields
  get salesOrderWorkflow() {
    return this.salesOrderWorkflowForm.controls;
  }
  disBtnWorkflow = false;

  handleCreateNavigation() {
    if (!this.allSalesStages.length) {
      this.gs.sweetAlertError(
        "A Stage has to be created before a workflow can be created. Please create a stage"
      );
    } else {
      this.router.navigate(["/settings/sales-workflow-create"]);
    }
  }

  addWorkflow() {
    if (
      this.salesOrderWorkflowForm.valid &&
      this.salesOrderWorkflowForm.value.salesWorkflowName.trim()
    ) {
      const workflowData = {
        id: 0,
        name: this.salesOrderWorkflowForm.value.salesWorkflowName,
        dealAttach: this.salesOrderWorkflowForm.value.dealAttach,
        orgID: this.gs.orgID,
      };
      this.disBtnWorkflow = true;
      this.salesOrder.createSalesWorkflow(workflowData).subscribe(
        (result: any) => {
          this.disBtnWorkflow = false;
          this.loadAllWorkflow();
          $(".close").click();
          this.salesOrderWorkflowForm.reset();
          this.gs.sweetAlertSucess(result.message);
        },
        (error) => {
          if (error) {
            this.disBtnWorkflow = false;
            $(".close").click();
            this.salesOrderWorkflowForm.reset();
            const msg = error.error.message
              ? error.error.message
              : "Error occured try again";
            this.gs.sweetAlertError(msg);
          }
        }
      );
    }
  }

  loadAllWorkflow(auto = false) {
    this.salesOrder.getWorkflowByOrgId().subscribe((data: any) => {
      this.allSalesWorkFlow = data;
      this.dataTable.dataChangedObs.next(true);
      if (auto) {
        $.getScript("../../../assets/js/datatableScript.js");
      }
    });
  }

  editSalesWorkflow(id) {
    // router to the edit page
    console.log(id);
    this.router.navigate(["settings/sales-workflow-edit", id]);
  }

  /*
   * Stages
   */

  // convenience getter for easy access to form fields
  get salesOrderStages() {
    return this.salesOrderStagesForm.controls;
  }

  disBtnStage = false;
  addStage() {
    if (
      this.salesOrderStagesForm.valid &&
      this.salesOrderStagesForm.value.salesStagesName.trim()
    ) {
      const stageData = {
        id: 0,
        name: this.salesOrderStagesForm.value.salesStagesName,
        orgID: this.gs.orgID,
      };
      this.disBtnStage = true;
      this.salesOrder.createSalesStages(stageData).subscribe(
        (result: any) => {
          this.disBtnStage = false;
          $(".close").click();
          this.loadAllStages();
          this.salesOrderStagesForm.reset();
          this.gs.sweetAlertSucess(result.message);
        },
        (error) => {
          if (error) {
            this.disBtnStage = false;
            $(".close").click();
            this.salesOrderStagesForm.reset();
            const msg = error.error.message
              ? error.error.message
              : "Error occured try again";
            this.gs.sweetAlertError(msg);
          }
        }
      );
    }
  }

  loadAllStages() {
    this.salesOrder.getStagesByOrgId().subscribe((data: any) => {
      this.allSalesStages = data;
    });
  }

  // For Deleting Sequencing on the list
  deleteSalesStages({ name, id }) {
    this.gs.sweetAlertFileDeletions(name + " Stage").then((res) => {
      if (res.value) {
        this.salesOrder.deleteSalesStage(id).subscribe(
          (data: any) => {
            this.gs.sweetAlertSucess(data.message);
            this.loadAllStages();
          },
          (error) => {
            const msg = error.error.message
              ? error.error.message
              : "Error occured try again";
            this.gs.sweetAlertError(msg);
          }
        );
      }
    });
  }
}
