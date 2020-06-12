import { Component, Output, EventEmitter } from "@angular/core";
import DateUtils from 'src/app/utils/date';


@Component({
    selector: 'data-range',
    template: ` <div class="helpdesk-right-header"> 
    <h3>Time Period: <span>{{startDate | date}} - {{endDate | date}}</span> 
       <button (click)="toggle()" class="ml-2 fin-pry-btn">Toggle Filter</button></h3>
    <div *ngIf="showFilter"> 
       <form #dateForm="ngForm" class="form-inline" (ngSubmit)="filterDate()">
           <div class="form-group mx-sm-3 mb-2">
               <label for="inputPassword2" class="label">Start Date</label>
               <input type="text" placeholder="dd/mm/yyyy" class="form-control" name="startDate" [(ngModel)]="startDate" required  bsDatepicker
               [bsConfig]="{ dateInputFormat: 'DD-MM-YYYY', selectFromOtherMonth: true }">
             </div> 
           <div class="form-group mx-sm-3 mb-2">
             <label for="inputPassword2" class="label">End Date</label>
             <input  [min]="startDate" type="text" placeholder="dd/mm/yyyy" class="form-control" name="endDate" [(ngModel)]="endDate" required bsDatepicker
             [bsConfig]="{ dateInputFormat: 'DD-MM-YYYY', selectFromOtherMonth: true }">
           </div>
           <button type="submit"  class="btn btn-primary mb-2">submit</button>
         </form>
    </div>
 </div>`
})

export class DataRangeFilter {
    @Output() getFilter = new EventEmitter();
    showFilter = false;
    date = new DateUtils;
    startDate = new Date(this.date.getPrvMntTs());
    endDate = new Date(this.date.getCurrentTs());
    constructor() {
      console.log('init data');
      
    }

    toggle() {
        this.showFilter = !this.showFilter;
      }
      filterDate() {
        const { getTimeStp, getEndTimeStp } = this.date
        const payload = {endDate: getEndTimeStp(this.endDate), startDate: getTimeStp(this.startDate)}
        this.getFilter.emit(payload)
      }
}