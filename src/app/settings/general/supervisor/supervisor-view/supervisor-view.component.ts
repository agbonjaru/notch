import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationService } from 'src/app/services/organizationservice';
import { selectConfig } from 'src/app/utils/utils';
import { SignupLoginService } from 'src/app/services/signupLogin.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-supervisor-view',
  templateUrl: './supervisor-view.component.html',
  styleUrls: ['./supervisor-view.component.css']
})
export class SupervisorViewComponent implements OnInit {
  selectedUser = [];
  disBtn = false;
  usersList$ = this.orgSrv.getUsersInOrganization();
  supervisor = {id:'', name: '', email: ''};
  config = {...selectConfig, displayKey: 'fullName'}
  filteredUserList;
  subordinateList;
  constructor(
    private orgSrv: OrganizationService,
    private signupSrv: SignupLoginService,
    private gs: GeneralService,
    route: ActivatedRoute) {
    route.params.subscribe((res: any) => {
      this.supervisor = res;
    })
   }

  ngOnInit() {
    this.getSubordinates();
  }

  getSubordinates() {
    this.signupSrv.fetchSubordinates(this.supervisor.email).subscribe(res => {
      this.subordinateList = res;
    })
  }

  addSubordinate() {
    if(this.selectedUser.length) {
      this.disBtn = true;
      const payload = {supervisorEmail: this.supervisor.email, userEmails: this.selectedUser}
      this.signupSrv.addSubordinate(payload).subscribe((res: any) => {
        this.selectedUser = [];
        this.getSubordinates();
        this.gs.sweetAlertSucess(res.message)
      }, err => {
        this.gs.sweetAlertError(this.gs.getErrMsg(err));
      }).add(() => {
        this.disBtn = false
      })
    }
  }
  deleteSub(sub) {
    this.gs.sweetAlertFileDeletions(sub.firstName+' '+sub.lastName).then(res => {
      if(res.value) {
        this.signupSrv.deleteSubordinate(this.supervisor.email, sub.email).subscribe((res: any) => {
          this.getSubordinates();
          this.gs.sweetAlertSucess(res.message)
        }, err => {
          this.gs.sweetAlertError(this.gs.getErrMsg(err));
        })
      }
    })
  }
  filteredUsers(users: any[]) {    
    const newUser = users.filter(user => user.id != this.supervisor.id);
    this.filteredUserList = [...newUser];
    return [...newUser];
  }
}
