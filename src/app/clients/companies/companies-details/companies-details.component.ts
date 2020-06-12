import { Component, OnInit } from "@angular/core";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { GeneralService } from "src/app/services/general.service";
import {
  ActivatedRoute,
  Params,
  Router,
  NavigationExtras
} from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { ContactCompanyImageService } from "src/app/services/client-services/contactImage.service";
import $ from "jquery";
import Swal from "sweetalert2";
import { ClientService } from "src/app/services/client-services/clients.service";
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';

@Component({
  selector: "app-companies-details",
  templateUrl: "./companies-details.component.html",
  styleUrls: ["./companies-details.component.css"]
})
export class CompaniesDetailsComponent implements OnInit {
  display: any = {
    showSpinner: false,
    dashboard: false,
    details: false,
    score: false
  };
  isOpened: boolean = false;
  navMenu: any = {
    default: "dashboard",
    list: [
      { name: "dashboard", selected: true },
      { name: "details", selected: false },
      { name: "score", selected: false }
    ]
  };
  loader: any = {
    dataless: {
      title: "No Data Available!",
      subTitle: "Please create a contact and try again",
      action: "Create Contact",
      success: true,
      exists: true
    },
    main: {
      default: "sharp",
      spinnerType: "",
      spinnerStyle: { marginTop: "15%" },
      showSpinner: false
    },
    content: {
      default: "sharp",
      spinnerType: "",
      spinnerStyle: { marginTop: "5%" },
      showSpinner: false
    }
  };
  showScore = false;
  dataSource: any;
  companies;
  contacts;
  reloadDataSource = new BehaviorSubject<boolean>(false);
  companyId;
  imgDetails = {
    previousImage: "",
    src: ""
  };
  companyClientId;

  constructor(
    private companyServ: CompaniesService,
    private genServ: GeneralService,
    private router: Router,
    private companyImage: ContactCompanyImageService,
    private clientServ: ClientService,
    private activeRoute: ActivatedRoute,
    private email_service: EmailService,
    private contact_service: ContactsService
  ) {
    // Set up the loader forEach section
    this.loader.main.spinnerType = this.loader.main.default;
    this.loader.content.spinnerType = this.loader.content.default;

    this.activeRoute.params.subscribe((par: Params) => {
      const { id } = par;
      this.companyId = id;
    });
    this.reloadDataSource.subscribe(res => {
      if (res) {
        this.initializeCompanyById(this.companyId);
      }
    });
  }

  async ngOnInit() {

    /** FOR EMAIL CONTEXT */
    this.companyServ.getContactForCompany(this.companyId).subscribe ( response => {
      if (response.success) {
        const contact_ids = response.payload.map( contact => contact.id);
        this.contact_service.getContactsByFilter(`id=${contact_ids.join()}`).subscribe ( response => {
          if (response.success) {
            this.contacts = response.payload.map( contact => contact.email);
          }
        });
      }
    },error => {
      console.log(`Error ${error.message}`);
    })
    await this.ngOnLoad();
  }

  // Manages all needed functions onload
  async ngOnLoad() {
    this.loader.main.showSpinner = true; //Start main loader
    const res = await this.initializeCompanyById(this.companyId);

    while (res) {
      setTimeout(() => (this.loader.main.showSpinner = false), 1000);
      //set content settings
      const defaultView = "dashboard";
      await this.onSelectMenu(defaultView);
      break;
    }
  }

  // Get Company By ID
  private async getCompanyById(id) {
    return await this.companyServ.getOneCompany(id).toPromise();
  }

  //Initialize Get Company By Id
  private async initializeCompanyById(id) {
    const company: { payload; success } = await this.getCompanyById(id);
    if (company === null || company === undefined) {
      const setError = {
        title: "Something went wrong.",
        subTitle: "Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.main.spinnerStyle = { top: "35%" };
      this.loader.main.spinnerType = "dataless";
    } else if (!company.success) {
      const setError = {
        title: "Oops...",
        subTitle: "Company data does not exist or has been deleted.",
        action: "Companies List",
        success: false,
        exists: false
      };
      this.loader.dataless = setError;
      this.loader.main.spinnerStyle = { top: "35%" };
      this.loader.main.spinnerType = "dataless";
    } else {
      this.dataSource = company.payload;
      this.companyClientId = company.payload.clientId;
      this.imgDetails.src = company.payload.profileImage;
      this.getMergeIds();
      this.pass_company_data_to_email_context(this.dataSource);
      return true;
    }
    console.log(company, "company");
    return false;
  }

  pass_company_data_to_email_context(company) {
    const context_data = {
      name: 'company',
      data: {
        id: company.id,
        email: company.email,
        email_list: []
      },
      company: { ...company, contact_ids: this.contacts }
    }

    this.email_service.email_context.next(context_data);
  }

  private getMergeIds() {
    this.clientServ.getOneClients(this.companyClientId).subscribe(res => {
      const { mergedWith: arrayMergedIds } = res.payload[0];
      if (arrayMergedIds.length > 0) {
        const joinArrayMergedIds = arrayMergedIds.join(",");
        const filterQuery = `clientId=${joinArrayMergedIds},${this.companyClientId}`;
        // console.log(filterQuery, 'queryFilterClientIDs');
        this.genServ.filterQueryClientIDs.next(filterQuery);
      } else {
        this.genServ.filterQueryClientIDs.next(this.companyClientId);
      }
    });
  }

  // Get Companies
  getAllCompanies() {
    this.companyServ.getAllCompanies().subscribe(res => {
      const { payload } = res;
      this.companies = payload.filter(
        res2 => Number(res2.id) !== Number(this.companyId)
      );
    });
  }

  private get proifleImageUpdate() {
    const profileImage = this.imgDetails.src;
    return { ...this.dataSource, profileImage };
  }

  private get navigationUrlExtras() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        session_id: "clientNavigation",
        client_id: this.companyClientId,
        client_name: `${this.dataSource.name}`,
        session_name: "company"
      }
    };
    return navigationExtras;
  }

  onMouseMenu() {
    this.isOpened = !this.isOpened;
  }

  //Filter Select Menu
  async onSelectMenu(menuName) {
    this.navMenu.default = menuName;
    this.navMenu.list.filter(async m => {
      m.selected = false;
      if (m.name === menuName) m.selected = true;
      await this.toggleView(menuName);
    });
    // console.log(this.contactMenus, "contactMenus");
  }

  private async toggleView(view) {
    this.loader.content.showSpinner = true;
    await this.initializeCompanyById(this.companyId);

    switch (view) {
      case "dashboard":
        this.display.dashboard = true;
        this.display.details = false;
        this.display.score = false;
        break;

      case "details":
        this.display.dashboard = false;
        this.display.details = true;
        this.display.score = false;
        break;

      case "score":
        document.getElementById('open-score-modal').click();
        break;

      default:
        this.display.dashboard = false;
        this.display.details = false;
        this.display.score = false;
        this.loader.spinnerType = "errorCard";
        break;
    }
    setTimeout(async () => (this.loader.content.showSpinner = false), 1000);
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const image = event.target.files[0];
      const formData = new FormData();
      formData.append("image", image);
      formData.append("previousImageName", this.imgDetails.previousImage);

      // console.log(formData.getAll('image'), 'vent');

      this.companyImage.createImage(formData).subscribe(res => {
        const { payload, success } = res;
        if (success) {
          this.imgDetails.previousImage = payload.imageName;
          this.imgDetails.src = payload.request.uri;
        }
        // console.log(res, 'formdata res');
      });
    }
  }

  // Main Loader Button Action (dataless)
  async mainActionState() {
    if (
      this.loader.dataless.success === false &&
      this.loader.dataless.exists === false
    ) {
      this.router.navigate(["/clients/companies-list"]);
    } else {
      this.loader.main.spinnerType = this.loader.main.default;
      await this.ngOnLoad();
    }
  }

  // Content Loader Button Action (dataless)
  async onActionState() {
    if (this.loader.dataless.success === true)
      this.router.navigate(["/clients/create-contacts"]);
    // else await this.ngOnLoad();
  }

  handleProfileImageUpload() {
    this.companyServ.updateCompanies(this.proifleImageUpdate).subscribe(
      res => {
        if (res.success) {
          this.reloadDataSource.next(true);
          $("#ModalCenter19 .close").click();
          // console.log(res, 'update about contact response');
        }
      },
      error => {
        console.log(error, "error");
      }
    );
  }

  toggleScore() {
    this.showScore = !this.showScore;
  }

  handleCreateInvoice() {
    this.router.navigate(["/sales/create-invoice"], this.navigationUrlExtras);
  }

  handleCreateQuotation() {
    this.router.navigate(["/sales/create-quote"], this.navigationUrlExtras);
  }

  handleCreateSalesOrder() {
    this.router.navigate(
      ["/sales/create-sales-order"],
      this.navigationUrlExtras
    );
  }

  handleCreateDeals() {
    this.router.navigate(["/sales/create-deals"], this.navigationUrlExtras);
  }

  handleCompanyMerge(mergeClientId) {
    // this.genServ.sweetAlertClientMerge('Company').then(result => {
    //   if (result.value) {
    this.clientServ
      .mergerClients(mergeClientId, this.companyClientId)
      .subscribe(res => {
        console.log(res, "onmerge");
        if (res !== null && res.success) {
          $("#ModalCenter20 .close").click();
          Swal.fire("Merged!", "Your Companies have been merged.", "success");
          this.getMergeIds();
        }
      });
    //   }
    // });
  }

  handleCompanyDeletion(id) {
    this.genServ.sweetAlertFileDeletions("Company").then(result => {
      if (result.value) {
        this.companyServ.deleteCompanies(id).subscribe(
          result2 => {
            if (result2) {
              console.log("updated deleted");
              Swal.fire(
                "Deleted!",
                "Your file has been deleted.",
                "success"
              ).then(res22 => {
                this.router.navigate(["/clients/companies-list"]);
              });
            }
          },
          error => {
            console.log("errorDeleting", error);
            Swal.fire({
              type: "error",
              title: "Oops...",
              text: "Something went wrong! Try again"
            });
          }
        );
      }
    });
  }
}
