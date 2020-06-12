import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Endpoints } from '../../shared/config/endpoints';
import { GeneralService } from '../general.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactCompanyImageService {
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {}

  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = '';
    console.log(error, 'er');
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, ' Contact Image Error Message');
    return of(null);
  }

  // Merge Endpoints
  private get createImageUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contactCompanyImage.getPostImage
    );
  }

  private get getOneImageUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contactCompanyImage.getPostImage
    );
  }

  private get deleteImageUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contactCompanyImage.getPostImage
    );
  }

  // Image Creation

  createImage(payload) {
    try {
      this.genServ.httpStatus.next('imageHeaders');
      return this.http
        .post(this.createImageUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getOneImage(imageName) {
    try {
      // this.genServ.httpStatus.next('imageHeaders');
      return this.http
        .get(`${this.getOneImageUrl}/${imageName}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  deleteImage(id) {
    try {
      return this.http
        .delete(`${this.deleteImageUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
