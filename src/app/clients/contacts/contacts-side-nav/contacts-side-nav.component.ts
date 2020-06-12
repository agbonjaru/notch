import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { GeneralService } from "src/app/services/general.service";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { CustomFilterService } from "src/app/services/customFilter.service";
import { selectConfig } from "src/app/utils/utils";

@Component({
  selector: "app-contacts-side-nav",
  templateUrl: "./contacts-side-nav.component.html",
  styleUrls: ["./contacts-side-nav.component.css"]
})
export class ContactsSideNavComponent implements OnInit, OnDestroy {
  config = { ...selectConfig, placeholder: "Select Companies" };

  showFilter = null;
  unsubscribe = new Subject();
  @Output() getContactNameFilter = new EventEmitter();
  @Output() getClearFilter = new EventEmitter();
  @Output() getDOBFilter = new EventEmitter();
  @Output() getCompanyFilter = new EventEmitter();
  @Output() getMaritalStatusFilter = new EventEmitter();
  @Output() getGenderFilter = new EventEmitter();
  @Output() getCustomFilter = new EventEmitter();

  contactForm = new FormGroup({
    contactName: new FormControl("", Validators.required)
    // clientId: new FormControl(''),
  });

  dateOfBirthForm = new FormGroup({
    fromDate: new FormControl("", [Validators.required]),
    toDate: new FormControl("", [Validators.required])
  });

  companyForm = new FormGroup({
    companyName: new FormControl("", Validators.required)
  });

  genderForm = new FormGroup({
    gender: new FormControl("", Validators.required)
  });

  maritalStatusForm = new FormGroup({
    status: new FormControl("", Validators.required)
  });

  createFilterForm = new FormGroup({
    filterName: new FormControl("", Validators.required),
    companyName: new FormControl("", Validators.required),
    gender: new FormControl("", Validators.required),
    maritalStatus: new FormControl("", Validators.required)
  });

  filterList = [];

  userId;

  dropdownOptions: Observable<any>;
  contactsDetailArray = [];
  companies: Observable<any>;

  constructor(
    private generalSrv: GeneralService,
    private contactServ: ContactsService,
    private companyServ: CompaniesService,
    private customFilterServ: CustomFilterService,
    store: Store<AppState>
  ) {
    store.select("userInfo").subscribe(data => {
      this.userId = data.user.id;
    });
    // Get Contacts
    this.contactServ
      .getAllContacts()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        res => {
          if (res) {
            // create array object
            const arrayResponse = [];
            // loop through object and push into array
            Object.keys(res).forEach(key => {
              arrayResponse.push(res[key]);
            });

            arrayResponse[1].map((res2: any) => {
              this.contactsDetailArray.push({
                id: res2.id,
                name: `${res2.firstName} ${res2.surName}`
              });
            });
            const dropDown = [];
            this.contactsDetailArray.forEach(element => {
              dropDown.push(element.name);
            });
            this.dropdownOptions = new Observable(observer => {
              observer.next(dropDown);
            });
          }
        },
        error => {
          // this.loadingView = false;
          console.log(error, "error on getting contacts");
        }
      );
  }

  ngOnInit() {
    this.getFilters();
  }

  // Get Company
  private companyFrmDB() {
    this.companyServ.getAllCompanies().subscribe(res => {
      const { payload } = res;
      let container = [];
      payload.map((res2: any) => {
        container.push({
          id: res2.clientId,
          name: res2.name
        });
      });
      this.companies = new Observable(observer => {
        observer.next(container);
      });
    });
  }

  clearAllFilter() {
    this.getClearFilter.emit();
    this.contactForm.reset();
  }

  filterByContactName() {
    this.getContactNameFilter.emit();
  }

  filterByMaritalStatus() {
    this.getMaritalStatusFilter.emit();
  }

  filterByGender() {
    this.getGenderFilter.emit();
  }

  filterByCustomFilter(filterData) {
    this.getCustomFilter.emit(filterData);
  }

  filterByDOB() {
    this.getDOBFilter.emit();
  }

  filterByCompanyName() {
    this.getCompanyFilter.emit();
  }

  createUpdateFilter(type) {
    if (this.createFilterForm.valid) {
      const payload = {
        id: "",
        userId: this.userId,
        service: "contact",
        filter: this.createFilterForm.value,
        name: this.createFilterForm.value.filterName
      };
      if (type === "create") {
        this.customFilterServ
          .createCustomFilter(payload)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(() => {
            this.createFilterForm.reset();
            this.getFilters();
          });
      } else {
        payload.id = this.filterList[0].id;
        this.customFilterServ
          .updateCustomFilter(payload)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(() => {
            this.createFilterForm.reset();
            this.getFilters();
            this.showFilter = null;
          });
      }
    }
  }

  setValue(filterData) {
    if (filterData) {
      this.createFilterForm.patchValue(filterData);
    }
  }

  getFilters() {
    this.customFilterServ
      .getCustomFilter(this.userId, "contact")
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.filterList = data.payload;
        // console.log(this.filterList, "loglid");
      });
  }

  deleteFilter(filter) {
    this.generalSrv
      .sweetAlertFileDeletions(`${filter.filter.filterName} Filter`)
      .then(result => {
        if (result.value) {
          this.customFilterServ
            .deleteCustomFilter(filter.id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              this.getFilters();
            });
        }
      });
  }

  toStr(value) {
    return JSON.stringify(value);
  }

  toJson(value) {
    return JSON.parse(value);
  }
  editFilter(index, data?) {
    console.log(data, "edittiem");
    this.showFilter = index;
    this.setValue(data.filter);
  }

  cancelFiter(index) {
    this.showFilter = !index;
  }

  fetchCompanyList() {
    this.companyFrmDB();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
