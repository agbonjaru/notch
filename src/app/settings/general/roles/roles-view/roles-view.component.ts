import { Component, OnInit,  } from '@angular/core';
import * as $ from 'jquery';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { PermissionsService } from 'src/app/services/settings-services/permissions.service';
import { selectConfig } from 'src/app/utils/utils';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { RolesService } from 'src/app/services/settings-services/roles.service';
import { SignupLoginService } from 'src/app/services/signupLogin.service';

@Component({
  selector: 'app-roles-view',
  templateUrl: './roles-view.component.html',
  styleUrls: ['./roles-view.component.css']
})
export class RolesViewComponent implements OnInit {
  id;
  allModules$ = combineLatest(
    this.permission.fetchSectionModules(0),
    this.permission.fetchSectionModules(1)
  ).pipe(map(([actionModule, pageModule]) => {
    return {actionModule, pageModule}
  }));
  config = {...selectConfig};
  rolesByName: any;
  name: any;
  permissionModule = []
  allActionMoule = [];
  allPageModule = [];
  selectedActModule;
  selectedPageModule;
  actionPrives: any[];
  pagePrives: any[]
  allPerimssion = [];
  loading = false;
  loadingPages = false;
  disBtn = false;
  markAll =  false


  constructor(
    private permission: PermissionsService,
    private roleSrv: RolesService,
    private route: ActivatedRoute,
    public gs: GeneralService,
    private signupSrv: SignupLoginService,
  ) {
    $.getScript('../../../assets/js/datatableScript.js');
    this.route.params.subscribe(params => {
      this.name = params.name;
      this.id = Number(params.id);
    });
  }  

  ngOnInit() {
    this.getModules();
    this.getRole();
  }
  getModules() {
    this.signupSrv.fetchLicenseByName().subscribe((res: any) => {
      this.allActionMoule = res.modules;
      this.allPageModule = res.modules;
    });
    // this.allModules$.subscribe((res) => {
    //   this.allActionMoule = (res.actionModule as any[]);
    //   this.allPageModule = (res.pageModule as any[]);
    // })
  }
  getRole() {
    this.roleSrv.getRoleByName(this.name).subscribe((res) => {
      this.allPerimssion = res.priviledges.map(priv => priv.priviledge);
    })
  }
  changeActModule() {
    if(this.selectedActModule) {
      this.loading = true;
      this.actionPrives = null;
      const payload = {modul: this.selectedActModule, type: 0}
      this.permission.fetchPrivByModule(payload).subscribe((res: any[]) => {
        this.actionPrives = res;
        this.loading = false;
      })
    }
  }
  changePageModule() {
    if(this.selectedPageModule) {
      this.loadingPages = true;
      this.pagePrives = null;
      const payload = {modul: this.selectedPageModule, type: 1}
      this.permission.fetchPrivByModule(payload).subscribe((res: any[]) => {
        this.pagePrives = res;
        this.loadingPages = false;
      })
    } 
  }
  addPermission(name, type) {
    if(this.allPerimssion.indexOf(name) == -1) {
      this.allPerimssion = this.allPerimssion.concat(name);
    } else {
      this.allPerimssion.splice(this.allPerimssion.indexOf(name), 1)
    }
  }
  updateRole() {
      if(this.allPerimssion.length) {
        this.disBtn = true;
        const {id, name, allPerimssion } = this;
        const priviledges = allPerimssion.map(priv => ({priviledge: priv}));
        this.roleSrv.editRole({id, name, priviledges}).subscribe((res: any) => {
          this.gs.sweetAlertSucess(res.message);
          this.disBtn = false
        }, (err) => {
          this.disBtn = false;
          this.gs.sweetAlertError(err)
        })
      }
  }
  markAllPages(type, event) {    
   const pages: any =  document.querySelectorAll(`#${type} input[type=checkbox].action`);
    if(event.target.checked) {
      pages.forEach(page => {
        if(!page.checked) {
         page.click();
        }
      })
    } else {
      pages.forEach(page => {
        if(page.checked) {
         page.click();
        }
      })
    }
   
  }





}
