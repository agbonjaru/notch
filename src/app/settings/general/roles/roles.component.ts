import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { RolesService } from 'src/app/services/settings-services/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})
export class RolesComponent implements OnInit {
  allRoles: any;
  disableBtn = false;

  roleForm: FormGroup;

  message: any = {};

  name: string;


  constructor(
    private roles: RolesService,
    private formBuilder: FormBuilder,
    public gs: GeneralService,
    private router: Router
  ) {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
    // this is to load the role list when opening the Roles Page
    this.loadRolesList();

    // forms validation for Adding Roles Lists
    this.roleForm = this.formBuilder.group({
      roleName: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.roleForm.controls;
  }



  // add Roles(s)
  addRoles() {
    // stop here if form is invalid
    if (this.roleForm.valid) {
        const rolesData = {
          orgID: this.gs.orgID,
          id: 0,
          name: this.roleForm.value.roleName,
          priviledges: [],
        };
        this.disableBtn = true
        this.roles.createRole(rolesData).subscribe((result: any) => {
              this.disableBtn = false
              this.message.header = 'Submitted';
              $('.close').click();
              this.loadRolesList();
              this.message.text = result.message;
              this.message.type = 'success';
              this.gs.alert(this.message);
              this.roleForm.reset();
          }, error => {
            console.log(error, 'Error Message');
            if (error) {
              $('.close').click()
              this.roleForm.reset();
              this.message.header = 'Failed';
              this.message.text = error.error.message ? error.error.message : 'Sorry error occured try again';
              this.message.type = 'error';
              this.disableBtn = false
              this.gs.alert(this.message);
            }
          }
        );
      }
  }

  // Load Roles List
  loadRolesList() {
    this.roles.getAllRoles().subscribe((result: any) => {
      console.log(result, 'result load list');
      this.allRoles = result;
    });
  }

  // Editing  roles on the Roles List
  editRoles(role) {
    // router to the edit page\
    console.log(role);
    this.router.navigate(['settings/Roles', role.name, role.id]);
  }

  // Swit Message for delete confirmation
  deleteRolesConfirm(name) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then(result => {
        console.log(result);
        if (result.value) {
          console.log(result, '1');
          this.deleteRoles(name);
          this.message.header = 'Deleted';
          this.message.text = result.value.message;
          this.message.type = 'success';
          this.gs.alert(this.message);
        } else if (
          // Read more about handling dismissals
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire('Delete Action Cancelled');
        }
      });
  }

  // For Deleting Roles on the list
  deleteRoles(name) {
    console.log(name);
    this.roles.deleteRole(name).subscribe((data: any) => {
      console.log(data, 'data delete roles');
    });
  }
}
