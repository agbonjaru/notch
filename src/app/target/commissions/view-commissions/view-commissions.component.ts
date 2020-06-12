import * as $ from 'jquery';
import { Component, OnInit } from '@angular/core';
import { TargetService } from 'src/app/services/target.service';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { CurrencyService } from 'src/app/services/currency.service';

@Component({
  selector: 'app-view-commissions',
  templateUrl: './view-commissions.component.html',
  styleUrls: ['./view-commissions.component.css']
})
export class ViewCommissionsComponent implements OnInit {
  processes: Array<{}> = [];
  payments: Array<{}> = [];
  committals: Object = {};
  commission: Object = {};
  commissionId;
  userId;
  earnings: Number = 0;
  amount_paid: Number = 0;
  user_commission_id;
  processed_commission: Number = 0;
  loadingView = false;
  loadingView2 = false;
  processForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private currencySrv: CurrencyService,
    private targetService: TargetService,
    private generalService: GeneralService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.commissionId = params.id;
      this.getCommission(this.commissionId);
    });
  }

  ngOnInit() {
    this.createForm();
    $.getScript('../../../assets/js/datatableScript.js');
  }

  private getCommission(id) {
    this.targetService.getCommissions(
      (this.generalService.isSuperAdmin)? null : this.userId
    ).subscribe((res: any) => {
      if (res.status === 200) {
        this.commission = (res.response.filter(e => {
          return e.id === Number(id);
        }))[0];
        this.getCommittals();
      }
    });
  }

  private getCommittals() {
    let id = this.commission['id'],
        userId = this.commission['userId'],
        targetId = this.commission['targetId'],
        paid = this.commission['value'],
        type = this.commission['type'],
        rate = this.commission['rate'],
        threshold_rate = this.commission['threshold'],
        target_value = this.commission['target_value'],
        accelerator = this.commission['accelerator'],
        accelerator_type = this.commission['accelerator_type'],
        accelerator_threshold_rate = this.commission['accelerator_threshold'],
        start = this.commission['start'],
        end = this.commission['end'],
        stage = this.commission['stage'];
    this.userId = userId;
    this.user_commission_id = id;
    this.amount_paid = Number(paid);
    this.loadingView = true;
    this.targetService.getTargetCommittals('user', type, userId, targetId, start, end, stage).subscribe((res: any) => {
      if (res.status === 200) {
        this.committals = res.response;
        this.committals['total'] = this.committals['total'] || 0;
        this.committals['total'] = this.currencySrv.get_total_converted_value(this.committals['data'], 'amount');
        const currency_rate = this.currencySrv.get_conversion_rate(this.commission['currency']);
        this.committals['total'] = this.committals['total'] * currency_rate;
        let accelerator_threshold = (parseFloat(accelerator_threshold_rate)/100) * parseFloat(target_value),
            threshold = (parseFloat(threshold_rate)/100) * parseFloat(target_value),
            progress = (parseFloat(this.committals['total'])/parseFloat(target_value)) * 100;
        if (parseFloat(this.committals['total']) >= threshold){
            if (accelerator &&
                accelerator_type &&
                accelerator_threshold_rate &&
                progress >= accelerator_threshold_rate
            ) {
                switch (accelerator_type) {
                    case 'all': {
                        this.earnings = (parseInt(accelerator)/100) * parseFloat(this.committals['total']);
                        break;
                    }
                    case 'additional': {
                        let excess = parseFloat(this.committals['total']) - accelerator_threshold,
                            earnings_ = (parseInt(rate)/100) * accelerator_threshold,
                            earnings_excess = (parseInt(accelerator)/100) * excess;
                        this.earnings = earnings_ + earnings_excess;
                        break;
                    }
                }
            } else {
                this.earnings = (parseInt(rate)/100) * parseFloat(this.committals['total']);
            }
        }
        this.getPayments();
      }
    });
  }

  private getPayments() {
    this.targetService.getCommissionPayments(
        this.commission['id']
      ).subscribe((res: any) => {
      if (res.status === 200) {
        this.payments = res.response;
        this.getProcesses();
      }
    });
  }

  private getProcesses() {
    this.targetService.getCommissionProcesses(this.commission['id'])
    .subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200) {
        this.processes = res.response;
        let process_amount = 0;
        $.each(this.processes, (key, value) => {
            let amount = Number((Number(value.amount)).toFixed(2));
            process_amount += amount;
        });
        this.processed_commission = Number(this.earnings) - Number(this.commission['value']) + process_amount;
      }
    });
  }

  setProcessType() {
    if (this.processForm.value.type === 'none') {
      this.processForm.get('amount').setValidators([CustomValidators.number]);
    } else {
      this.processForm.get('amount').setValidators([Validators.required, CustomValidators.number]);
    }
    this.processForm.get('amount').updateValueAndValidity();
  }
  
  addPayment() {
    this.generalService.sweetAlertFileCreations('Commission Payment')
      .then(res => {
        if (res.value) {
          const $amount = $('#amount');
          let obj = {
            userId: this.userId,
            commissionId: this.commissionId,
            user_commissionId: this.user_commission_id,
            total_earned: this.earnings,
            total_processed: this.processed_commission,
            total_paid: this.amount_paid,
            amount: Number($amount.val())
          };
          if (!obj.amount || Number(obj.amount) <= 0)
              return this.generalService.notification('Invalid amount specified', '', 'warning');
          obj.amount = Number(obj.amount);
          if (obj.amount > this.processed_commission)
              return this.generalService.notification(`Insufficient commission available (${this.processed_commission})`, '', 'warning');
          this.loadingView = true;
          this.targetService.addCommissionPayment(obj)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200)
                this.getCommission(this.commissionId);
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  createForm() {
    this.processForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      amount: ['',
        [
          Validators.required,
          CustomValidators.number
        ]
      ]
    });
  }

  processCommission() {
    $('#ModalCenter4 .close').click();
    this.generalService.sweetAlertFileCreations('Commission Process')
      .then(res => {
        if (res.value) {
          let obj = {
            userId: this.userId,
            commissionId: this.commissionId,
            user_commissionId: this.user_commission_id,
            title: this.processForm.value.title,
            type: this.processForm.value.type,
            amount: this.processForm.value.amount
          };
          if ((obj.type !== 'none' && !obj.amount) || !obj.title || !obj.type)
              return this.generalService.notification('Kindly fill all required field(s)', '', 'warning');
          obj.amount = parseFloat(obj.amount);
          if (obj.type !== 'none') {
              if (obj.amount <= 0)
              return this.generalService.notification('Invalid amount specified', '', 'warning');
              if ((obj.type === 'deduction') && (obj.amount > this.earnings))
                  return this.generalService.notification(`Insufficient commission earned (${this.earnings})`, '', 'warning');
              obj.amount = (obj.type === 'addition')? obj.amount : (-1 * obj.amount);
          } else {
              obj.amount = 0;
          }
          this.loadingView = true;
          this.targetService.addCommissionProcess(obj)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200) {
                this.getProcesses();
                this.processForm.reset();
              }
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  reversePayment(id) {
    this.generalService.sweetAlertFileDeletions('Commission Payment')
      .then(result => {
        if (result.value) {
          this.loadingView = true;
          this.targetService.reverseCommissionPayment(id)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200)
                this.getCommission(this.commissionId);
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  reverseProcess(id) {
    $('#ModalCenter4 .close').click();
    this.generalService.sweetAlertFileDeletions('Commission Process')
      .then(result => {
        if (result.value) {
          this.loadingView2 = true;
          this.targetService.reverseCommissionProcess(id)
            .subscribe((response: any) => {
              this.loadingView2 = false;
              if (response.status === 200)
                this.getPayments();
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }
}
