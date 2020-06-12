import DateUtils  from 'src/app/utils/date';
import { ActivatedRoute } from '@angular/router';
import { dataList } from './../../../data/industries';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { teamMemebers } from 'src/app/data/user';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as $ from 'jquery';
import { Observable, of } from 'rxjs';
import { GeneralService } from 'src/app/services/general.service';

import { selectConfig } from '../../../utils/utils';
import { DealsService } from './../../../services/deals.service';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { SignupLoginService } from 'src/app/services/signupLogin.service';
import { CurrencyService } from 'src/app/services/currency.service';
import { getCurrencySymbol } from 'src/app/utils/currency.util';
import { ClientService } from 'src/app/services/client-services/clients.service';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-create-deals',
  templateUrl: './create-deals.component.html',
  styleUrls: ['./create-deals.component.css'],
})
export class CreateDealsComponent implements OnInit {
  dateUtil = new DateUtils();
  date = this.dateUtil.getNxtDay();
  currenySymbol = ''
  selectedClient = { id: null, name: null };
  session = { id: null, name: null }
  disable = { company: false, contact: false, loading: false };
  dataList = dataList
  contactList$: Observable<any>;
  clientList$: Observable<any>;
  competitorList$;
  productList$;
  salesProcessList$
  salesPersonList$
  teamList$: Observable<any[]>;
  currencyList: any;
  baseCurrency: string;

  stageList$: Observable<any>;
  Companyconfig = { ...selectConfig, placeholder: 'Choose Client' };
  ContactConfig = { ...selectConfig, placeholder: 'Choose Contact' };
  competitorConfig = { ...selectConfig, placeholder: 'Choose Contact', displayKey: 'fullname' };
  productConfig = { ...selectConfig, placeholder: 'Choose Product', }
  salespersonConfig = { ...selectConfig, placeholder: 'Choose Salesperson', }

  constructor(
    private dealSrv: DealsService,
    public generalSrv: GeneralService,
    private contactSrv: ContactsService,
    private salespersonSrv: SalesPersonService,
    private signupSrv: SignupLoginService,
    private currencySrv: CurrencyService,
    private clientSrv: ClientService,
    route: ActivatedRoute
  ) {    
    this.getData();
    route.queryParams.subscribe(params => {
      this.selectedClient.id = params.client_id;
      this.selectedClient.name = params.client_name;
      this.session.id = params.session_id;
      this.session.name = params.session_name
    })
  }


  createDealForm = new FormGroup({
    name: new FormControl('', Validators.required),
    currency: new FormControl('', Validators.required),
    amount: new FormControl('', [Validators.min(0)]),
    currStage: new FormControl('', Validators.required),
    salesProcessName: new FormControl('', Validators.required),
    closeDate: new FormControl('', Validators.required),
    creatorID: new FormControl('', Validators.required),
    teamID: new FormControl('', Validators.required),
    salesCompetitors: new FormControl([]),
    client: new FormControl('', Validators.required),
    contacts: new FormControl([]),
    products: new FormControl([]),
  });

  getData() {
    this.contactList$ = this.contactSrv.getContactsByFilter('isActive=true').pipe(
      mergeMap((data: { payload: any[] }) => of(data ? data.payload.map(client => (
        { id: client.id, name: (client.firstName + ' ' + client.surName), email: client.email }
      )) : '')));
    this.clientList$ = this.clientSrv.getAllClients().pipe(
      mergeMap((data: any[]) => of(data ? data.map(dat => ({ id: dat.id, name: dat.name, email: dat.email })) : '')));
    this.competitorList$ = this.dealSrv.fetchSaleCompetitor();
    this.productList$ = this.dealSrv.fetchAllProducts();
    this.salesProcessList$ = this.dealSrv.fetchSalesProcess().pipe(mergeMap((data: any[]) => of(data.filter(dat => {
      return dat.status === 1
    }))));
    this.salesPersonList$ = this.salespersonSrv.fetchAllSalePersons().pipe(
      mergeMap((data: any[]) => of(data.map(dat => ({ id: dat.id, name: dat.name })))));;
  }

  ngOnInit() {
    this.getOrgCurrency();
    this.setValues();
  }
  getOrgCurrency() {
    this.currencySrv.org_currencies.subscribe(org_currencies => {
      this.baseCurrency = org_currencies && org_currencies.base_currency ? org_currencies.base_currency : '';
      this.createDealForm.controls.currency.setValue(this.baseCurrency);
      this.currenySymbol = this.baseCurrency ? getCurrencySymbol(this.baseCurrency) : '';
      if (!this.generalSrv.checkIfObjectIsEmpty(org_currencies)) {
        this.currencyList = this.generalSrv.convertObjectToArray(org_currencies.currencies);
      }
    })
  }

  get stage() {
    return this.createDealForm.get('currStage');
  }

  getDealControls(controls) { return this.createDealForm.get(controls) }

  changeCurrency() {
    console.log(this.createDealForm.value.currency);

    this.currenySymbol = getCurrencySymbol(this.createDealForm.value.currency)
  }

  setValues() {
    console.log(this.baseCurrency);


    const { firstName, lastName, id: userId } = this.generalSrv.user;
    this.getDealControls('creatorID').setValue({ name: `${firstName} ${lastName}`, id: userId });
    this.fetchSalesPTeam();

    const { id, name } = this.selectedClient;
    if (this.session.name === 'company' || this.session.name === 'contact') {
      this.getDealControls('client').setValue({ id, name })
      this.disable.company = true
    }
  }
  handleSelf(event) {
    if (event.target.checked) {
      this.getDealControls('teamID').setValue(this.generalSrv.user.teamID);
      this.getDealControls('teamID').disable();
    } else {
      this.getDealControls('teamID').setValue('');
      this.getDealControls('teamID').enable();
    }
  }
  create() {
    if (this.createDealForm.valid) {
      this.disable.loading = true;
      const deal_data = {
        ...this.createDealForm.getRawValue(),
        equivalents: this.currencySrv.get_cost_equivalents(
          this.baseCurrency,
          this.createDealForm.value.currency,
          this.createDealForm.value.amount)
      }
      
      this.dealSrv.createDeal(deal_data).subscribe(
        (data: any) => {
          console.log(data);
          this.disable.loading = false;
          this.generalSrv.sweetAlertFileCreationSuccess(
            'Deal',
            '/sales/deals-view/' + data.code
          );
          this.createDealForm.reset();
          this.getData();
          this.setValues();
        }, error => {
          this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
          this.disable.loading = false;
        }
      );
    }
  }

  fetchStages() {
    const { salesProcessName } = this.createDealForm.value;
    this.stageList$ = this.dealSrv.fetchStages(salesProcessName.split('+')[0]);
    this.stage.setValue('');
  }

  fetchSalesPTeam() {
    const { creatorID } = this.createDealForm.value;
    this.createDealForm.controls.teamID.setValue('')
    this.createDealForm.controls.teamID.enable();
    const id = creatorID ? creatorID.id : null
    if (id) {
      this.teamList$ = (this.signupSrv.fetchsalesPersonTeams(id) as any)
    }
  }

  filterStage(stageList: any[]) {
    let result;
    const NotWinLossStages = stageList.filter(stage => (stage.name !== 'Won' && stage.name !== 'Lost'))
    // return NotWinLossStages.filter(stage => stage.canSkip === true);
    const canSkipStage = NotWinLossStages.filter(stage => stage.canSkip === true)[0];
    if (canSkipStage) {
      const index = NotWinLossStages.findIndex(stage => stage.id == canSkipStage.id) || 0
      result = NotWinLossStages.slice(0, index + 1);
    } else {
      result = NotWinLossStages;
    }
    return result
  }

  clientLookUp(value) {
    if (!value) {
      return;
    }
    this.clientList$ = this.clientSrv.getClientWildcard(value).pipe(
      mergeMap((data: { payload: any[] }) => of(data.payload.map(dat => ({ id: dat.id, name: dat.name, email: dat.email })))));
  }

  clientFormat(clients: any[]) {
    return clients.map(client =>
      ({ id: client.clientId, name: client.name || (client.firstName + ' ' + client.surName), email: client.email }))
  }
}
