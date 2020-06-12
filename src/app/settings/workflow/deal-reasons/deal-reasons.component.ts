import { Observable } from 'rxjs';
import { DealPipelineWorkflowService } from './../../../services/settings-services/deal-pipeline-workflow.service';
import { GeneralService } from 'src/app/services/general.service';
import { NgModel } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deal-reasons',
  templateUrl: './deal-reasons.component.html',
  styleUrls: ['./deal-reasons.component.css']
})
export class DealReasonsComponent implements OnInit {
  allReasonList$: Observable<any[]>;
  loading = false;
  constructor(
    private gs: GeneralService,
    private dealworkflowSrv: DealPipelineWorkflowService
    ) {
      this.getData()
     }

  ngOnInit() {
  }
  getData() {
    this.allReasonList$ = null;
    this.allReasonList$ = (this.dealworkflowSrv.fetchDealReasons() as any);
  }

  add(form: NgModel) {
    if(form.valid) {
      this.loading = true;
      this.dealworkflowSrv.createDealReason(form.value).subscribe((res: any) => {
        this.getData()
        this.gs.sweetAlertSucess(res.message)
      }, err => {
        this.gs.sweetAlertError(this.gs.getErrMsg(err))
      }).add(() => {
        this.loading = false;
        form.reset();
      })
    }
    console.log(form.value);
  }
  deleteReason({id, value}) {
    const observable = this.dealworkflowSrv.deleteDealReason(id);
    const msg = `<p>Delete this reason for losing a deal?</p> <h5 class="m-0">${value}</h5>`
    this.gs.sweetAlertAsync('warning', msg, observable)
        .then(res => {
          if(res.value && res.value.status) {
          if(res.value.status === 'success') {
            this.getData()
            this.gs.sweetAlertSucess(res.value.message)
          } else {
            this.gs.sweetAlertError(this.gs.getErrMsg(res.value.error));
          }
        }
        })
  }

}
