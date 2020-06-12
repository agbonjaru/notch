/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */

import * as $ from 'jquery';

export const LeadFormHelper = {
    createLeadFormItem: (fitnessKey, fitnessFactor) => {
        $("#fitnessFactor").append(`
        <div class="about-contact-row">
        <div class="col-sm-8">
            <span class="contact-detail-top">${fitnessKey}</span>
            <br>
            <span *ngIf="!editMode" class="contact-detail">${fitnessFactor}</span>
            <input *ngIf="editMode" type="text" name="cname" value="${fitnessFactor}" class="gen-input browser-default" >

        </div>
        <div class="col-sm-4 text-right">

        </div>
        </div>`
        );
    },
    toggleFormDisplay: () => {

    }
}