import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  noWhitespaceValidator } from '../../../../utils/no-whitespace.validator'
import { ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { DealPipelineWorkflowService } from 'src/app/services/settings-services/deal-pipeline-workflow.service';
import { RolesService } from 'src/app/services/settings-services/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deals-pipeline-view',
  templateUrl: './deal-pipeline-view.component.html',
  styleUrls: ['./deal-pipeline-view.component.css'],
})
export class DealsPipelineViewComponent implements OnInit {
  id: any;
  allDealStages: any;
  allDealStagesByWorkflow: any;
  dealPipelineWorkflowForm: any;
  allDealWorkflow: any;
  message: any = {};
  dealStagesForm: FormGroup;
  editWorkflowName: string;
  stageDocs = [];
  rolesName = [];
  prevStageFormState = {}
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true
  };

  allRoles: any;

  editWorkflow = false;

  workflowStage = false;

  loadstage = false;
  disBtn = false;

  constructor(
    private roles: RolesService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private gs: GeneralService,
    private dealWorkflow: DealPipelineWorkflowService
  ) {
    this.route.params.subscribe(params => {
      this.id = params.id;
    });
    this.dealStagesForm = this.formBuilder.group({
      name: ['', [Validators.required, noWhitespaceValidator] ],
      docName: '',
      documents: [[], ],
      userCondition: [''],
      roleNames: [[], Validators.required],
      requireForecast: [ false],
      requireValue: [false],
      id: '',
      number: 0,
      canSkip: [false]
    });
    this.prevStageFormState = {...this.dealStagesForm.value};
    this.dealPipelineWorkflowForm = this.formBuilder.group({
      workflowName: '',
      createdDate: '',
      workflowId: '',
    });
  }

  ngOnInit() {
    // Scroll To top
    // $('html,body').animate({ scrollTop: 0 }, 0);
   this.fetchData()
    this.loadRolesList();

  }
  checkClicked(id) {    
    $(`#${id}`).click()    
  }
  fetchData() {
    this.loadAllDealStagesById(this.id);
    this.loadAllDealWorkflowById(this.id);
  }

  // Load Roles List
  loadRolesList() {
    this.roles.getAllRoles().subscribe((data: any) => {
      this.allRoles = data;
    });
  }

  // convenience getter for easy access to form fields
  get DealStages() {
    return this.dealStagesForm.controls;
  }
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  editWorkflowStage() {
    this.editWorkflow = true;
  }
  addDocs() {
    const value: string = this.dealStagesForm.value.docName;
    if(value.trim().length && this.stageDocs.indexOf(value) === -1) {
      this.stageDocs.push(value);
      this.dealStagesForm.controls.docName.reset()
    }
  }
  removeDoc(name) {
    const index = this.stageDocs.indexOf(name);
    this.stageDocs.splice(index, 1)
  }
  addDealStage() {
    if (this.dealStagesForm.valid) {
      const stagesData = {
        ...this.dealStagesForm.value,
        documents: this.stageDocs,
        orgID: this.gs.orgID,
       dealsPipelineID: this.id,
       roleNames: this.dealStagesForm.value.roleNames.map(role => role.name),
      };
      this.disBtn = true;
      this.dealWorkflow.createDealStage(stagesData).subscribe(
        (result: any) => {
          this.id = result.id;
          this.fetchData();
          this.disBtn = false;
          this.dealStagesForm.reset();
          this.stageDocs = []
          $('.close').click()
          this.gs.sweetAlertSucess(result.message);
        }, error => {
          if (error) {
            this.dealStagesForm.reset();
            this.disBtn = false;
            $('.close').click()
            const msg = error.error.message ? error.error.message : 'Error occured try again';
            this.gs.sweetAlertError(msg)
          }
        }
      );
    }
  }

  updateDealStage() {
    const stagesData = {
      ...this.dealStagesForm.value,
      dealsPipelineID: this.id,
      roleNames: this.dealStagesForm.value.roleNames.map(role => role.name),
    };
    this.disBtn = true;
    this.dealWorkflow.editDealStage(stagesData).subscribe(
      (result: any) => {
        this.id = result.id;
        this.fetchData();
        this.gs.sweetAlertSucess(result.message);
      }, error => {
        this.gs.sweetAlertError(this.gs.getErrMsg(error))
      }).add(()=> {
        this.disBtn = false;
        this.dealStagesForm.reset();
        this.stageDocs = []
        $('.close').click()
    });
  }

  loadStages(stage) {
    this.loadstage = true;
    this.allDealStages = stage;    
    this.dealStagesForm.patchValue(stage);
    this.stageDocs = stage.documents;
    const roleList = []
    if(stage && this.allRoles) {
      stage.roleNames.forEach(role => {
        const findRole = this.allRoles.find(rol => rol.name == role)
        roleList.push(findRole);
      })
      this.dealStagesForm.controls.roleNames.setValue(roleList);
    }
  }
  resetAddStage() {
    this.loadstage = false;
    this.stageDocs = []
    this.dealStagesForm.patchValue(this.prevStageFormState);
  }

  // update workflow
  updateWorkflow() {
    // Submitting the Email Json to the server
    const workflowData = {
      id: this.dealPipelineWorkflowForm.value.workflowId,
      name: this.dealPipelineWorkflowForm.value.workflowName,
      orgID: this.gs.orgID,
      createdDate: this.dealPipelineWorkflowForm.value.createdDate,
    };
    this.disBtn = true;
    this.dealWorkflow.editDealWorkflow(workflowData).subscribe(
      (result: any) => {
        if (result) {
          this.gs.sweetAlertSucess(result.message);
          this.loadAllDealWorkflowById(this.id);
          this.editWorkflow = false;
          this.disBtn = false;
        }
      }, error => {
        if (error) {
          this.disBtn = false;
          const msg = error.error.message ? error.error.message : 'Error occured try again';
          this.gs.sweetAlertError(msg)
        }
      }
    );
  }

  loadAllDealStagesById(id) {
    this.dealWorkflow
      .getDealsPipelineStageByDealId(id)
      .subscribe((data: any) => {
        this.allDealStagesByWorkflow = data;
      });
  }



  loadAllDealWorkflowById(id) {
    this.dealWorkflow
      .getDealsPipelineWorkflowById(id)
      .subscribe((data: any) => {
        console.log(data, 'result deal workflow list');
        this.allDealWorkflow = data;
        this.editWorkflowName = data.name;
        this.dealPipelineWorkflowForm = this.formBuilder.group({
          workflowName: this.allDealWorkflow.name,
          workflowId: this.allDealWorkflow.id,
          createdDate: this.allDealWorkflow.createdDate,
        });
      });
  }

  // For Deleting Sequencing on the list
  deleteDealStage({name, id}) {
    console.log('delete');
    const observable = this.dealWorkflow.deleteDealsPipelineStage(id)
    this.gs.sweetAlertAsync('warning', `Delete ${name}`, observable)
    .then(res => {
      console.log(res);
      if(res.value && res.value.status) {
      if(res.value.status === 'success') {
        this.id = res.value.id;
        this.fetchData();
        this.gs.sweetAlertSucess(res.value.message)
      } else {
        this.gs.sweetAlertError(this.gs.getErrMsg(res.value.error));
      }
    }
    })
  }
  updateWorkflowStatus(status) {
    const msg = status === 0 ? 'Activate' : 'Deactive';
    const name = this.dealPipelineWorkflowForm.value.workflowName;
    const observable = this.dealWorkflow.updateDealWorkflowStatus(this.id)
     this.gs.sweetAlertAsync("question",`${msg} ${name}`, observable)
     .then(res =>  {
         if(res.value && res.value.status) {
           if(res.value.status === 'success') {
             console.log('success', res.value);
             this.loadAllDealWorkflowById(this.id);
             this.gs.sweetAlertSucess(res.value.message)
           } else {
             this.gs.sweetAlertError(this.gs.getErrMsg(res.value.error));
             console.log('success', res.value);
           }
         }
     })
   }

  
}
