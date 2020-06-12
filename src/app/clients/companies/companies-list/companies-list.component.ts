import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { GeneralService } from "src/app/services/general.service";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { CompaniesModel } from "src/app/models/clients/companies.model";
import Swal from "sweetalert2";
import { COUNTRIES } from "src/app/data/nations";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { STATES } from "src/app/data/states";
import {
  VALIDEMAILREGEX,
  REMOVESPACESONLY,
} from "src/app/helpers/helperResources";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { selectConfig, exportTableToCSV } from "src/app/utils/utils";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { ClientService } from "src/app/services/client-services/clients.service";

@Component({
  selector: "app-companies-list",
  templateUrl: "./companies-list.component.html",
  styleUrls: ["./companies-list.component.css"],
})
export class CompaniesListComponent implements OnInit {
  config = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Select Country", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search",
  };

  teamConfig = { ...selectConfig, displayKey: "teamName" };

  config2 = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Select State", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search",
  };

  companies: any;
  arrayTeams: any;
  companyForm: FormGroup;
  loadingView = false;
  nations: Observable<any>;
  states: Observable<any>;
  country;
  teamID;
  filterResponseIfExist = new Subject<any>();
  emailPhoneExist = [{}];
  swalInfo: Observable<any>;
  loading = false;
  autoSuggestion = "";
  uploadedFiles: Array<File>;
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "ID", key: "id" },
      { title: "Name", key: "name" },
      { title: "Industry", key: "industry" },
      { title: "Country", key: "country" },
      { title: "Creation Date", key: "createdAt" },
      { title: "Action", key: "action" },
    ],
    options: {
      singleActions: [
        {title:"View / Edit", showIf: () => this.genSer.isAuthorized('CLIENT_ACTIONS')}, 
        {title:"Assign To", showIf: () => this.genSer.isAuthorized('CLIENT_ACTIONS')}],
      bulkActions: [
        "Email",
        "SMS",
        "Chat",
        "Assign Territory",
        "Assign Company",
        "Assign Invoice Template",
        "Assign Quotation Template",
        "Delete",
      ],
    },
  };
  loader: any = {
    default: "notch-loader",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please add a company and try again",
      action: "Add Company",
      success: true,
    },
    import: {
      spinnerType: "jsBin",
      spinnerStyle: { left: "45%", top: "45%" },
      showSpinner: false,
    },
    showSpinner: false,
    btnSpinner: false,
    export: false,
  };
  showSmallSpinner: boolean = false;
  loadingBtn: boolean = false;
  teamList: any = [];
  salesPerson: any;
  salesPersonList: any;
  assignedUserId: Number;
  arrayCompany: any = {
    salesPersonId: Number,
    teamId: Number,
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private clientService: ClientService,
    private companyServ: CompaniesService,
    private contactServ: ContactsService,
    private signupSvc: SignupLoginService,
    private toastr: ToastrService,
    private datepipe: DatePipe,
    public genSer: GeneralService,
    private salespersonSvc: SalesPersonService
  ) {
    this.loader.spinnerType = this.loader.default;
    this.arrayCompany.salesPersonId = 0;
    this.arrayCompany.teamId = 0;

    this.nations = new Observable((observer) => {
      observer.next(this.extractValueFromObject(COUNTRIES, "name"));
    });

    this.states = new Observable((observer) => {
      observer.next(this.extractValueFromObject(STATES, "value"));
    });
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View / Edit") {
          if(this.genSer.isAuthorized('CLIENT_ACTIONS')) {
            this.router.navigate(["/clients/companies-view/" + data.data.id]);
          }
        } else if (data.action === "Assign To") {
          //@ts-ignore
          document.querySelector("[data-target='#assignCompany'").click();
          this.openAssignModal(data.data.id);
        }

        break;

      default:
        break;
    }
  };

  async ngOnInit() {
    this.createForm();
    await this.ngOnLoad();
  }

  // Manage all needed functions onload
  async ngOnLoad() {
    this.loader.showSpinner = true;
    this.genSer.showSpinner.next(true);
    const res = await this.intializeCompany();
    while (res) {
      this.genSer.showSpinner.next(false);
      this.loader.showSpinner = false;
      this.arrayTeams = await this.getSalespersonTeams();
      await this.getAllSalesPersons();
      await this.fetchSalesPersonTeams(null);
      break;
    }
  }

  get f() {
    return this.companyForm.controls;
  }

  // Create Company
  createForm() {
    this.companyForm = this.fb.group({
      name: ["", [Validators.required, REMOVESPACESONLY]],
      industry: ["", REMOVESPACESONLY],
      email: ["", [Validators.pattern(VALIDEMAILREGEX), REMOVESPACESONLY]],
      phoneNumber: ["", [Validators.pattern("^[0-9]{11}$"), REMOVESPACESONLY]],
      country: ["", REMOVESPACESONLY],
      state: ["", REMOVESPACESONLY],
    });
  }

  // Get All Companies
  private async getAllCompanies() {
    return await this.companyServ.getAllCompanies().toPromise();
  }

  // Get SalesPerson Teams
  private async getSalespersonTeams() {
    return await this.companyServ.getSalespersonTeams().toPromise();
  }

  // Initialize Company Setup
  private async intializeCompany() {
    const arrayCompany: { payload; success } = await this.getAllCompanies();
    if (
      arrayCompany === null ||
      arrayCompany === undefined
      // || !arrayCompany.success
    ) {
      const setError = {
        title: "We couldn't load the data.",
        subTitle: "Reload to try again.",
        action: "Reload",
        success: false,
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    }
    // else if (arrayCompany.payload.length === 0)
    //   this.loader.spinnerType = "dataless";
    else {
      this.companies = arrayCompany.payload;
      return true;
    }
    console.log(arrayCompany, "arrayCompany");
    return false;
  }

  // Get getAllSalesPersons
  private async getAllSalesPersons() {
    this.salespersonSvc.fetchAllSalePersons().subscribe(async (res) => {
      this.salesPersonList = res;
    });
  }

  // Get fetchSalesPersonTeams
  private async fetchSalesPersonTeams(salesPersonId) {
    this.signupSvc
      .fetchsalesPersonTeams(salesPersonId)
      .subscribe(async (res) => {
        this.teamList = res;
      });
  }

  // Allow user to add a company when there is none.
  async onActionState() {
    console.log("onActionState from company");
    if (this.loader.dataless.success === true) {
      // $("#ModalCenter4").show()
    } else await this.reloadSpinner();
  }

  openStyle() {
    let modal = document.getElementById("ModalCenter4");
    $("#ModalCenter4").show();
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    // modal.className = "modal fade show";
    // setTimeout(() => {
    //   modal.style.opacity = "1";
    // });

    //MODAL SHOW
    // modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    // // modal.style.display = "block";
    // modal.className = "modal fade show";
    // setTimeout(() => {
    //   modal.style.opacity = "1";
    // }); //FOR TRANSITION
  }

  // Reload Spinner
  async reloadSpinner() {
    console.log("i am  reloadSpinner from company");
    this.loader.spinnerType = this.loader.default;
    await this.ngOnLoad();
  }

  // Open Assign Compay Modal
  async openAssignModal(id: Number) {
    await this.ngOnInit();
    console.log(id, "assignedUserId");
    this.assignedUserId = id;

    // Reset Input Models
    this.arrayCompany.salesPersonId = 0;
    this.arrayCompany.teamId = 0;
  }

  //Fetch SalesPerson Teams By SalesPerson Id
  onChangeSalesPerson() {
    this.showSmallSpinner = true;
    const spId = Number(this.arrayCompany.salesPersonId);

    this.signupSvc
      .fetchsalesPersonTeams(spId)
      .subscribe(async (res) => {
        this.teamList = res;
        console.log(res, "teamList for " + spId);
      })
      .add(() => {
        setTimeout(() => {
          this.showSmallSpinner = false;
        }, 1000);
      });
  }

  assignCompany() {
    const payload = {
      id: this.assignedUserId,
      owner: Number(this.arrayCompany.salesPersonId),
      teamId: Number(this.arrayCompany.teamId),
    };

    if (payload.id !== null && payload.teamId !== null) {
      this.loadingBtn = true;

      this.companyServ
        .updateCompanies(payload)
        .subscribe(
          async (res) => {
            const { success, payload } = res;
            if (success) {
              console.log(res, "response");
              this.toastr.success("Company assigned successfully!", "Success");
              await this.intializeCompany(); // Refresh Contact List
            } else
              this.toastr.error(
                "Error assigning company. Please try again!",
                "Oops!"
              );
          },
          (err) => {
            this.toastr.error(err.message, "Oops!");
          }
        )
        .add(() => {
          this.loadingBtn = false;
          $("#assignCompany .close").click();
          this.dataTable.dataChangedObs.next(true);
        });
    } else this.toastr.error("Error assigning company!", "Oops!");
  }

  // Get Company Details
  private get companyDetails() {
    const companyForm = this.companyForm.value;
    // const otherInfo = JSON.stringify({
    //   size: companyForm.size,
    // });
    return {
      name: companyForm.name,
      industry: companyForm.industry,
      state: companyForm.state,
      country: companyForm.country,
      // teamId: companyForm.team.teamID,
      email: companyForm.email,
      phoneNumber: companyForm.phoneNumber,
      otherInfo: {},
      leadId: 0,
      // contacts: [],
      profileImage: "http://ssl.gstatic.com/accounts/ui/avatar_2x.png",
    };
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

  private async filterApi(valid, filterQuery, queryType) {
    if (valid) {
      const arrayCompany: {
        payload;
        success;
      } = await this.companyServ.getCompaniesByFilter(filterQuery).toPromise();

      console.log(arrayCompany, "resOnfilrer");

      if (arrayCompany.success) {
        if (queryType === "sideBar") {
          this.companies = arrayCompany.payload;
          this.dataTable.dataChangedObs.next(true);
        } else if (queryType === "emailType") {
          this.filterResponseIfExist.next(arrayCompany.payload);
          this.dataTable.dataChangedObs.next(true);
        } else if (queryType === "phoneNumberType") {
          this.filterResponseIfExist.next(arrayCompany.payload);
          this.dataTable.dataChangedObs.next(true);
        } else {
          this.companies = [];
          this.dataTable.dataChangedObs.next(true);
          console.log("No Result");
        }
      }
      (error) => {
        console.log(error, "error");
      };
    }
  }

  private filterByContact(contactId) {
    let filteredContact;
    return new Promise((resolve) => {
      this.contactServ.getCompanyForContact(contactId).subscribe((res) => {
        if (res.payload.length > 0) {
          filteredContact = res.payload;
          resolve(filteredContact);
          this.dataTable.dataChangedObs.next(true);
        } else {
          resolve([]);
          this.dataTable.dataChangedObs.next(true);
        }
      });
    });
  }

  handleCheckIfExist(databaseColumnName) {
    this.swalInfo = new Observable((observer) => {
      observer.next({});
    });
    const {
      value: { email, phoneNumber },
    } = this.companyForm;
    let filterQuery;
    let queryType;
    switch (databaseColumnName) {
      case "email":
        filterQuery = `email=${email}`;
        queryType = "emailType";
        break;

      case "phoneNumber":
        filterQuery = `phoneNumber=${phoneNumber}`;
        queryType = "phoneNumberType";
        break;
    }
    this.filterApi(true, filterQuery, queryType);
    this.filterResponseIfExist.subscribe((res) => {
      if (res.length > 0 && res) {
        if (queryType === "phoneNumberType") {
          this.swalInfo = new Observable((observer) => {
            observer.next({ phoneNumber });
            this.companyForm.controls.phoneNumber.setErrors({
              incorrect: true,
            });
          });
        } else {
          this.swalInfo = new Observable((observer) => {
            observer.next({ email });
            this.companyForm.controls.email.setErrors({ incorrect: true });
          });
        }
      }
    });
  }

  handleClearAllFilter() {
    this.filterApi(true, "", "sideBar");
  }

  async handleCompanyNameFilter(companyForm: FormGroup) {
    const {
      value: { companyName },
      valid,
    } = companyForm;
    const filterQuery = `name=${companyName}`;
    console.log(filterQuery, "filterQuery");
    await this.filterApi(valid, filterQuery, "sideBar");
  }

  async handleCompanyDateFilter(createdOn: FormGroup) {
    const { value, valid } = createdOn;
    const fromDate = Date.parse(value.fromDate);
    const toDate = Date.parse(value.toDate);
    const jsonFilterString = {
      createdAt: { from: fromDate.toString(), to: toDate.toString() },
    };
    const filterQuery = `range=${JSON.stringify(jsonFilterString)}`;
    await this.filterApi(valid, filterQuery, "sideBar");
  }

  handleCompanyindustryFilter(industry: FormGroup) {
    const {
      value: { industry: indus },
      valid,
    } = industry;
    const filterQuery = `industry=${indus}`;
    this.filterApi(valid, filterQuery, "sideBar");
  }

  async handleContactFilter(contactForm: FormGroup) {
    const {
      value: { contactName },
      valid,
    } = contactForm;
    if (valid) {
      const id = contactName.id;
      this.companies = await this.filterByContact(id);
    }
  }

  async handleCustomFilter(event) {
    const { contactName, industry } = event;
    const companiesByContact: any = await this.filterByContact(contactName.id);
    this.companies = companiesByContact.filter(
      (res) => res.industry.toLowerCase() === industry.toLowerCase()
    );
    this.dataTable.dataChangedObs.next(true);
  }

  handleCompanyWildcard() {
    const companyName = this.companyForm.value.name;
    console.log(companyName, "companyNameOnblur");
    if (companyName) {
      this.companyServ.getWildcardCompanies(companyName).subscribe((res) => {
        console.log(res, "result");
        const { success, payload } = res;
        if (success && payload.length > 0) {
          this.loading = true;
          let all = "";
          for (const iterator of payload) {
            all += iterator.name + ",";
          }
          this.autoSuggestion = all;
          return;
        } else {
          this.loading = false;
          this.autoSuggestion = "";
          return;
        }
      });
    } else {
      this.loading = false;
      this.autoSuggestion = "";
      return;
    }
  }

  // Create Company
  async handleCompanyCreation() {
    this.loader.btnSpinner = true;
    // const companyDetails = this.companyDetails;
    const body = {
      ...this.companyForm.value,
      otherInfo: {},
      leadId: 0,
      profileImage: "http://ssl.gstatic.com/accounts/ui/avatar_2x.png",
    };

    // console.log(body, "body company");
    // console.log(companyDetails, "details");
    this.loadingView = true;
    $("#ModalCenter4 .close").click();
    this.genSer
      .sweetAlertFileCreations("Company")
      .then((res) => {
        if (res.value) {
          this.companyServ.createCompanies(body).subscribe(async (response) => {
            console.log(response, "regCompany");
            this.loadingView = false;
            if (response) {
              await this.intializeCompany();
              this.companyForm.reset();
              this.nations = new Observable((observer) => {
                observer.next(this.extractValueFromObject(COUNTRIES, "name"));
              });

              this.states = new Observable((observer) => {
                observer.next(this.extractValueFromObject(STATES, "value"));
              });
            }
          });
        }
      })
      .finally(() => {
        this.loader.btnSpinner = false;
        this.dataTable.dataChangedObs.next(true);
      });
  }

  // Handle Deletion
  async handleCompanyDeletion(id) {
    this.genSer.sweetAlertFileDeletions("Company").then((result) => {
      if (result.value) {
        this.companyServ.deleteCompanies(id).subscribe(
          async (result2) => {
            if (result2) {
              console.log("updated deleted");

              Swal.fire(
                "Deleted!",
                "Your file has been deleted.",
                "success"
              ).then(async (res22) => {
                // Reload Page
                await this.intializeCompany();
              });
            }
          },
          (error) => {
            console.log("errorDeleting", error);
            Swal.fire({
              type: "error",
              title: "Oops...",
              text: "Something went wrong! Try again",
            });
          }
        );
      }
    });
  }

  async onImportCompany(files) {
    try {
      // Start Loader
      this.loader.import.showSpinner = true;

      // Process file import
      let file: File = files.item(0);
      let newFile = new File([file], file.name, { type: "text/csv" });
      console.log(newFile, "newFile");

      let formData = new FormData();
      formData.append("clientType", "company");
      formData.append("createdBy", this.genSer.user.id.toString());
      formData.append("teamId", this.genSer.user.id.toString());
      formData.append("clients", newFile);
      const res: any = await this.importCompanyAsync(formData);
      console.log(res, "res");

      if (res !== null && res.successfulUploads.length > 0) {
        $("#importCompany").click();
        this.toastr.success("Company uploaded successfully!", "Success");
        // this.genSer.sweetAlertSucess("Company upload successfully!");
        await this.intializeCompany();
        this.dataTable.dataChangedObs.next(true);
      }
    } catch (error) {
      let msg = "Something went wrong. Please try again!";
      msg =
        error && error.error && error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Import Error!");
    } finally {
      this.loader.import.showSpinner = false;
    }
  }

  // Import Company Async
  async importCompanyAsync(formData) {
    try {
      return await this.clientService.importClients(formData).toPromise();
    } catch (error) {
      let msg = "Error uploading file. Please try again!";
      msg =
        error && error.error && error.error.message ? error.error.message : msg;
      console.log(msg, "error import");
      this.toastr.error(msg, "Import Error!");
    }
  }

  fileChange(element) {
    this.uploadedFiles = element.target.files;
  }

  upload() {
    let formData = new FormData();
    formData.append("clientType", "company");
    formData.append("createdBy", this.genSer.user.id.toString());
    formData.append("teamId", this.arrayTeams[0].teamID);
    formData.append("clients", this.uploadedFiles[0]);
    $("#closeUploadModal").click();

    this.companyServ.uploadCompanies(formData).subscribe(
      (data) => {
        if (data !== null) {
          console.log(JSON.stringify(data));
          this.genSer.sweetAlertSucess("File uploaded successfully!");
        } else {
          this.genSer.sweetAlertError("Error uploading file!");
        }
      },
      (err) => {
        console.log(err);
        this.genSer.sweetAlertError("Error uploading file!");
      }
    );
    console.log(JSON.stringify(formData));
  }

  fileupload(files: FileList) {
    let file: File = files.item(0);
    let formData = new FormData();

    formData.append("clientType", "company");
    formData.append("createdBy", this.genSer.user.id.toString());
    formData.append("teamId", this.arrayTeams[0].teamID);
    formData.append("clients", file);
    $("#closeUploadModal").click();
    this.companyServ.uploadCompanies(formData).subscribe(
      (data) => {
        if (data !== null) {
          console.log(JSON.stringify(data));
          this.genSer.sweetAlertSucess("File uploaded successfully!");
        } else {
          this.genSer.sweetAlertError("Error uploading file!");
        }
      },
      (err) => {
        console.log(err);
        this.genSer.sweetAlertError("Error uploading file!");
      }
    );
    console.log(JSON.stringify(formData));
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

  async exportTable() {
    this.loader.export = true;
    const exportName = "Notch Company List - " + Date.now();
    const columns = [
      { title: "Id", value: "id" },
      { title: "Name", value: "name" },
      { title: "Industry", value: "industry" },
      { title: "Email", value: "email" },
      { title: "Phone Number", value: "phoneNumber" },
      { title: "Country", value: "country" },
      { title: "Creation Date", value: "createdAt" },
    ];

    const arrayCompany: { payload; success } = await this.getAllCompanies();
    arrayCompany.payload.forEach((d) => {
      d.createdAt = this.datepipe.transform(d.createdAt, "dd/MM/yyyy h:m:s");
      if (d.name === undefined || d.name === null) d.name = "";
      if (d.industry === undefined || d.industry === null) d.industry = "";
      if (d.email === undefined || d.email === null) d.email = "";
      if (d.phoneNumber === undefined || d.phoneNumber === null)
        d.phoneNumber = "";
      if (d.country === undefined || d.country === null) d.country = "";
      return d;
    });

    exportTableToCSV(arrayCompany.payload, columns, exportName);
    this.loader.export = false;
  }
}
