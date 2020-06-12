import { Component, OnInit } from '@angular/core';
import { GeneralTaskService } from 'src/app/services/task/general-task.service';
import { ClientTaskService } from 'src/app/services/task/client-task.service';
import { GeneralService } from 'src/app/services/general.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as $ from 'jquery';
import { Subject, forkJoin } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { noWhitespaceValidator } from 'src/app/utils/no-whitespace.validator';
import EmailHelper from 'src/app/shared/components/integration/email/email-helper';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { CompaniesService } from 'src/app/services/client-services/companies.service';

@Component({
  selector: 'app-all-my-tasks',
  templateUrl: './all-my-tasks.component.html',
  styleUrls: ['./all-my-tasks.component.css']
})
export class AllMyTasksComponent implements OnInit {

  private unsubscribe = new Subject();
  mytime: any = "00 : 00 AM";
  allGeneralTasks: any = [];
  userID: any;
  allOrgUsers: any = [];
  supervisorAttachedUsers: any = [];
  selectedOption: string;
  selectedUserID: string = '';
  selectedClientID: string = '';
  selectedClientName: string = '';
  myCreatedTaskFilter: string = '';
  myCreatedTasks: any = [];
  remindDate: Date;
  task: any = {};
  clients: any = [];
  clientPassValue: any;
  clientList: any = [];
  clientFilterString: any = [];
  suggestedDeals: any = [];
  suggestedDeals2: any = [];
  filterDealName: string = '';
  filterDealCode: string = '';
  inputText2: string;
  inputText1: string;
  personalFilter: any;
  userFilter: any;
  taskDealName: string;
  clientFilterText: string = ''
  associatedClientID: string;
  taskID: string;
  restricDate = new Date().toISOString().slice(0, 10);
  restricDateTYP = new Date();
  schedulerStatus = false;
  isLoading: boolean = false;
  isLoadingDeals: boolean = false;
  isLoadingDeals2: boolean = false;
  myTaskFilter: string = '';
  fullList = "col-xl-12 col-lg-12 col-md-12";
  halfList = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.halfList;
  email_helper = EmailHelper;


  loader: any = {
    default: "notch-loader",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please  try again",
      action: "Load Teams",
      success: true
    },
    showSpinner: false
  };

  constructor(
    store: Store<AppState>,
    private generalTaskSrv: GeneralTaskService,
    private clientTaskSrv: ClientTaskService,
    private formBuilder: FormBuilder,
    private companyServ: CompaniesService,
    private leadService: LeadService,
    private contactServ: ContactsService,
    private generalSrv: GeneralService
  ) {
    this.loader.spinnerType = this.loader.default;
    store.select("userInfo").subscribe(info => {
      this.userID = info.user.id;
    });
  }

  addTaskForm = this.formBuilder.group({
    taskName: new FormControl('', [Validators.required, noWhitespaceValidator]),
    remindDate: new FormControl('', Validators.required),
    remindTime: new FormControl('', Validators.required),
    assignedUserID: new FormControl('', Validators.required),
    taskDescription: new FormControl('', Validators.required),
  })

  editTaskForm = this.formBuilder.group({
    taskName: new FormControl('', [Validators.required, noWhitespaceValidator]),
    remindDate: new FormControl('', Validators.required),
    remindTime: new FormControl('', Validators.required),
    assignedUserID: new FormControl('', Validators.required),
    taskDescription: new FormControl('', Validators.required),
    taskID: new FormControl('')
  })

  assignClientForm = new FormGroup({
    inputText: new FormControl(''),
    taskDeal: new FormControl(''),
    taskDealName: new FormControl(''),
    associatedClientID: new FormControl(''),
    associatedClientName: new FormControl(''),
    id: new FormControl('')
  })

  dealFilterForm = new FormGroup({
    inputText: new FormControl(''),
    filterDealCode: new FormControl(''),
    filterDealName: new FormControl('')
  })

  clientFilterForm = new FormGroup({
    clientFilterText: new FormControl(''),
    inputText: new FormControl(''),
    selectedClientName: new FormControl(''),
    selectedClientID: new FormControl('')
  })

  whatsAppForm = this.formBuilder.group({
    whatsappNumber: new FormControl('', [Validators.required, noWhitespaceValidator]),
  })

  /**
   * Reset ADD TASK FORM && EDIT TASK FORM
   */
  resetForm(form) {
    form.patchValue({
      taskName: '',
      remindDate: '',
      remindTime: '',
      assignedUserID: '',
      taskDescription: ''
    })
  }

  public onClientSelected(event) {
    this.associatedClientID = event.target.value;
    this.assignClientForm.patchValue({ selectedClientID: this.associatedClientID });
    this.assignClientForm.patchValue({ taskID: this.taskID });
  }

  ngOnInit() {
    this.generalSrv.showSpinner.next(false);
    this.remindDate = new Date();
    this.FetchAssignedTasks();
    this.FetchAllOrganisationUsers();
    this.onFetchSupervisorAttachedUsers();
    this.fetchClientsByOrgID();
  }

  onFetchUserTasks() {
    this.FetchGeneralPendingTasks();
  }

  onFetchSupervisorAttachedUsers() {
    this.fetchUsersBySupervisor();
  }

  /**
   * Clear Filter Details
   */
  onClearFilters() {
    this.FetchAssignedTasks();
    this.clientFilterText = "";
    this.inputText1 = "";
    this.inputText2 = "";
    this.personalFilter = " ";
    this.userFilter = "";
    this.clientFilterForm.patchValue({ selectedClientName: '' });
    this.clientFilterForm.patchValue({ selectedClientID: '' });
    this.clientFilterForm.patchValue({ clientFilterText: '' });
    this.dealFilterForm.patchValue({ filterDealName: '' });
    this.dealFilterForm.patchValue({ filterDealCode: '' });
  }

  /**
  * Fetch All Assigned Task by type
  * 2 = ASSIGNED TO ME
  */
  FetchAssignedTasks() {
    this.loader.showSpinner = true;
    this.generalTaskSrv.getTaskForMe(2)
      .subscribe(allUserTasks => {
        this.initializeLoad(allUserTasks);
      })
  }

  /**
  * Fetch All Assigned Task by type
  * 1 = CREATED BY ME
  */
  private FetchCreatedTasks() {
    this.loader.showSpinner = true;
    this.generalTaskSrv.getTaskForMe(1)
      .subscribe(allUserTasks => {
        this.initializeLoad(allUserTasks);
      })
  }

  /**
   * Fetch Task By Status
   */
  private FetchByStatus(status) {
    this.loader.showSpinner = true;
    this.generalTaskSrv.getFilteredByStatus(status)
      .subscribe(allUserTasks => {
        this.initializeLoad(allUserTasks);
      })
  }

  /**
  * Internet Loading
  * @param data 
  */
  initializeLoad(data) {
    if (data === null || data === undefined) {
      const setError = {
        title: "We couldn't load the data.",
        subTitle: "Kindly Check your Internet & Click Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else {
      this.allGeneralTasks = data;
      this.loader.showSpinner = false;
    }
  }

  /**
  * Add Task 
  */
  private addTask() {
    this.isLoading = true
    if (this.addTaskForm.valid) {
      this.generalTaskSrv.createTask(this.addTaskForm.getRawValue()).subscribe((data: any) => {
        console.log(data, "this.data.data");
        this.isLoading = false;
        $("#closeAddTaskModal").click();
        this.generalSrv.sweetAlertSucess('Your Task Has Been Created');
        this.resetForm(this.addTaskForm);
        this.FetchAssignedTasks();
      }, (error) => {
        this.isLoading = false;
        $("#closeAddTaskModal").click();
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      })
    }
  }

  /**
  * Update Task
  */
  onUpdateTask() {
    this.editTaskForm.patchValue({ taskID: this.taskID });
    this.editGeneralTask();
  }

  /**
   * Edit Task
   */
  private editGeneralTask() {
    this.isLoading = true;
    this.generalTaskSrv.editGeneralTaskByID(this.editTaskForm.getRawValue()).subscribe((data: any) => {
      this.isLoading = false;
      $("#closeEditTaskModal").click();
      this.generalSrv.sweetAlertFileUpdateSuccessWithoutNav('Task Updated');
      this.FetchAssignedTasks();
      this.resetForm(this.editTaskForm);
    }, (error) => {
      this.isLoading = false;
      $("#closeEditTaskModal").click();
      this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
    })
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
        this.FetchAssignedTasks();
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
        this.FetchAssignedTasks();
      }, error => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      });
  }

  /**
   * Add Task
   */
  onAddTask() {
    this.addTask();
  }

  /**
   * Edit Task By id
   * @param id 
   */
  onEditTask(id) {
    this.resetForm(this.editTaskForm);
    this.fetchTaskByID(id);
    this.taskID = id;

  }

  get f() { return this.editTaskForm.controls; }

  /**
   * getting data value for Task Edit
   * @param data 
   */
  setFormValues(data) {
    this.f.taskID.setValue(data.taskID);
    this.f.taskName.setValue(data.name);
    this.f.assignedUserID.setValue(data.assignedUserID);
    this.f.taskDescription.setValue(data.description);
    this.f.remindDate.setValue(data.endDate);
    this.f.remindTime.setValue(data.dueTime);
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
      this.setFormValues(task);

    })
  }

  /**
   * Open Assign Client Modal
   * @param id 
   */
  onOpenAssignClientModal(id) {
    this.inputText2 = "";
    this.assignClientForm.patchValue({
      inputText: '',
      taskDeal: '',
      taskDealName: '',
      associatedClientID: '',
    })
    this.fetchTaskByID(id);
    this.fetchClientsByOrgID();
    this.taskID = id;
  }

  /**
   * Get organization clients
   */
  private fetchClientsByOrgID() {
    const lead = this.leadService.fetchLeads().toPromise();
    const contacts = this.contactServ.getAllContacts().toPromise();
    const companies = this.companyServ.getAllCompanies().toPromise();

    forkJoin([lead, contacts, companies]).subscribe((responses: any) => {
      let client_users = [];

      if (responses[0].success) {
        client_users = [...client_users, ...responses[0].payload];
      }

      if (responses[1].success) {
        client_users = [...client_users, ...responses[1].payload];
      }

      if (responses[2].success) {
        client_users = [...client_users, ...responses[2].payload];
      }

      this.clients = [...client_users.filter(x => x.isActive === true)];
    });
  }

  /**
   * Get Deals Suggestion for add client
   */
  onGetDealSuggestions() {
    this.isLoadingDeals2 = true;
    this.generalTaskSrv.getDealSuggestions(this.assignClientForm.getRawValue()).subscribe((suggestedDeals) => {
      this.isLoadingDeals2 = false;
      this.suggestedDeals = suggestedDeals;
    })
  }

  /**
  * Get Deals Suggestion for deals filter
  */
  onGetDealSuggestions2() {
    this.isLoadingDeals = true;
    this.generalTaskSrv.getDealSuggestions(this.dealFilterForm.getRawValue()).subscribe((suggestedDeals2) => {
      this.isLoadingDeals = false;
      this.suggestedDeals2 = suggestedDeals2;
    })
  }

  /**
   * Assign Client deal
   */
  public onAssignClientDeal() {
    this.assignClientDealToTask();
  }

  /**
  * Assign Client Deal TO Task
  */
  private assignClientDealToTask() {
    this.isLoading = true
    this.assignClientForm.patchValue({ id: this.taskID });
    this.assignClientForm.patchValue({ taskDealName: this.assignClientForm.value.inputText });
    if (this.assignClientForm.valid) {
      this.clientTaskSrv.pushTaskToClientCategory(this.assignClientForm.getRawValue()).subscribe((data: any) => {
        this.isLoading = false;
        $("#closeAssignModal").click();
        this.generalSrv.sweetAlertFileUpdateSuccessWithoutNav('Task');
        this.inputText2 = "";
        this.assignClientForm.patchValue({
          inputText: '',
          taskDeal: '',
          taskDealName: '',
          associatedClientID: '',
        })
      }, (error) => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      })
    }
  }

  /**
   * clear deals suggestions
   */
  clearSuggestedDeals() {
    this.suggestedDeals = [];
    this.suggestedDeals2 = [];
  }

  /**
  * clear Client suggestions
  */
  clearSuggestedClient() {
    this.clientList = [];
  }

  /**
   * Clear InputText
   */
  clearInputText(inputName) {
    this[inputName] = "";
  }

  /**
   * Get Client Suggestion
   * @param event 
   */
  onGetClientSuggestions(event) {
    if (event.target.client === '') {
      this.clearInputText(this.clientFilterText);
      this.clearSuggestedClient();
    } else {
      this.clientFilterString = event.target.value;
      this.clientList = this.clients;
    }
  }

  /**
   * Filter Task Created By or Assigned to
   * @param event 
   */
  public onMyTaskFilter(event) {
    this.myTaskFilter = event.target.value;
    if (this.myTaskFilter === 'all') {
      this.FetchAssignedTasks();
    } else if (this.myTaskFilter === 'created') {
      this.FetchCreatedTasks();
    } else if (this.myTaskFilter === 'completed') {
      this.FetchByStatus("completed");
    } else if (this.myTaskFilter === 'pending') {
      this.FetchByStatus("pending");
    } else if (this.myTaskFilter === 'overdue') {
      this.FetchByStatus("overdue");
    } else if (this.myTaskFilter === 'voided') {
      this.FetchByStatus("voided");
    }
  }

  /**
   * Get client Filter By USERID AND CLIENTID
   * @param userID 
   * @param clientID 
   */
  getFilteredClient(userID, clientID) {
    this.loader.showSpinner = true;
    this.generalTaskSrv.getFilteredClient(userID, clientID)
      .subscribe(allUserTasks => {
        this.initializeLoad(allUserTasks);
      })
  }

  /**
   * Filter Client
   * @param value 
   * @param inputName 
   */
  addClient(value) {
    this.clientFilterForm.patchValue({ clientFilterText: value.name || value.firstName + " " + value.surName });
    this.clientFilterForm.patchValue({ selectedClientID: value.id });
    this.selectedClientID = value.id;
    this.getFilteredClient(this.userID, this.selectedClientID);
    this.clearSuggestedClient();
    // this.clearInputText(inputName);
  }

  /**
   * Get deal Filter By USERID AND dealCode
   * @param userID 
   * @param dealCode 
   */
  getFilteredDeal(userID, dealCode) {
    this.loader.showSpinner = true;
    this.generalTaskSrv.getFilteredDeal(userID, dealCode)
      .subscribe(allUserTasks => {
        this.initializeLoad(allUserTasks);
      })
  }

  /**
   * Filter Deal
   * @param value 
   * @param inputName 
   */
  addDealFilter(value) {
    this.dealFilterForm.patchValue({ inputText: value.name });
    this.dealFilterForm.patchValue({ filterDealCode: value.code });
    this.filterDealCode = value.code;
    this.getFilteredDeal(this.userID, this.filterDealCode);
    this.clearSuggestedDeals();
  }

  /**
   * Add deal For Client (Assign client)
   * @param value 
   * @param inputName 
   */
  addDeal(value) {
    this.assignClientForm.patchValue({ inputText: value.name });
    this.assignClientForm.patchValue({ taskDeal: value.code });
    this.clearSuggestedDeals();
  }

  /**
   * filter by user using creatorID and AssignedID
   * @param userID 
   * @param assignID 
   */
  FetchFilteredUserTask(userID, assignID) {
    this.loader.showSpinner = true;
    this.generalTaskSrv.getUserFilteredTask(userID, assignID)
      .subscribe(allUserTasks => {
        this.initializeLoad(allUserTasks);
      })
  }

  /**
   * USER FILTERS
   * @param event 
   */
  public onUserFilter(event) {
    this.selectedUserID = event.target.value;
    if (this.selectedUserID === 'all') {
      this.FetchCreatedTasks();
    } else {
      this.FetchFilteredUserTask(this.userID, this.selectedUserID);
    }
  }

  /**
   * Fetch users attached to a supervisor
   */
  private fetchUsersBySupervisor() {
    this.generalTaskSrv.getUsersBySupervisor()
      .subscribe(supervisorAttachedUsers => {
        this.supervisorAttachedUsers = supervisorAttachedUsers;
      })
  }

  filteredDeal(event) {
    alert(event.target.value)
  }

  /**
   * WhatsApp Integration 
   */
  integrateWhatsApp() {
    this.isLoading = true;
    this.generalTaskSrv.integrateWhatsappBot(this.whatsAppForm.getRawValue()).subscribe((data) => {
      this.isLoading = false;
      this.whatsApp()
      this.generalSrv.sweetAlertSucess('Please Check Your WhatsApp');
    }, (error) => {
      this.isLoading = false;
        $("#closeWhatsapp").click();
        this.whatsApp()
        console.log(error.error.text, "error.error.text")
        this.generalSrv.sweetAlertSucess(error.error.text);
    })
  }


  whatsApp() {
    this.generalTaskSrv.integrateWhatsapp(this.whatsAppForm.getRawValue()).subscribe(data => {
      console.log(data, "this.data.data");
    }, (error) => {
      console.log(error);
    })
  }


  //new structure ends here


  private FetchGeneralPendingTasks() {
    this.generalTaskSrv.getGeneralPendingTasks()
      .subscribe(generalPendingTasks => {
        this.allGeneralTasks = generalPendingTasks;
      })
  }


  private FetchAllOrganisationUsers() {
    this.generalTaskSrv.getAllOrganisationUsers()
      .subscribe(allOrgUsers => {
        this.allOrgUsers = allOrgUsers;
      })
  }

  timeChanged($event, timeAsInput) {
    // console.log($event)
    // console.log(timeAsInput)
  }

  // Reload Spinner
  async reloadSpinner() {
    this.loader.spinnerType = this.loader.default;
    this.FetchAssignedTasks();
  }

  // Allow user to add a lead when there is none.
  async onActionState() {
    if (this.loader.dataless.success === true) $("#ModalCenter4").show();
    else this.FetchAssignedTasks();
    this.fetchUsersBySupervisor();
  }

  /**
   * Toggling BUTTON FOR FILTER
   * @param type 
   */
  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.halfList : this.fullList;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}

