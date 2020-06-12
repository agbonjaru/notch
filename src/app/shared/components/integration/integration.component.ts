import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges
} from "@angular/core";
import Swal from "sweetalert2";
import { CallService } from "src/app/services/call.service";
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: "app-integration",
  templateUrl: "./integration.component.html",
  styleUrls: ["./integration.component.css"]
})
export class IntegrationComponent implements OnInit, OnChanges {
  /* */
  email_is_modal = ''
  email_component_id: string = 'integration';

  pageContext;
  showTeams: boolean = false;

  /** */
  @Input() clientID;

  dropdownOptions = ["Option 1", "Option 2", "England", "Option 3", "Tokyo"];
  times = ["10mins", "20mins", "30mins", "1hr", "2hr"];
  fileInfo = "no file selected";
  config = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Clients", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search"
  };
  editorField = "Enter text here....";
  numberAdded = false;

  constructor(
    private phoneCallServ: CallService,
    private emailService: EmailService,
    private generalSrv: GeneralService

  ) { }

  ngOnInit() {
    this.getPageContext();
  }

  /**
   * TASK CONDITIONS
   */
  getPageContext() {
    this.emailService.email_context.subscribe((context: any) => {
      if (!this.generalSrv.checkIfObjectIsEmpty(context)) {
        this.pageContext = context.name;
        console.log(context.name, " integration page");
        this.getAssignedTask(context);
      }
    });
  }

  getAssignedTask(context) {
    console.log(context.name, "v2.name");
    switch (context.name) {
      case 'deal':
        this.showTeams = true;
        break;

      case 'lead':
        this.showTeams = true;

        break;

      case 'company':
        this.showTeams = true;

        break;

      case 'contact':
        this.showTeams = true;

        break;

      case 'salesPerson':
        this.showTeams = true;

        break;
      
      case 'teams':
        this.showTeams = false;

        break;

      default:
        break;
    }
  }
  //ends here


  private callPhoneNumber(clientID) {

    //
    this.phoneCallServ.getPhoneNumber(clientID).subscribe(res => {
      console.log(res, "kol");
      if (res) {
        this.numberAdded = true;
      } else {
        this.numberAdded = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const {
      clientID: { currentValue: clientID }
    } = changes;
    if (clientID) {
      this.callPhoneNumber(clientID);
    }
  }

  upload(id) {
    document.getElementById(id).click();
  }
  inputChange(event) {
    const { files } = event.target;
    this.fileInfo = files[0].name;
  }

  handleAddCall() {
    Swal.fire({
      title: `Add Phone Number`,
      animation: true,
      customClass: {
        popup: "Input your phone number below"
      },

      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: `Add Number`,
      showLoaderOnConfirm: true,
      preConfirm: login => {
        const regx = new RegExp("^[0-9]+$");
        if (regx.test(login) && login.length === 11) {
          let phoneDetails = {
            phone: login,
            userID: this.clientID
          };

          this.phoneCallServ.addPhoneNumber(phoneDetails).subscribe(
            res => {
              if (res && res.status === "200") {
                Swal.fire({
                  text: `Phone Number Added`,
                  type: "success"
                }).then(res => {
                  this.callPhoneNumber(this.clientID);
                });
                return;
              } else {
                Swal.fire({
                  text: `Error Adding Phone Number`,
                  type: "error"
                });
                return;
              }
            },
            error => {
              Swal.fire({
                text: error,
                type: "error"
              });
              return;
            }
          );
        } else {
          setTimeout(() => {
            Swal.fire({
              text: "Contact must be a Number. Number must be vaild",
              type: "error"
            });
          }, 2000);
        }
      }
    });
  }

  handleUpdateCall() {
    Swal.fire({
      title: `Update Phone Number`,
      animation: true,
      customClass: {
        popup: "Input your phone number below"
      },
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: `Update Number`,
      showLoaderOnConfirm: true,
      preConfirm: login => {
        const regx = new RegExp("^[0-9]+$");
        if (regx.test(login) && login.length === 11) {
          let phoneDetails = {
            phone: login,
            userID: this.clientID
          };

          this.phoneCallServ
            .updatePhoneNumber(this.clientID, phoneDetails)
            .subscribe(
              res => {
                console.log(res, "on update");
                if (res && res.status === "200") {
                  Swal.fire({
                    text: `Phone Number Updated`,
                    type: "success"
                  }).then(res => {
                    this.callPhoneNumber(this.clientID);
                  });
                  return;
                } else {
                  Swal.fire({
                    text: `Error Updating Phone Number`,
                    type: "error"
                  });
                  return;
                }
              },
              error => {
                Swal.fire({
                  text: error,
                  type: "error"
                });
                return;
              }
            );
        } else {
          setTimeout(() => {
            Swal.fire({
              text: "Contact must be a Number. Number must be vaild",
              type: "error"
            });
          }, 2000);
        }
      }
    });
  }

  handleMakeCall() {
    Swal.fire({
      title: '<i class="Phone is-animating"></i>',
      type: "info",
      html: '<i class="Phone is-animating"></i>',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
      confirmButtonAriaLabel: "Thumbs up, great!",
      cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
      cancelButtonAriaLabel: "Thumbs down"
    });
  }

  deleteNumber() {
    Swal.fire({
      title: "Delete Phone Number",
      type: "warning",
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> Confirm!',
      confirmButtonAriaLabel: "Thumbs up, great!",
      cancelButtonText: "Cancel",
      cancelButtonAriaLabel: "Thumbs down"
    }).then(res => {
      if (res.value) {
        this.phoneCallServ.deletePhoneNumber(this.clientID).subscribe(res => {
          console.log(res, "delete Phone");
          if (res.message === "SUCCESS!") {
            Swal.fire({
              text: `Number Deleted`,
              type: "success"
            }).then(res => {
              this.callPhoneNumber(this.clientID);
            });
            return;
          }
        });
      }
    });
  }
}
