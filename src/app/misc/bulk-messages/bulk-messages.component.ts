import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/general.service";
import { BulkMessagesService } from "src/app/services/misc/bulk-messages.service";

@Component({
  selector: "app-bulk-messages",
  templateUrl: "./bulk-messages.component.html",
  styleUrls: ["./bulk-messages.component.css"],
})
export class BulkMessagesComponent implements OnInit {
  loading: boolean = false;
  alertClass = `d-none`;
  alertMessage = ``;
  selectedRecipients: any = {};

  form_zip: string;
  form_recipient: string;
  form_sender: string;
  form_message: string;

  /** INTEGRATIONS */
  is_activated: boolean = false;

  constructor(
    private bulkMessageService: BulkMessagesService,
    private gs: GeneralService
  ) { }

  ngOnInit() { 
    this.bulkMessageService.getCompanyIntegrations().subscribe( (response: any) => {
      this.is_activated = response.bulkSMS;
    });
  }

  addRecipient(event: any, phone_number: string) {
    const last_index = phone_number.trim().length - 1;
    if (
      (event.code && event.code.toLowerCase() === 'enter') ||
      (event.type === 'input' && phone_number[last_index] === ',')
      ) {
      const processedNumber = this.processNumber(this.form_zip, phone_number);
      this.selectedRecipients[processedNumber.msidn] = processedNumber;
      this.form_recipient = "";
    }
  }

  removeRecipient(number: string) {
    delete this.selectedRecipients[number];
  }

  processNumber(zip: string, number: string) {
    let clean_number = "";
    const trimmed_zip = zip.trim();
    const trimmed_number = number.trim();

    if (trimmed_number[0] === "0") {
      clean_number = `${trimmed_zip}${trimmed_number.substr(1)}`;
    } else {
      clean_number = `${trimmed_zip}${trimmed_number}`;
    }

    return {
      msidn: clean_number,
      msgid: clean_number,
    };
  }

  /**
   * Clean any values left in the form
   */
  processInputResidue() {
    const residue = this.form_recipient;
    const phone_number_list = residue.split(',');
    
    const processedNumbers = [ ...this.flattenSelectedRecipientsIntoArray()]
    phone_number_list.forEach( phone_number => {
      const processedNumber = this.processNumber(this.form_zip, phone_number);
      processedNumbers.push(processedNumber);
    });

    return processedNumbers;
  }

  flattenSelectedRecipientsIntoArray() {
    let flattened_array = [];
    for (let recipient in this.selectedRecipients) {
      flattened_array.push(recipient);
    }

    return flattened_array;
  }

  prepareFormFieldsForSending() {
    let phoneNumbers = this.processInputResidue();
    return {
      phoneNumbers,
      message: this.form_message.trim(),
      sender: this.form_sender.trim(),
      numberCount: phoneNumbers.length,
    };
  }

  sendMessage() {
    const message = this.prepareFormFieldsForSending();
    
    if (!this.is_activated) {
      this.displayAlert(0, `Bulk SMS not activated`);
      return;
    }

    if (message.numberCount < 1) {
      this.displayAlert(0, `Please enter recipients`);
      return;
    }

    if (!message.message) {
      this.displayAlert(0, `Message cannot be empty `);
      return;
    }

    if (!message.sender) {
      this.displayAlert(0, `Sender cannot be empty`);
      return;
    }

    this.loading = true;
    this.bulkMessageService.sendMessage(message).subscribe(
      (response: any) => {
        this.loading = false;

        const { success, payload } = response;
        if (success) {
          this.displayAlert(1, `Message sent successfully`);
          const topUpData = {
            id: 0,
            orgID: this.gs.orgID,
            units: payload.unitsLeft,
          };
          this.bulkMessageService.updateSMSUnits(topUpData).subscribe(
            (response) => {
              // console.log(response);
            },
            (error) => {
              // console.log(error.message);
            }
          );
        } else {
          this.displayAlert(0, payload);
        }
      },
      (error) => {
        this.loading = false;
        this.displayAlert(0, error.message);
      }
    );
  }

  displayAlert(code, message) {
    /** code: 0 - error | 1 - success */
    if (code === 0) this.alertClass = `alert-danger`;
    if (code === 1) this.alertClass = `alert-success`;

    this.alertMessage = message;

    setTimeout(() => {
      this.alertClass = `d-none`;
    }, 2000);
  }
}
