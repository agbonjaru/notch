import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { ProductServicesService } from 'src/app/services/settings-services/product-services.service';
import { selectConfig } from 'src/app/utils/utils';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-product-services',
  templateUrl: './product-services.component.html',
  styleUrls: ['./product-services.component.css'],
})
export class ProductServicesComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "checkbox", key: "checkbox" },
      {
        title: "Product Name", key: "name" },
      { title: "Category", key: "categories" },
      {
        title: "Description", key: "descrip" },
      { title: "Creation Date", key: "createdDate" },

    ],
    options: {
   
      singleActions: [
   
      ],
      bulkActions: [
      ]
    }
  };
  config = { ...selectConfig}
  categoryForm: FormGroup;
  productForm: FormGroup;
  message: any = {};
  allCategory: any;
  allProduct: any;
  allCategoryName = [];
  loadingCat = false;
  loadingProduct = false;

  constructor(
    private productService: ProductServicesService,
    private formBuilder: FormBuilder,
    public gs: GeneralService
  ) {}
  dataFeedBackObsListener = data => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "Activate") {
          //@ts-ignore
          this.onActivate(data.data)

        } else if (data.action === "Deactivate") {
          //@ts-ignore
          this.onDeactivate(data.data)


        } else if (data.action === "Edit User") {
          //@ts-ignore
          document.querySelector("[data-target='#editUserModal'").click()
        //  this.onEditUser(data.data)

        }
        break;
      default:
        break;
    }
  };

  ngOnInit() {
    // Loading Category and Product List from The Server
    this.loadCategoryList();
    this.loadProductList();

    // forms validation for Adding Product Lists
    this.categoryForm = this.formBuilder.group({
      categoryName: ['', Validators.required],
    });

    // forms validation for Adding Leads Lists
    this.productForm = this.formBuilder.group({
      productName: ['', Validators.required],
      productCategory: ['', Validators.required],
      productDiscription: ['', Validators.required],
    });
  }


  /** Category */

  // convenience getter for easy access to form fields
  get category() {
    return this.categoryForm.controls;
  }

  submitCategory() {
    this.addCategory();
  }

  // add Category(s)
  addCategory() {
    if (this.categoryForm.valid) {
      const categoryData = {
        categoryID: '',
        orgID: this.gs.orgID,
        name: this.categoryForm.value.categoryName,
      };
      this.loadingCat = true;
      this.productService.createCategory(categoryData).subscribe(
        (result: any) => {
          if (result) {
            this.categoryForm.reset();
            $('.close').click();
            this.gs.sweetAlertSucess(result.message)
            this.loadingCat = false;
            this.loadCategoryList();
          }
        }, error => {
          if (error) {
            const msg = error.error.message ? error.error.message : 'Error occured try again';
            $('.close').click();
            this.gs.sweetAlertError(msg);
            this.loadingCat = false;
            this.categoryForm.reset();

          }
        }
      );
    }
  }

  // Load Leads List
  loadCategoryList() {
    this.productService.getAllCategory().subscribe((result: any) => {
      console.log(result);
      
      if(result) {
        this.allCategory = result;
        this.allCategoryName = result.map(cat => cat.name)
      }
    });
  }

  get product() {
    return this.productForm.controls;
  }

  submitProduct() {
    this.addProduct();
  }

  // add Category(s)
  addProduct() {
    if (this.productForm.valid) {
        const productData = {
          categories: this.productForm.value.productCategory,
          orgID: this.gs.orgID,
          createdDate: '',
          descrip: this.productForm.value.productDiscription,
          id: 0,
          name: this.productForm.value.productName,
        };
        this.loadingProduct = true
        this.productService.createProduct(productData).subscribe((result: any) => {
            this.loadingProduct = false;
            $('.close').click();
            this.gs.sweetAlertSucess(result.message);
            this.loadProductList(false) 
            this.loadCategoryList();
            this.productForm.reset();
          },error => {
            if (error) {
              const msg = error.error.message ? error.error.message : 'Error occured try again';
              this.loadingProduct = false;
              $('.close').click();
              this.gs.sweetAlertError(msg);
              this.productForm.reset();
            }
          }
        );
    }
  }

  // Load Product List
  loadProductList(auto = true) {
    this.productService.getAllProductByCompany().subscribe((result: any) => {
      this.allProduct = result;
      this.dataTable.dataChangedObs.next(true)
      if(auto) {
        $.getScript('../../../assets/js/datatableScript.js');
      }
    });
  }


  // For Deleting Product on the list
  deleteProduct(name) {
    console.log(name);
    this.productService.deleteProduct(name).subscribe((data: any) => {
      console.log(data, 'data delete roles');
    });
  }
}
