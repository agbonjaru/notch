import { Component, OnInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import {
  VALIDEMAILREGEX,
  REMOVESPACESONLY,
} from "src/app/helpers/helperResources";
import { ContactsModel } from "src/app/models/clients/contacts.model";
import { Observable } from "rxjs";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import * as $ from "jquery";
import { ContactCompanyImageService } from "src/app/services/client-services/contactImage.service";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { GeneralService } from "src/app/services/general.service";
import { selectConfig } from "src/app/utils/utils";
import {
  trigger,
  transition,
  query,
  style,
  animate,
  group,
} from "@angular/animations";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

@Component({
  selector: "app-create-contact",
  templateUrl: "./create-contact.component.html",
  styleUrls: ["./create-contact.component.css"],
})
export class CreateContactComponent implements OnInit {
  config = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Companies", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search",
  };
  bsConfig = {
    dateInputFormat: "DD-MM-YYYY",
    selectFromOtherMonth: true,
    adaptivePosition: true,
  };
  today: Date = new Date();
  otherTitle: string;
  teamConfig = { ...selectConfig, displayKey: "teamName" };
  multipleCompany = true;
  contactForm: FormGroup;
  teamID;
  validEmailRegex;
  children = [];
  addBtnName = "Add Child";
  childEditObject: any = {};
  arrayTeams: any;
  editChildIndex;
  companyDropdownOptions: Observable<any>;
  companysDetailArray = [];
  selectedCompanies;
  imgDetails = {
    previousImage: "",
    src: "https://test.notchcx.io/assets/img/default.png",
  };

  showAdditionalFields: boolean = false;
  loadingBtn: boolean = false;
  counter: number = 0;
  btnNext: string = "Save Contact";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private contactServ: ContactsService,
    private genServ: GeneralService,
    private companyServ: CompaniesService,
    private contactImage: ContactCompanyImageService,
    private toastr: ToastrService
  ) {
    this.validEmailRegex = VALIDEMAILREGEX;

    // Get companys
    this.companyServ.getAllCompanies().subscribe(
      (res) => {
        if (res) {
          // create array object
          const { payload } = res;
          payload.map((res2: any) => {
            this.companysDetailArray.push({
              id: res2.clientId,
              name: res2.name,
            });
          });
          const dropDown = ["*Not Listed"];
          this.companysDetailArray.forEach((element) => {
            dropDown.push(element.name);
          });
          this.companyDropdownOptions = new Observable((observer) => {
            observer.next(dropDown);
          });
        }
      },
      (error) => {
        // this.loadingView = false;
        console.log(error, "error on getting companys");
      }
    );
  }

  ngOnInit() {
    this.createForm();
    this.getSalespersonTeams();
    // Child edit - Twoway binding Hack
    this.childEditObject = { ...this.contactForm.value.chidrenInfo };
    // console.log(this.f, "f");
  }

  get f() {
    return this.contactForm.controls;
  }

  get personalInfoForm() {
    return this.f.personalInfo;
  }

  // Get Contact Details
  private get contactDetails(): ContactsModel {
    const contactForm = this.contactForm.value;
    let DOB = "";
    if (contactForm.personalInfo.dateOfBirth !== null)
      DOB = Date.parse(contactForm.personalInfo.dateOfBirth).toString();

    const otherInfo = JSON.stringify({
      SMSNumber: contactForm.personalInfo.smsPhoneNumber,
      spouseDetails: {
        spouseName: contactForm.spouseInfo.spouseName || "",
        spousedateOfBirth: contactForm.spouseInfo.spousedateOfBirt || "",
        spousePhoneNumber: contactForm.spouseInfo.spousePhoneNumber || "",
        spouseSpecialAnniversary:
          contactForm.spouseInfo.spouseSpecialAnniversary || "",
      },
      childrenDetails: this.children || [],
    });
    // console.log(contactForm, "team");

    return {
      leadId: 0,
      title: contactForm.personalInfo.title,
      firstName: contactForm.personalInfo.firstName,
      surName: contactForm.personalInfo.lastName,
      otherName: contactForm.personalInfo.otherName || "",
      dateOfBirth: contactForm.personalInfo.dateOfBirth || "",
      gender: contactForm.personalInfo.gender,
      maritalStatus: contactForm.personalInfo.maritalStatus,
      maidenName: contactForm.personalInfo.maidenName || "",
      occupation: "",
      officialPhoneNumber: contactForm.personalInfo.officalPhoneNumber,
      personalPhoneNumber: contactForm.personalInfo.personalPhoneNumber || "",
      email: contactForm.personalInfo.officialEmail,
      otherEmail: contactForm.personalInfo.personalEmail || "",
      postalAddress: "",
      fax: "",
      zip: "",
      stateOfOrigin: "",
      nextOfKin: "",
      nextOfKinRelationship: "",
      otherInfo,
      profileImage: this.imgDetails.src || "",
    };
  }

  // Get companys
  private get fetchCompaniesId() {
    const selectedCompanies = [];
    this.contactForm.value.personalInfo.companyName.forEach((element) => {
      selectedCompanies.push(
        ...this.companysDetailArray.filter((res) => res.name === element)
      );
    });
    return selectedCompanies;
  }

  // Get getSalespersonTeams
  getSalespersonTeams() {
    this.companyServ.getSalespersonTeams().subscribe((res) => {
      // console.log(res, 'arrayTeam');
      this.arrayTeams = res;
    });
  }

  createForm() {
    this.contactForm = this.fb.group({
      personalInfo: this.fb.group({
        title: [""],
        firstName: ["", [Validators.required, REMOVESPACESONLY]],
        lastName: ["", [Validators.required, REMOVESPACESONLY]],
        officialEmail: [
          "",
          Validators.compose([Validators.pattern(this.validEmailRegex)]),
        ],
        personalEmail: [
          "",
          Validators.compose([Validators.pattern(this.validEmailRegex)]),
        ],
        officalPhoneNumber: ["", Validators.pattern("^[0-9]{11}$")],
        personalPhoneNumber: ["", Validators.pattern("^[0-9]{11}$")],
        smsPhoneNumber: ["", Validators.pattern("^[0-9]{11}$")],
        companyName: [""],
        dateOfBirth: [""],
        profile: [""],
        otherName: [""],
        maidenName: [""],
        gender: [""],
        maritalStatus: [""],
        team: [""],
      }),
      spouseInfo: this.fb.group({
        spouseName: [""],
        spousedateOfBirth: [""],
        spousePhoneNumber: ["", Validators.pattern("^[0-9]{11}$")],
        spouseSpecialAnniversary: [""],
      }),
      chidrenInfo: this.fb.group({
        childrenName: [""],
        childrenOfBirth: [""],
      }),
    });
  }

  getToday(): string {
    return new Date().toISOString().split("T")[0];
  }

  checkCompanySelection() {
    const contactForm = this.contactForm.value;
    if (contactForm.personalInfo.companyName.includes("*Not Listed")) {
      this.multipleCompany = false;
      this.selectedCompanies = [];
    } else {
      this.multipleCompany = true;
      this.selectedCompanies = this.fetchCompaniesId;
    }
  }

  addChild() {
    const child = this.contactForm.value.chidrenInfo;
    if (this.addBtnName === "Add Child") {
      this.children.push(child);
    } else {
      this.children[this.editChildIndex] = child;
      this.addBtnName = "Add Child";
    }
    this.contactForm.controls.chidrenInfo.reset();
  }

  editChild(index) {
    this.childEditObject = this.children[index];
    this.editChildIndex = index;
    this.addBtnName = "Update Child";
  }

  removeChild(child) {
    this.children.splice(this.children.indexOf(child), 1);
  }

  onShowAdditionalFields() {
    this.showAdditionalFields = !this.showAdditionalFields;
  }

  async onSubmit() {
    const payload = this.contactDetails;
    await this.createContact(payload);
  }

  async createContact(body) {
    this.loadingBtn = true;
    this.contactServ
      .createContacts(body)
      .subscribe(
        async (res) => {
          const { payload, success } = res;
          if (success) {
            this.toastr.success("Contact created successfully!", "Success");
            this.router.navigate(["clients/contacts-list"]);
          } else {
            this.toastr.error(
              "Something went wrong. Please try again!",
              "Oops"
            );
          }
        },
        (error) => {
          console.log(error, "error");
          this.toastr.error("Something went wrong!", "Oops");
        }
      )
      .add(() => {
        this.contactForm.reset();
        this.loadingBtn = false;
      });
  }

  // Create Contact
  handleContactCreation() {
    console.log(this.contactDetails, "onSubmit");
    const contactDetails = this.contactDetails;
    console.log(contactDetails, "details");
    // this.loadingView = true;
    $("#ModalCenter4 .close").click();
    this.genServ.sweetAlertFileCreations("Contact").then((res) => {
      if (res.value) {
        this.contactServ
          .createContacts(contactDetails)
          .subscribe((response) => {
            console.log(response, "regContact");
            const { success, payload } = response;
            if (success) {
              // Add Company to contact
              const selectedCompanyIds = this.fetchCompaniesId;
              selectedCompanyIds.map((result) => {
                const companyPayload = {
                  companyId: result.id,
                  contactId: payload.clientId,
                };
                console.log(companyPayload, "selectedContactsIds");
                this.contactServ.addCompanyToContact(companyPayload).subscribe(
                  (res2) => {
                    const { success: contactSuccess } = res2;
                    if (contactSuccess) {
                      this.genServ.sweetAlertFileCreationSuccess(
                        "Contact",
                        `/clients/contacts-view/${payload.id}`
                      );
                    } else {
                      this.genServ.sweetAlertFileCreateErrorWithoutNav(
                        "Contact"
                      );
                    }
                  },
                  (error) => {
                    console.log(error, "error");
                  }
                );
              });

              this.contactForm.reset();
            }
          });
      }
    });
  }

  // async onImageUpload(event) {
  //   let res: boolean = await this.readImageURL(event.target);
  //   if (res) await this.uploadContactPhoto(event);
  //   else this.toastr.error("Error uploading photo! Please try again.", "Oops!");
  // }

  // UPLOAD CONTACT PHOTO TO GET IMAGE URL

  async uploadContactPhoto(event) {
    if (event.target.files.length > 0) {
      const image = event.target.files[0];
      const formData = new FormData();
      formData.append("image", image);
      formData.append("previousImageName", this.imgDetails.previousImage);

      console.log(formData.getAll("image"), "vent");

      this.contactImage.createImage(formData).subscribe(
        async (res) => {
          const { payload, success } = res;
          if (success) {
            this.imgDetails.previousImage = payload.imageName;
            this.imgDetails.src = payload.request.uri;
            $("#imagePreview").hide();
            $("#imagePreview").fadeIn(650);
          } else
            this.toastr.error(
              "Error uploading photo! Please try again.",
              "Oops!"
            );
        },
        (err) => {
          this.toastr.error(
            "Error uploading photo! Please try again.",
            "Oops!"
          );
        }
      );
    }
  }

  // WIZARD FUNCTION BEGINS HERE
  onNext() {
    if (this.counter === 1) {
      this.btnNext = "Create Contact";
      this.counter++;
    } else if (this.counter === 2) {
      this.onSubmit();
    } else {
      this.btnNext = "Continue";
      this.counter++;
    }

    // if (this.counter != 3 - 1) {
    //   this.btnNext = "Continue";
    //   this.counter++;
    // } else this.btnNext = "Create Contact";
  }

  onPrevious() {
    if (this.counter > 0) {
      this.btnNext = "Save Contact";
      this.counter--;
    }
  }

  validateNumber(event) {
    const keyCode = event.keyCode;
    const excludedKeys = [8, 37, 39, 46];

    if (
      !(
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 96 && keyCode <= 105) ||
        excludedKeys.includes(keyCode)
      )
    ) {
      event.preventDefault();
    }
  }
}
