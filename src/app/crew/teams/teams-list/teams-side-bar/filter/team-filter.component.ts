import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { teamMemebers } from 'src/app/data/user';

@Component({
  selector: 'app-team-filter',
  templateUrl: './team-filter.component.html',
  styleUrls: ['./team-filter.component.css']
})

export class TeamFilterComponent implements OnInit {
  @Input() filterIndex;
  @Input() filterData;
  @Output() cancelFiter = new EventEmitter();
  @Output() getEditFilter = new EventEmitter();
  teamMemberList$ = teamMemebers;
  editLoading = false;
  companyList$ = [];
  contactList$ = [];
  createClientList = [];
  filterForm = new FormGroup({
    id: new FormControl(''),
    filterName: new FormControl('', Validators.required),
    noOfDeals: new FormControl(0),
    noOfDealsLost: new FormControl(0),
    noOfDealsWon: new FormControl(0),
    // noOfInvoices: new FormControl(0),
  });

  constructor() { }

  ngOnInit() {
    this.setValue();
  }

  setValue() {
    if (this.filterData) {
      this.filterForm.patchValue(this.filterData);       
    }
  }

  toString(value) {
    return JSON.stringify(value);
  }


  cancel() {
    this.cancelFiter.emit(this.filterIndex);
  }

  editFilter() {
    const data = { ...this.filterData, ...this.filterForm.value };
    this.getEditFilter.emit(data);
  }
}
