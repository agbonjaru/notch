import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import * as $ from "jquery";
import { GeneralService } from "src/app/services/general.service";
import { RolesService } from "src/app/services/settings-services/roles.service";
import Swal from "sweetalert2";

import { SalesOrderWorkflowService } from "./../../../../services/settings-services/sales-order-workflow.service";
import { selectConfig } from "./../../../../utils/utils";

@Component({
  selector: "app-sales-order-view",
  templateUrl: "./sales-order-view.component.html",
  styleUrls: ["./sales-order-view.component.css"],
})
export class SalesOrderViewComponent implements OnInit {
  id: any;

  rolesName: any;

  salesOrderWorkflowForm: FormGroup;

  salesOrderTransitionForm: FormGroup;

  message: any = {};

  editWorkflow = false;

  editWorkflowName: any;

  allSalesWorkFlow: any;

  allTransitionList: any;

  allSalesStages: any;
  startSalesStages: any;

  allRoles: any;
  allTransition: any;

  disBtn = false;

  otherStages = [];

  Stageconfig = { ...selectConfig, placeholder: "Choose Stage(s)" };

  dropdownSettings = {
    singleSelection: false,
    idField: "id",
    textField: "name",
    // enableCheckAll: false,
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 10,
    allowSearchFilter: true,
  };

  documents = [];
  transStartStages = [];
  startEditStage = [];
  pattern = /^[\w-_ \-]*$/;

  constructor(
    private gs: GeneralService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private roles: RolesService,
    private salesOrder: SalesOrderWorkflowService
  ) {
    this.route.params.subscribe((params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    // Scroll To top
    $("html,body").animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Industry
    this.salesOrderWorkflowForm = this.formBuilder.group({
      salesWorkflowName: "",
      salesWorkflowId: "",
      createdDate: "",
    });

    // forms validation for Adding Industry
    this.salesOrderTransitionForm = this.formBuilder.group({
      transitionName: ["", Validators.required],
      transitionStartStage: ["", Validators.required],
      transitionNextStage: ["", Validators.required],
      transitionDocument: "",
      transitionPermission: [[], Validators.required],
      transitionNumber: "",
      transitionId: "",
    });

    this.loadSalesWorkflowById(this.id);
    this.loadTransitionBysalesOrderId(this.id);
    this.loadRolesList();
  }

  /*
   *WorkFlow
   */

  editWorkflowDetails() {
    this.editWorkflow = true;
  }

  updateWorkflow() {
    const workflowData = {
      createdDate: this.salesOrderWorkflowForm.value.createdDate,
      id: this.salesOrderWorkflowForm.value.salesWorkflowId,
      name: this.salesOrderWorkflowForm.value.salesWorkflowName,
      orgID: this.gs.orgID,
    };
    this.salesOrder.editSalesWorkflow(workflowData).subscribe(
      (result: any) => {
        this.editWorkflow = false;
        this.loadSalesWorkflowById(this.id);
        this.gs.sweetAlertSucess(result.message);
      },
      (error) => {
        if (error) {
          const msg = error.error.message
            ? error.error.message
            : "Error occured try again";
          this.gs.sweetAlertError(msg);
        }
      }
    );
  }

  loadSalesWorkflowById(id) {
    this.salesOrder.getSalesWorkFlowsById(id).subscribe((data: any) => {
      this.allSalesWorkFlow = data;
      this.editWorkflowName = data.name;
      this.salesOrderWorkflowForm = this.formBuilder.group({
        salesWorkflowName: this.allSalesWorkFlow.name,
        salesWorkflowId: this.allSalesWorkFlow.id,
        createdDate: this.allSalesWorkFlow.createdDate,
      });
    });
  }

  /*
   * Transition
   */

  setNextStages(stageName) {
    let selectedStage = stageName.split("+");
    this.otherStages = this.allSalesStages.filter(
      (res) =>
        res.id !== Number(selectedStage[0]) && res.name !== selectedStage[1]
    );
    this.salesOrderTransitionForm.controls.transitionNextStage.value
      ? this.salesOrderTransitionForm.controls.transitionNextStage.setValue("")
      : null;
  }

  addDocs(docName) {
    if (docName.trim().length && this.documents.indexOf(docName) === -1) {
      this.documents.push(docName);
      // Reset Form Element
      this.salesOrderTransitionForm.controls.transitionDocument.reset();
    }
  }

  removeDoc(name) {
    const docIndex = this.documents.indexOf(name);
    this.documents.splice(docIndex, 1);
  }

  // convenience getter for easy access to form fields
  get salesOrderTransition() {
    return this.salesOrderTransitionForm.controls;
  }

  private get transitionDetails() {
    let documents = this.documents;
    let roleName = [];
    this.salesOrderTransitionForm.value.transitionPermission.forEach(
      (element) => roleName.push(element.name)
    );
    let stages = [];
    this.salesOrderTransitionForm.value.transitionNextStage.forEach((element) =>
      stages.push({
        id: 0,
        stageID: element.id,
        stageName: element.name,
      })
    );

    const transitionData = {
      id: this.salesOrderTransitionForm.value.transitionId || 0,
      name: this.salesOrderTransitionForm.value.transitionName,
      number: "0",
      orgID: this.gs.orgID,
      roleName,
      stages,
      salesOrderID: this.salesOrderWorkflowForm.value.salesWorkflowId,
      documents,
      startStageID: this.salesOrderTransitionForm.value.transitionStartStage.split(
        "+"
      )[0],
      startStageName: this.salesOrderTransitionForm.value.transitionStartStage.split(
        "+"
      )[1],
    };

    return transitionData;
  }

  editTrans = false;

  activateTransModal() {
    this.editTrans = false;
    this.documents = [];
    this.salesOrderTransitionForm.reset();
  }

  addEditTransition(state = "createSalesTransitions") {
    if (this.salesOrderTransitionForm.valid) {
      console.log(this.transitionDetails, "transDetails");
      this.disBtn = true;
      this.salesOrder[state](this.transitionDetails).subscribe(
        (result: any) => {
          this.disBtn = false;
          $(".close").click();
          this.salesOrderTransitionForm.reset();
          this.documents = [];
          this.id = state === "createSalesTransitions" ? result.id : this.id;
          console.log(result, "result", this.id);
          this.loadTransitionBysalesOrderId(this.id);
          this.gs.sweetAlertSucess(result.message);
        },
        (error) => {
          if (error) {
            $(".close").click();
            this.disBtn = false;
            this.salesOrderTransitionForm.reset();
            const msg = error.error.message
              ? error.error.message
              : "Error occured try again";
            this.gs.sweetAlertError(msg);
          }
        }
      );
    }
  }

  updateTransition() {
    this.addEditTransition("editSalesTransition");
  }

  loadTransitionBysalesOrderId(id) {
    this.salesOrder.getTransitionBysalesOrderId(id).subscribe((data: any) => {
      if (data) {
        this.allTransitionList = data;
        data.forEach((res) => {
          this.transStartStages.push(res.startStageName);
        });
        this.loadAllStages();
        this.documents = [];
      }
    });
  }

  loadFormTransition(transition) {
    this.editTrans = true;
    this.allTransition = transition;
    this.documents = transition.documents;
    console.log(transition, "transition");

    // Set other stages
    this.otherStages = this.allSalesStages.filter(
      (res) =>
        res.id !== Number(this.allTransition.startStageID) &&
        res.name !== this.allTransition.startStageName
    );

    this.startEditStage = this.allSalesStages.filter(
      (res) =>
        (res.name === this.allTransition.startStageName &&
          res.id === this.allTransition.startStageID) ||
        this.transStartStages.indexOf(res.name) === -1
    );

    const data = {
      transitionName: this.allTransition.name,
      transitionStartStage:
        this.allTransition.startStageID +
        "+" +
        this.allTransition.startStageName,
      transitionNextStage: this.allTransition.stages.map((st) => ({
        id: st.stageID,
        name: st.stageName,
      })),
      transitionDocument: this.allTransition.document,
      transitionPermission: this.allTransition.roleName.map((st) => ({
        name: st,
      })),
      transitionNumber: this.allTransition.number,
      transitionId: this.allTransition.id,
    };
    this.salesOrderTransitionForm.patchValue(data);
  }

  // For Deleting Sequencing on the list
  deleteSalesTransition({ name, id }) {
    this.gs.sweetAlertFileDeletions(name).then((res) => {
      if (res.value) {
        this.allTransitionList = null;
        this.salesOrder.deleteSalesTransition(id).subscribe(
          (data: any) => {
            console.log(data, "data from deleted");
            this.loadTransitionBysalesOrderId(data.id);
            this.transStartStages = [];
            this.documents = [];
            // this.gs.sweetAlertSucess(data.message);
            Swal.fire("Deleted", data.message, "warning");
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

  loadAllStages() {
    this.salesOrder.getStagesByOrgId().subscribe((data: any) => {
      this.allSalesStages = data;
      this.startSalesStages = data.filter(
        (res) => this.transStartStages.indexOf(res.name) === -1
      );
    });
  }

  loadRolesList() {
    this.roles.getAllRoles().subscribe((data: any) => {
      this.allRoles = data;
    });
  }
}
