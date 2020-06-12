/**
 * 
 */

class EmailAnimations {
    component_id;

    modules = {
        syntax: true,
        toolbar: [
            ['bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'color': [] }, { 'align': [] }],
            [{ 'font': [] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
        ]
    }

    is_editor_enabled = false;

    show_recipient_list = {
        cc: {
            input: false,
            mouse_over: false
        },
        bcc: {
            input: false,
            mouse_over: false
        }
    }

    cc_input_element: any;
    cc_input_list: any;


    bcc_input_element: any;
    bcc_input_list: any;

    constructor(component_id) {
        this.component_id = component_id;
    }

    loadFormElements() {
        /** */
        window.addEventListener('click', () => {
            if (!this.show_recipient_list.cc.mouse_over) {
                this.show_recipient_list.cc.input = false;
            }

            if (!this.show_recipient_list.bcc.mouse_over) {
                this.show_recipient_list.bcc.input = false;
            }
        });

        window.addEventListener('load', () => {

            /** CC */
            this.cc_input_element = document.getElementById(`input-cc-${this.component_id}`);
            this.cc_input_list = document.getElementById(`input-cc-list-${this.component_id}`);

            this.cc_input_element.addEventListener('focus', () => {
                this.show_recipient_list.cc.input = true;
                this.show_recipient_list.bcc.input = false;
            });

            this.cc_input_element.addEventListener('blur', () => {
                if (!this.show_recipient_list.cc.mouse_over) {
                    this.show_recipient_list.cc.input = false;
                }
            });

            this.cc_input_element.addEventListener('click', e => {
                e.stopPropagation();
                this.show_recipient_list.bcc.input = false;
            });

            this.cc_input_list.addEventListener('mouseout', () => {
                this.show_recipient_list.cc.mouse_over = false;
            });

            this.cc_input_list.addEventListener('mouseover', () => {
                this.show_recipient_list.cc.mouse_over = true;
            });

            this.cc_input_list.addEventListener('click', e => {
                e.stopPropagation();
                this.show_recipient_list.cc.input = true;
            });

            /**
             * BCC
             */
            this.bcc_input_element = document.getElementById(`input-bcc-${this.component_id}`);
            this.bcc_input_list = document.getElementById(`input-bcc-list-${this.component_id}`);

            this.bcc_input_element.addEventListener('focus', () => {
                this.show_recipient_list.bcc.input = true;
                this.show_recipient_list.cc.input = false;
            });

            this.bcc_input_element.addEventListener('blur', () => {
                if (!this.show_recipient_list.bcc.mouse_over) {
                    this.show_recipient_list.bcc.input = false;
                }
            });

            this.bcc_input_element.addEventListener('click', e => {
                e.stopPropagation();
                this.show_recipient_list.cc.input = false;
            });

            this.bcc_input_list.addEventListener('mouseout', () => {
                this.show_recipient_list.bcc.mouse_over = false;
            });

            this.bcc_input_list.addEventListener('mouseover', () => {
                this.show_recipient_list.bcc.mouse_over = true;
            });

            this.bcc_input_list.addEventListener('click', e => {
                e.stopPropagation();
                this.show_recipient_list.bcc.input = true;
            });

            const quill_toolbars: NodeList = document.querySelectorAll(`#email-area-${this.component_id} .ql-toolbar`);
            const quill_editors: NodeList = document.querySelectorAll(`#email-area-${this.component_id} .ql-editor`);

            quill_editors.forEach( (quill_editor: HTMLElement) => {
                quill_editor.style.height = '300px';
                quill_editor.setAttribute('tabindex','5');
            })
                
            quill_toolbars.forEach( (quill_toolbar: HTMLElement) => {
                quill_toolbar.style.position = 'sticky';
                quill_toolbar.style.top = '0';
                // quill_toolbar.style.zIndex = '900';
                quill_toolbar.style.backgroundColor = "#fff";
            })

            this.is_editor_enabled = true;
        });
    }

    show_list(type: string) {
        const { input } = this.show_recipient_list[type];
        return input;
    }

    hide_list(event, type: string) {
        event.stopPropagation();
        this.show_recipient_list[type].input = false;
    }

    determine_placeholder(type: string, emailHelper: any) {
        const recipient_class = type == 'cc' ? 'selectedCcRecipients' : 'selectedBccRecipients';
        const recipient_list = emailHelper.convertObjectToArray(emailHelper[recipient_class]);
        let recipient_string = '';
        if (recipient_list.length > 0) {
            recipient_string = recipient_list.length > 1 ? `${recipient_list[0].email} and ${recipient_list.length - 1} other(s)` : `${recipient_list[0].email}`;
        }

        return this.show_recipient_list[type].input ? '' : recipient_string;
    }
}

export default EmailAnimations;