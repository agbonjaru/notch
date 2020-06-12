import { RolesService } from "src/app/services/settings-services/roles.service";
import { UserModel } from "src/app/store/storeModels/user.model";
import { OrganizationService } from "src/app/services/organizationservice";
import { OrgModel } from "./../../store/storeModels/user.model";
import { ChatService } from "./../../services/chat.service";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
// import * as $ from "jquery";
declare var $: any;
import { EmailNotificationService } from "src/app/services/settings-services/email-notification.service";
import { GeneralService } from "src/app/services/general.service";
import { Endpoints } from "src/app/shared/config/endpoints";
import TwitterHandler from "./TwitterHandler";
import { TwitterService } from "src/app/services/integrations/email/twitter.service";
import { EmailService } from 'src/app/services/integrations/email/email.service';

export interface ThreadModel {
  fullName: string;
  email: string;
  id: number;
  role: string;
  position: string;
}
@Component({
  selector: "app-ai",
  templateUrl: "./ai.component.html",
  styleUrls: ["./ai.component.css"],
})
export class AiComponent implements OnInit {
  twitter_handler: any;

  messageList = [];
  threadList: ThreadModel[] = [];
  senderMsg = [];
  activeView: any;

  role = {
    id: "",
    name: "",
  };

  msg = "";
  replyTo;
  notify: any;
  org: OrgModel;
  user: UserModel;
  clicked: boolean = false;
  notifyLength = [];
  notifyList: any[];
  typing = { user: "", status: false };
  seenNotifyList: any[] = [];
  seenNotifyId;
  defaultImg =
    "https://icon-library.net//images/avatar-icon-png/avatar-icon-png-8.jpg";

  socketUrl = this.config.notificationsServiceUrl;

  loader: any = {
    default: "jsBin",
    spinnerType: "",
    spinnerStyle: { top: "25%" },
    dataless: {
      title: "No Data Available!",
      subTitle: "Please  try again",
      action: "Load Notification",
      success: true,
    },
    showSpinner: false,
  };

  constructor(
    private config: Endpoints,
    private toastr: ToastrService,
    private chatSrv: ChatService,
    private orgSrv: OrganizationService,
    private roleSrv: RolesService,
    private gs: GeneralService,
    private emailSrv: EmailNotificationService,
    private router: Router,
    private email_service: EmailService,
    private twitter_service: TwitterService) {
    this.org = this.gs.org;
    this.user = this.gs.user;
  }

  ngOnInit() {
    //
    this.twitter_handler = new TwitterHandler(this.twitter_service, this.email_service);
    this.twitter_handler.listen_for_tweets(this.emailSrv.get_socket());

    this.getUserInOrg();
    this.getNotification();
    this.getRoleByName();
    this.getSeenNotification();
    this.JoinAndRecieveAgentNotify();
  }

  JoinAndRecieveAgentNotify() {
    this.chatSrv.joinAgentNofication().subscribe(() => {
      console.log("joined agent notification");
    });
    this.chatSrv.getAgentIncomingNotify().subscribe((data: any) => {
      console.info("agent has mentioned you");
      console.log(data);
      this.notify = data;
      this.notifyList = [data, ...this.notifyList];
      const msg = `@${data.creatorName} ${data.template}`
      this.toastr.success(msg, "Success");
    });
  }
  /**
   * Fetch Role by Name
   */
  getRoleByName() {
    this.roleSrv.getRoleByName(this.gs.roleName).subscribe((res) => {
      if (res) {
        this.role.id = res.id + "";
        this.role.name = res.name;
        this.getOrgNotification();
      }
    });
  }

  /**
   * Fetch notification by Org
   */
  getOrgNotification() {
    const query = `userId=${this.user.id}&role=${this.role.id} `;
    this.emailSrv.getOrgNotification(query).subscribe((res: any) => {
      if (res.success) {
        this.processRoleNotification(res.payload);
      }
    });
    this.getUserInOrg();
  }

  /**
   * Get Users In organization
   */
  getUserInOrg() {
    this.orgSrv.getUsersInOrganization().subscribe((res: any[]) => {
      this.threadList = res.filter((data) => data.id != this.user.id);
    });
  }

  /**
   * Filter Notification Based On User
   * @param data
   */
  processRoleNotification(data: { roles: any[], userIds: any[] }[]) {
    this.notifyList = data
    this.processSeenNotify();
  }

  /**
   * Get Notification through socket io
   */
  getNotification() {
    const socket = this.emailSrv.get_socket();
    socket.on("new_notification", (data) => {
      if (data.roles.indexOf(this.role.id) >= 0) {
        this.notifyList = [data, ...this.notifyList];
        this.toastr.success(data.template, "Success");
        this.notify = data;
        console.log(this.notify, "notification");  
        console.log(this.notifyList, "notification 2");
      }
    });
  }

  /**
   * Toggling of SADE'S head
   */
  handleToggle(content) {
    if (this.notify) {
      this.activeView = !this.activeView;
      document.getElementById(`${content}-tab`).click();
      $("html, body").animate(
        { scrollTop: $(`#${content}-tab`).offset().top },
        "slow"
      );
    } else {
      this.activeView = !this.activeView;
    }
  }

  /**
   * Navigate to the various path
   * @param notify
   */
  handleNotifyNav(notice) {
    if (notice.service === 'tickets') {
      this.router.navigate(["/ticket/ticket-view", notice.itemId]);
    } else if (notice.service === 'leads') {
      this.router.navigate(["/clients/leads/", notice.itemId]);
    } else if (notice.service === 'company') {
      this.router.navigate(["/clients/companies-view/", notice.data.id]);
    } else if (notice.service === 'Deals') {
      this.router.navigate(["/sales/deals-view/", notice.itemId]);
    }
  }

  /**
   * Save Clicked Notification
   */
  clickNotify(notice) {
    const payload = {
      orgId: this.org.id,
      userId: this.user.id,
      notifications: notice._id,
    };
    this.emailSrv
      .onClick(payload)
      .subscribe(() => {
        this.clicked = true;
        this.getNotificationClicked();
      })
      .add(() => {
        this.getNotificationClicked();
      });
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
        success: false,
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else {
      // this.allRoles = data;
      this.loader.showSpinner = false;
    }
  }

  /**
   * Get Clicked Notification
   */
  getNotificationClicked() {
    this.loader.showSpinner = true;
    this.emailSrv.getClickedNotify().subscribe(() => {
    });
  }

  // Seen Notification Logic
  getSeenNotification() {
    this.emailSrv.getClickedNotify().subscribe((res: any) => {
      if (res.success && res.payload && res.payload.length) {
        this.seenNotifyList = res.payload[0].notifications;
        this.seenNotifyId = res.payload[0]._id;
      }
    });
  }

  /**
   * Function to handle click notification
   * @param notice
   */
  handleNotificationClick(notice) {
    this.handleNotifyNav(notice);
    if (this.seenNotifyId) {
      this.updateSeenNotification(notice._id);
    } else {
      this.createSeenNotification(notice._id);
    }
  }

  /**
   * Create a seen notification by id
   * @param notifyId
   */
  createSeenNotification(notifyId) {
    this.seenNotifyList = this.seenNotifyList.concat(notifyId);
    this.processSeenNotify();
    this.emailSrv.createSeenRecord(notifyId).subscribe(
      (res: any) => {
        this.seenNotifyList = res.payload[0].notifications;
        this.seenNotifyId = res.payload[0]._id;
      },
      () => { }
    );
  }

  /**
   * Update Seen Notification By Id
   * @param notifyId
   */
  updateSeenNotification(notifyId) {
    if (this.seenNotifyList.indexOf(notifyId) === -1) {
      this.seenNotifyList = this.seenNotifyList.concat(notifyId);
      this.processSeenNotify();
      this.emailSrv
        .updateSeenRecord(this.seenNotifyId, this.seenNotifyList)
        .subscribe(
          () => { },
          () => { }
        );
    }
  }

  /**
   * Seen Notification Process
   */
  processSeenNotify() {
    if (this.notifyList) {
      for (let i = 0; i < this.notifyList.length; i++) {
        const notice = this.notifyList[i];
        if (this.seenNotifyList.indexOf(notice._id) >= 0) {
          this.notifyList[i].isSeen = true;
        }
        // if (this.notifyList.length-1 === i) {
        //   this.filterSeenNotification();
        // }
      }
    }
  }

  /**
   * Filter Seen Notification
   */
  filterSeenNotification() {
    const unSeenList = this.notifyList.filter(
      (notice) => !notice.isSeen || notice.isSeen == undefined
    );
    const seenList = this.notifyList.filter((notice) => notice.isSeen);
    this.notifyList = [...unSeenList, ...seenList];
  }



  /**
  * Toggling of SADE'S head
  */
  handleToggle2() {
    this.activeView = !this.activeView;
    this.notify = "";
  }

  sendMsg() { }

  joinAndnewMsg() {
    this.chatSrv.joinChat();
  }

  getThreads() { }

  getMessages(data) {
    this.senderMsg = this.messageList.filter(
      (msg) => msg.threadId === data.threadId
    );
    this.replyTo = data.sender;
  }

  // Reload Spinner
  async reloadSpinner() {
    this.loader.spinnerType = this.loader.default;
    // await this.getNotificationClicked();
  }

  // Allow user to add a lead when there is none.
  async onActionState() {
    if (this.loader.dataless.success === true) $("#ModalCenter4").show();
    else await this.reloadSpinner();
  }
}
