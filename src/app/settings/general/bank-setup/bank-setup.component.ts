import { Component, OnInit } from '@angular/core';
import { BankService } from 'src/app/services/settings-services/bank.service';
import Swal from 'sweetalert2';
import { GeneralService } from 'src/app/services/general.service';
import { CurrencyService } from 'src/app/services/currency.service';

@Component({
  selector: 'app-bank-setup',
  templateUrl: './bank-setup.component.html',
  styleUrls: ['./bank-setup.component.css']
})
export class BankSetupComponent implements OnInit {

  public bank_accounts: any = {};
  public organisation_currencies: any = {};

  public form_bank_id: number;
  public form_bank_name: string = '';
  public form_account_name: string = '';
  public form_account_number: string = '';
  public form_account_currency: string = '';

  public form_error: any = {
    success: false,
    message: ''
  }

  constructor(
    private bank_service: BankService,
    private currency_service: CurrencyService,
    public general_service: GeneralService
  ) { }

  ngOnInit() {
    this.bank_service.fetch_bank_records().subscribe((response: any) => {
      if (response && response.success) {
        this.bank_accounts = this.process_bank_accounts_into_object(response.payload);
      }
    }, error => {
      console.log(`Bank Account Setup Error: ${error.message}`);
    });

    this.currency_service.org_currencies.subscribe( currencies => {
      if (!this.general_service.checkIfObjectIsEmpty(currencies)) {
        this.organisation_currencies = this.general_service.convertObjectToArray(currencies.currencies);
      }
    })
  }

  add_bank_account_to_list(account) {
    this.bank_accounts[account.id] = { ...account };
  }

  remove_bank_account_from_list(id) {
    delete this.bank_accounts[id];
  }

  process_bank_accounts_into_object(accounts: Array<any>): any {
    let processed_accounts = {};
    for (let i in accounts) {
      const account = accounts[i];
      processed_accounts = {
        ...processed_accounts,
        [account.id]: { ...account }
      }
    }

    return processed_accounts;
  }

  flatten_bank_accounts () {
    let flattened_accounts = [];
    for (let id in this.bank_accounts) {
      flattened_accounts.push(this.bank_accounts[id]);
    }

    return flattened_accounts;
  }

  submit_form() {
    if (this.form_bank_name.length < 1) {
      this.display_error(false, `Bank name cannot be empty`);
      return;
    }

    if (this.form_account_name.length < 1) {
      this.display_error(false, `Account name cannot be empty`);
      return;
    }

    if (this.form_account_number.length < 10) {
      this.display_error(false, `Account number must have atleast 10 digits.`)
      return;
    }

    if (this.form_account_number.length > 12) {
      this.display_error(false, `Account number too long`)
      return;
    }

    if (!this.form_account_currency) {
      this.display_error(false, `Invalid Account Currency.`)
      return;
    }

    const form_data = {
      bank: this.form_bank_name,
      currency: this.form_account_currency,
      name: this.form_account_name,
      number: this.form_account_number,
    };

    if (this.form_bank_id) {
      this.update_bank_record(form_data);
    } else {
      // if not, we want to create
      this.create_bank_record(form_data);
    }
  }

  create_bank_record (data: any) {
    this.general_service.sweetAlertCreate('Create Bank Account').then(res => {
      if (res.value) {
        this.bank_service.create_bank_record(data).subscribe((response: any) => {
          if (response && response.success) {
            this.add_bank_account_to_list({ ...response.payload });
            this.general_service.sweetAlertCreateSuccessWithoutNav('Bank Account');
            this.clear_form();
          } else {
            this.display_error(false, response.payload);
          }
        }, (error: any) => {
          this.display_error(false, `An error occurred. Please try again.`);
        })
      }
    });
  }

  update_bank_record(data: any) {
    const update_data = {
      ...this.bank_accounts[this.form_bank_id],
      ...data
    }

    this.general_service.sweetAlertUpdates('Update Bank Account').then(res => {
      if (res.value) {
        this.bank_service.update_bank_record(update_data).subscribe((response: any) => {
          if (response && response.success) {
            this.add_bank_account_to_list({ ...this.bank_accounts[this.form_bank_id], ...response.payload });
            this.general_service.sweetAlertFileUpdateSuccessWithoutNav('Bank Account');
          } else {
            this.display_error(false, `Could not update bank account`);
          }
          this.clear_form();
        }, (error: any) => {
          this.display_error(false, `An error occurred. Please try again.`);
          this.clear_form();
        })
      }
    })
  }

  delete_bank_account(id) {
    this.general_service.sweetAlertGeneralDelete('Delete Bank Account', 'Delete').then (res => {
      if (res.value) {
        this.bank_service.delete_bank_record(id).subscribe((response: any) => {
          if (response && response.success) {
            this.remove_bank_account_from_list(id);
            this.general_service.sweetAlertDeleteSuccess('Bank Account');
          } else {
            this.display_error(false, `Could not delete bank account`);
          }
        }, (error: any) => {
          console.log(`Bank Account Error: ${error.message}`);
          this.display_error(false, `An error occurred. Please try again. `)
        })
      }
    })
  }

  select_account_for_edit(id) {
    const account = this.bank_accounts[id];

    this.form_bank_id = id;
    this.form_bank_name = account.bank;
    this.form_account_name = account.name;
    this.form_account_number = account.number;

  }

  clear_form() {
    this.form_bank_id = undefined;
    this.form_bank_name = '';
    this.form_account_name = '';
    this.form_account_number = '';
  }

  display_error(success: boolean, message: string) {
    this.form_error = {
      success,
      message
    }

    setTimeout(() => {
      this.form_error = {
        success: false,
        message: undefined
      }
    }, 2500);
  }

}
