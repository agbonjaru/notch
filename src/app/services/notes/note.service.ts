import { UserModel, OrgModel } from '../../store/storeModels/user.model';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from '../../shared/config/endpoints';
import { Injectable } from '@angular/core';
import { GeneralService } from '../general.service';
import { NoteModel } from '../../models/note.model';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private notesapi = this.endpoint.analyticsUrl;
  private user: UserModel

  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService
  ) { 
    this.user = this.gs.user;
  }

  private _refreshNeeded$ = new Subject<void>();

  get refreshNeeded$() {
    return this._refreshNeeded$;
  }

  private getCurrDate() {
    let currDate = new Date().toLocaleDateString();
    let currTime = new Date().toLocaleTimeString('en-US',{hour: '2-digit',minute:'2-digit', second:'2-digit', hour12:true});
    return `${currDate}, ${currTime}`;
  }

  createNote(form: NoteModel) {
    const body = {
      ...form,
      content: form.content,
      orgID: this.gs.orgID,
      userID: this.user.id
    }
    return this.http.post(`${this.notesapi}/Notes`, body)
    .pipe(
      tap(() => {
        this._refreshNeeded$.next();
      })
    );
  }

  fetchNoteByID(id) {
    return this.http.get(`${this.notesapi}/Note/${id}/${this.user.id}`);
  }

  editNote(form: NoteModel) {
    console.log(form.noteID);    
    const body = {
      ...form,
      content: form.content,
      orgID: this.gs.orgID,
      userID: this.user.id
    }
    return this.http.put(`${this.notesapi}/Note/${form.noteID}`, body);
  }

  deleteNoteByID(noteID) {
    return this.http.delete(`${this.notesapi}/Note/${noteID}/${this.gs.user.id}`);
    // return this.http.delete(`${this.notesapi}/Note/${form.noteID}`, body);
  }

  getUserNotes(): Observable<NoteModel[]> {
    return this.http.get<NoteModel[]>(`${this.notesapi}/Notes/${this.gs.orgID}/${this.user.id}`);
  }
}
