import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as $ from 'jquery';
import { VALIDEMAILREGEX } from 'src/app/helpers/helperResources';
import { GeneralService } from 'src/app/services/general.service';
import { SalesCompetitorService } from 'src/app/services/settings-services/sales-competitor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sales-competition-territory',
  templateUrl: './sales-competition-territory.component.html',
  styleUrls: ['./sales-competition-territory.component.css'],
})
export class SalesCompetitionTerritoryComponent implements OnInit {
  validEmailRegex: any;

  industryForm: FormGroup;

  regionForm: FormGroup;

  competitionForm: FormGroup;

  allIndustry: any;

  allRegion: any;

  allCompetitors: any;

  message: any = {};

  id: any;

  name: any;
  disBtn = false;

  constructor(
    private salesCompetitor: SalesCompetitorService,
    private formBuilder: FormBuilder,
    private gs: GeneralService
  ) {
    $.getScript('../../../assets/js/datatableScript.js');
    this.validEmailRegex = VALIDEMAILREGEX; // email validation
  }

  ngOnInit() {
    // Scroll T o
    $('html,body').animate({ scrollTop: 0 }, 0);

    // forms validation for Adding Industry
    this.industryForm = this.formBuilder.group({
      industryName: ['', Validators.required],
    });

    // forms validation for Adding Industry
    this.regionForm = this.formBuilder.group({
      regionName: ['', Validators.required],
    });

    // forms validation for Adding Industry
    this.competitionForm = this.formBuilder.group({
      competitorName: ['', Validators.required],
      competitorEmail: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex),
        ]),
      ],
      competitorAddress: ['', Validators.required],
      competitorCompanyName: ['', Validators.required],
      competitorWebsite: ['', Validators.required],
      competitorStrength: ['', Validators.required],
    });

    // Load Sales Competitors Territory List
    this.loadIndustryList();
    this.loadRegionList();
    this.loadCompetitorsList();
  }


  /** INDUSTRY */

  // convenience getter for easy access to form fields
  get industry() {
    return this.industryForm.controls;
  }
  // Load Industry List
  loadIndustryList() {
    this.salesCompetitor
      .getSalesTerritoriesByCategory('INDUSTRY')
      .subscribe((data: any) => {
        this.allIndustry = data;
      });
  }
  // add Industry(s)
  addIndustry() {
    if (this.industryForm.valid) {
      const IndustryData = {
        category: 'INDUSTRY',
        orgID: this.gs.orgID,
        id: 0,
        name: this.industryForm.value.industryName,
      };
      this.disBtn = true
      this.salesCompetitor.createSalesTerritory(IndustryData).subscribe(
        (result: any) => {
          this.disBtn = false;
          $('.close').click();
          this.industryForm.reset();
          this.loadIndustryList();
          this.gs.sweetAlertSucess(result.message)
        }, error => {
          if (error) {
            this.disBtn = false;
            $('.close').click()
            this.industryForm.reset();
            const msg = error.error.message ? error.error.message : 'Error occured try again';
            this.gs.sweetAlertError(msg)
          }
        });
    }
  }

  /*
   *REGION
   **/

  // convenience getter for easy access to form fields
  get regions() {
    return this.regionForm.controls;
  }
  // Load Industry List
  loadRegionList() {
    this.salesCompetitor
      .getSalesTerritoriesByCategory('REGION')
      .subscribe((data: any) => {
        this.allRegion = data;
      });
  }
  // add Industry(s)
  addRegion() {
    if (this.regionForm.valid) {
      const RegionData = {
        category: 'REGION',
        orgID: this.gs.orgID,
        id: 0,
        name: this.regionForm.value.regionName,
      };
      this.disBtn = true;
      this.salesCompetitor.createSalesTerritory(RegionData).subscribe(
        (result: any) => {
          this.loadRegionList();
          this.regionForm.reset();
          this.disBtn = false;
          $('.close').click();
          this.gs.sweetAlertSucess(result.message);
        }, error => {
          if (error) {
            this.disBtn = false;
            $('.close').click()
            this.regionForm.reset();
            const msg = error.error.message ? error.error.message : 'Error occured try again';
            this.gs.sweetAlertError(msg)
          }
        }
      );
    }
  }

  // For Deleting Sales Territory on the list
  deleteSalesTerritory({name, id}) {
    this.gs.sweetAlertFileDeletions(name).then(res => {
      if(res.value) {
        this.salesCompetitor.deleteSalesTerritory(id).subscribe(
          (data: any) => {
            this.loadIndustryList();
            this.loadRegionList()
            this.gs.sweetAlertSucess(data.message)
          }, error => {
            if (error) {
              const msg = error.error.message ? error.error.message : 'Error occured try again'
            this.gs.sweetAlertError(msg)
            }
          }
        );
      }
    })
  }

  /** SALES Competitors */

  // convenience getter for easy access to form fields
  get competitors() {
    return this.competitionForm.controls;
  }

  // Load Competitors List
  loadCompetitorsList() {
    this.salesCompetitor
      .getSalesCompetitorByCompany()
      .subscribe((data: any) => {
        this.allCompetitors = data;
      });
  }

  // add Competitors(s)
  addCompetitors() {
    if (this.competitionForm.valid) {
      const CompetitorData = {
        address: this.competitionForm.value.competitorAddress,
        orgID: this.gs.orgID,
        companyName: this.competitionForm.value.competitorCompanyName,
        email: this.competitionForm.value.competitorEmail,
        fullname: this.competitionForm.value.competitorName,
        id: 0,
        strength: this.competitionForm.value.competitorStrength,
        website: this.competitionForm.value.competitorWebsite,
      };
      this.disBtn = true
      this.salesCompetitor.createSalesCompetitor(CompetitorData).subscribe(
        (result: any) => {
          this.loadCompetitorsList();
          this.competitionForm.reset();
          this.disBtn = false;
          $('.close').click();
          this.gs.sweetAlertSucess(result.message);
        }, error => {
          if (error) {
            this.disBtn = false;
            $('.close').click()
            this.competitionForm.reset();
            const msg = error.error.message ? error.error.message : 'Error occured try again';
            this.gs.sweetAlertError(msg)
          }
        }
      );
    }
  }
  // For Deleting Sales Competitors on the list
  deleteCompetitors({fullname, companyName}) {
    this.gs.sweetAlertFileDeletions(fullname).then(res => {
      if(res.value) {
        this.salesCompetitor.deleteSalesCompetitor(companyName).subscribe(
          (data: any) => {
            this.loadCompetitorsList();
            this.gs.sweetAlertSucess(data.message)
          }, error => {
            if (error) {
              const msg = error.error.message ? error.error.message : 'Error occured try again'
            this.gs.sweetAlertError(msg)
            }
          }
        );
      }
    })
  }
}
