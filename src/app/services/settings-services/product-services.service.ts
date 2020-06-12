import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { GeneralService } from '../general.service';
import { Endpoints } from '../../shared/config/endpoints';

@Injectable({
  providedIn: "root",
})
export class ProductServicesService {
  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService
  ) {}

  // Product Customer Api Config
  private get ProductServicesAPI() {
    const url = this.config.settingsUrl + this.config.product.baseurl;
    return url;
  }

  /*
   *Product Service
   *GET,POST
   **/
  // Get All Product by Company
  getAllProductByCompany(): Observable<[]> {
    return this.http
      .get<any[]>(
        this.ProductServicesAPI +
          "/" +
          this.gs.orgID +
          this.config.product.getProductsByCompany
      )
      .pipe(
        map(items =>
          // tslint:disable-next-line:no-shadowed-variable
          items.map(items => {
            return items;
          })
        ),
        catchError(this.gs.handleError)
      );
  }

  // CREATE =>  POST: add a new product to the server
  createProduct(product): Observable<any> {
    return this.http
      .post<any>(this.ProductServicesAPI + this.config.product.new, product)
      .pipe(catchError(this.gs.handleError));
  }

  // UPDATE => PUT: update the product on the server
  updateProduct(product): Observable<any> {
    return this.http
      .put(this.ProductServicesAPI + this.config.product.edit, product)
      .pipe(catchError(this.gs.handleError));
  }

  // Get All ProductService
  getAllProduct(productName: number): Observable<any> {
    return this.http
      .get<any>(
        this.ProductServicesAPI +
          "/" +
          this.gs.orgID +
          `/${productName}` +
          this.config.product.get
      )
      .pipe(catchError(this.gs.handleError));
  }

  // Get All ProductService by company
  getProductsServicesByCategory(categoryName) {
    return this.http
      .get<any>(
        this.ProductServicesAPI +
          "/" +
          this.gs.orgID +
          `/${categoryName}` +
          this.config.category.getCategoryByCompany
      )
      .pipe(catchError(this.gs.handleError));
  }

  // DELETE => delete the product from the server
  deleteProduct(productName: string): Observable<any> {
    const url =
      this.ProductServicesAPI +
      "/" +
      this.gs.orgID +
      `/${productName}` +
      this.config.product.delete;
    return this.http.delete<any>(url).pipe(catchError(this.gs.handleError));
  }

  /*
   *Categories Service
   *GET,POST
   **/
  // Get All Category
  getAllCategory() {
    return this.http.get(this.ProductServicesAPI + "/" + this.gs.orgID + this.config.category.get)
  }

  // Get All Product by Company
  getAllCategoryByCompany(categoryName): Observable<[]> {
    return this.http
      .get<any>(
        this.ProductServicesAPI +
          "/" +
          this.gs.orgID +
          `/${categoryName}` +
          this.config.category.getCategoryByCompany
      )
      .pipe(catchError(this.gs.handleError));
  }

  // CREATE =>  POST: add a new category to the server
  createCategory(category): Observable<any> {
    return this.http
      .post<any>(this.ProductServicesAPI + this.config.category.new, category)
  }

  // UPDATE => PUT: update the role on the server
  updateCategory(category): Observable<any> {
    return this.http
      .put(this.ProductServicesAPI + this.config.category.edit, category)
      .pipe(catchError(this.gs.handleError));
  }
}
