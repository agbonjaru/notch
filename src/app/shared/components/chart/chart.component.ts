import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { ChartType, ChartDataSets, ChartOptions } from "chart.js";
import { MultiDataSet, Label } from "ng2-charts";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})
export class ChartComponent implements OnInit, OnChanges {
  // pass data - Array of data
  // pass label for the chart
  @Input() data: MultiDataSet = [[50, 50]];
  @Input() label: Label[] = ["Chart 1", "Chart 2"];
  @Input() chartType: ChartType = "doughnut";
  @Input() title = "Title";
  @Input() chartOptions: ChartOptions = {};
  @Input() chartLegend: boolean;
  @Input() data2;

  // @Input() Inv

  @Input() datasetColor: ChartDataSets[];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    const { data } = changes;

    // console.log(changes, "datafromchart");
  }
}
