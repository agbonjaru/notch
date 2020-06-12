/**
 * 
**/

class EmailHelper {
    emailClientService;
    alertMessage: string;

    selectedToRecipients: any = {};
    selectedCcRecipients: any = {};
    selectedBccRecipients: any = {};

    temporaryToRecipients: any = {};
    temporaryCcRecipients: any = {};
    temporaryBccRecipients: any = {};

    suggestedUsers = [];

    selectedRecipientGroup: string = '';
    selectedClientType: string = '';
    inputText: string;

    inputTo: string;
    inputCc: string;
    inputBcc: string;

    emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


    constructor(
    ) {
    }

    addRecipient(value, inputName, type?) {
        //
        if (!value.email) return;
        type = !type ? this.determineRecipientType() : type;

        const trimmed_email= value.email.trim();
        const cleaned_value = {
            ...value,
            email: trimmed_email,
            is_valid: this.emailPattern.test(trimmed_email)
        }
        
        if (type === "temporaryToRecipients") {
            this[type] = {
                [cleaned_value.email]: cleaned_value,
            }
        } else {
            this[type] = {
                ...this[type],
                [cleaned_value.email]: cleaned_value,
            }
        }

        this.clearSuggestedUsers();
        this.clearInputText(inputName);
    }

    removeRecipient(type: string, email: string) {
        delete this[type][email];
    }

    determineRecipientType() {
        switch (this.selectedRecipientGroup) {
            case "cc":
                return "temporaryCcRecipients";
            case "bcc":
                return "temporaryBccRecipients";
            default:
                return "temporaryToRecipients";
        }
    }

    determineItemClass(is_valid) {
        return `recipient-list-item ${is_valid ? ' ' : 'invalid-recipient-list-item'}`
    }

    consolidateRecipients() {
        this.selectedBccRecipients = {
            ...this.selectedBccRecipients,
            ...this.temporaryBccRecipients
        };

        this.selectedCcRecipients = {
            ...this.selectedCcRecipients,
            ...this.temporaryCcRecipients
        };

        this.selectedToRecipients = {
            ...this.selectedToRecipients,
            ...this.temporaryToRecipients
        }

        this.inputTo = this.convertObjectToArray(this.selectedToRecipients)[0].email
    }

    clearSelectedRecipients() {
        this.selectedToRecipients = {};
        this.selectedCcRecipients = {};
        this.selectedBccRecipients = {};
    }

    clearTemporarySelections() {
        this.temporaryToRecipients = {};
        this.temporaryCcRecipients = {};
        this.temporaryBccRecipients = {};
    }

    processReplySelection(type, data) {
        if (data) {
            data.forEach(recipient => {
                this[type] = {
                    ...this[type],
                    [recipient.address]: {
                        name: recipient.name,
                        email: recipient.address
                    }
                }
            })
        }
    }

    processInputText(type, inputName?, event?) {
        if (!this[inputName]) return;

        const lastIndex = Number(this[inputName].length - 1);
        if (this[inputName][lastIndex] == "," || (event && event.key == 'Enter')) {
            const selection = this[inputName].replace(/,/g, '').trim();
            this.selectedRecipientGroup = type;
            this.addRecipient({
                name: selection,
                email: selection
            }, inputName, type);
        }
    }

    processInputResidue() {
        if (this.inputTo !== undefined && this.inputTo.length >= 2) {
            this.selectedToRecipients = {
                ...this.selectedToRecipients,
                [this.inputTo]: { name: this.inputTo, email: this.inputTo.trim() }
            }
        }

        if (this.inputCc !== undefined && this.inputCc.length >= 2) {
            this.selectedCcRecipients = {
                ...this.selectedCcRecipients,
                [this.inputCc]: { name: this.inputCc, email: this.inputCc.trim() }
            }
            
            this.clearInputText('inputCc');
        }

        if (this.inputBcc !== undefined && this.inputBcc.length >= 2) {
            this.selectedBccRecipients = {
                ...this.selectedBccRecipients,
                [this.inputBcc]: { name: this.inputBcc, email: this.inputBcc.trim() }
            }
            
            this.clearInputText('inputBcc');
        }
    }

    reduceSelectedRecipients(collection) {
        let recipients = [];
        for (let key in this[collection]) {
            recipients.push(this[collection][key].email);
        }

        return recipients.join();
    }

    editSelectedRecipient(value: string, inputType: string) {
        this[inputType] = value;
        
        if (inputType === 'inputCc') delete this.selectedCcRecipients[value];
        if (inputType === 'inputBcc') delete this.selectedBccRecipients[value];
    }


    processCurrentlyOpenedMail(email, userEmail) {
        let emailFrom, emailTo;
        switch (email.service) {
            case "office":
                emailFrom = email.body.from.address;
                emailTo = email.body.to.address;
            case "gmail":
                emailFrom = email.body.from;
                emailTo = email.body.to;
                break;
            case "imap":
                emailFrom = email.sender;
                emailTo = email.body.to || email.headers['envelope-to'];

                return {
                    ...email,
                    from: emailFrom == userEmail ? emailTo : emailFrom,
                    subject: email.headers.subject,
                    body: ` ${this.processMessageBodyToSend({
                        ...email.body,
                        to: emailTo,
                        from: emailFrom,
                        subject: email.headers.subject,
                        createdOn: Number(email.date),
                        service: email.service
                    })}`
                }
                break;
            default:
        }

        return {
            ...email,
            from: emailFrom == userEmail ? emailTo : emailFrom,
            subject: email.body.subject,
            body: ` ${this.processMessageBodyToSend({...email.body, service: email.service})}`
        }
    }

    processMessageBodyToSend(rawBody) {
        let body = "";
        switch (rawBody.service) {
            case "office":
                body = rawBody.body.content;
                return  (
                    "\r\n \r\n \r\n _________________________\r\n" +
                    "From: "+ rawBody.to[0].name +" <" +rawBody.to[0].address +">\r\n" +
                    "Sent: " + rawBody.createdOn + "\r\n" +
                    "To: " + rawBody.from.name +" <" +rawBody.from.address +">\r\n" +
                    "Subject: " + rawBody.subject + "\r\n" +
                    "\r\n" + body.replace(/\n[>]+/g, '\n')
                )
            case "gmail":
                body = typeof rawBody.body === "string" ? rawBody.body : rawBody.body.text;
                return (                    
                    "\r\n _________________________\r\n" +
                    "From: "+ rawBody.to +" <" +rawBody.to +">\r\n" +
                    "Sent: " + new Date(rawBody.createdOn).toDateString() + "\r\n" +
                    "To: " + rawBody.from +" <" +rawBody.from +">\r\n" +
                    "Subject: " + rawBody.subject + "\r\n" +
                    "\r\n" + body.replace(/\n[>]+/g, '\n')
                    )
            case 'imap':
                body = typeof rawBody.text === "string"? rawBody.text: rawBody.text.text;
                body = body.replace(/\n[>]+/g, '\n');
                return (           
                    "\n _________________________\n" +
                    "From: " + rawBody.to +" <" +rawBody.to +">\n" +
                    "Sent: " + new Date(rawBody.createdOn).toDateString() + "\n" +
                    "To: "+ rawBody.from +" <" +rawBody.from +">\n" +
                    "Subject: " + rawBody.subject + "\n" +
                    "\n" + body
                )
            default:
        }
    }

    /** */
    convertObjectToArray(object) {
        const finalArray = [];
        for (let prop in object) {
            finalArray.push(object[prop]);
        }

        return finalArray;
    }

    clearSuggestedUsers() {
        this.suggestedUsers = [];
    }

    clearInputText(inputName) {
        this[inputName] = "";
    }

    displayAlert(message) {
        this.alertMessage = message;
        setTimeout(() => {
            this.alertMessage = undefined;
        }, 2000);
    }
}

export default new EmailHelper;