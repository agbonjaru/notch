import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})

export class SalesCompetitorService {

  constructor(private http: HttpClient,
              private config: Endpoints,
              private gs: GeneralService) { }

  // Sales Competitor Api Config
  private get SalesCompetitorAPI() {
    const url = this.config.settingsUrl + '/settingsservice';
    return url;
  }

  /* 
   *Sales Territories
   *GET,POST
   **/

  // Sales Territory
  getAllSalesTerritory(): Observable<[]> {
    return this.http
      .get<any[]>(this.SalesCompetitorAPI + '/' + this.gs.orgID + this.config.salesTerritory.get)
      .pipe(
        map(salesTerritory =>
          // tslint:disable-next-line:no-shadowed-variable
          salesTerritory.map(salesTerritory => {
            return salesTerritory;
          })
        ),
        catchError(
          this.gs.handleError
        )
      );
  }

  getSalesTerritoriesByCategory(Territorycategory: string): Observable<any> {
    return this.http
      .get<any>(this.SalesCompetitorAPI + '/' + this.gs.orgID + `/${Territorycategory}` + this.config.salesTerritory.getByCategory)
  }

  // CREATE =>  POST: add a new SalesTerritory to the server
  createSalesTerritory(salesTerritory): Observable<any> {
    return this.http
      .post<any>(this.SalesCompetitorAPI + this.config.salesTerritory.new, salesTerritory)
      .pipe(catchError(this.gs.handleError));
  }

  // UPDATE => PUT: update the SalesTerritory on the server
  updateSalesTerritory(salesTerritory): Observable<any> {
    return this.http.put(this.SalesCompetitorAPI + this.config.salesTerritory.edit, salesTerritory)
      .pipe(catchError(this.gs.handleError));
  }

  // DELETE => delete the SalesTerritory from the server
  deleteSalesTerritory(salesCompTerriId: number): Observable<any> {
    const url = this.SalesCompetitorAPI + `/${salesCompTerriId}` + this.config.salesTerritory.delete;
    return this.http.delete<any>(url)
      .pipe(catchError(this.gs.handleError));
  }


  /*
    *Sales Competitors
    *GET,POST
    **/

  // Sales Competitors
  getSalesCompetitorByCompany(): Observable<[]> {
    return this.http
      .get<any[]>(this.SalesCompetitorAPI + '/' + this.gs.orgID + this.config.salesCompetitors.getByCompany)
      .pipe(
        map(salesCompetitor =>
          // tslint:disable-next-line:no-shadowed-variable
          salesCompetitor.map(salesCompetitor => {
            return salesCompetitor;
          })
        ),
        catchError(
          this.gs.handleError
        )
      );
  }

  // CREATE =>  POST: add a new Sales Competitors to the server
  createSalesCompetitor(salesCompetitors): Observable<any> {
    return this.http
      .post<any>(this.SalesCompetitorAPI + this.config.salesCompetitors.new, salesCompetitors)
      .pipe(catchError(this.gs.handleError));
  }

  // UPDATE => PUT: update the Sales Competitors on the server
  updateSalesCompetitor(salesCompetitors): Observable<any> {
    return this.http.put(this.SalesCompetitorAPI + this.config.salesCompetitors.edit, salesCompetitors)
      .pipe(catchError(this.gs.handleError));
  }

  // PULL => GET : GET Sales Competitors By Name
  getAllSalesCompetitor(salesCompetitorsName: string): Observable<any> {
    return this.http
      .get<any>(this.SalesCompetitorAPI + '/' + this.gs.orgID + `/${salesCompetitorsName}` + this.config.salesCompetitors.get)
      .pipe(catchError(this.gs.handleError));
  }

  // DELETE => delete the Sales Competitors from the server
  deleteSalesCompetitor(salesCompetitorsName: string): Observable<any> {
    const url = this.SalesCompetitorAPI + '/' + this.gs.orgID + `/${salesCompetitorsName}` + this.config.salesCompetitors.delete;
    return this.http.delete<any>(url)
  }


}
