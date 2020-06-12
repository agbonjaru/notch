import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  SalesOrderFilterComponent,
} from 'src/app/sales/sales-order/sidebar-sales-order/sales-order-filter/sales-order-filter.component';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { GeneralService } from 'src/app/services/general.service';
import { SalesOrderService } from 'src/app/services/sales-order.service';
import { selectConfig } from 'src/app/utils/utils';
import { TeamFilterComponent } from '../../teams/teams-list/teams-side-bar/filter/team-filter.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { noWhitespaceValidator } from 'src/app/utils/no-whitespace.validator';

@Component({
  selector: "app-salesperson-siderbar",
  templateUrl: "./salesperson-siderbar.component.html",
  styleUrls: ["./salesperson-siderbar.component.css"]
})
export class SalespersonSiderbarComponent implements OnInit {
  unsubscribe = new Subject();
  @ViewChild(TeamFilterComponent) Filter: TeamFilterComponent;
  @Output() getInvoiceDateFilter = new EventEmitter();
  @Output() getClearFilter = new EventEmitter();
  @Output() getCreateFilter = new EventEmitter();
  @Output() getCustomFilter = new EventEmitter();
  @Output() getDealsFilter = new EventEmitter();
  @Output() getInvoiceFilter = new EventEmitter();
  @Output() getFilter = new EventEmitter();
  @Output() toggleFilter = new EventEmitter();
  @Output() getDealWonFilter = new EventEmitter();
  @Output() getDealLostFilter = new EventEmitter();

  userID;
  spinnerType: string;
  setSpinnerStatus: string;
  sideBarSpinner: boolean = true;
  salesorderFilter: SalesOrderFilterComponent;
  invoiceDateForm: FormGroup;
  selectedCustomFilter: any;
  createFilterForm: FormGroup;
  editFilterForm: FormGroup;
  selectedSalesPerson: any;
  salesPersonList$;
  showFilter = null;
  invoiceFrom: number = 0;
  invoiceTo: number = 0;
  filterDealsForm: FormGroup;

  filterList$: Observable<any[]>;
  initialCreateFilterValue = {};
  createLoading = false;
  config = { ...selectConfig };

  dealsForm = new FormGroup({
    from: new FormControl(0, [Validators.required, Validators.max(100)]),
    to: new FormControl(0, [Validators.required, Validators.max(100)]),
  });

  dealLostForm = new FormGroup({
    from: new FormControl(0, [Validators.required, Validators.max(100)]),
    to: new FormControl(0, [Validators.required, Validators.max(100)]),
  });

  dealWonForm = new FormGroup({
    from: new FormControl(0, [Validators.required, Validators.max(100)]),
    to: new FormControl(0, [Validators.required, Validators.max(100)]),
  });

  constructor(
    private salespersonSrv: SalesPersonService,
    private gs: GeneralService,
    private fb: FormBuilder,
    store: Store<AppState>
  ) {
    store.select("userInfo").subscribe(info => {
      this.userID = info.user.id;
    });
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "...";
  }

  ngOnInit() {
    this.newFilterForm();
    this.newFilterDealsForm();
    this.getAllSalesPersons();
    this.getAllFilters();
  }

  isSelected(id) {
    return id === this.selectedCustomFilter;
  }

  /**
   * New Filter Form 
   */
  newFilterForm() {
    this.createFilterForm = this.fb.group({
      filterName: ['', [Validators.required, noWhitespaceValidator]],
      noOfDeals: [""],
      noOfDealsLost: [""],
      noOfDealsWon: [""],
    });

    return this.createFilterForm;
  }

  /**
   * Toggle for Teams filter  
  */
  toggle(type) {
    this.toggleFilter.emit(type)
  }

  /**
   * Getting All FILTERS for SalesPerson
   */
  getAllFilters() {
    this.salespersonSrv
      .fetchFilter()
      .subscribe((data: Observable<any[]>) => {
        this.filterList$ = data;
      })
      .add(() => (this.sideBarSpinner = false));
  }

  /**
   * Filter Deals Form (New)
   */
  newFilterDealsForm() {
    this.filterDealsForm = this.fb.group({
      filterType: ["", Validators.required],
      dealsFrom: [0, Validators.required],
      dealsTo: [0, Validators.required]
    });
  }

  /**
   * Get All SalesPersons
   */
  getAllSalesPersons() {
    this.salespersonSrv.fetchAllSalePersons().subscribe(data => {
      this.salesPersonList$ = data;
    });
  }

  /**
   * Clear Filter
   */
  clearFilter() {
    const resetForms: FormGroup[] = [
      this.createFilterForm, this.dealsForm, this.dealLostForm, this.dealWonForm,
    ]
    resetForms.forEach(form => form.reset());
    this.getClearFilter.emit()
  }

  /**
   * Custom Filter by FilterID
   * @param filterId 
   */
  customFilter(filterId) {
    this.getCustomFilter.emit(filterId);
  }

  createdOnFilter = date => this.getFilter.emit(date);

  /**
   * Create Filter For SalesPersons
   */
  createFilter() {
    this.createLoading = true;
    const payload = this.createFilterForm.value;
    this.salespersonSrv.newSalesPersonCustomFilter(payload)
      .subscribe(
       ( result : any) => {
          this.createLoading = false;
          this.gs.sweetAlertSucess(result.message);
          this.createFilterForm.reset();
        },
        error => {
          this.createLoading = false;
          this.gs.sweetAlertError(this.gs.getErrMsg(error));
        }
      )
      .add(() => {
        this.createFilterForm.reset();
        this.getAllFilters();
      });
  }

  /**
     * Invoice  Filter     
  * @param data
  */
  invoiceFilter() {
    this.getInvoiceFilter.emit();
  }

  /**
   * Total Deals Won
   */
  dealWonFilter() {
    this.getDealWonFilter.emit();
  }

  /**
   * Total Deals Lost
   */
  dealLostFilter() {
    this.getDealLostFilter.emit();
  }

  /**
   * Total Deals  Filter
   */
  dealsFilter() {
    this.getDealsFilter.emit();
  }

  /**
   * Toggle Filter
   * @param index 
   */
  toogleFilter(index: number) {
    document.getElementById(`collapseHead-${index}`).click();
  }

  /**
   * On Edit Filter
   * @param index 
   */
  onEditFilter(index) {
    this.showFilter = index;
    this.createFilterForm.enable();
  }

  /**
   * To View The Filter
   * @param index 
   */
  activateEdit(index) {
    document.getElementById(`collapseHead-${index}`).click();
  }

  /**
   * Edit Filter
   * @param index 
   */
  editFilter(index) {
    this.showFilter = index;
  }

  /**
   * Cancel Filter
   * @param index
   */
  cancelFiter(index) {
    this.showFilter = !index;
  }

  /**
   * Edit Filter
   * @param data 
   */
  getEditFilter(data) {
    this.Filter.editLoading = true;
    this.salespersonSrv.editFilter(data).subscribe(
      (res: any) => {
        this.cancelFiter(0);
        this.Filter.editLoading = false;
        this.getAllFilters();
        this.gs.sweetAlertSucess(res.message);
      },
      error => {
        this.Filter.editLoading = false;
        this.getAllFilters();
        this.gs.sweetAlertError(this.gs.getErrMsg(error));
      }
    );
  }

  /**
   * Delete Filter Form salesperson CustomFilter
   * @param filter 
   */
  deleteFilter(filter) {
    this.gs.sweetAlertFileDeletions(` Filter`).then(res => {
      if (res.value) {
        this.salespersonSrv.deleteSalesPersonCustomFilter(filter.id).subscribe(
          (res: any) => {
            this.filterList$ = this.salespersonSrv.fetchFilter() as any;
            this.getAllFilters();
            this.gs.sweetAlertSucess(res.message);
          },
          error => {
            this.gs.sweetAlertError(this.gs.getErrMsg(error));
          }
        );
      }
    });
  }
}
