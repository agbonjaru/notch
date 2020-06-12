import { Component, OnInit, Input } from '@angular/core';
import { NoteService } from 'src/app/services/notes/note.service';
import { GeneralService } from 'src/app/services/general.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NoteModel } from '../../../../models/note.model';
import EmailAnimations from '../../integration/email/animations';
import * as $ from 'jquery';

@Component({
  selector: 'app-note-feeds',
  templateUrl: './note-feeds.component.html',
  styleUrls: ['./note-feeds.component.css']
})
export class NoteFeedsComponent implements OnInit {
  @Input() component_id: any;
  html_ids: any = {};
  emailAnimations;

  userNotes: any = [];
  note: any = {};
  id: any;

  showLoading: boolean = false;
  deleteLoading: boolean = false;

  constructor(
    private noteSrv: NoteService,
    private generalSrv: GeneralService
  ) { }

  editNoteForm = new FormGroup({
    content: new FormControl('', Validators.required),
    noteID: new FormControl('')
  })

  deleteNoteForm = new FormGroup({
    noteID: new FormControl('')
  })

  ngOnInit() {
    this.getUserNotes();
    this.emailAnimations = new EmailAnimations(this.component_id);

    this.noteSrv.refreshNeeded$
      .subscribe(() => {
        this.getUserNotes();
      })
  }

  /**
  * View note By ID
  * @param id
  */
  onViewNotes() {
    this.getUserNotes();
  }

  /**
  * Edit notes by ID
  * @param id
  */
  onEditNote(id) {
    this.editUserNote(id);
  }

  /**
   * Delete nOte by ID
   * @param id
   */
  onDeleteNote(id) {
    this.deleteNoteByID(id);
  }

  /**
  * View note By ID
  * @param id
  */
  onViewSingleNote(id) {
    this.viewSingleNote(id);
  }

  /**
   * View note By ID
   * @param id 
   */
  private viewSingleNote(id) {
    this.noteSrv.fetchNoteByID(id)
      .subscribe((note) => {
        this.note = note;
        console.log(this.note, " id notes")
        this.editNoteForm.patchValue({ content: this.note.content });
      });
  }

  /**
   * Fetch Notes
   */
  private getUserNotes() {
    this.noteSrv.getUserNotes()
      .subscribe((userNotes: NoteModel[]) => {
        this.userNotes = userNotes;
      })
  }

  /**
   * Edit notes by ID
   * @param id 
   */
  private editUserNote(id) {
    this.showLoading = true;
    this.editNoteForm.patchValue({
      noteID: id
    });
    if (this.editNoteForm.valid) {
      this.noteSrv.editNote(this.editNoteForm.getRawValue()).subscribe((data: any) => {
        this.showLoading = false;
        $("#closeNoteModal").click();
        this.generalSrv.sweetAlertFileUpdateSuccessWithoutNav('Note');
        this.userNotes = this.getUserNotes();
      }, (error) => {
        this.showLoading = false;
        $("#closeNoteModal").click();
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      })
    }
  }

  /**
   * Delete nOte by ID
   * @param id 
   */
  private deleteNoteByID(id) {
    this.deleteLoading = true;
    this.noteSrv.deleteNoteByID(id).subscribe((data: any) => {
      this.deleteLoading = false;
      this.userNotes = this.getUserNotes();
      this.generalSrv.sweetAlertDeleteSuccess('Note');
    }, (error) => {
      this.deleteLoading = false;
      this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
    })
  }

}
