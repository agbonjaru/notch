import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from "../../general.service";
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { BehaviorSubject } from 'rxjs';


@Injectable({
     providedIn: 'root'
})
export class TwitterService {
     org_id;
     user_id;

     user_data: any = new BehaviorSubject<any>({});
     listener_settings: any = new BehaviorSubject<any>({});

     private server_uri: string;

     constructor(
          private http: HttpClient,
          private endpoints: Endpoints,
          private general_service: GeneralService
     ) {
          this.org_id = this.general_service.org.id
          this.user_id = this.general_service.user.id;
          this.server_uri = this.endpoints.communicationsEndpoint
     }



     /** */
     fetch_user_data() {
          return this.http.get(`${this.server_uri}/users/user?orgId=${this.org_id}&service=twitter`);
     }

     fetch_stream_setting() {
          return this.http.get(`${this.server_uri}/twitter/listener/${this.org_id}`);
     }

     set_stream_setting(payload) {
          return this.http.post(`${this.server_uri}/twitter/listener`, { ...payload, orgId: this.org_id });
     }


     /**
     * GET TOKEN REQUEST
     **/
     fetch_Token() {
          return this.http.get(`${this.server_uri}/twitter/token/request`);
     }

     connect_To_Twitter(payload) {
          return this.http.post(`${this.server_uri}/twitter/token/access`, payload);
     }

     disconnect_from_twitter(id) {
          return this.http.delete(`${this.server_uri}/twitter/disconnect/${id}`);
     }

     /**
      * 
      */
     send_reply(payload) {
          return this.http.post(`${this.server_uri}/twitter/tweet/reply`, { ...payload });
     }
}
