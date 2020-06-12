import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import * as $ from 'jquery';
import { TargetService } from 'src/app/services/target.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { format } from 'date-fns';
import { exportTableToCSV } from 'src/app/utils/utils';
import { CustomValidators } from 'ngx-custom-validators';

@Component({
  selector: 'app-commission-profiles',
  templateUrl: './commission-profiles.component.html',
  styleUrls: ['./commission-profiles.component.css']
})
  
export class CommissionProfilesComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "Commission Title", key: "title" },
      { title: "Commission Type", key: "type" },
      { title: "Rate ( % )", key: "rate" },
      { title: "Accelerator ( % )", key: "accelerator" },
      { title: 'Date Created', key: 'date_created' },
      { title: "Action", key: "action" }
    ],
    options: {
      bulkActions: [],
      singleActions: [
        'View/Edit'
      ]
    }
  };
  Id;
  profile = {};
  enable_accelerator: boolean = false;
  profiles: Array<{}> = [];
  profileForm: FormGroup;
  dashboardStyle = "col-xl-12 col-lg-12 col-md-12";
  listStyle = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.listStyle;
  loadingView = false;

  constructor(
    private fb: FormBuilder,
    private targetService: TargetService,
    public generalService: GeneralService
  ) {}

  ngOnInit() {
    this.getProfiles();
    this.createForm();
    $.getScript('../../../assets/js/datatableScript.js');
  }

  dataFeedBackObsListener = (data) => {
    switch (data.type) {
      case 'singleaction': {
        this.Id = data.data.id;
        this.profile = data.data;
        if(data.action === 'View/Edit') {
          this.viewProfile(this.profile);
        } else if(data.action === 'Delete') {
          this.deleteProfile();
        }
        break;
      }
      default:
        break;
    }
  }

  clearFilter = () => this.getProfiles();

  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.listStyle : this.dashboardStyle;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  toggleAcceleratorOption() {
    this.enable_accelerator = !this.enable_accelerator;
    this.toggleAcceleratorView();
  }

  toggleAcceleratorView() {
    if (this.enable_accelerator) {
      this.profileForm.get('accelerator').setValidators([Validators.required, CustomValidators.number]);
      this.profileForm.get('accelerator_type').setValidators(Validators.required);
    } else {
      this.profileForm.get('accelerator').clearValidators();
      this.profileForm.get('accelerator_type').clearValidators();
    }
    this.profileForm.get('accelerator').updateValueAndValidity();
    this.profileForm.get('accelerator_type').updateValueAndValidity();
  }

  getProfiles(filter?) {
    this.loadingView = true;
    this.targetService.getCommissionProfiles(
      this.targetService.convertObjectToQueryString(filter)
    ).subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200)
        this.profiles = res.response;
        this.dataTable.dataChangedObs.next(true)
    });
  }

  createForm() {
    this.profileForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      rate: ['',
        [
          Validators.required,
          CustomValidators.number
        ]
      ],
      accelerator: ['',
        [CustomValidators.number]
      ],
      accelerator_type: ['']
    });
  }

  openProfileModal() {
    this.Id = null;
    this.profileForm.reset();
    //@ts-ignore
    document.querySelector("[data-target='#ModalCenter4'").click();
  }

  viewProfile(obj) {
    this.openProfileModal();
    const profile = Object.assign({}, obj);
    this.Id = profile.id;
    if (profile.accelerator || profile.accelerator_type) {
      this.enable_accelerator = true;
    } else {
      this.enable_accelerator = false;
    }
    this.profileForm.patchValue(profile);
    this.toggleAcceleratorView();
  }

  saveProfile() {
    let profileDetails = this.profileForm.value;
    if(!this.enable_accelerator) {
      delete profileDetails.accelerator;
      delete profileDetails.accelerator_type;
    }
    $('#ModalCenter4 .close').click();
    return (this.Id)? this.updateProfile(profileDetails) : this.addProfile(profileDetails);
  }

  addProfile(profileDetails) {
    this.generalService.sweetAlertFileCreations('Commission Profile')
      .then(res => {
        if (res.value) {
          this.loadingView = true;
          this.targetService.addCommissionProfile(profileDetails)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200) {
                this.getProfiles();
                this.profileForm.reset();
              }
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  updateProfile(profileDetails) {
    this.generalService.sweetAlertFileUpdates('Commission Profile')
      .then(res => {
        if (res.value) {
          this.loadingView = true;
          this.targetService.updateCommissionProfile(this.Id, profileDetails)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200) {
                this.getProfiles();
                this.profileForm.reset();
              }
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  deleteProfile() {
    this.generalService.sweetAlertFileDeletions('Commission Profile')
      .then(res => {
        if (res.value) {
          this.loadingView = true;
          this.targetService.deleteCommissionProfile(this.Id)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200)
                this.getProfiles();
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  exportTable() {
    const exportName = `Notch Commission Profile List - ${format(Date.now(), 'MMM d, yyyy h.mm a')}`;
    const columns = [
      { title: "Commission Title", value: "title" },
      { title: "Commission Type", value: "type" },
      { title: "Rate ( % )", value: "rate" },
      { title: "Accelerator ( % )", value: "accelerator" },
      { title: 'Date Created', value: 'date_created' }
    ];
    exportTableToCSV(this.profiles, columns, exportName);
  }
}
