import { ClientService } from './../../../services/client-services/clients.service';
import { mergeMap } from 'rxjs/operators';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { teamMemebers } from 'src/app/data/user';
import { dataList } from 'src/app/data/industries';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { selectConfig } from 'src/app/utils/utils';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  config = {...selectConfig}
  @Input() filterIndex;
  @Input() filterData;
  @Output() cancelFiter = new EventEmitter();
  @Output() getEditFilter = new EventEmitter();
  teamMemberList$ =  this.salespersonSrv.fetchAllSalePersons()
    .pipe(mergeMap((data: any[]) => of(data.map(dat => ({id: dat.id, name: dat.name})))));
  companyList$ = [];
  contactList$ = [];
  createClientList = [];
  loading = false;
  filterForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', Validators.required),
    dealOwnerName: new FormControl(''),
    dealValueFrom: new FormControl(''),
    dealValueTo: new FormControl(''),
    dealStatus:  new FormControl(''),
    clientType: new FormControl(''),
    clientName: new FormControl(''),
  });
  constructor(
    private salespersonSrv: SalesPersonService,
    private companySrv: CompaniesService,
    private contactSrv: ContactsService,
    private clientSrv: ClientService) { }

  ngOnInit() {       
    this.getAllClient(); 
    this.getAllCompanies()
    this.getAllContacts();
    this.setValue();
  }
  getAllCompanies() {
    this.companySrv.getAllCompanies().subscribe((data: any) => {
      if(data) {
        this.companyList$ = data.payload.map(com => ({id: com.clientId, name: com.name}));
        this.setValue()
      }
    })
  }
  getAllContacts() {
    this.contactSrv.getAllContacts().subscribe((data: any) => {
      if(data) {
        this.contactList$ = data.payload.map(con => ({id: con.clientId, name: (con.surName+' '+con.firstName)}))
        this.setValue();
      }
    })
  }
  getAllClient() {
    this.clientSrv.getAllClients().subscribe((res: any[]) => {
      this.createClientList = res.map(data => ({id: data.id, name: data.name}));
    })
  }
  setValue(){
    console.log(this.filterForm.value);
    
    if (this.filterData ) {
      const { dealOwnerID, dealOwnerName,  clientType, clientName, clientID } = this.filterData;
      this.filterForm.patchValue(this.filterData);
      if(dealOwnerID && dealOwnerName) {
        this.filterForm.controls.dealOwnerName.patchValue({id: dealOwnerID, name: dealOwnerName});
      }
      if(clientName && clientID) {
        this.filterForm.controls.clientName.patchValue({id: clientID, name: clientName});
      }
    }
  }
  toString(value) {
    return JSON.stringify(value);
  }
  fetchCreateClient() {
    this.filterForm.controls.clientName.setValue('');
    const { clientType } =  this.filterForm.value;
    this.createClientList = clientType === 'Contact' ? this.contactList$ : this.companyList$;
  }
  get disFilterBtn(): boolean {
    const {name, dealOwnerName, dealStatus, dealValueFrom , dealValueTo, clientType, clientName} = this.filterForm.value;
    const notRequired = dealOwnerName || dealStatus || dealValueFrom || dealValueTo || (!Array.isArray(clientName) || clientName);
    if(name && notRequired) {
      return true;
    } else {
      return false;
    }
  }
  cancel() {
    this.cancelFiter.emit(this.filterIndex);
  }
  
  editFilter() {
    const data = {...this.filterData, ...this.filterForm.value};
    this.loading =true;
    this.getEditFilter.emit(data);
  }
}
