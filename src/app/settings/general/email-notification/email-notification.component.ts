import { Component, OnInit } from '@angular/core';
import { RolesService } from 'src/app/services/settings-services/roles.service';
import { EmailNotificationService } from 'src/app/services/settings-services/email-notification.service';
import { GeneralService } from 'src/app/services/general.service';
declare var $: any;
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { NotificationListModel, NotificationModel, NotificationSettings } from 'src/app/models/settings/notification';

@Component({
  selector: 'app-email-notification',
  templateUrl: './email-notification.component.html',
  styleUrls: ['./email-notification.component.css'],
})
export class EmailNotificationComponent implements OnInit {


  spinnerType: string;
  spinnerStyle: any = {};
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  showSmallSpinner: boolean = false;
  smallSpinnerStyle: any = { 'margin-left': '' };
  isLoading: boolean = false;

  selectedEmailRole = '';
  selectedInAppRole = '';
  notifyList: NotificationListModel = { email: [], inApp: [] };

  allRoles = [];
  org;
  allRolesID: any;
  userRoles = [];
  events = [];
  userEmails;
  roleName = '';
  roleName2 = '';
  notifySet: NotificationListModel;
  showButton;

  loader: any = {
    default: "notch-loader",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please  try again",
      action: "Load Notification",
      success: true
    },
    showSpinner: false
  };

  constructor(
    private roles: RolesService,
    private emailNotSrv: EmailNotificationService,
    private gs: GeneralService,
    store: Store<AppState>
  ) {
    this.loader.spinnerType = this.loader.default;
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    this.spinnerStyle = { top: '25%' };
    store.select("userInfo").subscribe(info => {
      this.org = info.organization;
    });
  }

  ngOnInit() {
    this.loadRolesList();
  }

  /**
  * Internet Loading
  * @param data 
  */
  initializeLoad(data) {
    if (data === null || data === undefined) {
      const setError = {
        title: "We couldn't load the data.",
        subTitle: "Kindly Check your Internet & Click Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else {
      this.allRoles = data;
      this.loader.showSpinner = false;
    }
  }

  /**
   * GET Roles 
   */
  loadRolesList() {
    this.loader.showSpinner = true;
    this.roles.getAllRoles().subscribe((data: any) => {
      this.initializeLoad(data);
    });
  }

  /**
  * Get Users By Roles 
  */
  getUsersByRoles() {
    this.showSmallSpinner = !this.showSmallSpinner;
    this.allRolesID = this.roleName.split(" ")[0];
    if (this.roleName.split(" ")[2] === undefined) {
      this.roleName2 = this.roleName.split(" ")[1]
    } else {
      this.roleName2 = this.roleName.split(" ")[1] + " " + this.roleName.split(" ")[2];
    }
    this.emailNotSrv.getUsersByRoles(this.roleName2).subscribe((data: any) => {
      this.userRoles = data;
      this.getNotifyByRoles(this.allRolesID);
      this.userEmails = this.userRoles.map(member => member.email);
    });
  }

  /**
  *  Get Notification By Roles
  * @param roleName 
  */
  getNotifyByRoles(roleName) {

    this.notifyList = { email: [], inApp: [] };

    this.emailNotSrv.getEvents().subscribe((res: any) => {
      res.payload.forEach(notify => {
        this.notifyList.email.push(new NotificationModel(notify.display_name, notify.name, notify._id));
        this.notifyList.inApp.push(new NotificationModel(notify.display_name, notify.name, notify._id));
      });

      const query = `orgId=${this.org.id}&role=${roleName}`;

      this.emailNotSrv.getNotificationByRoles(query).subscribe(data => {
        this.showButton = data.success;
        let events = data.payload[0].events;

        for (let name in events) {
          let setting: NotificationSettings = events[name];

          let emailNot = this.notifyList.email.find(a => a.name == name);
          let emailIndex = this.notifyList.email.indexOf(emailNot);
          this.notifyList.email[emailIndex].selected = setting.email;

          let inAppNot = this.notifyList.inApp.find(a => a.name == name);
          let inAppIndex = this.notifyList.inApp.indexOf(inAppNot);
          this.notifyList.inApp[inAppIndex].selected = setting.inApp;
        }

      }).add(() => {
        this.showSmallSpinner = !this.showSmallSpinner;
      });
    })

  }

  /**
   * Fetch ALl Events
   */
  getAllEvents() {
    this.emailNotSrv.getEvents().subscribe((res: any) => {
      res.payload.forEach(notify => {
        this.notifyList.email.push(new NotificationModel(notify.display_name, notify.name, notify._id));
        this.notifyList.inApp.push(new NotificationModel(notify.display_name, notify.name, notify._id));
      })
    })
  }

  checkNotification(notify: NotificationModel) {
    notify.selected = !notify.selected;
  }

  /**
   * Add Notification Settings
   */
  saveEmailNotify() {
    this.isLoading = !this.isLoading;
    const payload = this.processEmailNotification();
    this.emailNotSrv.saveNotSetting(payload)
      .subscribe((data: any) => {
        console.log(data, "data message");
        this.gs.sweetAlertSucess(data.message);
      }, error => {
        const msg = error.error.message ? error.error.message : 'Error occurred try again';
        this.gs.sweetAlertError(msg)
      }).add(() => {
        this.isLoading = !this.isLoading;;
        // this.retry('spin');
        // $("#email").click();
      });
  }

  /**
   * Update Notification Settings
   */
  updateEmailNotify() {
    this.isLoading = !this.isLoading;
    const payload = this.processEmailNotification();
    console.log(payload, 'Update payload');
    this.emailNotSrv.UpdateNotSetting(payload)
      .subscribe((data: any) => {
        this.gs.sweetAlertSucess(data.message);
      }, error => {
        const msg = error.error.message ? error.error.message : 'Error occurred try again';
        this.gs.sweetAlertError(msg)
      }).add(() => {
        this.isLoading = !this.isLoading;;
        // this.retry('spin');
        // $("#email").click();
      });
  }

  /**
   * DATA Required for adding Notification settings
   */
  processEmailNotification() {
    let events = {};
    this.notifyList.inApp.forEach(notification => {
      events[notification.name] = {
        "inApp": notification.selected,
        "email": false
      }
    });

    this.notifyList.email.forEach(notification => {
      events[notification.name].email = notification.selected;
    });

    const payload = {
      "orgId": this.org.id,
      "role": this.allRolesID,
      "email_list": this.userEmails,
      "events": events
    }
    // console.dir(payload);
    return payload
  }

  /**
   * LOader
   * @param spinnerType 
   */
  retry(spinnerType) {
    this.showSpinner = true;
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    setTimeout(() => {
      this.ngOnInit();
    }, 2000);
  }

  // Reload Spinner
  async reloadSpinner() {
    this.loader.spinnerType = this.loader.default;
    await this.loadRolesList();
  }

  // Allow user to add a lead when there is none.
  async onActionState() {
    if (this.loader.dataless.success === true) $("#ModalCenter4").show();
    else await this.reloadSpinner();
  }

  /**
  * Tab Navigation
  * @param content 
  */
  openContent(content) {
    document.getElementById(`${content}-tab`).click();
    $("html, body").animate(
      { scrollTop: $(`#${content}-tab`).offset().top },
      "slow"
    );
  }

}
