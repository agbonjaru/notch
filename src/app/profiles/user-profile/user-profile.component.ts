import { selectConfig } from "../../utils/utils";
import { COUNTRIES } from "../../data/nations";
import { GeneralService } from "../../services/general.service";
import { AuthService } from "../../auth/auth.service";
import { SignupLoginService } from "../../services/signupLogin.service";
import { Store } from "@ngrx/store";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { AppState } from "src/app/store/app.state";
import { UserModel } from "src/app/store/storeModels/user.model";
import $ from "jquery";
import {
  REMOVESPACESONLY,
  VALIDEMAILREGEX,
} from "src/app/helpers/helperResources";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  user: UserModel;
  roleName: string;
  priviledges: any[];
  config = { ...selectConfig };
  countries = [];
  imgUrl = "/assets/img/default.png";
  userForm: FormGroup;
  loader: any = {};
  // UserForm = new FormGroup({
  //   id: new FormControl("", Validators.required),
  //   password: new FormControl("", Validators.required),
  //   emailConfirm: new FormControl("", Validators.required),
  //   token: new FormControl(""),
  //   firstName: new FormControl("", Validators.required),
  //   lastName: new FormControl("", Validators.required),
  //   email: new FormControl("", Validators.required),
  //   city: new FormControl(""),
  //   country: new FormControl(""),
  //   dateOfBirth: new FormControl(""),
  //   phoneNo: new FormControl(""),
  //   mobileNo: new FormControl(""),
  //   website: new FormControl(""),
  //   state: new FormControl(""),
  //   street: new FormControl(""),
  // });
  constructor(
    private store: Store<AppState>,
    private signSrv: SignupLoginService,
    private authSrv: AuthService,
    private generalSrv: GeneralService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.countries = COUNTRIES.map((country) => country.name);
  }

  ngOnInit() {
    this.createForm();
    this.initializeStore();
  }

  initializeStore() {
    this.store.select("userInfo").subscribe((info) => {
      if (info && info.user) {
        console.log(info.user, "user");

        this.user = info.user;
        this.roleName = info.roleName;
        this.priviledges = info.priviledges;
        this.imgUrl = this.user.userImg ? this.user.userImg : this.imgUrl;
        this.userForm.patchValue(info.user);
        // this.setFormValues(info.user);
      }
    });
  }

  createForm() {
    this.userForm = this.fb.group({
      id: [null],
      firstName: ["", [Validators.required, REMOVESPACESONLY]],
      lastName: ["", [Validators.required, REMOVESPACESONLY]],
      phoneNo: [""],
      mobileNo: [""],
      dateOfBirth: [""],
      website: [""],
      street: [""],
      city: [""],
      state: [""],
      country: [""],
    });
  }

  setFormValues(data) {
    this.userForm.patchValue({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNo: data.phoneNo,
      mobileNo: data.mobileNo,
      dateOfBirth: data.dateOfBirth,
      website: data.website,
      street: data.street,
      city: data.city,
      state: data.state,
      country: data.country,
    });
  }

  async updateUser() {
    try {
      this.loader.save = true;
      // console.log(this.userForm.value, "value");
      let res = await this.signSrv.updateUser(this.userForm.value).toPromise();
      console.log(res, "res");
      if (res) this.authSrv.updateUser(this.userForm.value);
      this.toastr.success("Profile updated successfully!", "Success");
      this.generalSrv.sweetAlertSucess("Profile Updated");
    } catch (error) {
      console.log(error, "error");
      this.toastr.error(error.message, "Profile Error!");
    } finally {
      this.loader.save = false;
      this.initializeStore();
    }
    // if (this.userForm.valid) {
    //   this.generalSrv
    //     .sweetAlertUpdates("Confirm Update User")
    //     .then((result) => {
    //       if (result.value) {
    //         this.signSrv.updateUser(this.userForm.value).subscribe(() => {
    //           this.authSrv.updateUser(this.userForm.value);
    //           this.generalSrv.sweetAlertSucess("User Updated");
    //         });
    //       }
    //     });
    // }
  }

  userImg: File;
  imgLoading = false;
  handleBrowse() {
    $("#photo").click();
  }
  browseFile(event) {
    this.userImg = event.target.files[0];
  }
  cancelUpload() {
    this.userImg = null;
  }
  upload() {
    if (this.userImg) {
      this.imgLoading = true;
      const uploadtype = this.user.userImg ? "update" : "new";
      this.signSrv.uploadUserImg(this.userImg, uploadtype).subscribe(
        (res: any) => {
          this.authSrv.updateUser({ userImg: res.displayUriPath });
          this.imgLoading = false;
          this.generalSrv.sweetAlertSucess("User Image Uploaded");
          this.cancelUpload();
        },
        (err) => {
          this.imgLoading = false;
          alert("error occured try again");
        }
      );
    }
  }
}
