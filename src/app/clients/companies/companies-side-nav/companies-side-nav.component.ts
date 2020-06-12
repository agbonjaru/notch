import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  OnDestroy
} from "@angular/core";
import { Subject, Observable } from "rxjs";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { takeUntil } from "rxjs/operators";
import { CustomFilterService } from "src/app/services/customFilter.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { dataList } from "src/app/data/industries";
import { GeneralService } from "src/app/services/general.service";
import Swal from "sweetalert2";
import { selectConfig } from "src/app/utils/utils";

@Component({
  selector: "app-companies-side-nav",
  templateUrl: "./companies-side-nav.component.html",
  styleUrls: ["./companies-side-nav.component.css"]
})
export class CompaniesSideNavComponent implements OnInit, OnDestroy {
  config = { ...selectConfig, placeholder: "Select Contact" };

  showFilter = null;
  unsubscribe = new Subject();
  @Output() getCompanyNameFilter = new EventEmitter();
  @Output() getClearFilter = new EventEmitter();
  @Output() getContactFilter = new EventEmitter();

  @Output() getCompanyDateFilter = new EventEmitter();
  @Output() getCompanyindustryFilter = new EventEmitter();
  @Output() getCompanyCustomFilter = new EventEmitter();

  companyForm = new FormGroup({
    companyName: new FormControl("", Validators.required)
  });

  contactForm = new FormGroup({
    contactName: new FormControl("", Validators.required)
  });

  companyDateForm = new FormGroup({
    fromDate: new FormControl("", [Validators.required]),
    toDate: new FormControl("", [Validators.required])
  });

  industryForm = new FormGroup({
    industry: new FormControl("", Validators.required)
  });

  createFilterForm = new FormGroup({
    filterName: new FormControl("", Validators.required),
    contactName: new FormControl("", Validators.required),
    industry: new FormControl(0, Validators.required)
  });

  filterList = [];
  userId;

  dropdownOptions: Observable<any>;
  companiesDetailArray = [];
  contacts: Observable<any>;

  constructor(
    private contactServ: ContactsService,
    private companyServ: CompaniesService,
    private customFilterServ: CustomFilterService,
    private generalSrv: GeneralService,
    store: Store<AppState>
  ) {
    store.select("userInfo").subscribe(data => {
      this.userId = data.user.id;
    });
    // Get Companies
    this.companyServ
      .getAllCompanies()
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
              this.companiesDetailArray.push({
                id: res2.id,
                name: `${res2.name}`
              });
            });
            const dropDown = [];
            this.companiesDetailArray.forEach(element => {
              dropDown.push(element.name);
            });
            this.dropdownOptions = new Observable(observer => {
              observer.next(dropDown);
            });
          }
        },
        error => {
          // this.loadingView = false;
          console.log(error, "error on getting Companies");
        }
      );
  }

  ngOnInit() {
    this.getFilters();
  }

  // Get Contact
  private contactFrmDB() {
    this.contactServ.getAllContacts().subscribe(res => {
      const { payload } = res;
      let container = [];
      console.log(payload, "payload");
      payload.map((res2: any) => {
        container.push({
          id: res2.clientId,
          name: res2.firstName + " " + res2.surName
        });
      });

      this.contacts = new Observable(observer => {
        observer.next(container);
      });
    });
  }

  clearAllFilter() {
    this.getClearFilter.emit();
    this.contactForm.reset();
  }

  filterByCompanyName() {
    this.getCompanyNameFilter.emit();
  }

  filterByContactName() {
    this.getContactFilter.emit();
  }

  filterByCompanyDate() {
    this.getCompanyDateFilter.emit();
  }

  fetchContactList() {
    this.contactFrmDB();
  }

  filterByIndusry() {
    this.getCompanyindustryFilter.emit();
  }

  filterCustomFilter(filter) {
    this.getCompanyCustomFilter.emit(filter);
  }

  createUpdateFilter(type) {
    if (this.createFilterForm.valid) {
      const payload = {
        id: "",
        userId: this.userId,
        service: "company",
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
      .getCustomFilter(this.userId, "company")
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

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  async handleSwalEmal() {
    // var str =
    //   "Message: Got it! On Thu, 16 Jan 2020 at 3:29 PM, Nathan Oguntuberu <noguntuberu@atbtechsoft.com<mailto:noguntuberu@atbtechsoft.com>> wrote: Just a test";
    // var span = document.createElement("span");
    // span.innerHTML = "<h2>Re: Test</h2> <p class = 'test'> HEHE </p>";
    // Swal.fire({
    //   content: span
    // });
    // Swal.fire({
    //   html: "<pre>" + span + "</pre>",
    //   customClass: {
    //     popup: "format-pre"
    //   }
    // });
    // Swal.fire({
    //   title: "<strong>HTML <u>example</u></strong>",
    //   html:
    //     "Re: Test </b>, \n" +
    //     "Got it! </b>, " +
    //     "On Thu, 16 Jan 2020 at 3:29 PM, Nathan Oguntuberu <noguntuberu@atbtechsoft.com<mailto:noguntuberu@atbtechsoft.com>> wrote: </br>" +
    //     "Just a test ",
    //   showCloseButton: true,
    //   showCancelButton: true,
    //   focusConfirm: false,
    //   confirmButtonText: 'Reply! <i class="fa fa-mail"></i>',
    //   confirmButtonAriaLabel: "Thumbs up, great!",
    //   cancelButtonText: 'Cancel <i class="fa fa-thumbs-down"></i>',
    //   cancelButtonAriaLabel: "Thumbs down"
    // });
  }
}
