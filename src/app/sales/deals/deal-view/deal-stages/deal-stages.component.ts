import { GeneralService } from './../../../../services/general.service';
import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ViewChild } from '@angular/core';
import { DealsService } from 'src/app/services/deals.service';
import { Observable, Subject, pipe } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DealModalComponent } from 'src/app/shared/components/deal-modal/deal-modal.component';
import $ from 'jquery';
import { DealModel } from 'src/app/models/deal.model';
import { getCurrencySymbol } from 'src/app/utils/currency.util';
import DateUtils from 'src/app/utils/date';
@Component({
  selector: 'app-deal-stages',
  templateUrl: './deal-stages.component.html',
  styleUrls: ['./deal-stages.component.css']
})
export class DealStagesComponent implements OnInit, OnDestroy {
  dateUtil = new DateUtils;
  private unsubscribe = new Subject();
  @ViewChild(DealModalComponent) dealModal: DealModalComponent
  @Input() deal: DealModel;
  @Output() getDeal = new EventEmitter();
  @Output() calldealNav = new EventEmitter();
  closeModalId = 'stageClose'
  showSteps = false;
  step = 0;
  stageList$: Observable<any[]>;
  selectedFile: File;
  fileErrMsg = false;
  needsDocument = false;
  documentList = [];
  nextStage;
  constructor(
    private dealSrv: DealsService,
    private gs: GeneralService) { }

  ngOnInit() {
    this.getData();
  }
  getCunSymbol(symbol) {
   return getCurrencySymbol(symbol)
  }
  getData() {
    this.stageList$ = (this.dealSrv.fetchStages(this.deal.salesProcessID) as Observable<any[]>);
  }
  updateModal() {
    this.dealModal.getDocument();
  }
  changeStage(nextStage, stageList: any[]) {
    const activeStageIndex = stageList.findIndex(stage => stage.id == this.deal.stageID)
    const nextStageIndex = stageList.findIndex(stage => stage.id == nextStage.id)    
    const activeStage = stageList.find(stage => stage.id == this.deal.stageID);
    let moveDealForward = false;
    if(nextStage.id != this.deal.stageID) {      
      if(activeStageIndex < nextStageIndex){
        moveDealForward = true;
      } else {
        moveDealForward = false;
      }
      if(activeStage.roleNames.indexOf(this.gs.roleName) >= 0) {        
        if(activeStage.requireValue && this.gs.NoValue(this.deal.amount) && moveDealForward) {
          this.gs.sweetAlertFieldValidatio('Deal Value is required to move to the next stage');
        } else if(activeStage.requireForecast && !this.deal.forecastAmount && moveDealForward) {
         this.gs.sweetAlertFieldValidatio('Deal Forecast is required to move to the next stage');
        } else {
          document.getElementById('auto-click').click();
          this.dealModal.getRequiredDoc(activeStage, this.deal, nextStage, moveDealForward); 
        }
      } else {
        this.gs.sweetAlertFieldValidatio('You don\'t have permission to move deal to the next stage');
      }
    }
  }
  changeDealStage(body) {
    console.log('change deal stage');
      
    this.dealSrv.changeStage(body).pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.getDeal.emit();
    }, err => {
      this.gs.sweetAlertError(this.gs.getErrMsg(err))
    }).add(() => {
      this.calldealNav.emit();
      this.dealModal.loading = false;
      document.getElementById(this.closeModalId).click();
    });
  }
  ngOnDestroy(){
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
