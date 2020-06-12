import { NgForm } from '@angular/forms';
import { GeneralService } from './../../../services/general.service';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-all-ticket-filter',
  templateUrl: './all-ticket-filter.component.html',
  styleUrls: ['./all-ticket-filter.component.css']
})
export class AllTicketFilterComponent implements OnInit {
  loadingCustom = false;
  filterList: any[]
  @Output() emitFilter = new EventEmitter<{type: string, value: string}>();
  @ViewChild('customFilterForm') customFilterForm: NgForm
  constructor(
    private ticketSrv: TicketService,
    private gs: GeneralService) { }

  ngOnInit() {
    this.getCustomFilters();
  }
  getCustomFilters() {
    this.ticketSrv.fetchCustomFilters().subscribe((res: any) => {
      this.filterList = res;
      console.log(this.filterList);
    })
  }
  activateEdit(index) {
    document.getElementById(`collapseHead-${index}`).click()
  }

  createdDate=(date)=>this.emitFilter.emit({type: 'createdDate', value: date})

  filtersEmition=(type, value)=>this.emitFilter.emit({type, value})
  customFilter(form: NgForm) {
    this.loadingCustom = true
    this.ticketSrv.createCustomFilter(form.value).subscribe((res: any) => {
      this.getCustomFilters();
      this.gs.sweetAlertSucess(res.message);
      Object.keys(form.controls).forEach(field => {
        form.controls[field].setValue('')
      })
    }, err => {
      this.gs.sweetAlertError(this.gs.getErrMsg(err));
    }).add(() => {
      this.loadingCustom = false;
    })
    
  }

  clearFilters(forms: NgForm[]) {
    forms.forEach(form => {
      form.resetForm();
      Object.keys(form.controls).forEach(field => {
        form.controls[field].setValue('')
      })
    })
    this.emitFilter.emit({type: 'clearFilter', value: ''})
  }  
  get disBtn() {
    const { name, priority,source, status, type} = this.customFilterForm.value;
    return (name) && (priority||source||status||type)
  }
  deleteFilter(filter) {
    const observable = this.ticketSrv.deleteCustomFilter(filter.id);
    const msg = `<p>Delete ${filter.name}</p>`;
    this.gs.sweetAlertAsync('warning', msg, observable)
        .then(res => {
          if(res.value && res.value.status) {
          if(res.value.status === 'success') {
            this.getCustomFilters()
            this.gs.sweetAlertSucess(res.value.message)
          } else {
            this.gs.sweetAlertError(this.gs.getErrMsg(res.value.error));
          }
        }
        })
  }
}