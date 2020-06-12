import { EmailService } from 'src/app/services/integrations/email/email.service';

class EmailAttachmentHelper {
    selectedAttachments = {};

    attachmentError = undefined;

    constructor (
        private emailService: EmailService
    ) {}

    uploadFile(file) {
        let formData = new FormData();

        formData.append('attachment', file[0]);

        this.emailService.uploadAttachment(formData).subscribe( response => {
            const payload = response['payload'];
            if (response['success']) {
                this.selectedAttachments = {
                    ...this.selectedAttachments,
                    [payload.name] : payload
                }
            } else {
                this.displayError(payload);
            }
        });
    }

    reduceSelectedAttachmentsToList () {
        const attachmentArray = [];
        for (let prop in this.selectedAttachments) {
            attachmentArray.push(this.selectedAttachments[prop]);
        }

        return attachmentArray;
    }
    
    removeAttachment(name) {
        delete this.selectedAttachments[name];
    }

    displayError(message) {
        this.attachmentError = message;
        setTimeout(() => {
            this.attachmentError = undefined;
        }, 2000);
    }
}

export default EmailAttachmentHelper;