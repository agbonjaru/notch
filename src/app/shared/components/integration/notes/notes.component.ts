import { Component, OnInit, Input } from '@angular/core';
import { NoteService } from 'src/app/services/notes/note.service';
import { GeneralService } from 'src/app/services/general.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { noWhitespaceValidator } from 'src/app/utils/no-whitespace.validator';
import EmailAnimations from '../email/animations';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  @Input() component_id: any;
  html_ids: any = {};

  showLoading: boolean = false;
  userNotes: any = [];

  emailAnimations;

  constructor(
    private noteSrv: NoteService,
    private generalSrv: GeneralService
  ) { }

  addNoteForm = new FormGroup({
    content: new FormControl('', [Validators.required, noWhitespaceValidator]),
  })

  ngOnInit() {
    this.emailAnimations = new EmailAnimations(this.component_id);        
  }

  onAddNote() {
    this.addNote();
    this.resetForm();
  }

  resetForm() {
    this.addNoteForm.patchValue({
      content: ''
    })
  }

  private addNote() {
    this.showLoading = true;
    if(this.addNoteForm.valid) {
      this.noteSrv.createNote(this.addNoteForm.getRawValue()).subscribe((data: any)=> {
        this.showLoading = false;
        this.generalSrv.sweetAlertCreateSuccessWithoutNav('Note');
      }, (error) => {
          this.showLoading = false;
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      })
    }
  }

}
