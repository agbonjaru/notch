import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { teamMemebers } from 'src/app/data/user';
import { dataList } from 'src/app/data/industries';

@Component({
  selector: 'app-invoice-filter',
  templateUrl: './invoice-filter.component.html',
  styleUrls: ['./invoice-filter.component.css'],
})
export class InvoiceFilterComponent implements OnInit {
  @Input() filterIndex;
  @Input() filterData;
  @Output() cancelFiter = new EventEmitter();
  @Output() getEditFilter = new EventEmitter();
  teamMemberList$ = teamMemebers;
  companyList$ = dataList;
  contactList$ = dataList;
  createClientList = [];
  filterForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', Validators.required),
    dealOwnerName: new FormControl('', Validators.required),
    dealValueFrom: new FormControl(0, Validators.required),
    dealValueTo: new FormControl(0, Validators.required),
    clientType: new FormControl('', Validators.required),
    clientName: new FormControl('', Validators.required),
  });
  constructor() {}

  ngOnInit() {
    this.setValue();
  }
  setValue() {
    if (this.filterData) {
      const {
        dealOwnerID,
        dealOwnerName,
        clientType,
        clientName,
        clientID,
      } = this.filterData;
      this.filterForm.patchValue(this.filterData);
      this.filterForm.controls.dealOwnerName.patchValue(
        dealOwnerID + '+' + dealOwnerName
      );
      this.createClientList =
        clientType === 'Contact' ? this.contactList$ : this.companyList$;
      this.filterForm.controls.clientName.patchValue(
        clientID + '+' + clientName
      );
    }
  }
  toString(value) {
    return JSON.stringify(value);
  }
  fetchCreateClient() {
    this.filterForm.controls.client.setValue('');
    const { clientType } = this.filterForm.value;
    this.createClientList =
      clientType === 'Contact' ? this.contactList$ : this.companyList$;
  }
  // filter() {
  //   console.log(this.filterForm.value);
  // }
  cancel() {
    this.cancelFiter.emit(this.filterIndex);
  }
  editFilter() {
    const data = { ...this.filterData, ...this.filterForm.value };
    this.getEditFilter.emit(data);
  }
}
