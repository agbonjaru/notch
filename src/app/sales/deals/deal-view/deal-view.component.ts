import  DateUtils  from 'src/app/utils/date';
import { Router } from '@angular/router';
import { DealPipelineWorkflowService } from 'src/app/services/settings-services/deal-pipeline-workflow.service';
import { NgForm } from '@angular/forms';
import { DealNavComponent } from './deal-nav/deal-nav.component';
import { DealModalComponent } from '../../../shared/components/deal-modal/deal-modal.component';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import { DealsService } from 'src/app/services/deals.service';
import { DealModel } from 'src/app/models/deal.model';
import { takeUntil } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general.service';
import { EmailService } from 'src/app/services/integrations/email/email.service';
@Component({
  selector: 'app-deal-view',
  templateUrl: './deal-view.component.html',
  styleUrls: ['./deal-view.component.css'],
})
export class DealViewComponent implements OnInit, OnDestroy {
  dateUtils = new DateUtils()
  @ViewChild(DealModalComponent) dealModal: DealModalComponent
  @ViewChild(DealNavComponent) dealNav: DealNavComponent;
  private unsubscribe = new Subject<any>();
  minDate = this.dateUtils.getNxtDay();

  showScore = false;
  id: string;
  deal: DealModel;
  stageList = [];
  selectedFile: File;
  stage;
  fileErrMsg = false;
  seletedReason = '';
  selectedOtherReason = '';
  errors = {others: false, reason: false};
  reasonList$ = this.dealworkSrv.fetchDealReasons();
  public clickedEvent: Event;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealSrv: DealsService,
    public generalSrv: GeneralService,
    private dealworkSrv: DealPipelineWorkflowService,
    private emailSrv: EmailService) {
    $.getScript('../../../assets/js/datatableScript.js');
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.getDeal();
  }
  getDeal() {
    this.dealSrv.fetchDeal(this.id).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: DealModel) => {
        this.passDataToEmailConText(data);
        this.deal = data;
        this.getStages(this.deal.salesProcessID);
      });
  }
  passDataToEmailConText(deal: DealModel) {
    const context_data = {
      name: 'deal',
      data: {
        id: deal.code,
        email: deal.clientEmail,
        email_list: deal.contacts.map(contact => contact.email)
      },
      deal
    }
    this.emailSrv.email_context.next(context_data)
  }
  passDealsData(url: string) {
    const data = {
      session_id: this.deal.code, 
      session_location: 'deals',
      client_id: this.deal.clientID, 
      client_name: this.deal.clientName,
      currency: this.deal.currency,
      team_id: this.deal.teamID
    };
    this.router.navigate([url], {queryParams: data, fragment:'redirect'})
  }
  getStages(processId) {
    this.dealSrv.fetchStages(processId).pipe(takeUntil(this.unsubscribe))
    .subscribe((data: any) => this.stageList = data);
  }
  toggleScore() {
    this.showScore = !this.showScore;
  }
  uploadFile(event){
    this.selectedFile = event.target.files[0];
  }
  changeStage(stage, e) {
    e.preventDefault();
    const won = this.stageList[this.stageList.length - 2];
    const loss = this.stageList[this.stageList.length - 1];
    this.stage = stage === 'Won' ? won : loss; 
    if(stage === 'Won') {
      const activeStage = this.stageList.find(stage => stage.id == this.deal.stageID);
      if(activeStage.roleNames.indexOf(this.generalSrv.roleName) >= 0) {
        if(activeStage.requireValue && (this.deal.amount == '0'||(this.deal.amount as any)== 0||this.deal.amount == null || this.deal.amount == '')) {
          this.generalSrv.sweetAlertFieldValidatio(`Deal Value is required to mark deal as ${stage}`);
        } else if(activeStage.requireForecast && !this.deal.forecastAmount) {
         this.generalSrv.sweetAlertFieldValidatio(`Deal Forecast is required to mark deal as ${stage}`);
        } else {
          document.getElementById('auto-click-won').click();
          this.dealModal.getRequiredDoc(activeStage, this.deal, this.stage); 
        }
      } else {
        this.generalSrv.sweetAlertFieldValidatio(`You don\'t have permission to mark deal as ${stage}`);
      }
    } else {
      document.getElementById('lossDealBtn').click();
    }
  }
  closeForecastModal(form: NgForm) {
    form.reset();
  }
  closeDealLossModal() {
    this.selectedOtherReason = '';
    this.seletedReason = '';
    this.lossDealLoading = false; 
    $('#closeDealLossModal').click();
    console.log('close deal loss modal');
  }
  // Mark Deal As Loss Logic
  lossDealLoading = false;
  changeReson() {

    
  }
  markDealAsLoss() {
    let payload = {code: this.deal.code, stageID: this.stage.id, stageName: this.stage.name}
    if(this.seletedReason) {
      if(this.seletedReason === 'others') {
        if(this.selectedOtherReason) {
          this.errors.others = false;
          this.lossDealLoading = true;
          this.changeDealStage({...payload, comment: this.selectedOtherReason})
        } else {
          this.errors.others = true
        }
      } else {
        this.errors.reason = false;
        this.lossDealLoading = true;
        this.changeDealStage({...payload, comment: this.seletedReason})
      }
    } else {
      this.errors.reason = true
    }

    console.log(this.errors);
    
  }
  changeDealStage(body) {
    this.dealSrv.changeStage(body).pipe(takeUntil(this.unsubscribe))
    .subscribe(() => {
      this.getDeal();
    }, err => {
      this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err))
    }).add(() => {
      if(body.stageName === 'Won') {
        this.dealModal.loading = false;
        this.dealNav.getDocument();
        document.getElementById('closeDModal').click();
        const url = '/assets/img/great-emoji.svg' 
        this.generalSrv.sweetAlertIcon(url,'swt-img', 'Awesome'); 
      } else {
        this.lossDealLoading = false;
        this.closeDealLossModal();
        const url = '/assets/img/not-good-emoji.svg'
        this.generalSrv.sweetAlertIcon(url,'swt-img', 'Lost'); 
      }
    });
  }


  forcastLoading = false;
  forcastDeal(form) {
    if(form.valid) {
      this.forcastLoading = true
     const body = {...this.deal, ...form.value}
      this.dealSrv.updateDeal(body).pipe(takeUntil(this.unsubscribe)).subscribe(() => {
        this.getDeal();
        this.generalSrv.sweetAlertSucess('Deal Forecast Successful')
      }, err => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err))
      }).add(() => {
        $('#closeModal').click();
        this.forcastLoading = false
      })
    }
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
