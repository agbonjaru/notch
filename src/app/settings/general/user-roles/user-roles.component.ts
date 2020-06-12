import { BehaviorSubject } from "rxjs";
import { selectConfig } from "./../../../utils/utils";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as $ from "jquery";
import { GeneralService } from "src/app/services/general.service";
import { OrganizationService } from "src/app/services/organizationservice";
import { RolesService } from "src/app/services/settings-services/roles.service";
import { UserRolesService } from "src/app/services/settings-services/user-roles.service";
import { SignupLoginService } from "./../../../services/signupLogin.service";
import { ToastrService } from "ngx-toastr";
import {
  VALIDEMAILREGEX,
  REMOVESPACESONLY,
} from "src/app/helpers/helperResources";

@Component({
  selector: "app-user-roles",
  templateUrl: "./user-roles.component.html",
  styleUrls: ["./user-roles.component.css"],
})
export class UserRolesComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "First Name", key: "firstName" },
      { title: "Last Name", key: "lastName" },
      { title: "Email", key: "email" },
      { title: "Role", key: "role" },
      { title: "Position", key: "position" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActionsIf: {
        Deactivate: "status",
        Activate: "!status",
      },
      singleActions: [
        {
          title: "Edit User",
          showIf: (a, b) => {
            return this.gs.isAuthorized("ADMIN_USER_ACTIONS");
          },
        },
        {
          title: "Deactivate",
          showIf: (a, b) => {
            return this.gs.isAuthorized("ADMIN_USER_ACTIONS") && b.status;
          },
        },
        {
          title: "Activate",
          showIf: (a, b) => {
            return this.gs.isAuthorized("ADMIN_USER_ACTIONS") && !b.status;
          },
        },
      ],
      bulkActions: [],
    },
  };
  dataTable2 = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "First Name", key: "firstName" },
      { title: "Last Name", key: "lastName" },
      { title: "Email", key: "email" },
      { title: "Role", key: "role" },
      { title: "Position", key: "position" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: [
        {
          title: "Re-invite",
          showIf: () => {
            return this.gs.isAuthorized("ADMIN_USER_ACTIONS");
          },
        },
      ],
      bulkActions: [],
    },
  };
  config = { ...selectConfig, placeholder: "Search Role(s)" };

  rolesName = [];
  usersList: any = [];
  licenseData: any = [];
  unRegisteredUsersList: any[];
  userInfo: any;
  loading = false;
  loader: any = {
    btnInvite: false,
  };

  loadingModal: boolean = false;
  userRolesForm: FormGroup;
  editUserForm: FormGroup;
  resetPasswordForm: FormGroup;
  getUserPosition: string;
  maxUsersExceeded: boolean = false;
  showSpinner: boolean = false;

  constructor(
    private userRoles: UserRolesService,
    private roles: RolesService,
    private toastr: ToastrService,
    private orgServ: OrganizationService,
    private signinLogin: SignupLoginService,
    private formBuilder: FormBuilder,
    private gs: GeneralService
  ) {}

  async ngOnInit() {
    this.ngForms();
    this.loadRolesList();
    await this.loadUserByOrg(true);
    this.getUnRegisteredUsers(true);
    this.showSpinner = await this.ngLoad();
    this.gs.showSpinner.next(false);
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "Activate") {
          //@ts-ignore
          this.onActivate(data.data);
        } else if (data.action === "Deactivate") {
          //@ts-ignore
          this.onDeactivate(data.data);
        } else if (data.action === "Edit User") {
          this.onEditUser(data.data);
          //@ts-ignore
          document.querySelector("[data-target='#editUserModal'").click();
        }
        break;
      default:
        break;
    }
  };

  dataFeedBackObsListener2 = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "Re-invite") {
          //@ts-ignore
          this.reInviteUser(data.data.id);
        }
        break;
      default:
        break;
    }
  };

  refreshTable = () => {
    // this.dataTable.dataChangedObs.next(true);
  };

  ngForms() {
    this.userRolesForm = this.formBuilder.group({
      email: [
        "",
        [
          Validators.pattern(VALIDEMAILREGEX),
          Validators.required,
          REMOVESPACESONLY,
        ],
      ],
      firstName: ["", [Validators.required, REMOVESPACESONLY]],
      lastName: ["", [Validators.required, REMOVESPACESONLY]],
      roleName: ["", Validators.required],
      salesPerson: false,
      agent: false,
    });

    this.editUserForm = this.formBuilder.group({
      email: ["", [Validators.pattern(VALIDEMAILREGEX), REMOVESPACESONLY]],
      firstName: ["", [Validators.required, REMOVESPACESONLY]],
      lastName: ["", [Validators.required, REMOVESPACESONLY]],
      roleName: ["", Validators.required],
      userID: [0],
      salesPerson: false,
      agent: false,
    });

    this.resetPasswordForm = this.formBuilder.group({
      password: ["", Validators.required],
      confirm: ["", Validators.required],
    });
  }

  get u() {
    return this.userRolesForm.controls;
  }
  get f() {
    return this.editUserForm.controls;
  }

  //A Delayed to validateMaxUser
  async ngLoad() {
    let users: any = await this.getRegisteredUsers();
    let licenseData: any = await this.getLicenseFromBilling();
    //validateMaxUser
    this.validateMaxUser(
      users.length,
      this.unRegisteredUsersList.length,
      parseInt(licenseData.maxUsers)
    );
    return true;
  }

  // Load Roles List
  loadRolesList() {
    this.roles.getAllRoles().subscribe((data: any) => {
      this.rolesName = data.map((role) => role.name);
    });
  }

  async getRegisteredUsers() {
    return await this.orgServ.getUsersInOrganization().toPromise();
  }

  async loadUserByOrg(meta?) {
    await this.orgServ
      .getUsersInOrganization()
      .toPromise()
      .then((result: any) => {
        this.usersList = result;
        this.dataTable.dataChangedObs.next(true);
      });
  }

  async getUnRegisteredUsers(meta?) {
    await this.orgServ
      .getPendingUsersInOrganization()
      .toPromise()
      .then((res: any) => {
        this.unRegisteredUsersList = res;
        this.dataTable2.dataChangedObs.next(true);
        if (meta) {
          $.getScript("../../../assets/js/datatableScript.js");
        }
      });
  }

  getUserById(id) {
    this.loadingModal = true;
    this.usersList.filter((u) => {
      if (u.id === id) {
        // console.log(u, "u");
        this.f.userID.setValue(u.id);
        this.f.email.setValue(u.email);
        this.f.firstName.setValue(u.firstName);
        this.f.lastName.setValue(u.lastName);
        this.f.roleName.setValue(u.role);
        this.getUserPosition = u.position;

        //Split and set agent/salesPerson
        const isExist = this.getUserPosition.includes("/");
        // console.log(isExist, "isExist");
        if (isExist) {
          const agent = this.getUserPosition.split("/")[0];
          const salesPerson = this.getUserPosition.split("/")[1];
          if (agent.toUpperCase() === "AGENT") this.f.agent.setValue(true);
          if (salesPerson.toUpperCase() === "SALES PERSON")
            this.f.salesPerson.setValue(true);
        } else {
          if (this.getUserPosition.toUpperCase() === "AGENT")
            this.f.agent.setValue(true);
          if (this.getUserPosition.toUpperCase() === "SALES PERSON")
            this.f.salesPerson.setValue(true);
        }
      }
    });
    this.loadingModal = false;
  }

  async getLicenseFromBilling() {
    return await this.signinLogin.getLicenseFromBilling().toPromise();
  }

  updatePassword(user) {
    this.getUserById(user.id);
    // this.
    // $("#editUserModal").show();
    // const title = "Activate " + user.fullName;
    // const btnTxt = "Activate";
    // this.gs.sweetAlertGeneralDelete(title, btnTxt).then(result => {
    //   if (result.value) {
    //     this.activateUser(user.id);
    //   }
    // });
  }

  onEditUser(user) {
    // console.log(user, "user edit");
    this.getUserById(user.id);
  }

  onPasswordChange(user) {
    const title = "Deactivate " + user.fullName;
    const btnTxt = "Deactivate";
    this.gs.sweetAlertGeneralDelete(title, btnTxt).then((result) => {
      if (result.value) {
        this.deactivateUser(user.id);
      }
    });
  }

  onActivate(user) {
    const title = "Activate " + user.firstName + " " + user.lastName;
    const btnTxt = "Activate";
    this.gs.sweetAlertGeneralDelete(title, btnTxt).then((result) => {
      if (result.value) {
        this.activateUser(user.id);
      }
    });
  }

  onDeactivate(user) {
    const title = "Deactivate " + user.firstName + " " + user.lastName;
    const btnTxt = "Deactivate";
    this.gs.sweetAlertGeneralDelete(title, btnTxt).then((result) => {
      if (result.value) {
        this.deactivateUser(user.id);
      }
    });
  }

  //Invite user submit func
  async inviteUser() {
    this.loader.btnInvite = true;
    if (this.userRolesForm.invalid) return;
    const payload = { ...this.userRolesForm.value };

    try {
      const res = await this.userRoles.inviteUser(payload).toPromise();
      console.log(res, "res await");
      const successMsg = "Invite Email Sent";
      this.toastr.success(successMsg);
    } catch (err) {
      let errMsg = "Sorry error occured try again";
      errMsg = err.error && err.error.message ? err.error.message : errMsg;
      this.toastr.error(errMsg, "Error");
    } finally {
      this.userRolesForm.reset();
      $("#closeInviteUserModal").click();
      this.loader.btnInvite = false;
      await this.ngLoad();
      this.getUnRegisteredUsers(true);
      this.dataTable.dataChangedObs.next(true);
      this.dataTable2.dataChangedObs.next(true);
    }

    // if (this.userRolesForm.valid) {
    //   this.loading = true;

    //   const payload = { ...this.userRolesForm.value };
    //   console.log(payload);

    //   this.userRoles
    //     .inviteUser(payload)
    //     .subscribe(
    //       async (res) => {
    //         this.gs.sweetAlertSucess("Invite Email Sent");
    //         this.ngLoad();
    //       },
    //       (err) => {
    //         this.loading = false;
    //         let errMsg = "sorry error occured try again";
    //         errMsg =
    //           err.error && err.error.message ? err.error.message : errMsg;
    //         this.gs.sweetAlertError(errMsg);
    //       }
    //     )
    //     .add(() => {
    //       this.loading = false;
    //       this.userRolesForm.reset();
    //       $("#closeInviteUserModal").click();
    //       this.dataTable.dataChangedObs.next(true);
    //     });
    // }
  }

  reInviteUser(userId) {
    this.userRoles
      .reInviteUser(userId)
      .subscribe(
        () => {
          this.gs.sweetAlertSucess("Invitation Sent");
          // this.loadUserByOrg();
          // this.loadRolesList();
        },
        (err) => {
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => {
        this.loading = false;
        this.dataTable.dataChangedObs.next(true);
      });
  }

  activateUser(userId) {
    this.loading = true;
    this.userRoles
      .activateUser(userId)
      .subscribe(
        () => {
          this.loading = false;
          this.gs.sweetAlertSucess("User Activated");
          this.loadUserByOrg();
          this.loadRolesList();
        },
        (err) => {
          this.loading = false;
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => this.dataTable.dataChangedObs.next(true));
  }

  deactivateUser(userId) {
    this.loading = true;
    this.userRoles
      .deactivateUser(userId)
      .subscribe(
        () => {
          this.loading = false;
          this.gs.sweetAlertSucess("User Deactivated");
          this.loadUserByOrg();
          this.loadRolesList();
        },
        (err) => {
          this.loading = false;
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => this.dataTable.dataChangedObs.next(true));
  }

  //Edit user submit func
  async updateUser() {
    this.loading = true;
    const payload = { ...this.editUserForm.value };
    this.userRoles.editUser(payload).subscribe(
      async (res) => {
        this.loadUserByOrg();
        this.gs.sweetAlertSucess("Account Modified Successfully!");
      },
      (err) => {
        let errMsg = "sorry error occured try again";
        errMsg = err.error && err.error.message ? err.error.message : errMsg;
        this.gs.sweetAlertError(errMsg);
      },
      () => {
        this.loading = false;
        this.dataTable.dataChangedObs.next(true);
        $("#closeEditUserModal").click();
      }
    );
  }

  changePassword(userId) {
    this.loading = true;
    this.userRoles
      .reInviteUser(userId)
      .subscribe(
        () => {
          this.gs.sweetAlertSucess("Invitation Sent");
          this.loadUserByOrg();
          this.loadRolesList();
        },
        (err) => {
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => {
        this.loading = false;
      });
  }

  validateMaxUser(regUsers: number, unregUsers: number, maxUsers: number) {
    const countUsers = Number(regUsers + unregUsers);
    if (countUsers <= maxUsers) this.maxUsersExceeded = true;
    // console.log("maxUsersExceeded", this.maxUsersExceeded);
  }
}
