import { DealModalComponent } from 'src/app/shared/components/deal-modal/deal-modal.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as $ from 'jquery';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DealsService } from 'src/app/services/deals.service';
import { GeneralService } from 'src/app/services/general.service';
import { DealModel } from 'src/app/models/deal.model';
import { CurrencyService } from 'src/app/services/currency.service';
import { selectConfig } from 'src/app/utils/utils';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.css'],
})
export class PipelineComponent implements OnInit, OnDestroy {
  @ViewChild(DealModalComponent) dealModal: DealModalComponent;
  @Output() updateDashboard = new EventEmitter();
  @Input() teamID = null;
  @Input() salepersonID =  null;
  @Input() moveDeal = false;
  @Input() showWorkflowList: boolean = true;
  private unsubscribe$ = new Subject<void>();
  connectedTo = []; processList: any[]; 
  loading = true; showPipelineDeal = false;
  config = {...selectConfig, placeholder: 'Select Deal Process'}
  stage; code;
  baseCurrency;
  spinnerType = 'wave';
  processListPrevState = [];

  processForm = new FormGroup({
    processId: new FormControl(''),
  });

  constructor(
    private dealSrv: DealsService,
    private gs: GeneralService, 
    private currencySrv: CurrencyService) {

      this.currencySrv.org_currencies.subscribe( org_currencies => {
        if(!this.gs.checkIfObjectIsEmpty(org_currencies)) {
          this.baseCurrency = org_currencies.base_currency;
        }
      });
    // $.getScript('../../../assets/js/datatableScript.js');
  }

  pipelineList = [];
  filteredPipelist = []

  ngOnInit() {
    this.getData();
    // this.listenForWorkflowId();
  }
  listenForWorkflowId() {
    this.gs.emitWorkflowId.next(null)
    this.gs.emitWorkflowId.subscribe(res => {
      if(res) {
        this.processForm.controls.processId.setValue(res);
        this.getPipelineDeals()
      }
      console.log('emit workflow', res);
    })
  }
  getData() {
    this.getProcessList();
  }
  getProcessList() { 
    this.dealSrv
      .fetchOrgPiplelineWorkflow()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any[]) => {
       this.processListPrevState = this.processList = data;
      });
  }
  reloadPipelineDeals(type) {
    this.spinnerType = 'wave'
    this.getPipelineDeals();
    
  }
  changeProcess() {
    this.processList = [...this.processListPrevState];
    if(this.processForm.value.processId && this.processForm.value.processId.id) {
      this.getPipelineDeals();
    } else {
      this.pipelineList = []
      this.showPipelineDeal = false
    }
  }
  getPipelineDeals(dateFilter?: FormGroup) {
    this.showPipelineDeal = true;
    this.loading = true;
    const { processId } = this.processForm.value;
    const newDateFilter = dateFilter && dateFilter.valid ? dateFilter.value : null;
    const filter = {dateFilter: newDateFilter, salesperson: this.salepersonID}
    this.dealSrv.fetchPipelineDeals(processId.id, this.teamID, filter)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((data: any) => {
      this.pipelineList = data;
      this.filteredPipelist = data;
      this.updateDashboard.emit({pipelineList: data, processName: ''});
      for (const pipeline of this.pipelineList) {
        this.connectedTo.push(this.toStr(pipeline.stageID));
      }
      this.loading = false;
    }, err => {
      this.spinnerType = 'errorCard'
      this.gs.emitWorkflowId.next(null);
    });
  }
  getSum(deals: any[]) {
    return this.currencySrv.get_total_converted_value(deals)

    // return deals.reduce((curr, deal) =>  curr + (parseFloat(deal.amount) || 0), 0)
  }

  toStr(param: number) {
    return param.toString();
  }
  toStringify(obj) {
    return JSON.stringify(obj)
  }

  disableDeal(dealStage) {
    if (dealStage === 'Won' || dealStage === 'Lost') {
      return true;
    } else {
      return false;
    }
  }

  changeDealStage(body) {
    this.dealSrv.changeStage(body)
    .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.getPipelineDeals();
    }, err => {
      this.gs.sweetAlertError(this.gs.getErrMsg(err))
    }).add(() => {
      this.dealModal.loading = false;
      document.getElementById('closeDModal').click();
    });
  }

  onEntered(event: CdkDragDrop<string[]>) {
    const nativeElement = event.item.element.nativeElement;
    const deal: DealModel = JSON.parse(nativeElement.id as any)
    const activeStageIndex = this.pipelineList.findIndex(item => item.stageID == event.item.dropContainer.id);
    const nextStageIndex = this.pipelineList.findIndex(item => item.stageID == event.container.id);
    let moveDealForward = false;

    const findActiveStage = this.pipelineList.find(item => item.stageID == event.item.dropContainer.id);
    const findNextStage = this.pipelineList.find(item => item.stageID == event.container.id);
    const activeStage = {...findActiveStage, id: findActiveStage.stageID, name: findActiveStage.stageName, documents: findActiveStage.document};
    const nextStage = {...findNextStage, id: findNextStage.stageID, name: findNextStage.stageName, documents: findNextStage.document}
      if(activeStageIndex < nextStageIndex){
        moveDealForward = true;
      } else {
        moveDealForward = false;
      }
    if(activeStage.roleName.indexOf(this.gs.roleName) >= 0) {
      if(activeStage.requireValue && this.gs.NoValue(deal.amount) && moveDealForward) {
        this.gs.sweetAlertFieldValidatio('Deal Value is required to move to this stage');
      } else if(activeStage.requireForecast && !deal.forecastAmount && moveDealForward) {
       this.gs.sweetAlertFieldValidatio('Deal Forecast is required to move to this stage');
      } else {
        this.dealModal.getRequiredDoc(activeStage, deal, nextStage, moveDealForward);
        $('#showModal').click();
      }
    } else {
      this.gs.sweetAlertFieldValidatio('You don\'t have permission to move deal to this stage');
    }

  }
  onDrop(event: CdkDragDrop<string[]>) {
    const { id: code} = event.item.element.nativeElement;
    const stage = this.pipelineList.find(item => item.stageID == event.container.id);
    const {stageID, stageName} = stage;
    const body = { stageID, stageName, code};

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  async filterDeal(event) {
    const result = [...this.filteredPipelist]
    const { value } = event.target;
    for (let i = 0; i < this.filteredPipelist.length; i++) {
      const element = this.filteredPipelist[i];
      const deals = element.deals.filter(item => {
        return (item.name.toLowerCase().includes(value.toLowerCase()) || 
        item.clientName.toLowerCase().includes(value.toLowerCase()))
      })
      result[i] = {...result[i], deals}
    }
    this.pipelineList = result
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
