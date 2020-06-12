import { GeneralService } from 'src/app/services/general.service';
import { SignupLoginService } from 'src/app/services/signupLogin.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-pwd',
  templateUrl: './change-pwd.component.html',
  styleUrls: ['./change-pwd.component.css']
})
export class ChangePwdComponent implements OnInit {
  oldPassword;
  newPassword;
  confirmPassword;
  submitting;

  constructor(
    private signSrv: SignupLoginService,
    private generalSrv: GeneralService) { }

  ngOnInit() {
  }
  get matchPassword () {
    const vaildPasswordInput =  this.newPassword !== this.confirmPassword;
    return vaildPasswordInput && (this.newPassword && this.confirmPassword);
  }
  get disableBtn () {
    const validState = this.oldPassword && this.newPassword && this.confirmPassword;
    const vaildMatchPassword = this.newPassword === this.confirmPassword;
    return !(vaildMatchPassword && validState);
  }

  changePwd() {
    const body = {npass: this.newPassword, opass: this.oldPassword}
    this.submitting = true;
    this.signSrv.changePwd(body).subscribe(data => {
      this.generalSrv.sweetAlertSucess('Password Changed');
      this.reInitialize()
    }, err => {
      let errMsg = 'error occured try again';
      const inCorPassMsg = 'old password is incorrect'
      errMsg = err && err.error && err.error.status === 'INCORRECT_DETAILS' ? inCorPassMsg : errMsg; 
      this.generalSrv.sweetAlertError(errMsg);
      this.submitting = false;
    })
  }
  private  reInitialize() {
    this.oldPassword = null; this.confirmPassword = null; this.newPassword = null;
    this.submitting = false;
  }


}
