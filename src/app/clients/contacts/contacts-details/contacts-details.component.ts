import { Component, OnInit, ElementRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  ActivatedRoute,
  Params,
  Router,
  NavigationExtras
} from "@angular/router";
import { GeneralService } from "src/app/services/general.service";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { ContactCompanyImageService } from "src/app/services/client-services/contactImage.service";
import * as $ from "jquery";
import Swal from "sweetalert2";
import { EmailService } from 'src/app/services/integrations/email/email.service';

@Component({
  selector: "app-contacts-details",
  templateUrl: "./contacts-details.component.html",
  styleUrls: ["./contacts-details.component.css"]
})
export class ContactsDetailsComponent implements OnInit {
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
  dataSource: any;
  reloadDataSource = new BehaviorSubject<boolean>(false);
  contactId;
  imgDetails = {
    previousImage: "",
    src: ""
  };
  viewStatus = "Detailed";
  contactClientId;

  constructor(
    private contactServ: ContactsService,
    private genServ: GeneralService,
    private activeRoute: ActivatedRoute,
    private contactImage: ContactCompanyImageService,
    private router: Router,
    private el: ElementRef,
    private email_service: EmailService
  ) {
    // Set up the loader forEach section
    this.loader.main.spinnerType = this.loader.main.default;
    this.loader.content.spinnerType = this.loader.content.default;

    this.activeRoute.params.subscribe((par: Params) => {
      const { id } = par;
      this.contactId = id;
    });
    this.reloadDataSource.subscribe(res => {
      if (res) {
        this.initializeContactById(this.contactId);
      }
    });
  }

  async ngOnInit() {
    await this.ngOnLoad();
  }

  // Manages all needed functions onload
  async ngOnLoad() {
    this.loader.main.showSpinner = true; //Start main loader
    const res = await this.initializeContactById(this.contactId);
    while (res) {
      setTimeout(() => (this.loader.main.showSpinner = false), 1000);
      //set content settings
      const defaultView = "dashboard";
      await this.onSelectMenu(defaultView);
      break;
    }
  }

  // Get Contact By ID
  private async getContactById(id) {
    return await this.contactServ.getOneContact(id).toPromise();
  }

  //Initialize Get Contact By Id
  private async initializeContactById(id) {
    const contact: { payload; success } = await this.getContactById(id);
    if (contact === null || contact === undefined) {
      const setError = {
        title: "Something went wrong.",
        subTitle: "Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.main.spinnerStyle = { top: "35%" };
      this.loader.main.spinnerType = "dataless";
    } else if (!contact.success) {
      const setError = {
        title: "Oops...",
        subTitle: "Contact data does not exist or has been deleted.",
        action: "Contacts List",
        success: false,
        exists: false
      };
      this.loader.dataless = setError;
      this.loader.main.spinnerStyle = { top: "35%" };
      this.loader.main.spinnerType = "dataless";
    } else {
      this.dataSource = contact.payload;
      this.contactClientId = contact.payload.clientId;
      this.imgDetails.src = contact.payload.profileImage;
      this.pass_contact_data_to_email_context(this.dataSource);
      return true;
    }
    console.log(contact, "Contact");
    return false;
  }

  pass_contact_data_to_email_context(contact) {
    const context_data = {
      name: 'contact',
      data: {
        id: contact.id,
        email: contact.email,
      },
      contact
    }

    this.email_service.email_context.next(context_data);
  }

  private get proifleImageUpdate() {
    const profileImage = this.imgDetails.src;
    return { ...this.dataSource, profileImage };
  }

  private get navigationUrlExtras() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        session_id: "clientNavigation",
        client_id: this.contactClientId,
        client_name: `${this.dataSource.firstName} ${this.dataSource.surName} ${this.contactClientId}`,
        session_name: "contact"
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
    await this.initializeContactById(this.contactId);

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

      this.contactImage.createImage(formData).subscribe(res => {
        const { payload, success } = res;
        if (success) {
          this.imgDetails.previousImage = payload.imageName;
          this.imgDetails.src = payload.request.uri;
        }
        // console.log(res, 'formdata res');
      });
    }
  }

  handleProfileImageUpload() {
    this.contactServ.updateContacts(this.proifleImageUpdate).subscribe(
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
    this.display.showScore = !this.display.showScore;
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

  handleContactDeletion(id) {
    this.genServ.sweetAlertFileDeletions("Contact").then(result => {
      if (result.value) {
        this.contactServ.deleteContacts(id).subscribe(
          result2 => {
            if (result2) {
              console.log("updated deleted");
              Swal.fire(
                "Deleted!",
                "Your file has been deleted.",
                "success"
              ).then(res22 => {
                this.router.navigate(["/clients/contacts-list"]);
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

  //Toggle Contact Details &
  toggleScore2() {
    this.display.showScore = !this.display.showScore;
  }

  // Main Loader Button Action (dataless)
  async mainActionState() {
    if (
      this.loader.dataless.success === false &&
      this.loader.dataless.exists === false
    ) {
      this.router.navigate(["/clients/contacts-list"]);
    } else {
      this.loader.main.spinnerType = this.loader.main.default;
      await this.ngOnLoad();
    }
  }

  // Content Loader Button Action (dataless)
  async onActionState() {
    if (this.loader.dataless.success === true)
      this.router.navigate(["/clients/create-contacts"]);
    else await this.ngOnLoad();
  }
}
