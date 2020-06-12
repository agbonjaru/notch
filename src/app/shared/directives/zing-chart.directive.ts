import { Directive, Input, NgZone, AfterViewInit, OnDestroy, HostBinding } from '@angular/core';

declare var zingchart: any;

@Directive({
  selector : 'zing-chart'
})
export class ZingChartDirective implements AfterViewInit, OnDestroy {
  @Input() id: String;
  @Input() values: Number[];
  @HostBinding('id') 
  get something() { 
    return this.id; 
  }

  constructor(private zone: NgZone) {}
  
  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
        zingchart.THEME = "classic";
        zingchart.render({
            id : this.id,
            data : {
                "type": "gauge",
                "background-color": "#fff",
                "plot": {
                    "background-color": "#666"
                },
                "plotarea": {
                    "margin": "0 0 0 0"
                },
                "scale": {
                    "size-factor": 1.25,
                    "offset-y": 120
                },
                "tooltip": {
                    "background-color": "black"
                },
                "scale-r": {
                    "values": "0:100:10",
                    "border-color": "#b3b3b3",
                    "border-width": "2",
                    "background-color": "#eeeeee,#b3b3b3",
                    "ring": {
                        "size": 10,
                        "offset-r": "130px",
                        "rules": [{
                            "rule": "%v >=0 && %v < 20",
                            "background-color": "#FB0A02"
                        }, {
                            "rule": "%v >= 20 && %v < 40",
                            "background-color": "#EC7928"
                        }, {
                            "rule": "%v >= 40 && %v < 60",
                            "background-color": "#FAC100"
                        }, {
                            "rule": "%v >= 60 && %v < 80",
                            "background-color": "#B1AD00"
                        }, {
                            "rule": "%v >= 80",
                            "background-color": "#348D00"
                        }]
                    }
                },
                "labels": [{
                    "id": "lbl1",
                    "x": "50%",
                    "y": "90%",
                    "width": 80,
                    "offsetX": 160,
                    "textAlign": "center",
                    "padding": 10,
                    "anchor": "c",
                    "text": "Very High",
                    "backgroundColor": "#348D00",
                    "tooltip": {
                        "padding": 10,
                        "backgroundColor": "#237b00",
                        "text": "< 80 <br>Percent",
                        "shadow": 0
                    }
                }, {
                    "id": "lbl2",
                    "x": "50%",
                    "y": "90%",
                    "width": 80,
                    "offsetX": 80,
                    "textAlign": "center",
                    "padding": 10,
                    "anchor": "c",
                    "text": "High",
                    "backgroundColor": "#B1AD00",
                    "tooltip": {
                        "padding": 10,
                        "backgroundColor": "#a09c00",
                        "text": "> 60 < 80<br>Percent",
                        "shadow": 0
                    }
                }, {
                    "id": "lbl3",
                    "x": "50%",
                    "y": "90%",
                    "width": 80,
                    "offsetX": 0,
                    "textAlign": "center",
                    "padding": 10,
                    "anchor": "c",
                    "text": "Medium",
                    "backgroundColor": "#FAC100",
                    "tooltip": {
                        "padding": 10,
                        "backgroundColor": "#e9b000",
                        "text": "> 40 < 60<br>Percent",
                        "shadow": 0
                    }
                }, {
                    "id": "lbl4",
                    "x": "50%",
                    "y": "90%",
                    "width": 80,
                    "offsetX": -80,
                    "textAlign": "center",
                    "padding": 10,
                    "anchor": "c",
                    "text": "Low",
                    "backgroundColor": "#EC7928",
                    "tooltip": {
                        "padding": 10,
                        "backgroundColor": "#da6817",
                        "text": "> 20 < 40<br>Percent",
                        "shadow": 0
                    }
                }, {
                    "id": "lbl5",
                    "x": "50%",
                    "y": "90%",
                    "width": 80,
                    "offsetX": -160,
                    "textAlign": "center",
                    "padding": 10,
                    "anchor": "c",
                    "text": "Very Low",
                    "backgroundColor": "#FB0A02",
                    "tooltip": {
                        "padding": 10,
                        "backgroundColor": "#ea0901",
                        "text": "< 20<br>Percent",
                        "shadow": 0
                    }
                }],
                "series": [{
                    "values": this.values,
                    "animation": {
                        "method": 5,
                        "effect": 2,
                        "speed": 2500
                    }
                }],
                "alpha": 1
            },
            height : 500,
            width : 800
        });
    });
  }

  ngOnDestroy() {
      zingchart.exec(this.id, 'destroy');
  }
}