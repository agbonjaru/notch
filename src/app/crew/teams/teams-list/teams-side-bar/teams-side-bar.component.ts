import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { TeamsService } from 'src/app/services/crew-services/teams.service';
import { GeneralService } from 'src/app/services/general.service';
import { selectConfig } from 'src/app/utils/utils';
import { TeamFilterComponent } from './filter/team-filter.component';
import { noWhitespaceValidator } from 'src/app/utils/no-whitespace.validator';


@Component({
  selector: "app-teams-side-bar",
  templateUrl: "./teams-side-bar.component.html",
  styleUrls: ["./teams-side-bar.component.css"]
})

export class TeamsSideBarComponent implements OnInit {
  unsubscribe = new Subject();
  @ViewChild(TeamFilterComponent) Filter: TeamFilterComponent;
  @Output() getInvoiceDateFilter = new EventEmitter();
  @Output() getClearFilter = new EventEmitter();
  @Output() getCreateFilter = new EventEmitter();
  @Output() getCustomTeamFilter = new EventEmitter();
  @Output() toggleFilter = new EventEmitter();
  @Output() getFilter = new EventEmitter();
  @Output() getDealsFilter = new EventEmitter();
  @Output() getInvoiceFilter = new EventEmitter();
  @Output() getDealWonFilter = new EventEmitter();
  @Output() getDealLostFilter = new EventEmitter();

  invoiceDateForm: FormGroup;
  createFilterForm: FormGroup;
  selectedSalesPerson: any;
  salesPersonList$;
  showFilter = null;
  filterList = [];
  filterList$: Observable<any[]>;
  initialCreateFilterValue = {};
  createLoading = false;
  config = { ...selectConfig };
  spinnerType: string;
  setSpinnerStatus: string;
  sideBarSpinner: boolean = true;
  selectedCustomFilter;

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
    private teamsSrv: TeamsService,
    private gs: GeneralService,
    private fb: FormBuilder
  ) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "...";
  }

  ngOnInit() {
    this.newFilterForm();
    this.getAllFilters();
  }

  isSelected(id) {
    return id === this.selectedCustomFilter;
  }

  newFilterForm() {
    this.createFilterForm = this.fb.group({
      filterName: ['', [Validators.required, noWhitespaceValidator]],
      noOfDeals: '',
      noOfDealsLost: '',
      noOfDealsWon: '',
    });
  }

  /**
   * Getting All FILTERS for teams
   */
  getAllFilters() {
    this.teamsSrv
      .fetchAllTeamsFilter()
      .subscribe((data: Observable<any[]>) => {
        this.filterList$ = data;
      })
      .add(() => (this.sideBarSpinner = false));
  }

  /**
   * Clear Filter
   */
  clearFilter() {
    const resetForms: FormGroup[] = [
      this.createFilterForm, this.dealsForm, this.dealLostForm, this.dealWonForm
    ]
    resetForms.forEach(form => form.reset());
    this.getClearFilter.emit()
  }

  /**Toggle for Teams filter
   * toggle
   */
  toggleTF(type) {
    this.toggleFilter.emit(type)
  }

  createdOnFilter = date => this.getFilter.emit(date);

  /**
   * Creating a filter for teams
   * POST
   */
  createFilter() {
    const payload = this.createFilterForm.value;
    this.createLoading = true;
    this.teamsSrv
      .newTeamsPersonCustomFilter(payload).subscribe(
        (res: any) => {
          this.createLoading = false;
          this.getAllFilters();
          this.gs.sweetAlertSucess(res.message);
          this.createFilterForm.reset();
        },
        error => {
          this.createLoading = false;
          this.gs.sweetAlertError(this.gs.getErrMsg(error));
        }
      );
  }

  /**
   * Custom filters by id
   * @param id 
   */
  customFilter(id) {
    this.getCustomTeamFilter.emit(id);
  }

  /**
    * Invoice  Filter     
  */
  invoiceFilter() {
    this.getInvoiceFilter.emit();
  }

  /**
   * Total Deals Filter
   */
  dealsFilter() {
    this.getDealsFilter.emit();
  }

  /**
 * Total Deals Won Filter
 */
  dealWonFilter() {
    this.getDealWonFilter.emit();
  }

  /**
 * Total Deals Lost Filter
 */
  dealLostFilter() {
    this.getDealLostFilter.emit();
  }

  activateEdit(index) {
    document.getElementById(`collapseHead-${index}`).click();
  }

  editFilter(index) {
    this.showFilter = index;
  }

  cancelFiter(index) {
    this.showFilter = !index;
  }

  /**
   * Edit Filter
   * @param data 
   */
  getEditFilter(data) {
    this.Filter.editLoading = true;
    this.teamsSrv.editFilter(data).subscribe(
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
   * Deleting a filter for teams filter lists
   * @param filter 
   */
  deleteFilter(filter) {
    this.gs.sweetAlertFileDeletions(`Filter`).then(res => {
      if (res.value) {
        this.teamsSrv.deleteSTeamsCustomFilter(filter.id).subscribe(
          (res: any) => {
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
