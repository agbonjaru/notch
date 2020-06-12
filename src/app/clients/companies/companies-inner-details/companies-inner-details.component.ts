import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  Output
} from "@angular/core";
import dropDownToggle from "src/app/utils/dropdown";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { GeneralService } from "src/app/services/general.service";
import { CompaniesDetailsComponent } from "../companies-details/companies-details.component";
import * as $ from "jquery";
import * as _ from "lodash";
import { EventEmitter } from "events";
import { DealsService } from "src/app/services/deals.service";
import { Observable } from "rxjs";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { ActivatedRoute, Params } from "@angular/router";
import { COUNTRIES } from "src/app/data/nations";
import { STATES } from "src/app/data/states";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-companies-inner-details",
  templateUrl: "./companies-inner-details.component.html",
  styleUrls: ["./companies-inner-details.component.css"]
})
export class CompaniesInnerDetailsComponent implements OnInit, OnChanges {
  config = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Contacts", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search"
  };

  countryConfig = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Select Country", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search"
  };
  stateConfig = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Select State", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search"
  };
  nations: Observable<any>;
  states: Observable<any>;
  @Input() dataSource;
  bsConfig = {
    dateInputFormat: "DD-MM-YYYY",
    selectFromOtherMonth: true,
    adaptivePosition: true
  };
  today: Date = new Date();
  locationInfo;
  companyDetails: any = {};
  editMode = false;
  callsInfo = {
    data: [[80, 20]],
    title: "Calls: 6",
    labels: ["Successful - 2, 80%", "Unsuccessful - 0, 20%"]
  };
  meetingInfo = {
    data: [[10, 90]],
    title: "Message: 9",
    labels: ["Successful - 0, 10%", "Unsuccessful - 9, 90%"]
  };
  companyDeals;
  companyRegDateArranged;
  viewButtonStatus = ["View More", false];
  addedContacts = [];
  contactDropdownOptions: Observable<any>;
  contactsDetailArray = [];
  companyId;
  companyClientId;

  constructor(
    private companyServ: CompaniesService,
    private contactServ: ContactsService,
    private genServ: GeneralService,
    private companyDetailView: CompaniesDetailsComponent,
    private dealServ: DealsService,
    private datePipe: DatePipe,
    private activeRoute: ActivatedRoute
  ) {
    this.activeRoute.params.subscribe((par: Params) => {
      const { id } = par;
      this.companyId = id;
    });

    this.nations = new Observable(observer => {
      observer.next(this.extractValueFromObject(COUNTRIES, "name"));
    });

    this.states = new Observable(observer => {
      observer.next(this.extractValueFromObject(STATES, "value"));
    });

    // Get Contact
    this.contactServ.getAllContacts().subscribe(
      res => {
        if (res) {
          // create array object
          const { payload } = res;
          payload.map((res2: any) => {
            this.contactsDetailArray.push({
              id: res2.clientId,
              name: `${res2.firstName} ${res2.surName}`
            });
          });
          const dropDown = [];
          this.contactsDetailArray.forEach(element => {
            dropDown.push(element.name);
          });
          this.contactDropdownOptions = new Observable(observer => {
            observer.next(dropDown);
          });
        }
      },
      error => {
        // this.loadingView = false;
        console.log(error, "error on getting contact");
      }
    );
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    const {
      dataSource: { currentValue }
    } = changes;
    let regDate = "";
    if (currentValue !== undefined) {
      console.log(currentValue, "currentVslue");
      // Since i don't know what subsidiaries is for, i decided to make it empty.
      // If you figure this out before me, don't be angry. Atleast, i gave a comment notice :)
      this.companyDetails = { ...currentValue };
      this.companyClientId = this.companyDetails.clientId;
      this.companyDetails.subsidiaries = "";

      if (currentValue.regDate !== "string") {
        this.companyDetails.regDate = this.datePipe.transform(
          currentValue.dateOfBirth,
          "dd/MM/yyyy"
        );
      }

      // this.companyDetails.regDate = new Date(
      //   Number(this.companyDetails.regDate)
      // )
      //   .toISOString()
      //   .slice(0, 10);
      // const unArrangedDateArray = this.companyDetails.regDate.split("-");
      // this.companyRegDateArranged = `${unArrangedDateArray[2]}-${unArrangedDateArray[1]}-${unArrangedDateArray[0]}`;

      // send contacts attached to company on load.
      this.locationInfo = "#contacts-tab";
    }
  }

  // fetch Deals
  private fetchDeals(id) {
    const client = {
      client: '198',
      type: "Client" 
    };
    this.dealServ
      .fetchDeals(null, { client })
      .subscribe(res => (this.companyDeals = res));
  }

  private get editCompanyDetails() {
    const regDate = Date.parse(this.companyDetails.regDate);
    return {
      ...this.companyDetails,
      regDate
    };
  }

  // Get contactsId
  private get fetchContactsId() {
    const selectedContacts = [];
    this.addedContacts.forEach(element => {
      selectedContacts.push(
        ...this.contactsDetailArray.filter(res => res.name === element)
      );
    });
    this.addedContacts = [];
    return selectedContacts;
  }

  // Extract the country name from the list
  private extractValueFromObject(object, key) {
    const dropDown = [];
    switch (key) {
      case "name":
        object.forEach(element => {
          dropDown.push(element.name);
        });
        break;
      case "value":
        object.forEach(element => {
          dropDown.push(element.value);
        });
        break;
    }
    return dropDown;
  }

  toggleClass(className, dropdownClass) {
    dropDownToggle(className, dropdownClass);
    // tslint:disable-next-line: no-unused-expression
    dropdownClass === "deals" ? this.fetchDeals(this.companyId) : null;
  }

  edit() {
    this.editMode = true;
  }

  cancel() {
    this.companyDetailView.reloadDataSource.next(true);
    this.editMode = false;
  }

  handleChangeView() {
    if (!this.viewButtonStatus[1]) {
      this.viewButtonStatus = ["Go Back", true];
    } else {
      this.viewButtonStatus = ["View More", false];
    }
  }

  handleMoreButton(location) {
    this.locationInfo = location;
  }

  handleAddContact() {
    const selectedContactsIds = this.fetchContactsId;
    selectedContactsIds.map(res => {
      const payload = {
        companyId: this.companyClientId,
        contactId: res.id
      };
      console.log(payload, "selectedContactsIds");
      this.genServ.sweetAlertFileUpdates("About Company").then(result => {
        if (result.value) {
          this.companyServ.addContactToCompany(payload).subscribe(
            res2 => {
              const { success } = res2;
              if (success) {
                this.companyDetailView.reloadDataSource.next(true);
                this.genServ.sweetAlertFileUpdateSuccessWithoutNav("Company");
              } else {
                this.genServ.sweetAlertFileUpdateErrorWithoutNav("Company");
              }
            },
            error => {
              console.log(error, "error");
            }
          );
        } else {
          this.companyDetailView.reloadDataSource.next(true);
        }
      });
    });
  }

  // Save Changes and Reload the Company Api call
  saveChanges() {
    // console.log(this.editCompanyDetails, 'update');
    this.genServ.sweetAlertFileUpdates("About Company").then(res => {
      if (res.value) {
        this.companyServ.updateCompanies(this.editCompanyDetails).subscribe(
          res2 => {
            const { payload, success } = res2;
            if (success) {
              this.companyDetailView.reloadDataSource.next(true);
              this.editMode = false;
              this.genServ.sweetAlertFileUpdateSuccessWithoutNav("Company");
            } else {
              this.genServ.sweetAlertFileUpdateErrorWithoutNav("Company");
            }
          },
          error => {
            console.log(error, "error");
          }
        );
      } else {
        this.companyDetailView.reloadDataSource.next(true);
        this.editMode = false;
      }
    });
  }

  validateNumber(event) {
    const keyCode = event.keyCode;
    const excludedKeys = [8, 37, 39, 46];

    if (
      !(
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 96 && keyCode <= 105) ||
        excludedKeys.includes(keyCode)
      )
    ) {
      event.preventDefault();
    }
  }
}
