$.getScript("assets/js/modules/chart.js", function() {
  // donut chart
  // donut 1
  var values = [],
    labels = [],
    legends = true,
    legendsElement = $("#TicketByDepartmentLegends"),
    colors = ["#fcaf17", "#aa85bc", "#7cbe88", "#e67157"];

  $("#TicketByDepartment tr").each(function() {
    values.push(parseInt($("td", this).text(), 10));
    labels.push($("th", this).text());
  });

  $("#TicketByDepartment").hide();

  $.getScript(
    "http://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js",
    function() {
      var r = Raphael("DonutTicketsByDepartment", 200, 200);
      r.donutChart(
        100,
        100,
        88,
        35,
        values,
        labels,
        colors,
        legends,
        legendsElement,
        colors
      );

      // donut 2
      var values2 = [],
        labels2 = [],
        legends2 = true,
        legendsElement2 = $("#TicketByDepartmentLegends2"),
        colors2 = ["#7cbe88", "#e67157", "#fcaf17", "#aa85bc"];

      $("#TicketByDepartment2 tr").each(function() {
        values2.push(parseInt($("td", this).text(), 10));
        labels2.push($("th", this).text());
      });

      $("#TicketByDepartment2").hide();
      var r = Raphael("DonutTicketsByDepartment2", 200, 200);
      r.donutChart(
        100,
        100,
        88,
        35,
        values2,
        labels2,
        colors2,
        legends2,
        legendsElement2,
        colors2
      );
    }
  );
  // donut chart end

  // chart
  var label = document.querySelector(".label");
  var c = document.getElementById("c");
  var ctx = c.getContext("2d");
  var cw = (c.width = 700);
  var ch = (c.height = 350);
  var cx = cw / 2,
    cy = ch / 2;
  var rad = Math.PI / 180;
  var frames = 0;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#999";
  ctx.fillStyle = "#ccc";
  ctx.font = "14px monospace";

  var grd = ctx.createLinearGradient(0, 0, 0, cy);
  grd.addColorStop(0, "hsla(167,72%,60%,1)");
  grd.addColorStop(1, "hsla(167,72%,60%,0)");

  var oData = {
    "2008": 10,
    "2009": 39.9,
    "2010": 17,
    "2011": 30.0,
    "2012": 5.3,
    "2013": 38.4,
    "2014": 15.7,
    "2015": 9.0,
  };

  var valuesRy = [];
  var propsRy = [];
  for (var prop in oData) {
    valuesRy.push(oData[prop]);
    propsRy.push(prop);
  }

  var vData = 4;
  var hData = valuesRy.length;
  var offset = 50.5; //offset chart axis
  var chartHeight = ch - 2 * offset;
  var chartWidth = cw - 2 * offset;
  var t = 1 / 7; // curvature : 0 = no curvature
  var speed = 2; // for the animation

  var A = {
    x: offset,
    y: offset,
  };
  var B = {
    x: offset,
    y: offset + chartHeight,
  };
  var C = {
    x: offset + chartWidth,
    y: offset + chartHeight,
  };

  /*
                A  ^
                  |  |
                  + 25
                  |
                  |
                  |
                  + 25
                |__|_________________________________  C
                B
          */

  // CHART AXIS -------------------------
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.stroke();

  // vertical ( A - B )
  var aStep = (chartHeight - 50) / vData;

  var Max = Math.ceil(arrayMax(valuesRy) / 10) * 10;
  var Min = Math.floor(arrayMin(valuesRy) / 10) * 10;
  var aStepValue = (Max - Min) / vData;
  console.log("aStepValue: " + aStepValue); //8 units
  var verticalUnit = aStep / aStepValue;

  var a = [];
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (var i = 0; i <= vData; i++) {
    if (i === 0) {
      a[i] = {
        x: A.x,
        y: A.y + 25,
        val: Max,
      };
    } else {
      a[i] = {};
      a[i].x = a[i - 1].x;
      a[i].y = a[i - 1].y + aStep;
      a[i].val = a[i - 1].val - aStepValue;
    }
    drawCoords(a[i], 3, 0);
  }

  //horizontal ( B - C )
  var b = [];
  ctx.textAlign = "center";
  ctx.textBaseline = "hanging";
  var bStep = chartWidth / (hData + 1);

  for (var i = 0; i < hData; i++) {
    if (i === 0) {
      b[i] = {
        x: B.x + bStep,
        y: B.y,
        val: propsRy[0],
      };
    } else {
      b[i] = {};
      b[i].x = b[i - 1].x + bStep;
      b[i].y = b[i - 1].y;
      b[i].val = propsRy[i];
    }
    drawCoords(b[i], 0, 3);
  }

  function drawCoords(o, offX, offY) {
    ctx.beginPath();
    ctx.moveTo(o.x - offX, o.y - offY);
    ctx.lineTo(o.x + offX, o.y + offY);
    ctx.stroke();

    ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
  }

  //----------------------------------------------------------

  // DATA
  var oDots = [];
  var oFlat = [];
  var i = 0;

  // tslint:disable-next-line:forin
  for (var prop in oData) {
    oDots[i] = {};
    oFlat[i] = {};

    oDots[i].x = b[i].x;
    oFlat[i].x = b[i].x;

    oDots[i].y = b[i].y - oData[prop] * verticalUnit - 25;
    oFlat[i].y = b[i].y - 25;

    oDots[i].val = oData[b[i].val];

    i++;
  }

  ///// Animation Chart ///////////////////////////
  //var speed = 3;
  function animateChart() {
    requestId = window.requestAnimationFrame(animateChart);
    frames += speed; //console.log(frames)
    ctx.clearRect(60, 0, cw, ch - 60);

    for (var i = 0; i < oFlat.length; i++) {
      if (oFlat[i].y > oDots[i].y) {
        oFlat[i].y -= speed;
      }
    }
    drawCurve(oFlat);
    for (var i = 0; i < oFlat.length; i++) {
      ctx.fillText(oDots[i].val, oFlat[i].x, oFlat[i].y - 25);
      ctx.beginPath();
      ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (frames >= Max * verticalUnit) {
      window.cancelAnimationFrame(requestId);
    }
  }

  requestId = window.requestAnimationFrame(animateChart);

  /////// EVENTS //////////////////////
  c.addEventListener(
    "mousemove",
    function(e) {
      label.innerHTML = "";
      label.style.display = "none";
      this.style.cursor = "default";

      var m = oMousePos(this, e);
      for (var i = 0; i < oDots.length; i++) {
        output(m, i);
      }
    },
    false
  );

  function output(m, i) {
    ctx.beginPath();
    ctx.arc(oDots[i].x, oDots[i].y, 20, 0, 2 * Math.PI);
    if (ctx.isPointInPath(m.x, m.y)) {
      //console.log(i);
      label.style.display = "block";
      label.style.top = m.y + 10 + "px";
      label.style.left = m.x + 10 + "px";
      lab,
        (el.innerHTML =
          "<strong>" + propsRy[i] + "</strong>: " + valuesRy[i] + "%");
      c.style.cursor = "pointer";
    }
  }
});

