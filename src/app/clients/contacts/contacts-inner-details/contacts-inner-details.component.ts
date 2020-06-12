import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { Observable, BehaviorSubject, observable } from "rxjs";
import { GeneralService } from "src/app/services/general.service";
import { DealsService } from "src/app/services/deals.service";
import dropDownToggle from "src/app/utils/dropdown";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { ContactsDetailsComponent } from "../contacts-details/contacts-details.component";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as _ from "lodash";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { ClientRoutingModule } from "../../client-routing.module";
import { ActivatedRoute, Params } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { STATES } from "src/app/data/states";
import { stringify } from "querystring";

@Component({
  selector: "app-contacts-inner-details",
  templateUrl: "./contacts-inner-details.component.html",
  styleUrls: ["./contacts-inner-details.component.css"],
})
export class ContactsInnerDetailsComponent implements OnInit, OnChanges {
  config = {
    displayKey: "name",
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Company", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search",
  };
  stateConfig = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Select State", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search",
  };
  bsConfig = {
    dateInputFormat: "DD-MM-YYYY",
    selectFromOtherMonth: true,
    adaptivePosition: true,
  };
  today: Date = new Date();
  states: Observable<any>;
  @Input() dataSource;
  locationInfo;
  otherContactDetails;
  contactEditDetails: any;
  editMode = false;
  callsInfo = {
    data: [[80, 20]],
    title: "Calls: 6",
    labels: ["Successful - 2, 80%", "Unsuccessful - 0, 20%"],
  };
  meetingInfo = {
    data: [[10, 90]],
    title: "Message: 9",
    labels: ["Successful - 0, 10%", "Unsuccessful - 9, 90%"],
  };
  contactDeals;
  children;
  childrenForm: FormGroup;
  addBtnName = "Add Child";
  childEditObject: any = {};
  editChildIndex;
  viewButtonStatus = ["View More", false];
  addedCompanies;
  companiesDropdownOptions: Observable<any>;
  companiesDetailArray = [];
  contactId;
  contactClientId;
  dateOfBirthArranged;
  arrayCompanies: any = [];
  arrayCompanyList: Observable<any>;
  dataTable = {
    company: {
      dataChangedObs: new BehaviorSubject(null),
      heads: [
        { title: "checkbox", key: "checkbox" },
        { title: "ID", key: "id" },
        { title: "Name", key: "name" },
        { title: "Industry", key: "industry" },
        { title: "Country", key: "country" },
        { title: "Action", key: "action" },
      ],
      options: {
        singleActions: ["View"],
      },
    },
  };
  loader: any = {
    dataless: {
      title: "No Data Available!",
      subTitle: "Please create a contact and try again",
      action: "Create Contact",
      success: true,
    },
    company: {
      default: "sharp",
      spinnerType: "",
      spinnerStyle: { marginTop: "12%" },
      showSpinner: false,
      button: false,
    },
  };
  display: any = {
    addCompany: true,
  };

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private genSer: GeneralService,
    private dealServ: DealsService,
    private contactServ: ContactsService,
    private companyServ: CompaniesService,
    private contactDetailView: ContactsDetailsComponent,
    private activeRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.loader.company.spinnerType = this.loader.company.default;
    this.activeRoute.params.subscribe((par: Params) => {
      const { id } = par;
      this.contactId = id;
    });

    this.states = new Observable((observer) => {
      observer.next(this.extractValueFromObject(STATES, "value"));
    });

    // Get Contact
    this.companyServ.getAllCompanies().subscribe(
      (res) => {
        if (res) {
          // create array object
          // console.log(res, "resssss");

          const { payload } = res;
          payload.map((res2: any) => {
            this.companiesDetailArray.push({
              id: res2.clientId,
              name: `${res2.name}`,
            });
          });
          const dropDown = [];
          this.companiesDetailArray.forEach((element) => {
            dropDown.push(element.name);
            // dropDown.push(element);
          });
          this.companiesDropdownOptions = new Observable((observer) => {
            observer.next(dropDown);
          });
        }
      },
      (error) => {
        // this.loadingView = false;
        console.log(error, "error on getting contact");
      }
    );
  }

  async ngOnInit() {
    this.createForm();
    await this.ngOnLoad();

    // Child edit - Twoway binding Hack
    this.childEditObject = { ...this.childrenForm };
    setTimeout(() => {
      this.toggleClass("about-contact", "aboutDp");
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges) {
    const {
      dataSource: { currentValue },
    } = changes;
    let dob = new Date().toString();
    if (currentValue) {
      console.log(currentValue, "currentValue");

      if (currentValue.otherInfo !== undefined) {
        this.otherContactDetails = JSON.parse(currentValue.otherInfo);
        this.children = this.otherContactDetails.childrenDetails;
        console.log(this.children, "children");
      } else {
        this.otherContactDetails = {
          address: "",
          SMSNumber: "",
          spouseDetails: {
            spouseName: "",
            spousedateOfBirth: "",
            spousePhoneNumber: "",
            spouseSpecialAnniversary: "",
          },
          childrenDetails: [],
        };
      }

      this.contactClientId = currentValue.clientId;

      if (
        currentValue.dateOfBirth === "string" ||
        currentValue.dateOfBirth === "NaN"
      ) {
        dob = this.datePipe.transform(dob, "dd/MM/yyyy");
      } else
        dob = this.datePipe.transform(currentValue.dateOfBirth, "dd/MM/yyyy");

      this.contactEditDetails = {
        ...currentValue,
        dateOfBirth: dob,
      };
    }
  }

  // Manages all needed functions onload
  async ngOnLoad() {
    this.loader.company.showSpinner = true;
    const res = await this.initializeContactCompanies(this.contactClientId);
    while (res || !res) {
      await this.initializeArrayCompanyList();
      this.loader.company.showSpinner = false;
      break;
    }
  }

  companyFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        // if (data.action === "View / Edit") {
        //   this.router.navigate(["/clients/companies-view/" + data.data.id]);
        // } else if (data.action === "Delete") {
        //   this.handleCompanyDeletion(data.data.id);
        // }

        break;

      default:
        break;
    }
  };

  // fetch Deals
  private fetchDeals(id) {
    const client = {
      client: id,
      type: "Contact",
    };
    this.dealServ
      .fetchDeals(null, { client })
      .subscribe((res) => (this.contactDeals = res));
  }

  get cf() {
    return this.childrenForm.controls;
  }

  private get editContactDetails() {
    this.otherContactDetails.childrenDetails = this.children;
    const otherInfo = JSON.stringify(this.otherContactDetails);
    this.otherContactDetails.address = this.otherContactDetails.address || "";
    const DOB = Date.parse(this.contactEditDetails.dateOfBirth);
    const stateOfOrigin = this.contactEditDetails.stateOfOrigin || "";

    return {
      ...this.contactEditDetails,
      otherInfo,
      stateOfOrigin,
      dateOfBirth: DOB.toString(),
    };
  }

  // Get companies ids
  private get fetchCompaniesId() {
    const selectedCompanies = [];
    this.addedCompanies.forEach((element) => {
      selectedCompanies.push(
        ...this.companiesDetailArray.filter((res) => `${res.name}` === element)
      );
    });
    this.addedCompanies = [];
    return selectedCompanies;
  }

  // Get All Companies
  private async getAllCompanies() {
    return await this.companyServ.getAllCompanies().toPromise();
  }

  // Get Companies by contactId
  private async getContactCompanies(clientId) {
    return await this.contactServ.getCompanyForContact(clientId).toPromise();
  }

  // Initialize Get Contact By Id
  private async initializeContactCompanies(clientId) {
    const arrayCompany: { payload; success } = await this.getContactCompanies(
      clientId
    );
    console.log(arrayCompany, "arrayCompany");

    if (
      arrayCompany === null ||
      arrayCompany === undefined
      // ||      !arrayCompany.success
    ) {
      const setStatus = {
        title: "We couldn't load the data.",
        subTitle: "Reload to try again.",
        action: "Reload",
        success: false,
      };
      this.loader.dataless = setStatus;
      this.loader.company.spinnerStyle = { top: "35%", margin: "30px auto" };
      this.loader.company.spinnerType = "dataless";
    } else {
      this.arrayCompanies = arrayCompany.payload;
      return true;
    }
    console.log(arrayCompany, "arrayCompany");
    return false;
  }

  // Initialize Array Company List (for dropdown)
  private async initializeArrayCompanyList() {
    const arrayCompanyList: { payload; success } = await this.getAllCompanies();
    if (
      arrayCompanyList === null ||
      arrayCompanyList === undefined ||
      !arrayCompanyList.success
    ) {
      const setStatus = {
        title: "We couldn't load the data.",
        subTitle: "Reload to try again.",
        action: "Reload",
        success: false,
      };
      this.loader.dataless = setStatus;
      this.loader.company.spinnerStyle = { top: "35%", margin: "30px auto" };
      this.loader.company.spinnerType = "dataless";
    } else {
      this.arrayCompanyList = new Observable((observer) => {
        observer.next(
          arrayCompanyList.payload.map((e) => {
            return { id: e.id, name: e.name, clientId: e.clientId };
          })
        );
      });
      return true;
    }
    console.log(arrayCompanyList, "arrayCompanyList");
    return false;
  }

  // Extract the country name from the list
  private extractValueFromObject(object, key) {
    const dropDown = [];
    switch (key) {
      case "name":
        object.forEach((element) => {
          dropDown.push(element.name);
        });
        break;
      case "value":
        object.forEach((element) => {
          dropDown.push(element.value);
        });
        break;
    }
    return dropDown;
  }

  createForm() {
    this.childrenForm = this.fb.group({
      childrenName: ["", Validators.required],
      childrenOfBirth: ["", Validators.required],
    });
  }

  addChild() {
    const child = this.childrenForm.value;
    if (this.addBtnName === "Add Child") {
      this.children.push(child);
      console.log(this.children, "child");
    } else {
      this.children[this.editChildIndex] = child;
      this.addBtnName = "Add Child";
    }
    this.childrenForm.reset();
  }

  editChild(index) {
    this.childEditObject = this.children[index];
    // console.log(this.children[index]["childrenName"], "childrenName");
    // console.log(this.children[index]["childrenOfBirth"], "childrenOfBirth");

    // Set Children Form Properties
    this.cf.childrenName.setValue(this.children[index]["childrenName"]);
    this.cf.childrenOfBirth.setValue(this.children[index]["childrenOfBirth"]);
    this.editChildIndex = index;
    this.addBtnName = "Update Child";
  }

  removeChild(child) {
    this.children.splice(this.children.indexOf(child), 1);
  }

  handleChangeView() {
    if (!this.viewButtonStatus[1]) {
      this.viewButtonStatus = ["Go Back", true];
    } else {
      this.viewButtonStatus = ["View More", false];
    }
  }

  handleAddCompany() {
    this.loader.company.button = true;
    const payload = {
      companyId: this.addedCompanies.id,
      contactId: this.addedCompanies.clientId,
      // contactId: parseInt(this.contactId)
    };
    console.log(payload, "payload handleAddCompany");

    this.contactServ
      .addCompanyToContact(payload)
      .subscribe(
        async (res) => {
          const result: { payload; success } = res;
          if (result === null || result === undefined) {
            this.toastr.error(
              "Adding company failed! Please try again.",
              "Error"
            );
          } else if (result.success) {
            this.toastr.success("Company added successfully!", "Success");
            await this.ngOnLoad();
          } else this.toastr.error(res.payload, "Error");
        },
        (err) => this.toastr.error(err.message, "Bad Request")
      )
      .add(async () => {
        this.loader.company.button = false;
      });
    return;
    // To be deleted
    const selectedCompanyIds = this.fetchCompaniesId;
    selectedCompanyIds.map((res) => {
      const payload = {
        companyId: this.contactClientId,
        contactId: res.id,
      };
      console.log(payload, "selectedContactsIds");
      this.genSer.sweetAlertFileUpdates("About Contact").then((result) => {
        if (result.value) {
          this.contactServ.addCompanyToContact(payload).subscribe(
            (res2) => {
              const { success } = res2;
              if (success) {
                this.contactDetailView.reloadDataSource.next(true);
                this.genSer.sweetAlertFileUpdateSuccessWithoutNav("Contact");
              } else {
                this.genSer.sweetAlertFileUpdateErrorWithoutNav("Contact");
              }
            },
            (error) => {
              console.log(error, "error");
            }
          );
        } else {
          this.contactDetailView.reloadDataSource.next(true);
        }
      });
    });
  }

  async toggleClass(className, dropdownClass) {
    dropDownToggle(className, dropdownClass);
    if (className === "addCompany") await this.ngOnLoad();
    // tslint:disable-next-line: no-unused-expression
    dropdownClass === "deals" ? this.fetchDeals(this.contactClientId) : null;
  }

  edit() {
    this.editMode = true;
  }

  cancel() {
    this.contactDetailView.reloadDataSource.next(true);
    this.editMode = false;
  }

  handleMoreButton(location) {
    this.locationInfo = location;
  }

  // Save Changes and Reload the Contact Api call
  saveChanges() {
    this.otherContactDetails.childrenDetails = this.children;
    const otherInfo = JSON.stringify(this.otherContactDetails);

    let stateOfOrigin = this.contactEditDetails.stateOfOrigin;
    if (stateOfOrigin.length === 0) stateOfOrigin = "";
    const payload = { ...this.contactEditDetails, otherInfo, stateOfOrigin };
    console.log(payload, "payload");

    this.genSer.sweetAlertFileUpdates("About Contact").then((res) => {
      if (res.value) {
        this.contactServ.updateContacts(payload).subscribe(
          (res2) => {
            if (res2.payload) {
              this.contactDetailView.reloadDataSource.next(true);
              this.editMode = false;
              this.toastr.success("Contact updated successfully!", "Success");
              console.log(res, "update about contact response");
            } else
              this.toastr.error(
                "Updating contact failed! Please try again.",
                "Error"
              );
          },
          (error) => {
            this.toastr.error(error.message, "Error");
            console.log(error, "error");
          }
        );
      } else {
        this.contactDetailView.reloadDataSource.next(true);
        this.editMode = false;
        this.toastr.info("Updating contact cancelled!");
      }
    });
  }

  // Action button for loader.
  async companyActionState() {
    this.loader.company.spinnerType = this.loader.company.default;
    if (this.loader.dataless.success === true) console.log("glgogo");
    else await this.ngOnLoad();
  }

  // Allow user to create contacts when there is none.
  async onActionState() {
    // if (this.loader.dataless.success === true)
    //   this.router.navigate(["/clients/create-contacts"]);
    // else await this.ngOnLoad();
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
