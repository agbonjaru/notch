/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

export default class FormValidator {
    private form_inputs: HTMLFormControlsCollection;
    private form_is_clean: boolean = true;
    constructor(form_inputs: HTMLFormControlsCollection) {
        this.form_inputs = form_inputs;
    }

    validate() {
        for (let i in this.form_inputs) {
            const element: any = this.form_inputs[i];
            let is_required: boolean = false; 
            const validation_string: string = element.getAttribute ? element.getAttribute('data-validation') : '';

            if (!validation_string) {
                continue;
            }

            const validation_parameters = validation_string.split(';');
            validation_parameters.forEach(parameter_string => {
                const parameter_key_pair = parameter_string.split(':');
                switch (parameter_key_pair[0].trim()) {
                    case 'required':
                        this.validate_required_field(element);
                        is_required = true;
                        break;
                    case 'length':
                        if (!this.validate_length(element.value, parameter_key_pair[1]) && is_required) {
                            this.flag_element_as_dirty(element);
                        }
                        break;
                    case 'type':
                        switch (parameter_key_pair[1].trim()) {
                            case 'date':
                                this.validate_date_field(element, is_required);
                                break;
                            case 'number':
                                this.validate_number_field(element, is_required);
                                break;
                            case 'email':
                                this.validate_email_field(element, is_required);
                                break;
                            default:
                        }
                        break;
                    default:
                }
            });
        }

        return this.form_is_clean;
    }

    validate_email_field(input_element: any, is_required: boolean) {
        const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const value = input_element.value.trim();
        if (!emailPattern.test(value) && is_required) {
            this.flag_element_as_dirty(input_element);
        } else {
            this.reset_element(input_element)
        }
    }

    validate_length(value: any, limits_as_string: string) {
        const limits: Array<any> = limits_as_string.split('-');
        const minimum_limit: number = Number(limits[0]);
        const maximum_limit: number = Number(limits[1]);
        const value_length: number = (value.toString()).length;

        if (minimum_limit && maximum_limit) {
            return value_length >= minimum_limit && value_length <= maximum_limit;
        }

        if (minimum_limit) {
            return value_length >= minimum_limit;
        }

        if (maximum_limit) {
            return value_length <= maximum_limit;
        }

        return false;
    }

    validate_required_field(input_element: any) {
        console.log(input_element.value);
        if (!input_element.value.trim()) {
            this.flag_element_as_dirty(input_element);
        } else {
            this.reset_element(input_element)
        }
    }

    validate_number_field(input_element: any, is_required: boolean) {
        if (isNaN(Number(input_element.value.trim() && is_required))) {
            this.flag_element_as_dirty(input_element);
        } else {
            this.reset_element(input_element)
        }
    }

    validate_date_field(input_element: any, is_required: boolean) {
        if (isNaN(Date.parse(input_element.value.trim()))  && is_required) {
            this.flag_element_as_dirty(input_element);
        } else {
            this.reset_element(input_element)
        }
    }

    flag_element_as_dirty(input_element: any) {
        input_element.classList.add('border-danger');
        this.falsify_form_is_clean();
    }

    reset_element (input_element: any) {
        input_element.classList.remove('border-danger')
    }

    falsify_form_is_clean() {
        if (this.form_is_clean) {
            this.form_is_clean = false;
        }
    }
}