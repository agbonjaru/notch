import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from '../general.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FitnessService {
  private orgId: number;
  private base_uri: string;

  fitness: any = new BehaviorSubject<any>({});

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private general_service: GeneralService
  ) {
    this.orgId = this.general_service.org.id;
    this.base_uri = `${this.endpoints.fourFourSixEndpoint}/organisations-fitness`;
  }

  fetch_org_fitness_record() {
    return this.http.get(this.base_uri);
  }

  update_org_fitness_record(data: any) {
    return this.http.put(this.base_uri, { ...data });
  }
}
