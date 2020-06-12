import { SignupLoginService } from './../../services/signupLogin.service';
import { CurrencyService } from './../../services/currency.service';
import { FilterComponent } from './filter/filter.component';
import { NgForm } from '@angular/forms';
import { ClientService } from './../../services/client-services/clients.service';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { DealsService } from 'src/app/services/deals.service';
import { GeneralService } from 'src/app/services/general.service';
import { selectConfig } from 'src/app/utils/utils';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  showFilter = null;
  unsubscribe = new Subject();
  config = { ...selectConfig }
  @Input() teamId;
  @Output() getDateFilter = new EventEmitter();
  @Output() getDealOwnerFilter = new EventEmitter();
  @Output() getCreatedOnFilter = new EventEmitter();
  @Output() getClientFilter = new EventEmitter();
  @Output() getDealValueFilter = new EventEmitter();
  @Output() getwinProbFilter = new EventEmitter();
  @Output() getProfileScoreFilter = new EventEmitter();
  @Output() getDealStatusFilter = new EventEmitter();
  @Output() getClearFilter = new EventEmitter();
  @Output() getCustomFilter = new EventEmitter();
  @Output() TeamsDeal = new EventEmitter();

  @Output() toggleSidebar = new EventEmitter();
  @ViewChild(FilterComponent) filter: FilterComponent;
  @ViewChild('dealStatusForm') dealStatusForm: NgForm;



  dateForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });
  dealOwnerForm = new FormGroup({
    owner: new FormControl('', Validators.required),
  });
  createdOnForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });
  clientForm = new FormGroup({
    type: new FormControl('Client', Validators.required),
    client: new FormControl('', Validators.required),
  });
  dealValueForm = new FormGroup({
    from: new FormControl(0, Validators.required),
    to: new FormControl(0, Validators.required),
  });
  winProbForm = new FormGroup({
    from: new FormControl(0, [Validators.required, Validators.max(100)]),
    to: new FormControl(0, [Validators.required, Validators.max(100)])
  })
  scoreForm = new FormGroup({
    from: new FormControl(0, [Validators.required, Validators.max(100)]),
    to: new FormControl(0, [Validators.required, Validators.max(100)])
  })
  createFilterForm = new FormGroup({
    filterName: new FormControl('', Validators.required),
    dealOwner: new FormControl(''),
    dealStatus: new FormControl(''),
    dealValueFrom: new FormControl(''),
    dealValueTo: new FormControl(''),
    client: new FormControl(''),
  });
  teamMemberList;
  teamList$ = this.signupSrv.fetchSupervisorTeams();
  processList;
  processListPrevState = [];
  companyList$ = [];
  contactList$ = [];
  clientList = [];
  createClientList = [];
  filterList = [];
  initialCreateFilterValue = {};
  selectedTeamId ="";
  selectedWorkflow;
  baseCurrency= '';
  prevState = {owner: [], client: []}
  constructor( 
    private dealSrv: DealsService,
    public generalSrv: GeneralService,
    private companySrv: CompaniesService,
    private contactSrv: ContactsService,
    private clientSrv: ClientService,
    private currencySrv: CurrencyService,
    private signupSrv: SignupLoginService,
    private salespersonSrv: SalesPersonService) {
    this.getOrgCurrency();
    this.initialCreateFilterValue = {...this.createFilterForm.value};
    this.selectedTeamId = this.generalSrv.user.teamID || ''
  }

  ngOnInit() {
    this.currencySrv.org_currencies.subscribe(org_currencies => {
      this.baseCurrency = org_currencies && org_currencies.base_currency ? org_currencies.base_currency : '';
    })
    this.getAllClient();
    this.getProcessList();
    this.getFilters();
    this.getAllCompanies();
    this.getAllContacts();
    this.getSalesperson();
  }
  getSalesperson() {
    this.salespersonSrv.fetchAllSalePersons().subscribe((res: any) => {
      this.prevState.owner = this.teamMemberList = res;
    })
  }
  getOrgCurrency() {
    this.currencySrv.org_currencies.subscribe( org_currencies => {
      this.baseCurrency = org_currencies && org_currencies.base_currency ? org_currencies.base_currency : ''; 
    })
  }
  getProcessList() {
    this.dealSrv
      .fetchOrgPiplelineWorkflow()
      .subscribe((data: any[]) => {
        (this.processList = data)
        this.processListPrevState = data;
      }
        );
  }
  getAllCompanies() {
    this.companySrv.getCompaniesByFilter('isActive=true').pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        if (data) {
          this.companyList$ = data.payload.map(com => ({id: com.clientId, name: com.name}))
        }
      })
  }

  getAllContacts() {
    this.contactSrv.getContactsByFilter('isActive=true').pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        if (data) {
          this.contactList$ = data.payload.map(con => ({ id: con.clientId, name: (con.surName + ' ' + con.firstName) }))
        }
      })
  }

  getAllClient() {
    this.clientSrv.getAllClients().subscribe((res: any[]) => {
      this.clientList = res.map(data => ({id: data.id, name: data.name}));
     this.prevState.client = this.createClientList = this.clientList;
    })
  }
  

  getFilters() {
    this.dealSrv
      .fetchFilters(this.teamId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => (this.filterList = data));
  }
  getTeamsDeal() {
    this.TeamsDeal.emit(this.selectedTeamId);
  }
  workflowChange() {
    console.log('workflow change');
    
    this.generalSrv.emitWorkflowId.next(this.selectedWorkflow.id);
    this.processList = [...this.processListPrevState];
  }
  filterDate() {
    this.getDateFilter.emit();
  }
  dealOwnerFiter() {
    this.getDealOwnerFilter.emit();
  }
  createdOnFilter() {
    this.getCreatedOnFilter.emit();
  }
  clientFilter() {
    this.getClientFilter.emit();
  }
  dealStatusFilter(form: NgForm) {
    if(form.valid) {
      this.getDealStatusFilter.emit(form.value.dealStatus);
    }
  }
  dealValueFilter() {
    this.getDealValueFilter.emit();

  }
  winProbFilter() {
    this.getwinProbFilter.emit()
  }
  profileScoreFilter() {
    this.getProfileScoreFilter.emit();
  }
  changeClient() {
    this.clientList = [...this.prevState.client];
  }
  changeOwner() {
    this.teamMemberList = [...this.prevState.owner];
  }

  clearFilter() {
    const resetForms: FormGroup[] = [
      this.dateForm, this.dealOwnerForm, this.createdOnForm, this.clientForm,
      this.dealValueForm, this.winProbForm, this.scoreForm, this.createFilterForm
    ]
    resetForms.forEach(form => form.reset());
    this.clientForm.controls.type.setValue('Client')
    this.changeClient();
    this.changeOwner();
    this.dealStatusForm.resetForm({dealStatus: ''})
    this.selectedWorkflow = null
    this.selectedTeamId = this.generalSrv.user.teamID || '';
    this.getClearFilter.emit();
  }

  credFiltLoading = false
  
  createFilter() {
    if (this.createFilterForm.valid) {
      this.credFiltLoading = true
      this.dealSrv
        .createFilter(this.createFilterForm.value, this.teamId)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((res: any) => { 
          this.generalSrv.sweetAlertSucess(res.message);
          this.createFilterForm.reset();
          this.changeClient();
          this.changeOwner();
          this.createFilterForm.setValue(this.initialCreateFilterValue);
          // this.createFilterForm.setErrors({invalid: false});
          this.getFilters();
        }, err => {
          this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err))
        }).add(() => {
          this.credFiltLoading = false
        });
    }
  }

  deleteFilter(filter) {
    this.generalSrv
      .sweetAlertFileDeletions(`${filter.name} Filter`)
      .then(result => {
        if (result.value) {
          this.dealSrv
            .deleteFilter(filter)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((res: any) => {
              this.getClearFilter.emit()
              this.getFilters();
              this.generalSrv.sweetAlertSucess(res.message)
            }, err => {
              this.generalSrv.sweetAlertError(err);
            });
        }
      });
  }

  customFilter(filter) {
    this.getCustomFilter.emit(filter);
    // console.log(filter);
  }

  fetchClient() {
    this.clientForm.controls.client.setValue('');
    const { type } = this.clientForm.value;
    this.clientList =
      type === 'Contact' ? this.contactList$ : this.companyList$;
  }

  fetchCreateClient() {
    this.createFilterForm.controls.client.setValue('');
    const { clientType } = this.createFilterForm.value;
    this.createClientList =
      clientType === 'Contact' ? this.contactList$ : this.companyList$;
  }

  toStr(value) {
    return JSON.stringify(value);
  }

  editFilter(index) {
    this.showFilter = index;
  }

  cancelFiter(index) {
    this.showFilter = !index;
  }
  get disCustomFilterBtn(): boolean {
    const {filterName, dealOwner, dealStatus, dealValueFrom , dealValueTo ,client} = this.createFilterForm.value;
    const required = filterName;
    const notRequired = dealOwner || dealStatus || dealValueFrom || dealValueTo || client;
    if(required && notRequired) {
      return true;
    } else {
      return false;
    }
  }

  getEditFilter(filter) {
    this.dealSrv
      .editFilter(filter)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.generalSrv.sweetAlertFileUpdateSuccess(
          'Filter',
          '/sales/deals-list'
        );
        this.getFilters();
        this.cancelFiter(0);
      }, err => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err))
      }).add(() => {
        this.filter.loading = false;
      });
  }

  activateEdit(index) {
    document.getElementById(`collapseHead-${index}`).click()
  }

  toggle(type) {
    console.log(type);
    this.toggleSidebar.emit(type)
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
