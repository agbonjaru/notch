import { Injectable } from '@angular/core';
import { Endpoints } from '../shared/config/endpoints';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from './general.service';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';


@Injectable({
     providedIn: "root",
})

export class SystemActivities {

     url = this.endPoints.adminserviceUrl;

     constructor(
          private endPoints: Endpoints,
          private http: HttpClient,
          private gs: GeneralService,
     ) { }

     /**
      * Create System Activities
      * @param body 
      */
     newActivity(body) {
          return this.http.post(this.url + "/newActivity", body);
     }
}
