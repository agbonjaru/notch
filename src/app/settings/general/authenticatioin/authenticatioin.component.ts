import { Component, OnInit } from '@angular/core';
import { RolesService } from 'src/app/services/settings-services/roles.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import * as $ from 'jquery';
import { TwoFactorService } from 'src/app/services/settings-services/two-factor.service';

@Component({
  selector: 'app-authenticatioin',
  templateUrl: './authenticatioin.component.html',
  styleUrls: ['./authenticatioin.component.css'],
})

export class AuthenticatioinComponent implements OnInit {

  config = {
    search: true, // true/false for the search functionlity defaults to false,
    // tslint:disable-next-line:max-line-length
    height: 'auto', // height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder: 'Select Role(s)', // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder: 'Search', // label thats displayed in search input,
    // tslint:disable-next-line:max-line-length
    searchOnKey: 'name', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  };

  spinnerType: string;
  spinnerStyle: any = {};
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  showSmallSpinner: boolean = false;
  smallSpinnerStyle: any = { 'margin-left': '' };

  isLoading: boolean = false;
  twoFactorAuthForm: FormGroup;
  message: any = {};
  loadTwoFactorAuth = true;
  arrayRoles: any;
  allAuthentication: any;
  rolesName = [];

  constructor(
    private roles: RolesService,
    private fb: FormBuilder,
    private gs: GeneralService,
    private twoFactorAuth: TwoFactorService) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    this.spinnerStyle = { top: '25%' };
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
    this.createForm();
    this.getAllRoles();
    console.log(this.f, 'f');
  }

  // convenience getter for easy access to form fields
  get f() { return this.twoFactorAuthForm.controls; }

  // Load Roles List
  getAllRoles() {
    this.roles
      .getAllRoles()
      .subscribe((data: any) => {
        console.log(data, 'result Roles email notification');
        this.arrayRoles = data;
        this.showSpinner = !this.showSpinner;
      }, (error) => {
        this.errorLoader();
      }).add(() => {
      });
  }

  createForm() {
    // forms validation for Adding Leads Lists
    this.twoFactorAuthForm = this.fb.group({
      id: 0,
      twoFactorAuthEmail: [false],
      twoFactorAuthRoleName: [''],
      twoFactorAuthSms: [false],
    });
  }

  setFormValues(data) {
    this.f.id.setValue(data.id);
    this.f.twoFactorAuthEmail.setValue(data.email);
    this.f.twoFactorAuthSms.setValue(data.sms);
    this.f.twoFactorAuthRoleName.setValue(data.roleName);
  }

  loadAuthByRole() {
    this.showSmallSpinner = !this.showSmallSpinner;
    const roleName = this.twoFactorAuthForm.value.twoFactorAuthRoleName;
    this.twoFactorAuth
      .getAuthByRoleName(roleName)
      .subscribe((data: any) => {
        this.allAuthentication = data;
        console.log(data, 'd');
        if (data == null) {
          // reset value
          this.f.id.setValue(0);
          this.f.twoFactorAuthEmail.setValue('');
          this.f.twoFactorAuthSms.setValue('');
        } else {
          // set value
          this.setFormValues(data);
        }
      }).add(() => {
        this.showSmallSpinner = !this.showSmallSpinner;
      });
  }

  addTwoFactorAuth() {
    this.isLoading = !this.isLoading;
    console.log(this.twoFactorAuthForm.value.twoFactorAuthRoleName, 'twoFactorAuthRoleName');
    console.log(this.twoFactorAuthForm.value, 'twoFactorAuthForm values');
    // Submitting the Two Fcator Auth list to the server

    const twoFactorAuthData = {
      orgID: this.gs.orgID,
      email: this.twoFactorAuthForm.value.twoFactorAuthEmail || false,
      id: this.twoFactorAuthForm.value.id,
      roleName: this.twoFactorAuthForm.value.twoFactorAuthRoleName,
      sms: this.twoFactorAuthForm.value.twoFactorAuthSms
    };

    console.log(twoFactorAuthData);
    this.twoFactorAuth
      .createTwoFactorAuth(twoFactorAuthData)
      .subscribe((result: any) => {
        console.log(result, ' results');
        if (result) {
          this.message.header = 'Submitted';
          this.message.text = result.message;
          this.message.type = 'success';
          this.gs.alert(this.message);
        }
      }, (error) => {
        console.log(error.error.error.message, 'Error Message');
        if (error) {
          this.message.header = 'Failed';
          this.message.text = error.message;
          this.message.type = 'error';
          this.gs.alert(this.message);
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
        // this.ngOnInit();
      });
  }

  // Update Notification(s)
  updateInappNotification() {
    console.log(this.allAuthentication.id, 'update id');
    // Submitting the Product list to the server
    try {
      const twoFactorAuthData = {
        orgID: this.gs.orgID,
        email: this.twoFactorAuthForm.value.twoFactorAuthEmail,
        id: this.twoFactorAuthForm.value.twoFactorAuthChangeId,
        roleName: this.twoFactorAuthForm.value.twoFactorAuthRoleName,
        sms: this.twoFactorAuthForm.value.twoFactorAuthSms
      };
      console.log(twoFactorAuthData);
      this.twoFactorAuth.createTwoFactorAuth(twoFactorAuthData).subscribe((result: any) => {
        console.log(result, ' results');
        if (result) {
          this.message.header = 'Submitted';
          this.message.text = result.message;
          this.message.type = 'success';
          this.gs.alert(this.message);
        }
      },
        error => {
          console.log(error.error.error.message, 'Error Message');
          if (error) {
            this.message.header = 'Failed';
            this.message.text = error.message;
            this.message.type = 'error';
            this.gs.alert(this.message);
          }
        });

    } catch (error) {
      if (error) {
        this.message.header = 'Failed';
        this.message.text = error.message;
        this.message.type = 'error';
        this.gs.alert(this.message);
      }
    }
  }

  errorLoader() {
    this.spinnerType = "errorCard";
    this.setSpinnerStatus = "We couldn't load this view.";
  }

  retry(spinnerType) {
    this.showSpinner = true;
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";

    setTimeout(() => {
      this.ngOnInit();
    }, 2000);
  }
}
