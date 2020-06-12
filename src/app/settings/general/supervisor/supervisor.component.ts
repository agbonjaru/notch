import { Component, OnInit } from '@angular/core';
import { selectConfig } from 'src/app/utils/utils';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserModel } from 'src/app/store/storeModels/user.model'; 
import { OrganizationService } from 'src/app/services/organizationservice';
import { SignupLoginService } from 'src/app/services/signupLogin.service';
import { GeneralService } from 'src/app/services/general.service';
import $ from 'jquery'
import { Router } from '@angular/router';
@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.css']
})
export class SupervisorComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "Email", key: "email" },
      { title: "Full Name", key: "fullName" },
      { title: "Position", key: "position" },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},
      singleActionsIf: {
        Deactivate: 'status',
        Activate: '!status'
      },
      singleActions: [
       {
         title: "View",
         showIf: (a, b) => {
          return this.gs.isAuthorized('ADMIN_USER_ACTIONS')
         }
       },
      ],
      bulkActions: [
      ]
    }
  };
  selectedUser = [];
  config = { ...selectConfig, displayKey: 'fullName'}
  usersList$ = this.orgSrv.getUsersInOrganization();
  loading = false;
  supervisorList$ = this.signupSrv.fetchSupervisor();
  constructor(
    private orgSrv: OrganizationService,
    private signupSrv: SignupLoginService,
    private router: Router,
    public gs: GeneralService) {}

  dataFeedBackObsListener = data => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "View") {
          this.open(data.data)

        } else if (data.action === "Delete") {
          this.deleteSupervisor(data.data)


        }
        break;
      default:
        break;
    }
  };

  ngOnInit() {}
  

  addSupervisor() {
    if(this.selectedUser) {
      this.loading = true;
      this.signupSrv.addSupervisor(this.selectedUser).subscribe((res: any) => {
        this.gs.sweetAlertSucess(res.message);
        this.supervisorList$ = this.signupSrv.fetchSupervisor();
        this.dataTable.dataChangedObs.next(true)
      }, err => {
        this.gs.sweetAlertError(this.gs.getErrMsg(err))
      }).add(() => {
        $('.close').click()
        this.loading = false;
      })
    }
  }
  open({userID, fullName, email}) {
    if(this.gs.isAuthorized('ADMIN_USER_ACTIONS')) {
      this.router.navigate(['/settings/supervisor', userID, fullName, email])
    }
  }
  deleteSupervisor({fullName, email}) {
    this.gs.sweetAlertFileDeletions(fullName).then(res => {
      if(res.value) {
        this.signupSrv.deleteSupervisor(email).subscribe((res: any) => {
          this.supervisorList$ = this.signupSrv.fetchSupervisor();
          this.dataTable.dataChangedObs.next(true)
          this.gs.sweetAlertSucess(res.message)
        }, err => {
          this.gs.sweetAlertError(this.gs.getErrMsg(err));
        })
        
      }
    })
  }

}
