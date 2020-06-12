import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { LeadworkflowSettingsService } from "src/app/services/settings-services/leadworkflow-settings.service";
import { GeneralService } from "src/app/services/general.service";
import $ from "jquery";
@Component({
  selector: "app-lead-workflow",
  templateUrl: "./lead-workflow.component.html",
  styleUrls: ["./lead-workflow.component.css"]
})
export class LeadWorkflowComponent implements OnInit {
  category: string;
  workflowList: {
    cold: [],
    warm: [],
    hot: []
  };

  disBtn;
  workflowForm = new FormGroup({
    id: new FormControl(""),
    name: new FormControl("", Validators.required),
    convertsToDeal: new FormControl(false),
    convertsToClient: new FormControl(false)
  });
  prevFormState = this.workflowForm;
  constructor(
    private leadworkflowSetinSrv: LeadworkflowSettingsService,
    private gs: GeneralService
  ) {}

  ngOnInit() {
    this.getWorkflow();
  }
  getWorkflow() {
    this.leadworkflowSetinSrv.fetchWorkflow().subscribe((res: any) => {
      const workflowList = res.success ? res.payload : null;
      this.workflowList = { cold: [], hot: [], warm: []}
      if (workflowList) {
        workflowList.forEach(flow => {
          this.workflowList[flow.category] = [
            flow,
            ...this.workflowList[flow.category]
          ];

        });
      }
    });
  }

  openAddStep(type) {
    this.workflowForm.setValue({
      id: '',
      name: '',
      convertsToDeal: false,
      convertsToClient: false,
    })
    this.category = type;
  }
  addStep() {
    if (this.workflowForm.valid) {
      this.disBtn = true;
      const { category, workflowForm } = this;
      this.leadworkflowSetinSrv
        .addWorkflow({ category, ...workflowForm.value })
        .subscribe((response: any) => {
          
            if (response["success"]) {
              const { payload } = response;
              $(".close").click();
              this.gs.sweetAlertSucess("Step Added Successfully");
              this.workflowList[payload.category] = [
                ...this.workflowList[payload.category] ,
                payload
              ]

              this.workflowForm.reset();
              this.disBtn = false;
            }
          },
          error => {
            this.disBtn = false;
            this.workflowForm.reset();
            $(".close").click();
            const msg = error.error.message
              ? error.error.message
              : "Error occured try again";
            this.gs.sweetAlertError(msg);
          }
        );
    }
  }
  openUpdateStep(step) {
    this.category = step.category;
    const data = {
      ...step,
      convertsToDeal: step.convertsToDeal === "true",
      convertsToClient: step.convertsToClient === "true"
    };
    this.workflowForm.patchValue(data);
  }
  updateStep() {
    const payload = {...this.workflowForm.value, category: this.category};
    if (this.workflowForm.valid) {
      this.disBtn = true;
      this.leadworkflowSetinSrv
        .updateWorkflow(payload)
        .subscribe(
          () => {
            $(".close").click();
            this.gs.sweetAlertSucess("Step Added Successfully");
            this.getWorkflow();
            this.workflowForm.reset();
            this.disBtn = false;
          },
          error => {
            this.disBtn = false;
            this.workflowForm.reset();
            $(".close").click();
            const msg = error.error.message
              ? error.error.message
              : "Error occured try again";
            this.gs.sweetAlertError(msg);
          }
        );
    }
  }
  deleteStep({ name, id}) {
    this.gs.sweetAlertFileDeletions(name).then(res => {
      if(res.value) {
        this.leadworkflowSetinSrv.deleteWorkflow(id).subscribe(() => {
          this.gs.sweetAlertSucess('Step Deleted Successfully');
          this.getWorkflow();
        }, error => {
          const msg = error.error.message
          ? error.error.message
          : "Error occured try again";
        this.gs.sweetAlertError(msg);
        })
      }
    })
  }
}
