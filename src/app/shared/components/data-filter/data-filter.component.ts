import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { GeneralService } from "src/app/services/general.service";
import { BsDatepickerViewMode } from "ngx-bootstrap/datepicker/models";
import { BsDatepickerConfig } from "ngx-bootstrap";
declare var $: any;

@Component({
  selector: "app-data-filter",
  templateUrl: "./data-filter.component.html",
  styleUrls: ["./data-filter.component.css"],
})
export class DataFilterComponent implements OnInit {
  @Input() accordions;
  @Input() dataSource;
  @Input() customFilters;
  @Input() dataChanged: Observable<any>;
  @Output() filteredSource: EventEmitter<any> = new EventEmitter<any>(null);

  minMode: BsDatepickerViewMode = "month";
  bsConfig: Partial<BsDatepickerConfig> = { adaptivePosition: true };
  subs = [];
  btn: any = {};
  data: any = {
    filterTypeBox: [],
    arrayFilterSource: [],
  };
  filterCheckBox = {};
  filterRadioBox = {};
  filterRange = {};
  loader: any = {};
  filter: any = {
    search: [],
    minrange: [],
    maxrange: [],
    checkBox: {},
    status: true,
    current: {},
  };

  constructor(private gs: GeneralService) {
    this.btn.disabled = true;
    this.btn.create = "Create Filter";
  }

  ngOnInit() {
    if (this.dataChanged) {
      this.subs.push(
        this.dataChanged.subscribe((changed) => {
          if (changed) {
            setTimeout(() => {
              this.filter.source = this.dataSource;
              this.customFilters = this.customFilters;
              //Remove
              // this.filter.source.filter((item) => {
              //   item.noOfTickets = Math.round(Math.random() * 20);
              //   item.totalTicketsAssigned = Math.round(Math.random() * 50);
              //   item.totalTicketsResolved = Math.round(Math.random() * 100);
              //   return item;
              // });

              this.data.filterTypeBox = this.filterByType("box");
              this.filterSource(this.data.filterTypeBox);
              // console.log(this.data.filterTypeBox, "filterTypeBox");
            }, 1000);
          }
        })
      );
    }
  }

  onInputChanges() {
    if (
      Object.keys(this.filterCheckBox).length > 0 ||
      Object.keys(this.filterRange).length > 0 ||
      Object.keys(this.filterRadioBox).length > 0
    ) {
      this.btn.disabled = false;
    }
  }

  // Get all filter.type = 'type'
  // from this.accordions
  filterByType(type: string) {
    let res;
    if (type === "box") res = this.accordions.filter((f) => f.type === type);
    else if (type === "range")
      res = this.accordions.filter((f) => f.type === type);
    // console.log(res, "res");
    return res;
  }

  // Filter dataSource by filter.type = 'type'
  filterSource(arrayFilterSource: any) {
    if (this.dataSource === undefined) return;

    arrayFilterSource.filter((f) => {
      // console.log(f, "f");
      let filterKey = f.filterKey;
      this.data.arrayFilterSource[filterKey] = this.dataSource.map((item) => ({
        id: item.id,
        [filterKey]: item[filterKey],
      }));
      // console.log(this.data.arrayFilterSource, "arrayFilterSource");
    });
  }

  // When Filter CheckBox is checked/unchecked
  onCheckBoxChange(filterKey: string, value: any) {
    let dataSource = this.filter.source; //default data source
    let isFound = this.isCheckboxFamily(filterKey, this.filterCheckBox);
    console.log(isFound, "isFound");

    this.filterCheckBox[filterKey + "=" + value[filterKey]] = !this
      .filterCheckBox[filterKey + "=" + value[filterKey]];

    if (this.filterCheckBox[filterKey + "=" + value[filterKey]]) {
      this.filterCheckBox[filterKey + "=" + value[filterKey]] = true;
    } else {
      delete this.filterCheckBox[filterKey + "=" + value[filterKey]];
    }

    console.log(this.filterCheckBox, "checkBox");

    //if no range filters use default record
    // else use filtered dataSource
    if (Object.keys(this.filterRange).length > 0) {
      dataSource = this.dataSource;
    }

    //if filter isn't isFound
    // && dataSource has been filtered
    // use filtered dataSource (useful for the second checkbox occurence)
    if (!isFound && this.filter.status) {
      dataSource = this.dataSource;
    }

    this.dataSourceFilter(dataSource);
  }

  // When Filter CheckBox is checked/unchecked
  onCheckBoxChangeOld(filterKey: string, value: any) {
    let dataSource = this.filter.source; //default data source
    let isFound = this.isCheckboxFamily(filterKey, this.filterCheckBox);
    console.log(isFound, "isFound");

    this.filterCheckBox[filterKey + "=" + value[filterKey]] = !this
      .filterCheckBox[filterKey + "=" + value[filterKey]];

    if (this.filterCheckBox[filterKey + "=" + value[filterKey]]) {
      this.filterCheckBox[filterKey + "=" + value[filterKey]] = true;
    } else {
      delete this.filterCheckBox[filterKey + "=" + value[filterKey]];
    }

    console.log(this.filterCheckBox, "checkBox");

    //if no range filters use default record
    // else use filtered dataSource
    if (Object.keys(this.filterRange).length > 0) {
      dataSource = this.dataSource;
    }

    //if isFound use filtered dataSource
    if (isFound) {
      dataSource = this.dataSource;
    }

    this.dataSourceFilter(dataSource);
  }

  isCheckboxFamily(filterKey: string, arrayFilters: any): boolean {
    let filter: any = {};
    // Check if filter exist in checkbox
    if (Object.keys(arrayFilters).length > 0) {
      for (let key in arrayFilters) {
        filter.type = key.split("=")[0];
        filter[filter.type] = key.split("=")[1];
        console.log(filter, "filter");
        if (filter.type === filterKey) return true;
      }
      return false;
    }
    return true;
  }

  processCheckboxFilters(arrayFilters: any, arraySource: any): any {
    let filter: any = {};
    let filteredSource: any = [];

    console.log(arraySource, "arraySource");

    // Filter secondary data source
    for (let key in arrayFilters) {
      filter.type = key.split("=")[0];
      filter[filter.type] = key.split("=")[1];
      console.log(filter, "filter");
      arraySource.filter((item) => {
        if (item[filter.type] === filter[filter.type]) {
          if (!filteredSource.includes(item)) filteredSource.push(item);
        }
      });
    }

    console.log(filteredSource, "filteredSource");
    return filteredSource;
  }

  // When min > max, we need to be able to return the datasource back when another filter is initiated,

  //
  onChangeRange(filterKey: string) {
    let range: any = [];
    let dataSource = this.filter.source; //default data source
    let min = filterKey + "=min",
      max = filterKey + "=max";

    range[min] = parseInt(this.filter.minrange[filterKey]) || 0;
    range[max] = parseInt(this.filter.maxrange[filterKey]) || 10000;

    console.log(range, "range");
    console.log(this.filter.minrange, "minrange");

    //if checkBox filters has atleast a record,
    // use filtered dataSource
    if (Object.keys(this.filterCheckBox).length > 0 && this.filter.status) {
      console.log("use filtered data");
      dataSource = this.dataSource;
    }

    if (this.filterRange.hasOwnProperty(min)) {
      console.log(min, "min exist");
      // Delete and add again
      delete this.filterRange[min];
      delete this.filterRange[max];
      console.log(min, "min and max deleted");
      Object.assign(this.filterRange, range);
      console.log(this.filterRange, "filterRange added");
    } else {
      Object.assign(this.filterRange, range);
      console.log(this.filterRange, "filterRange assigned");
    }

    console.log(this.filterRange, "filterRange");
    this.dataSourceFilter(dataSource, filterKey);
  }

  processRangeFilters(arrayFilters: any, filterKey: string, arraySource: any) {
    let min, max: any;
    let filteredSource: any = [];

    min = filterKey + "=min";
    max = filterKey + "=max";

    console.log("start");
    console.log(filterKey, "filterKey");
    console.log(arrayFilters, "arrayFilters");

    if (Object.keys(arrayFilters).length === 0) return;

    // if filter is one: same property has two records
    // if (Object.keys(arrayFilters).length === 2) {
    if (!arrayFilters.hasOwnProperty(min)) return;
    min = arrayFilters[min];
    max = arrayFilters[max];
    // }
    // console.log(min, "min");
    // for (let key in arrayFilters) {
    //   console.log(key, "key");
    //   // if (!arrayFilters.hasOwnProperty(min)) return;
    //   min = arrayFilters[min];
    //   max = arrayFilters[max];
    //   console.log(key, "key");

    // }
    console.log(min, "min");
    console.log(max, "max");
    console.log(arraySource, "arraySource");

    filteredSource = arraySource.filter((item) => {
      return item[filterKey] >= min && item[filterKey] <= max;
    });

    console.log(filteredSource, "filteredSource");
    return filteredSource;
  }

  // Filter Data Source
  dataSourceFilter(filteredSource: any, filterKey?: string) {
    let filter: any = {};
    let dataSource = filteredSource;

    // Check if there is any filter to process for checkbox
    if (Object.keys(this.filterCheckBox).length > 0) {
      // If filter exist, process processCheckboxFilters
      dataSource = this.processCheckboxFilters(this.filterCheckBox, dataSource);
    }

    // Check if there is any filter to process for range
    if (filterKey !== undefined && Object.keys(this.filterRange).length > 0) {
      // If filter exist, process processRangeFilters
      console.log(filterKey, "filterKey");
      for (let key in this.filterRange) {
        console.log(key, "key");
        filter.type = key.split("=")[0];
        console.log(filter, "filter");
        dataSource = this.processRangeFilters(
          this.filterRange,
          filter.type,
          dataSource
        );
      }
    }

    console.log(dataSource, "dataSource");
    this.dataSource = dataSource;
    this.filteredSource.emit({ action: "filter", data: dataSource });
    // Data has been filtered
    if (this.dataSource.length > 0) this.filter.status = true;
    this.onInputChanges(); //Check for input changes
  }

  // Filter Data Source
  dataSourceFilterOld(filteredSource: any, filterKey?: string) {
    let dataSource = filteredSource;

    // Check if there is any filter to process for checkbox
    if (Object.keys(this.filterCheckBox).length > 0) {
      // If filter exist, process processCheckboxFilters
      dataSource = this.processCheckboxFilters(this.filterCheckBox, dataSource);
    }

    // Check if there is any filter to process for range
    if (filterKey !== undefined && Object.keys(this.filterRange).length > 0) {
      // If filter exist, process processRangeFilters
      dataSource = this.processRangeFilters(
        this.filterRange,
        filterKey,
        dataSource
      );
    }

    console.log(dataSource, "dataSource");
    this.dataSource = dataSource;
    this.filteredSource.emit({ action: "filter", data: dataSource });
    // Data has been filtered
    if (this.dataSource.length > 0) this.filter.status = true;
  }

  //Process Custom Filter
  processCustomFilter(filter) {
    this.resetFilters(); //Clear Filters
    this.presetFilters(filter); // Preset input values
    $(".cc--filter .accordion .card .collapse").collapse("show"); //Toogle all accordions
    //select radio button or Set created filter as default
    this.filterRadioBox[filter.id] = true;
    this.filteredSource.emit({ action: "processFilter", data: filter });
    this.onInputChanges();
    this.manageButton();
    console.log("process filters detected");
  }

  // Preset each filter type with the
  // default data
  presetFilters(filter) {
    this.filter.current = filter;
    this.filter.filterName = filter.filterName;
    this.accordions.filter((item) => {
      if (filter.hasOwnProperty(item.filterKey)) {
        // console.log(item.filterKey, "filterKey");
        this.filter.minrange[item.filterKey] = filter[item.filterKey];
        this.onChangeRange(item.filterKey); //process filters for update
      }
    });
    // console.log(this.filter.minrange, "minrange");
  }

  // Process payload on Create Custom Filter
  onCreateCustomFilter() {
    this.loader.create = true;

    let filter: any = {};
    let arrayFilters: any = {};

    // Check if there is any filter to process for checkbox
    if (Object.keys(this.filterCheckBox).length > 0) {
      // Check if there is any filter to process for checkboxes
      for (let [key, value] of Object.entries(this.filterCheckBox)) {
        filter = {}; //Clear filter
        console.log(key, "key");
        let type = key.split("=")[0];
        filter[type] = value;
        console.log(filter, "filter");
        if (!arrayFilters.hasOwnProperty(type)) {
          Object.assign(arrayFilters, filter);
        }
      }
    }

    // Check if there is any filter to process for range
    if (Object.keys(this.filterRange).length > 0) {
      for (let [key, value] of Object.entries(this.filterRange)) {
        filter = {}; //Clear filter
        console.log(key, "key");
        let type = key.split("=")[0];
        filter[type] = value;
        console.log(filter, "filter");
        if (!arrayFilters.hasOwnProperty(type)) {
          Object.assign(arrayFilters, filter);
        }
      }
    }

    const payload = {
      ...arrayFilters,
      filterName: this.filter.filterName,
    };
    console.log(payload, "payload");
    this.createCustomFilter(payload);
    setTimeout(() => (this.loader.create = false), 2000);
  }

  // Process payload on Update Custom Filter
  onUpdateCustomFilter() {
    this.loader.create = true;

    let filter: any = {};
    let arrayFilters: any = {};

    // Check if there is any filter to process for checkbox
    if (Object.keys(this.filterCheckBox).length > 0) {
      // Check if there is any filter to process for checkboxes
      for (let [key, value] of Object.entries(this.filterCheckBox)) {
        filter = {}; //Clear filter
        console.log(key, "key");
        let type = key.split("=")[0];
        filter[type] = value;
        console.log(filter, "filter");
        if (!arrayFilters.hasOwnProperty(type)) {
          Object.assign(arrayFilters, filter);
        }
      }
    }

    // Check if there is any filter to process for range
    if (Object.keys(this.filterRange).length > 0) {
      for (let [key, value] of Object.entries(this.filterRange)) {
        filter = {}; //Clear filter
        console.log(key, "key");
        let type = key.split("=")[0];
        filter[type] = value;
        console.log(filter, "filter");
        if (!arrayFilters.hasOwnProperty(type)) {
          Object.assign(arrayFilters, filter);
        }
      }
    }

    const payload = {
      ...arrayFilters,
      id: this.filter.current.id,
      filterName: this.filter.filterName,
    };
    console.log(payload, "payload");
    this.updateCustomFilter(payload);
    setTimeout(() => (this.loader.create = false), 2000);
  }

  // Create Custom Filter
  createCustomFilter(payload) {
    this.filteredSource.emit({ action: "createFilter", data: payload });
    // Set created filter as default
    this.customFilters.filter((f) => {
      if (f.filterName === payload.filterName) {
        this.processCustomFilter(f);
      }
    });

    //@ts-ignore
    setTimeout(() => document.querySelector("#closeModal").click(), 1200);
  }

  // Update Custom Filter
  updateCustomFilter(payload) {
    this.filteredSource.emit({ action: "updateFilter", data: payload });
    // Set created filter as default
    this.customFilters.filter((f) => {
      if (f.filterName === payload.filterName) {
        this.processCustomFilter(f);
      }
    });

    //@ts-ignore
    setTimeout(() => document.querySelector("#closeModal").click(), 1200);
  }

  // Remove or Delete Custom Filter
  removeCustomFilter(id) {
    let name = this.getCustomFilterNameById(id);
    console.log(name, "name");
    const title = "Delete " + name;
    this.gs.sweetAlertGeneralDelete(title, "Delete").then((res) => {
      // console.log(res, "value");
      if (res.value) {
        this.filteredSource.emit({ action: "deleteFilter", data: id });
      }
    });
  }

  // Get Custom Filter Name by filterId
  getCustomFilterNameById(id) {
    let name;
    this.customFilters.filter((f) => {
      if (f.id === id) name = f.filterName;
    });
    return name;
  }

  manageButton() {
    if (Object.keys(this.filterRadioBox).length > 0)
      this.btn.create = "Update Filter";
  }

  // Reset all filters
  resetFilters() {
    // Clear each checkbox in filterCheckBox
    for (let key in this.filterCheckBox) {
      this.filterCheckBox[key] = false;
    }
    // console.log(this.filterCheckBox, "checkBox");
    this.filter.search = []; // clear search
    this.filter.minrange = [];
    this.filter.maxrange = [];
    this.filterCheckBox = {}; //Clear filterCheckBox
    this.filterRange = [];
    this.filterRadioBox = {}; //Clear filterRadioBox
    this.btn.create = "Create Filter";
    console.log("reset filters detected");
  }

  // Clear and Reset all filters
  clearFilters() {
    this.resetFilters();
    this.btn.disabled = true;
    this.filteredSource.emit({ action: "clear", data: [] });
    console.clear();
    console.log("clear filters detected");
  }
}
