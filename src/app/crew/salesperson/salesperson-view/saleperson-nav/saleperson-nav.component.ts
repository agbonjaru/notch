import { DealsService } from "./../../../../services/deals.service";
import { GeneralService } from "src/app/services/general.service";
import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from "@angular/core";
import dropDownToggle from "src/app/utils/dropdown";
import { SalesPersonModel } from "src/app/models/crew/salesperson.model";
import { FormGroup } from "@angular/forms";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TargetService } from "src/app/services/target.service";
import { ActivatedRoute } from '@angular/router';
import DateUtils from 'src/app/utils/date';
import { DealModel } from 'src/app/models/deal.model';
import { InvoiceService } from 'src/app/services/invoice.service';
declare var $: any;

@Component({
  selector: "app-saleperson-nav",
  templateUrl: "./saleperson-nav.component.html",
  styleUrls: ["./saleperson-nav.component.css"]
})
export class SalepersonNavComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();
  @Input() salesPerson: SalesPersonModel;
  @Output() getSalesperson = new EventEmitter();
  d: number = 1;
  c: number = 1;
  t: number = 1;
  id;
  editMode = false;
  selectedFile: File;
  targetList$: Observable<any[]>;
  commissionList$: Observable<any[]>;
  updateSalperForm: FormGroup;
  dealWon: number = 0;
  dealLost: number = 0;
  salesPersonDeals;
  salesPersonTarget;
  assignedCommissions;
  assignedDeals;
  dateUtils = new DateUtils;
  filterMeta;
  dealList$: DealModel[];
  filteredDeal$;
  teamID;
  invoiceList;

  constructor(
    route: ActivatedRoute,
    private salepersonSrv: SalesPersonService,
    private generalSrv: GeneralService,
    private dealSrv: DealsService,
    private targetSrv: TargetService,
    private invoiceServ: InvoiceService,
  ) {
  }

  ngOnInit() {
    this.getSalesPersonInvoice();
    this.getSalesPersonDeals();
    this.getAssignedTargets();
    this.getAssignedCommission();
    this.getAssignedDeals();
    this.getSalesPersonInvoice();

    if (this.salesPerson) {

      this.commissionList$ = this.salepersonSrv.getSalespersonCommissions(this.salesPerson.id) as any;

      const dealList = (this.dealList$ = this.dealSrv.fetchDeals(this.salesPerson.id) as any);

    }

  }

  /**
   * Refresh the Dropdown List
   */
  public refresh() {
    this.getSalesPersonInvoice();
    this.getSalesPersonDeals();
    this.getAssignedTargets();
    this.getAssignedCommission();
    this.getAssignedDeals();
    this.getSalesPersonInvoice();
  }

  /**
   * GET Salesperson Deal length By ID
   */
  getSalesPersonDeals() {
    this.salepersonSrv
      .getBasicUserDetails(this.salesPerson.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.salesPersonDeals = data;
      });
  }


  toggleClass(className, dropdownClass) {
    dropDownToggle(className, dropdownClass);
  }

  /**
   * GET SalesPerson Target By ID
   */
  getAssignedTargets() {
    this.salepersonSrv.getSalespersonTargets(this.salesPerson.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.salesPersonTarget = data.response.map(e => {
          e.type = this.targetSrv.getTargetType(e.type)['name'];
          e.stage = this.targetSrv.getTargetStage(e.stage)['name'];
          return e;
        });
        this.targetSrv.getTargetLists(this.salesPerson.id)
          .subscribe((res: any) => {
            if (res.status === 200) {
              const targets = res.response.map(e => {
                e.user_type = e.user_type === 'user' ? 'Salesperson' : 'Team';
                return e;
              });
              localStorage.target_lists = JSON.stringify(targets);
            }
          });
      });
  }

  /**
   * GET SalesPerson Commission By ID
   */
  getAssignedCommission() {
    this.salepersonSrv.getSalespersonCommissions(this.salesPerson.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.assignedCommissions = data.response.map(e => {
          e.type = this.targetSrv.getTargetType(e.type)['name'];
          e.stage = this.targetSrv.getTargetStage(e.stage)['name'];
          return e;
        });
      });
  }

  /**
   * Fetch assigned deal by ID && TYPE 
   * WHERE SALESPERSON = 1
   */
  getAssignedDeals() {
    this.dealSrv
      .getMultipleDeals(this.salesPerson.id, 1)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.assignedDeals = data;
      });
  }

  /**
   * Get Salesperson Invoice by salesperson Id
   */
  getSalesPersonInvoice() {
    const query = `createdBy=${this.salesPerson.id}`;
    this.invoiceServ.getInvoiceByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.invoiceList = data.payload
      });
  }

  cancel() {
    this.editMode = false;
  }

  update() {
    if (this.updateSalperForm.valid) {
      const body = { ...this.salesPerson, ...this.updateSalperForm.value };
      this.salepersonSrv
        .updateSalesPerson(body)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          () => {
            this.cancel();
            this.getSalesperson.emit();
            this.generalSrv.sweetAlertSucess("Salesperson Updated");
          },
          err => {
            alert("error occured");
          }
        );
    }
  }

  uploadFile(event) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (this.selectedFile) {
    }
  }

  /**
   * Tabs Navigation (Invoice, Quotation and SALES ORDER)
   */
  openContent(content) {
    document.getElementById(`${content}-tab`).click();
    $("html, body").animate(
      { scrollTop: $(`#${content}-tab`).offset().top },
      "slow"
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
