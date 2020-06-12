import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VALIDEMAILREGEX } from 'src/app/helpers/helperResources';
import { SignupModel } from 'src/app/models/signUp.model';
import { SignupLoginService } from 'src/app/services/signupLogin.service';
import { Router, NavigationExtras } from '@angular/router';
import Swal from 'sweetalert2';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signUpForm: FormGroup;
  validEmailRegex: any;
  loadingPage = false;

  constructor(
    private fb: FormBuilder,
    private signUpServ: SignupLoginService,
    private genSer: GeneralService,
    private router: Router
  ) {
    this.validEmailRegex = VALIDEMAILREGEX; // email validation
  }

  // Prepare Signup Details
  private get signupDetails(): SignupModel {
    return {
      firstName: this.signUpForm.value.firstname,
      lastName: this.signUpForm.value.lastname,
      password: this.signUpForm.value.password,
      email: this.signUpForm.value.email,
      position: '',
      roles: '',
      generatedToken: '',
    };
  }

  ngOnInit() {
    this.createForm();
  }

  // Create form
  createForm() {
    this.signUpForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex),
        ]),
      ],
      password: ['', Validators.required],
    });
  }

  // Submit users details for signup
  handleSubmit() {
    this.loadingPage = true;
    this.signUpServ.registerUser(this.signupDetails).subscribe((res: any) => {
        this.loadingPage = false;
        if (res) {
          // Change this to redux
          this.genSer.signedInUserDetails.next(res);
          const sessionId = res.id;
          const navigationExtras: NavigationExtras = {
            queryParams: { session_id: sessionId },
            fragment: 'notVerified',
          };
          this.router.navigate(['administrator/welcome'], navigationExtras);
        }
      },
      error => {
        this.loadingPage = false;
        let msg = 'Error occured try again';
        if(error && error.error && error.error.message) {
          msg = error.error.message;
        }
        Swal.fire({
          type: 'error',
          title: 'Oops...',
          text: msg,
        });
        console.log(error, 'error');
    
      }
    );
  }
}
