import { Component, OnInit, OnDestroy } from '@angular/core';
import { TicketSettingsService } from 'src/app/services/settings-services/ticket-settings.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general.service';
import { ClientService } from 'src/app/services/client-services/clients.service';
import { selectConfig } from 'src/app/utils/utils';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import $ from 'jquery';

@Component({
  selector: 'app-ticket-settings',
  templateUrl: './ticket-settings.component.html',
  styleUrls: ['./ticket-settings.component.css']
})
export class TicketSettingsComponent implements OnInit, OnDestroy {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "Clients", key: "clientName" },
      { title: "Response Time", key: "responseTime" },
      { title: "Resolution Time", key: "resolutionTime" },
      { title: "Ticket Priority", key: "ticketPriority" },
      { title: "Creation Date", key: "createdDate" },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},

      singleActions: [
        "Delete",
      ],
      bulkActions: [
      ]
    }
  };
  config = {...selectConfig}
  clientList$ = this.clientSrv.getAllClients();
  slaList: any[]
  slaTime = {id: null, autoResponseTime: null};
  private unscb = new Subject();
  resLoading = false;
  slaLoading = false

  slaForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    resolutionTime: new FormControl(null, Validators.required),
    responseTime: new FormControl(null, Validators.required),
    ticketPriority: new FormControl('', Validators.required)
  })
  constructor(
    private ticketSetSrv: TicketSettingsService,
    private clientSrv: ClientService,
    public gs: GeneralService) { }
  dataFeedBackObsListener = data => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "Delete") {
          this.deleteResSla(data.data)

        }
        break;
      default:
        break;
    }
  };

  ngOnInit() {
    this.getAutomaticRes(); 
    this.getResSlas(true);
  }
  getAutomaticRes() {
    this.ticketSetSrv.fetchAutomaticTime().pipe(takeUntil(this.unscb)).subscribe((res: any) => {
      if(res) {
        this.slaTime = res
      }    
    })
  }
  getResSlas(auto = false) {
    this.ticketSetSrv.fetchSLAs().pipe(takeUntil(this.unscb)).subscribe((res:any) => {
      this.slaList = res;
      this.dataTable.dataChangedObs.next(true)
      if(auto) {
        $.getScript('/assets/js/datatableScript.js');
      }
    })
  }

  ticketResTime() {
    if(this.slaTime) {
      const resType = this.slaTime.id ? 'editTicketResTime' : 'newTicketResTime'
      const payload = this.slaTime;
      this.resLoading = true;
      this.ticketSetSrv[resType](payload).pipe(takeUntil(this.unscb)).subscribe((res: any) => {
        this.resLoading = false;
        this.gs.sweetAlertSucess(res.message);
        this.getAutomaticRes();
      }, error => {
         this.resLoading = false; 
         const msg = error.error.message ? error.error.message : 'Error occured try again';
        this.gs.sweetAlertError(msg);
      })
    }
  }
  newResSla() {
    if(this.slaForm.valid) {
      this.slaLoading = true;
      this.ticketSetSrv.newResSla(this.slaForm.value).pipe(takeUntil(this.unscb)).subscribe((res: any) => {
        this.slaLoading = false;
        this.gs.sweetAlertSucess(res.message);
        this.slaForm.reset()
        this.getResSlas()
      }, error => {
        this.slaLoading = false;
        this.slaForm.reset()
        const msg = error.error.message ? error.error.message : 'Error occured try again';
        this.gs.sweetAlertError(msg);
      })
    }
  }
  deleteResSla({id , clientName}) {
    this.gs.sweetAlertFileDeletions(clientName).then(res => {
      if(res.value) {
        this.ticketSetSrv.deleteSLA(id).pipe(takeUntil(this.unscb)).subscribe((res: any) => {
          this.getResSlas();
          this.gs.sweetAlertSucess(res.message)
        }, error =>  {
          const msg = error.error.message ? error.error.message : 'Error occured try again';
          this.gs.sweetAlertError(msg);
        } )
      }
    })
  }

  ngOnDestroy() {
    this.unscb.next();
    this.unscb.complete();
  }

}
