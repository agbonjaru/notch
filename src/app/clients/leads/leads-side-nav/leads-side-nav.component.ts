import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FilterService } from '../../../../app/services/filters/filter-service.service';
import { LeadSourceService } from 'src/app/services/filters/lead-source.service';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { GeneralService } from 'src/app/services/general.service';
import { filter } from 'rxjs/operators';
import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-leads-side-nav',
  templateUrl: './leads-side-nav.component.html',
  styleUrls: ['./leads-side-nav.component.css']
})
export class LeadsSideNavComponent implements OnInit {
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig> = { adaptivePosition: true };
  orgId: number;
  userId: any;
  defaultFilterOptions: any = {
    isNew: "",
    needsAttention: "",
    hasInboundEmail: "",
    profileScore: {},
    winningProbability: {},
    owner: {},
    source: {},
    createdOn: {},
  };

  filterOptions: any = {
  };

  selectedOptions: any = {

  };

  filterOptionsFlags: any = {

  }

  myFilters: any = {};
  customName = "";
  selectedCustomFilter: any;

  customFilterMessage: string;
  filterModificationMessage: string;


  @Output() filterQuery = new EventEmitter()

  //
  constructor(
    private genService: GeneralService,
    private filterService: FilterService,
    private sourceService: LeadSourceService,
    private crewService: SalesPersonService,
  ) {
    this.orgId = this.genService.orgID;
    this.userId = this.genService.user.id;
  }

  ngOnInit() {
    this.sourceService.filterLeadSources(`orgId=${this.orgId}`)
      .subscribe(response => {
        if (response.success) {
          response.payload.map(source => {
            const { id, name } = source;
            this.defaultFilterOptions.source = {
              ...this.defaultFilterOptions.source,
              [id]: { id, name }
            }
          });

          this.crewService.fetchAllSalePersons().subscribe(response => {
            const owners = this.convertObjectToArray(response);
            owners.forEach(owner => {
              const { id, name } = owner;
              this.defaultFilterOptions.owner = {
                ...this.defaultFilterOptions.owner,
                [id]: { id, name }
              }

              this.filterOptions = {
                ...this.defaultFilterOptions
              }

              //
              this.filterOptionsFlags = this.processFilterFlags(this.filterOptions);
            });
          }, error => {
            console.log(error.message);
          });
        } else {
          console.log('could not fetch sources');
        }
      }, error => {
        console.log(error.message);
      });

    this.filterService.filterFilter(`&userId=${this.userId}`)
      .subscribe(response => {
        if (response.success) {
          response.payload.map(myFilter => {
            const { id, name, filter } = myFilter;
            this.myFilters = {
              ...this.myFilters,
              [id]: { id, name, filter }
            }
          })
        }
      }, error => {
        console.log(error.message);
      });
  }

  clearForm() {
    this.customName = "";
    this.filterOptions = {
      ...this.defaultFilterOptions
    };

    this.selectedOptions = {};
    this.selectedCustomFilter = undefined;
    this.filterOptionsFlags = this.processFilterFlags(this.defaultFilterOptions);

    this.submit();
  }

  convertObjectToArray(object) {
    let finalArray = [];
    for (let key in object) {
      finalArray = [
        ...finalArray,
        object[key]
      ]
    }

    return finalArray;
  }

  isSelected(id) {
    return id === this.selectedCustomFilter;
  }

  processCheckbox(category: string): void {
    this.filterOptionsFlags[category] = !this.filterOptionsFlags[category];

    if (this.filterOptionsFlags[category]) {
      this.filterOptions[category] = true;
      this.selectedOptions[category] = true;
    } else {
      delete this.selectedOptions[category];
    }

    this.submit();
  }

  processCheckboxGroup(category: string, value: any): void {
    const { id, name } = value;
    this.filterOptionsFlags[id] = !this.filterOptionsFlags[id];

    if (this.filterOptionsFlags[id]) {
      if (category === 'source') {
        this.selectedOptions[category] = {
          ...this.selectedOptions[category],
          [name]: id
        }
      } else {
        this.selectedOptions[category] = {
          ...this.selectedOptions[category],
          [id]: id
        }
      }
    } else {
      if (category === 'source') {
        delete this.selectedOptions[category][name];
      } else {
        delete this.selectedOptions[category][id];
      }
    }

    // console.log(this.selectedOptions);
    this.submit();
  }

  processRange(category: string, type: string, value: any, isDate = false): void {
    if (this.filterOptions[category] === undefined) {
      this.filterOptions[category] = {};
    }

    if (this.selectedOptions[category] === undefined) {
      this.selectedOptions[category] = {};
    }


    if (value === undefined || value == '') {
      delete this.filterOptions[category];
      delete this.selectedOptions[category];
      return;
    }

    this.filterOptions[category][type] = isDate ? Date.parse(value) : value;
    this.selectedOptions[category][type] = isDate ? Date.parse(value) : value;

    //
    this.submit();
  }

  processCustomFilter(value) {
    if (this.selectedOptions.id !== undefined && this.selectedOptions.id === value) {
      this.clearForm();
      return;
    }

    const { id, name, filter } = this.myFilters[value];
    this.customName = name;
    this.selectedCustomFilter = id;

    const { createdOn, profileScore, winningProbability } = filter;
    this.filterOptions = {
      id,
      ...this.defaultFilterOptions,
      createdOn,
      profileScore,
      winningProbability
    }

    this.selectedOptions = {
      id,
      ...filter
    }

    this.processSelectedFilters();
  }

  processFilterFlags(filters) {
    let flags = {};
    for (let category in filters) {
      const filter = filters[category];
      if (typeof filter !== 'object') {
        flags[category] = false;
        continue;
      }

      if (!this.genService.checkIfObjectIsEmpty(filter)) {
        for (let option in filter) {
          flags[option] = false;
        }
      }
    }

    return flags;
  }

  processSelectedFilters() {
    for (let category in this.selectedOptions) {
      const filter = this.selectedOptions[category];
      if (typeof filter !== 'object' && this.filterOptionsFlags[category] !== undefined) {
        this.filterOptionsFlags[category] = true;
        continue;
      }

      delete this.selectedOptions.id;

      if (!this.genService.checkIfObjectIsEmpty(filter)) {
        for (let option in filter) {
          if (this.filterOptionsFlags[option] !== undefined) {
            this.filterOptionsFlags[option] = true;
          }
        }
      }
    }

    ///
    this.submit();
  }

  processFilterName(value) {
    this.customName = value;
  }

  processQuery(): string {
    let filterQuery = '';
    let ranges = {};
    for (let key in this.selectedOptions) {
      const filterOption = this.selectedOptions[key];

      if (typeof filterOption !== 'object' && filterOption !== undefined && filterOption !== '') {
        filterQuery += `&${key}=${filterOption}`;
        continue;
      }

      if (this.genService.checkIfObjectIsEmpty(filterOption)) {
        continue;
      }

      if (filterOption.from && filterOption.to) {
        ranges = {
          ...ranges,
          [key]: filterOption
        };
        continue;
      }


      if (filterOption.from && !filterOption.to) {
        ranges = {
          ...ranges,
          [key]: {
            ...filterOption,
            to : 9999999999999
          }
        };
        
        continue;
      }

      if (filterOption.to && !filterOption.from) {
        ranges = {
          ...ranges,
          [key]: {
            ...filterOption,
            from : 0
          }
        };

        continue;
      }

      let orQuery = '';
      for (let innerKey in filterOption) {
        orQuery += `${innerKey},`;
      }

      orQuery = orQuery.substring(0, orQuery.length - 1); //remove trailing comma (,)
      filterQuery += `&${key}=${orQuery}`;
    }

    //
    const rangeQuery = this.genService.checkIfObjectIsEmpty(ranges) ? `` : `&range=${JSON.stringify(ranges)}`;
    return `${filterQuery}${rangeQuery}`.substring(1); // remove preceeding &
  }

  submit() {
    const queryString = this.processQuery();
    console.log(queryString);
    this.filterQuery.emit(queryString);
  }

  submitCustomFilter() {
    const filter = this.selectedOptions;
    const id = this.selectedCustomFilter;
    delete filter.id;

    const filterData = {
      id,
      filter,
      userId: this.userId,
      service: 'leads',
      name: this.customName
    }

    if (this.genService.checkIfObjectIsEmpty(filterData.filter)) {
      this.displayFilterAlert('filterModificationMessage', `Filter cannot be empty`);
      return;
    }

    if (!id) {
      //create ne
      this.filterService.createFilter({ ...filterData })
        .subscribe(response => {
          this.processFilterModificationResponse(response);
        });
    } else {
      //update
      this.filterService.updateFilter({ ...filterData })
        .subscribe(response => {
          this.processFilterModificationResponse(response);
        });
    }
  }

  processFilterModificationResponse(response) {
    const alertType = "filterModificationMessage";
    if (response.success) {
      const { id, name, filter } = response.payload;
      this.customName = name;
      const { createdOn, profileScore, winningProbability } = filter;

      this.filterOptions = {
        id,
        ...this.defaultFilterOptions,
        createdOn,
        profileScore,
        winningProbability
      }

      this.selectedCustomFilter = id;

      this.myFilters = {
        ...this.myFilters,
        [id]: { ...response.payload }
      }

      this.displayFilterAlert(alertType, `Filter updated successfully`);
    } else {
      this.displayFilterAlert(alertType, `Could not update filter`);
    }
  }

  removeCustomFilter(id) {
    const alertType = 'customFilterMessage';
    this.filterService.deleteFilter(id).subscribe(response => {
      if (response.success) {
        delete this.myFilters[id];
        this.displayFilterAlert(alertType, 'Deleted');
      } else {
        this.displayFilterAlert(alertType, 'Not deleted');
      }
    })
  }

  displayFilterAlert(type, message) {
    this[type] = message;

    setTimeout(() => {
      this[type] = undefined;
    }, 2000);
  }
}
