import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-imap-integration',
  templateUrl: './imap.component.html',
  styleUrls: ['./imap.component.css']
})
export class ImapIntegrationComponent implements OnInit {
  loading: boolean = false;

  alert_class: string = ``;
  alert_message: string = ``;

  imap_setting_form: FormGroup;

  imap_setting_exists: boolean = false;
  imap_setting: any = {};

  selected_imap_setting: any;

  constructor(
    private emailService: EmailService,
    private generalService: GeneralService,
    private formBuilder: FormBuilder,
  ) {

    this.imap_setting_form = this.formBuilder.group({
      host: ['', Validators.required],
      domain: ['', Validators.required],
      port: ['', Validators.required],
      mode: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.emailService.fetchImapSettings().subscribe((response: any) => {
      if (response.success) {
        if (response.payload.length > 0) {
          this.imap_setting_exists = true;
          this.set_existing_imap_setting(response.payload);
          this.determine_exiting_setting_to_be_used_in_form();
          this.set_form_values_from_selected_existing_setting();
        }
      }
    }, (err: any) => {
      console.log(`Imap Setting Error: ${err.message}`);
    });
  }

  set_existing_imap_setting(settings: Array<any>) {
    settings.forEach(imap_setting => {
      let mode = '';
      if (imap_setting.isIncoming) {
        mode = 'imap'
      } else {
        mode = 'smtp'
      }

      this.imap_setting[mode] = {
        ...imap_setting
      }
    });
  }

  determine_exiting_setting_to_be_used_in_form() {
    if (this.imap_setting.imap) {
      this.selected_imap_setting = {
        ...this.imap_setting.imap,
        mode: 'imap'
      }
    } else if (this.imap_setting.smtp) {
      this.selected_imap_setting = {
        ...this.imap_setting.smtp,
        mode: 'smtp'
      }
    }
  }

  set_form_values_from_selected_existing_setting() {
    if (this.selected_imap_setting) {
      this.imap_setting_form.setValue({
        host: this.selected_imap_setting.host || '',
        domain: this.selected_imap_setting.domain || '',
        port: this.selected_imap_setting.port || '',
        mode: this.selected_imap_setting.mode || ''
      });
    }
  }

  check_setting_mode() {
    const { mode } = this.imap_setting_form.value;
    this.imap_setting_exists = this.imap_setting[mode] !== undefined;
    this.selected_imap_setting = {
      ...this.imap_setting[mode],
      mode
    };
    this.set_form_values_from_selected_existing_setting();
  }

  create_imap_setting(data) {
    this.emailService.createImapSetting({ ...data }).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.display_alert(1, `Settings created.`);
        this.imap_setting[data.mode] = {
          ...response.payload
        }
        this.selected_imap_setting = { ...data };
        this.set_form_values_from_selected_existing_setting();
        this.imap_setting_exists = true;
      } else {
        this.display_alert(0, `Settings not created.`);
      }
    }, (err: any) => {
      this.loading = false;
      this.display_alert(0, `Settings not created.`);
      console.log(`Imap Settings: ${err.message}`);
    });
  }

  update_imap_setting(data) {
    this.generalService.sweetAlertUpdates('Update Imap Setting?').then(fulfilled => {
      if (fulfilled.value) {
        this.emailService.updateImapSetting({
          ...this.imap_setting[data.mode],
          ...data
        }).subscribe((response: any) => {
          this.loading = false;
          if (response.success) {
            this.display_alert(1, `Settings updated.`);
            this.selected_imap_setting = { ...response.payload };
            this.set_form_values_from_selected_existing_setting();
          } else {
            this.display_alert(0, `Settings not updated.`);
          }
        }, (err: any) => {
          this.loading = false;
          this.display_alert(0, `Settings not updated.`);
          console.log(`Imap Settings: ${err.message}`);
        });
      } else {
        this.loading = false;
      }
    });
  }

  deactivate_imap_setting() {
    this.generalService.sweetAlertGeneralDelete('Deactivate Imap Settings', 'Deactivate').then(fulfilled => {
      if (fulfilled.value) {
        this.emailService.deactivateImapSettings().subscribe((response: any) => {
          if (response.success) {
            this.generalService.sweetAlertDeleteSuccess('Imap Settings');
            this.reset_all_props();
          } else {
            this.generalService.sweetAlertError('Could not deactivate imap settings');
          }
        }, error => {
          this.generalService.sweetAlertError('Could not deactivate imap settings');
          console.log(`Imap Deactivation Error: ${error.message}`);
        })
      }
    });
  }

  reset_all_props() {
    this.loading = false;

    this.alert_class = ``;
    this.alert_message = ``;
    this.imap_setting_exists = false;
    this.imap_setting = {};

    this.selected_imap_setting = {};
    this.imap_setting_form.reset();
  }

  submit(form: FormGroup) {

    if (!form.valid) {
      this.display_alert(0, `Please fill all fields`);
      return;
    }

    this.loading = true;

    const data = {
      ...form.value,
      isIncoming: form.value.mode === 'imap'
    };

    if (this.imap_setting[form.value.mode]) {
      this.update_imap_setting({ ...data });
    } else {
      this.create_imap_setting({ ...data });
    }

  }

  display_alert(code: number, message: string) {
    switch (code) {
      case 0:
        this.alert_class = `alert alert-danger`;
        break;
      case 1:
        this.alert_class = `alert alert-success`;
        break;
      case 2:
        this.alert_class = 'alert alert-info';
        break;
      default:
    }

    this.alert_message = message;

    setTimeout(() => {
      this.alert_message = ``
      this.alert_class = ``
    }, 3000);
  }

}
