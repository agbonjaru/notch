import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { ClientTaskService } from 'src/app/services/task/client-task.service';
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { GeneralTaskService } from 'src/app/services/task/general-task.service';
import * as $ from 'jquery';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-client-tasks',
  templateUrl: './client-tasks.component.html',
  styleUrls: ['./client-tasks.component.css']
})
export class ClientComponent implements OnInit {

  spinnerType: string;
  spinnerStyle: any = {};
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  showSmallSpinner: boolean = false;
  smallSpinnerStyle: any = { 'margin-left': '' };

  p: number = 1;
  userID;
  allClientTasks: any = [];
  pageContext: any = [];
  pageContextID: any;
  selectedStatus: string = '';
  selectedClientID: string = '';
  currentClientID: string = '';
  clients: any = [];
  task: any = {};
  taskStatus: string = '';
  isLoading: boolean = false;

  constructor(
    store: Store<AppState>,
    private emailService: EmailService,
    private clientTaskSrv: ClientTaskService,
    private generalTaskSrv: GeneralTaskService,
    private generalSrv: GeneralService
  ) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    this.spinnerStyle = { top: '25%' };
    store.select("userInfo").subscribe(info => {
      this.userID = info.user.id;
    });
  }

  addTaskForm = new FormGroup({
    taskName: new FormControl('', Validators.required),
    remindDate: new FormControl('', Validators.required),
    remindTime: new FormControl('', Validators.required),
    assignedUserID: new FormControl(''),
    taskDescription: new FormControl('', Validators.required)
  })

  editTaskForm = new FormGroup({
    taskName: new FormControl('', Validators.required),
    remindDate: new FormControl('', Validators.required),
    remindTime: new FormControl('', Validators.required),
    assignedUserID: new FormControl(''),
    taskDescription: new FormControl('', Validators.required),
    taskID: new FormControl('')
  })


  ngOnInit() {
    this.getPageContext()
    this.fetchClientsByOrgID();
  }

  /**
   * To pass data from context
   */
  getPageContext() {
    this.showSmallSpinner = true;
    this.emailService.email_context.subscribe((context: any) => {
      if (!this.generalSrv.checkIfObjectIsEmpty(context)) {
        this.showSmallSpinner = false;
        this.pageContext = context;
        console.log(context, "context");
        this.pageContextID = context.data.id
        this.getAssignedTask(context);
        
      }
    });
  }

  /**
  * Get Assigned task by deal, lead, contact, company , salesperson
  * @param id (Deals, lead, Contacts, Company, Salesperson)
  * @param type (1 = Deals, 2 = lead, 2 = Contacts, 2 = Company, 3 = Salesperson)
  */
  getAssignedTask(context) {
    const pageContextID = context.data.id
    console.log(context.name, "context.name");
    switch (context.name) {
      case 'deal':
        this.clientTaskSrv.getBasicClientTask(pageContextID, 1).subscribe(allClientTasks => {
          this.allClientTasks = allClientTasks;
        })
        break;

      case 'lead':
        this.clientTaskSrv.getBasicClientTask(pageContextID, 2).subscribe(allClientTasks => {
          this.allClientTasks = allClientTasks;
        })
        break;

      case 'company':
        this.clientTaskSrv.getBasicClientTask(pageContextID, 2).subscribe(allClientTasks => {
          this.allClientTasks = allClientTasks;
        })
        break;

      case 'contact':
        this.clientTaskSrv.getBasicClientTask(pageContextID, 2).subscribe(allClientTasks => {
          this.allClientTasks = allClientTasks;
        })
        break;

      case 'salesPerson':
        this.clientTaskSrv.getBasicClientTask(pageContextID, 3).subscribe(allClientTasks => {
          this.allClientTasks = allClientTasks;
        })
        break;

      default:
        break;
    }
  }

  /**
  * Mark Task As Complete
  * @param id 
  */
  onMarkTaskAsCompleted(id) {
    this.markTaskAsCompleted(id);
  }

  /**
   * Mark Task As Complete by id
   * @param id 
   */
  private markTaskAsCompleted(id) {
    this.generalTaskSrv.markTaskAsCompleted(id)
      .subscribe(data => {
        this.generalSrv.sweetAlertSucess("Your Task As Been Marked As Completed");
        this.getPageContext();
      }, error => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      });
  }

  /**
    * Mark Task As Complete
    * @param id 
    */
  onMarkTaskAsVoid(id) {
    this.markTaskAsVoid(id);
  }

  /**
   * Mark Task As Void by id
   * @param id 
   */
  private markTaskAsVoid(id) {
    this.generalTaskSrv.markTaskAsVoid(id)
      .subscribe(data => {
        this.generalSrv.sweetAlertSucess("Your Task As Been Terminated");
        this.getPageContext();
      }, error => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      });
  }

  /**
   * View 
   * @param id 
   */
  onViewTask(id) {
    this.fetchTaskByID(id);
  }

  /**
  * Fetch Task By ID
  * @param id 
  */
  fetchTaskByID(id) {
    this.task = '';
    this.isLoading = true;
    this.generalTaskSrv.getTaskByID(id).subscribe(task => {
      this.task = task;
      this.isLoading = false;
    })
  }

  /**
  * Get Assigned task by deal, lead, contact, company , salesperson
  * @param id (Deals, lead, Contacts, Company, Salesperson)
  * @param type (1 = Deals, 2 = lead, 2 = Contacts, 2 = Company, 3 = Salesperson)
  */
  onStatusSelected(event) {
    const clientID = this.pageContextID;
    console.log(clientID, "clientID");
    this.selectedStatus = event.target.value;
    if (this.selectedStatus === 'all' || this.selectedStatus === '') {
      this.pageContext();
    } else if (this.selectedStatus === 'pending') {
      this.clientTaskSrv.getBasicClientPendingTask(clientID, 1)
        .subscribe(filteredClientTask => {
          this.allClientTasks = filteredClientTask;
        })
    } else if (this.selectedStatus === 'completed') {
      this.clientTaskSrv.getBasicClientPendingTask(clientID, 1)
        .subscribe(filteredClientTask => {
          this.allClientTasks = filteredClientTask;
        })
    } else if (this.selectedStatus === 'overdue') {
      this.clientTaskSrv.getBasicClientPendingTask(clientID, 1)
        .subscribe(filteredClientTask => {
          this.allClientTasks = filteredClientTask;
        })
    } else if (this.selectedStatus === 'voided') {
      this.clientTaskSrv.getBasicClientPendingTask(clientID, 1)
        .subscribe(filteredClientTask => {
          this.allClientTasks = filteredClientTask;
        })
    }
  }

  private fetchClientsByOrgID() {
    this.clientTaskSrv.getClientByOrgID().subscribe((clients) => {
      this.clients = clients;
    })
  }

}
