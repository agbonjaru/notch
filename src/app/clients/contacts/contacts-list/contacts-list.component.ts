import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import Swal from "sweetalert2";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { GeneralService } from "src/app/services/general.service";
import * as $ from "jquery";
import { ContactsModel } from "src/app/models/clients/contacts.model";
import { takeUntil, catchError } from "rxjs/operators";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { exportTableToCSV } from "src/app/utils/utils";
import { BehaviorSubject } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { DatePipe } from "@angular/common";
import { ClientService } from "src/app/services/client-services/clients.service";

@Component({
  selector: "app-contacts-list",
  templateUrl: "./contacts-list.component.html",
  styleUrls: ["./contacts-list.component.css"],
})
export class ContactsListComponent implements OnInit {
  contacts: any = [];
  contactForm: FormGroup;
  loadingView = false;
  arrayTeams: any;
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "ID", key: "id" },
      { title: "Firstname", key: "firstName" },
      { title: "Lastname", key: "surName" },
      { title: "Gender", key: "gender" },
      { title: "Official Contact", key: "officialPhoneNumber" },
      { title: "Official Email", key: "email" },
      { title: "Creation date", key: "createdAt" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: [
        {title:"View / Edit", showIf: () => this.genSer.isAuthorized('CLIENT_ACTIONS')}, 
        {title:"Assign To", showIf: () => this.genSer.isAuthorized('CLIENT_ACTIONS')}
      ],
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
  customFilters;

  template: any = {
    id: {
      importContact: true,
    },
    options: {
      title: "Import Contact",
    },
  };
  showUploadLoader: boolean = false;
  showSmallSpinner: boolean = false;
  loadingBtn: boolean = false;
  teamList: any = [];
  salesPerson: any;
  salesPersonList: any;
  assignedUserId: Number;
  arrayContact: any = {
    salesPersonId: Number,
    teamId: Number,
  };
  loader: any = {
    default: "notch-loader",
    // default: "sharp",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please create a contact and try again",
      action: "Create Contact",
      success: true,
    },
    import: {
      spinnerType: "jsBin",
      spinnerStyle: { left: "45%", top: "45%" },
      // spinnerStyle: { marginTop: "5%" },
      showSpinner: false,
    },
    showSpinner: false,
  };
  dataFilter = {
    dataChangedObs: new BehaviorSubject(null),
    accordions: [
      {
        name: "SalesPerson",
        type: "box",
        search: true,
        filterKey: "owner",
      },
      { name: "Gender", type: "box", search: false, filterKey: "gender" },
      {
        name: "Marital Status",
        type: "box",
        search: true,
        filterKey: "maritalStatus",
      },
      {
        name: "Date of Birth",
        type: "date",
        filterKey: "dateOfBirth",
        icon: "fa fa-calendar-alt",
      },
      // {
      //   name: "Assigned Tickets",
      //   type: "range",
      //   filterKey: "totalTicketsAssigned",
      //   icon: "fa fa-ticket-alt",
      // },
    ],
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private datepipe: DatePipe,
    private contactServ: ContactsService,
    public genSer: GeneralService,
    private clientService: ClientService,
    private companyServ: CompaniesService,
    private signupSvc: SignupLoginService,
    private toastr: ToastrService,
    private salespersonSvc: SalesPersonService
  ) {
    this.loader.spinnerType = this.loader.default;
    this.arrayContact.salesPersonId = 0;
    this.arrayContact.teamId = 0;
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View / Edit" || data.action === "View/Edit") {
          if(this.genSer.isAuthorized('CLIENT_ACTIONS')) {
            this.router.navigate(["/clients/contacts-view/" + data.data.id]);
          }
        } else if (data.action === "Assign To") {
          //@ts-ignore
          document.querySelector("[data-target='#assignContact'").click();
          this.openAssignModal(data.data.id);
        }
        break;
      default:
        break;
    }
  };

  async dataSourceListener(event) {
    console.log(event.data);

    switch (event.action) {
      case "filter":
        this.contacts = event.data;
        this.dataTable.dataChangedObs.next(true);
        break;

      case "createFilter":
        // await this.createCustomFilterAsync(event.data);
        await this.getAllCustomFiltersAsync();
        this.dataFilter.dataChangedObs.next(true);
        break;

      case "processFilter":
        // await this.processCustomFilterAsync(event.data);
        this.dataTable.dataChangedObs.next(true);
        this.dataFilter.dataChangedObs.next(true);
        break;

      case "deleteFilter":
        // await this.deleteCustomFilterByIdAsync(event.data);
        await this.getAllCustomFiltersAsync();
        this.dataFilter.dataChangedObs.next(true);
        break;

      case "clear":
        await this.getAllContactsAsync();
        this.dataTable.dataChangedObs.next(true);
        this.dataFilter.dataChangedObs.next(true);
        break;

      default:
        break;
    }
  }

  fbListener = (data) => {
    console.log(data);
    switch (data.action) {
      case "close":
        if (!data.id) {
          this.template.id.createTenant = data.id;
        }
        break;

      default:
        break;
    }
  };

  async ngOnInit() {
    await this.ngOnLoad();
  }

  // Manage all needed functions onload
  async ngOnLoad() {
    try {
      this.loader.showSpinner = true;
      await this.getAllSalesPersonsAsync();
      await this.getAllContactsAsync();
    } catch (error) {
    } finally {
      await this.getAllCustomFiltersAsync();
      this.dataFilter.dataChangedObs.next(true);
      this.dataTable.dataChangedObs.next(true);
      this.loader.showSpinner = false;
      await this.getSalespersonTeamsAsync();
      await this.fetchSalesPersonTeams(null);
    }
  }

  // Get All Contacts
  private async getAllContacts() {
    return await this.contactServ.getAllContacts().toPromise();
  }

  // Get All Contacts Async
  private async getAllContactsAsync() {
    try {
      const data: {
        payload;
        success;
      } = await this.contactServ.getAllContacts().toPromise();
      this.contacts = await this.addOwnerToContactArray(data.payload);
      console.log(this.contacts);
    } catch (error) {
      let msg = "Error fetching contacts. Please try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Filter Error");
      console.log(error, "filters error");
    } finally {
      this.dataFilter.dataChangedObs.next(true);
    }
  }

  // Add Owner to Contact Array (for Filter by SalesPerson)
  private async addOwnerToContactArray(defaultSource: any) {
    let owner = [];
    defaultSource.filter((d) => {
      let creator = { ...d, owner: "Others" };
      this.salesPersonList.filter((s) => {
        if (d.createdBy === s.id) {
          creator["owner"] = s.name;
        }
      });
      owner.push(creator);
    });
    // console.log(owner, "owner");
    return owner;
  }

  // Get SalesPerson Teams Async
  private async getSalespersonTeamsAsync() {
    this.arrayTeams = await this.companyServ.getSalespersonTeams().toPromise();
  }

  //
  private async initializeContact() {
    const arrayContact: { payload; success } = await this.getAllContacts();
    if (
      arrayContact === null ||
      arrayContact === undefined
      // || !arrayContact.success
    ) {
      const setError = {
        title: "Something went wrong.",
        subTitle: "Reload to try again.",
        action: "Reload",
        success: false,
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else if (arrayContact.payload.length === 0)
      this.loader.spinnerType = "dataless";
    else {
      this.contacts = arrayContact.payload;
      return true;
    }
    console.log(arrayContact, "arrayContact");
    return false;
  }

  // Get Get All SalesPersons Async
  private async getAllSalesPersonsAsync() {
    try {
      this.salesPersonList = await this.salespersonSvc
        .fetchAllSalePersons()
        .toPromise();
      console.log(this.salesPersonList, "salesPersonList");
    } catch (error) {
      console.log(error, "salesPersonList error");
    }
  }

  // Get fetchSalesPersonTeams
  private async fetchSalesPersonTeams(salesPersonId) {
    this.signupSvc
      .fetchsalesPersonTeams(salesPersonId)
      .subscribe(async (res) => {
        this.teamList = res;
      });
  }

  private filterApi(valid, filterQuery) {
    if (valid) {
      this.contactServ
        .getContactsByFilter(filterQuery)
        // .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (res: any) => {
            console.log(res, "resOnfilrer");
            if (res.success) {
              this.contacts = res.payload;
            } else {
              this.contacts = [];
              // this.dataTable.dataChangedObs.next(true);
              console.log("No Result");
            }
          },
          (error) => {
            console.log(error, "error");
          }
        )
        .add(() => this.dataTable.dataChangedObs.next(true));
    }
  }

  private async filterByCompany(companyId) {
    // return await this.companyServ.getContactForCompany(companyId).toPromise();

    let filteredContact;
    return new Promise((resolve) => {
      this.companyServ.getContactForCompany(companyId).subscribe((res) => {
        if (res.payload.length > 0) {
          filteredContact = res.payload;
          resolve(filteredContact);
        }
      });
    });
  }

  private async getAllCustomFiltersAsync() {
    try {
      // let data = await this.groupSrv.getAgentCustomFilters().toPromise();
      // console.log(data, "filters");
      // this.customFilters = data;
    } catch (error) {
      let msg = "Error fetching filters. Please try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Filter Error");
      console.log(error, "filters error");
    }
  }

  handleClearAllFilter() {
    this.filterApi(true, "");
  }

  handleContactNameFilter(contactForm: FormGroup) {
    const { value, valid } = contactForm;
    const split = value.contactName.split(" ");
    const filterQuery = `firstName=${split[0]}&surName=${split[1]}`;
    this.filterApi(valid, filterQuery);
  }

  handleMaritalStatusFilter(status: FormGroup) {
    const { value, valid } = status;
    const statusM = value.status;
    const filterQuery = `maritalStatus=${statusM}`;
    this.filterApi(valid, filterQuery);
  }

  handleGenderFilter(gender: FormGroup) {
    const { value, valid } = gender;
    const genderM = value.gender;
    const filterQuery = `gender=${genderM}`;
    this.filterApi(valid, filterQuery);
  }

  handleDOBFilter(dateOfBirthForm: FormGroup) {
    const { value, valid } = dateOfBirthForm;
    const fromDate = Date.parse(value.fromDate);
    const toDate = Date.parse(value.toDate);
    const jsonFilterString = {
      dateOfBirth: { from: fromDate.toString(), to: toDate.toString() },
    };
    const filterQuery = `range=${JSON.stringify(jsonFilterString)}`;
    this.filterApi(valid, filterQuery);
  }

  async handleCompanyFilter(companyForm: FormGroup) {
    const {
      value: { companyName },
      valid,
    } = companyForm;

    if (valid) {
      console.log("companyName", companyName);
      this.contacts = await this.filterByCompany(companyName.id);
      console.log("this.contacts", this.contacts);
      this.dataTable.dataChangedObs.next(true);
    }
  }

  async handleCustomFilter(event) {
    const { companyName, maritalStatus, gender } = event;

    const contactByCompany: any = await this.filterByCompany(companyName.id);
    this.contacts = contactByCompany.filter(
      (res) =>
        res.gender.toLowerCase() === gender.toLowerCase() &&
        res.maritalStatus.toLowerCase() === maritalStatus.toLowerCase()
    );
    this.dataTable.dataChangedObs.next(true);
  }

  // Handle Deletion
  async handleContactDeletion(id) {
    this.genSer.sweetAlertFileDeletions("Contact").then((result) => {
      if (result.value) {
        this.contactServ.deleteContacts(id).subscribe(
          (result2) => {
            if (result2) {
              console.log("updated deleted");
              Swal.fire(
                "Deleted!",
                "Your file has been deleted.",
                "success"
              ).then(async (res22) => {
                // Reload Page
                // this.contactFrmDB();
                await this.initializeContact();
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

  // before Importing Contact
  async onImportContact(files) {
    try {
      // Start Loader
      this.loader.import.showSpinner = true;

      // Process file import
      let file: File = files.item(0);
      let newFile = new File([file], file.name, { type: "text/csv" });
      console.log(newFile, "newFile");

      let formData = new FormData();
      formData.append("clientType", "contact");
      formData.append("createdBy", this.genSer.user.id.toString());
      formData.append("teamId", this.genSer.user.id.toString());
      formData.append("clients", newFile);
      const res: any = await this.importContactAsync(formData);
      console.log(res, "res");

      if (res !== null && res.successfulUploads.length > 0) {
        $("#importContact").click();
        this.toastr.success("Contact uploaded successfully!", "Success");
        // this.genSer.sweetAlertSucess("Contact upload successfully!");
        await this.initializeContact();
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

  // Import Contact Async
  async importContactAsync(formData) {
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

  // Open Assign Contact Modal
  async openAssignModal(id: Number) {
    await this.ngOnInit();
    console.log(id, "assignedUserId");
    this.assignedUserId = id;

    // Reset Input Models
    this.arrayContact.salesPersonId = 0;
    this.arrayContact.teamId = 0;

    //Open Modal
    // $("#assignContact").click();
    // document.querySelector("[data-target='#assignContact'").click();
  }

  //Fetch SalesPerson Teams By SalesPerson Id
  onChangeSalesPerson() {
    this.showSmallSpinner = true;
    const spId = Number(this.arrayContact.salesPersonId);

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

  assignContact() {
    const payload = {
      id: this.assignedUserId,
      owner: Number(this.arrayContact.salesPersonId),
      teamId: Number(this.arrayContact.teamId),
    };

    if (payload.id !== null && payload.teamId !== null) {
      this.loadingBtn = true;

      this.contactServ
        .updateContacts(payload)
        .subscribe(
          async (res) => {
            const { success, payload } = res;
            if (success) {
              console.log(res, "response");
              this.toastr.success("Contact assigned successfully!", "Success");
              await this.initializeContact(); // Refresh Contact List
            } else
              this.toastr.error(
                "Error assigning contact. Please try again!",
                "Oops!"
              );
          },
          (err) => {
            this.toastr.error(err.message, "Oops!");
          }
        )
        .add(() => {
          this.loadingBtn = false;
          $("#assignContact .close").click();
          this.dataTable.dataChangedObs.next(true);
        });
    } else this.toastr.error("Error assigning contact!", "Oops!");
  }

  // Allow user to create contacts when there is none.
  async onActionState() {
    if (this.loader.dataless.success === true)
      this.router.navigate(["/clients/create-contacts"]);
    else await this.reloadSpinner();
  }

  // Reload Spinner
  async reloadSpinner() {
    console.log("i am  reloadSpinner");
    this.loader.spinnerType = this.loader.default;
    await this.ngOnLoad();
  }

  openTemplateById() {
    this.template.id.importContact = true;
  }

  async exportTable() {
    const exportName = "Notch Contacts List - " + Date.now();
    const columns = [
      { title: "Id", value: "id" },
      { title: "First Name", value: "firstName" },
      { title: "Last Name", value: "surName" },
      { title: "Gender", value: "gender" },
      { title: "Official Phone Number", value: "officialPhoneNumber" },
      { title: "Official Email", value: "email" },
      { title: "Creation Date", value: "createdAt" },
    ];

    const arrayContact: { payload; success } = await this.getAllContacts();
    // console.log(arrayContact.payload, "payload arrayContact");

    arrayContact.payload.forEach((d) => {
      d.createdAt = this.datepipe.transform(d.createdAt, "dd/MM/yyyy h:m:s");
      if (d.firstName === undefined || d.firstName === null) d.firstName = "";
      if (d.surName === undefined || d.surName === null) d.surName = "";
      if (d.gender === undefined || d.gender === null) d.gender = "";
      if (d.officialPhoneNumber === undefined || d.officialPhoneNumber === null)
        d.officialPhoneNumber = "";
      if (d.email === undefined || d.email === null) d.email = "";
      return d;
    });

    exportTableToCSV(arrayContact.payload, columns, exportName);
  }
}
