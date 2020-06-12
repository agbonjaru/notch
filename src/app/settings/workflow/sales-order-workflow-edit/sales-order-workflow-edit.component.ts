import { Component, OnInit } from "@angular/core";
import { selectConfig } from "src/app/utils/utils";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GeneralService } from "src/app/services/general.service";
import { ActivatedRoute, Router } from "@angular/router";
import { RolesService } from "src/app/services/settings-services/roles.service";
import { SalesOrderWorkflowService } from "src/app/services/settings-services/sales-order-workflow.service";
import $ from "jquery";

@Component({
  selector: "app-sales-order-workflow-edit",
  templateUrl: "./sales-order-workflow-edit.component.html",
  styleUrls: ["./sales-order-workflow-edit.component.css"],
})
export class SalesOrderWorkflowEditComponent implements OnInit {
  id: any;

  rolesName: any;

  salesOrderWorkflowForm: FormGroup;

  salesOrderTransitionForm: FormGroup;

  message: any = {};

  allSalesWorkFlow: any;
  allSalesTransition: any;

  allTransitionList = [];

  allSalesStages: any;
  startSalesStages: any;

  allRoles: any;

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

  defaultTransition = [];
  editNewTransIndex;
  editTrans = false;

  constructor(
    private gs: GeneralService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private roles: RolesService,
    private router: Router,
    private salesOrder: SalesOrderWorkflowService
  ) {
    this.route.params.subscribe((params) => {
      this.id = params.id;
      this.loadAllStages(); // Load Stages
    });
  }

  ngOnInit() {
    // Scroll To top
    $("html,body").animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Industry
    this.salesOrderWorkflowForm = this.formBuilder.group({
      salesWorkflowName: ["", Validators.required],
      salesWorkflowId: "",
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

    this.loadRolesList();
  }

  /*
   *Subscriptions
   */

  loadAllStages() {
    this.salesOrder.getStagesByOrgId().subscribe((data: any) => {
      this.allSalesStages = data;
      this.loadSalesWorkflowById(this.id);
    });
  }

  loadRolesList() {
    this.roles.getAllRoles().subscribe((data: any) => {
      this.allRoles = data;
    });
  }

  loadSalesWorkflowById(id) {
    this.salesOrder.getSalesWorkFlowsById(id).subscribe((data: any) => {
      this.allSalesWorkFlow = data.salesWorkflow;
      this.allSalesTransition = data.transitions;
      console.log(data, "allworkflowdata");
      this.salesOrderWorkflowForm.patchValue({
        salesWorkflowName: this.allSalesWorkFlow.name,
        salesWorkflowId: this.allSalesWorkFlow.id,
      });
      this.setDefaultTransitions(data.transitions);
    });
  }

  /*
   * Transition and Calls
   */

  setDefaultTransitions(transitions) {
    // console.log(transitions, "transition");
    for (const transition of transitions) {
      let stages = transition.stages.map((stage) => {
        stage.id = 0;
        return stage;
      });
      transition.stages = stages;
      transition.id = 0;
      // console.log(transition, "transition");
      // delete transition.stages;
      // console.log(transition, "tyuff");

      switch (transition.name) {
        case "Start Transition":
          this.defaultTransition.push({ ...transition });
          break;
        case "End Transition":
          this.defaultTransition.push({
            ...transition,
          });
          break;
        default:
          this.allTransitionList.push({ ...transition });
          break;
      }
      this.transStartStages.push(transition.startStageName);
    }
    // Reset Startstage list
    this.startSalesStages = this.allSalesStages.filter(
      (res) =>
        this.transStartStages.indexOf(res.name) === -1 &&
        res.name !== "Application Start" &&
        res.name !== "Application End"
    );
  }

  setNextStages(stageName, transType) {
    let selectedStage = stageName.split("+");
    // Set other stages
    if (transType !== "End Transition") {
      this.otherStages = this.allSalesStages.filter(
        (res) =>
          res.id !== Number(selectedStage[0]) &&
          res.name !== selectedStage[1] &&
          res.name !== "Application Start" &&
          res.name !== "Application End"
      );
      this.salesOrderTransitionForm.controls.transitionNextStage.value
        ? this.salesOrderTransitionForm.controls.transitionNextStage.setValue(
            ""
          )
        : null;
    }
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
      id: 0,
      name: this.salesOrderTransitionForm.value.transitionName,
      orgID: this.gs.orgID.toString(),
      roleName,
      stages,
      salesOrderID: Number(this.salesOrderWorkflowForm.value.salesWorkflowId),
      documents,
      startStageID: Number(
        this.salesOrderTransitionForm.value.transitionStartStage.split("+")[0]
      ),
      startStageName: this.salesOrderTransitionForm.value.transitionStartStage.split(
        "+"
      )[1],
    };

    return transitionData;
  }

  addTransition() {
    let validation = "";
    this.defaultTransition.forEach((res, i) => {
      if (i == 0) {
        validation +=
          res.stages.length === 0
            ? "Kindly update the Start Transition Details Before Adding New Transition! <br/> "
            : "";
      } else {
        validation +=
          res.startStageID === null || res.startStageName === null
            ? "Kindly update the End Transition Details  Before Adding New Transition! "
            : "";
      }
    });

    if (!validation) {
      if (this.salesOrderTransitionForm.valid) {
        let transitionDetails = { ...this.transitionDetails, number: "0" };
        console.log(transitionDetails, "transDetailsAddNew");
        this.allTransitionList.push(transitionDetails);

        this.transStartStages.indexOf(transitionDetails.startStageName) === -1
          ? this.transStartStages.push(transitionDetails.startStageName)
          : null;

        this.salesOrderTransitionForm.reset();
        this.editTrans = false;
        this.documents = [];
      }
      // Reset Startstage list
      this.startSalesStages = this.allSalesStages.filter(
        (res) =>
          this.transStartStages.indexOf(res.name) === -1 &&
          res.name !== "Application Start" &&
          res.name !== "Application End"
      );
      setTimeout(() => {
        this.salesOrderTransitionForm.reset();
      }, 2000);
    } else {
      this.gs.sweetAlertError(validation);
    }
  }

  updateTransition(transType) {
    if (this.salesOrderTransitionForm.valid) {
      console.log(this.transitionDetails, "transDetails");
      switch (transType) {
        case "Start Transition":
          this.defaultTransition[0] = {
            ...this.defaultTransition[0],
            ...this.transitionDetails,
          };
          break;
        case "End Transition":
          this.defaultTransition[1] = {
            ...this.defaultTransition[1],
            ...this.transitionDetails,
          };
          break;

        default:
          this.allTransitionList[this.editNewTransIndex] = {
            ...this.allTransitionList[this.editNewTransIndex],
            ...this.transitionDetails,
          };
          break;
      }

      this.transStartStages.indexOf(this.transitionDetails.startStageName) ===
      -1
        ? this.transStartStages.push(this.transitionDetails.startStageName)
        : null;
      this.salesOrderTransitionForm.reset();
      this.editTrans = false;
      this.documents = [];
    }

    // Reset Startstage list
    this.startSalesStages = this.allSalesStages.filter(
      (res) =>
        this.transStartStages.indexOf(res.name) === -1 &&
        res.name !== "Application Start" &&
        res.name !== "Application End"
    );
  }

  // For Deleting Sequencing on the list
  deleteTransition(details) {
    this.allTransitionList = this.allTransitionList.filter(
      (res) => res.startStageID !== details.startStageID
    );
    this.transStartStages = this.transStartStages.filter(
      (res) => res !== details.startStageName
    );
    // Reset Startstage list
    this.startSalesStages = this.allSalesStages.filter(
      (res) =>
        this.transStartStages.indexOf(res.name) === -1 &&
        res.name !== "Application Start" &&
        res.name !== "Application End"
    );
  }

  loadFormTransition(transition, transType) {
    this.editTrans = true;
    this.documents = transition.documents;

    // Set other stages
    if (transType !== "EndTrans") {
      this.otherStages = this.allSalesStages.filter(
        (res) =>
          res.id !== Number(transition.startStageID) &&
          res.name !== transition.startStageName &&
          res.name !== "Application Start" &&
          res.name !== "Application End"
      );
    }

    // remove loaded trans from the list
    this.transStartStages = this.transStartStages.filter(
      (res) => res !== transition.startStageName
    );

    // New Transition index - on edit
    typeof transType !== "string" ? (this.editNewTransIndex = transType) : null;

    this.startEditStage = this.allSalesStages.filter(
      (res) =>
        (res.name === transition.startStageName &&
          res.id === transition.startStageID) ||
        (this.transStartStages.indexOf(res.name) === -1 &&
          res.name !== "Application Start" &&
          res.name !== "Application End")
    );

    const data = {
      transitionName: transition.name,
      transitionStartStage:
        transition.startStageID + "+" + transition.startStageName,
      transitionNextStage: transition.stages.map((st) => {
        return {
          id: st.stageID,
          name: st.stageName,
        };
      }),
      transitionDocument: transition.document,
      transitionPermission: transition.roleName.map((st) => ({
        name: st,
      })),
      transitionNumber: transition.number,
      transitionId: transition.id,
    };
    console.log(data, "datsdsa");
    this.salesOrderTransitionForm.patchValue(data);
  }

  reset() {
    this.salesOrderTransitionForm.reset();
    this.documents = [];
    this.editTrans = false;
  }

  updateWorkflow() {
    let allStartStages = [];
    let transEndStages = [];
    let validation = "";

    const workflowData = {
      id: this.allSalesWorkFlow.id,
      name: this.salesOrderWorkflowForm.value.salesWorkflowName,
      dealAttach: this.allSalesWorkFlow.dealAttach,
      orgID: this.allSalesWorkFlow.orgID,
      createdDate: this.allSalesWorkFlow.createdDate,
      noOfCopies: this.allSalesWorkFlow.noOfCopies,
      transitionOrder: this.allSalesWorkFlow.transitionOrder,
      useStat: this.allSalesWorkFlow.useStat,
    };
    const data = {
      salesWorkflow: { ...workflowData },
      transitions: this.allTransitionList
        ? [...this.defaultTransition, ...this.allTransitionList]
        : [...this.defaultTransition],
    };

    this.defaultTransition.forEach((res, i) => {
      if (i == 0) {
        validation +=
          res.stages.length === 0
            ? "Kindly update the Start Transition Details! <br/> "
            : "";
      } else {
        validation +=
          res.startStageID === null || res.startStageName === null
            ? "Kindly update the End Transition Details! "
            : "";
      }
    });

    // Validate Start Stages appears once per transition  also fetch start and end stages
    data.transitions.forEach((res) => {
      // Validate Start Stages appears once per transition and save start stages too
      allStartStages.indexOf(res.startStageName) === -1
        ? allStartStages.push(res.startStageName)
        : (validation += `${res.startStageName} is start stage for more than one transition`);

      // Get all end stages
      res.stages.forEach((res2) => {
        transEndStages.indexOf(res2.stageName) === -1 &&
        res2.stageName !== "Application End"
          ? transEndStages.push(res2.stageName)
          : null;
      });
    });

    console.log(transEndStages, "this.transStartStages", allStartStages);

    transEndStages.forEach((res) => {
      validation +=
        allStartStages.indexOf(res) === -1
          ? `${res} stage must start a transition as it is a destination stage`
          : "";
    });

    // console.log(transEndStages, "re");

    if (!validation) {
      console.log(data, "data");
      this.disBtn = true;
      this.salesOrder.editSalesWorkflow(data).subscribe(
        (result: any) => {
          this.gs.sweetAlertSucess(result.message);
          this.disBtn = false;
          this.router.navigate(["/settings/sales-workflow"]);
        },
        (error) => {
          if (error) {
            const msg = error.error.message
              ? error.error.message
              : "Error occured try again";
            this.gs.sweetAlertError(msg);
            this.disBtn = false;
          }
        }
      );
    } else {
      this.gs.sweetAlertError(validation);
    }
  }
}
