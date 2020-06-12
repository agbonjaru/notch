// General Triggers
$.getScript("assets/js/modules/jquery-ui.min.js", function() {
  // Add profile link to profile dropdown
  $("#dropdown1 .row a").attr("href", "profile.html");
  // Add profile link to profile dropdown

  $(".dropdown-trigger").dropdown();

  // add calss to trigger green color on hover
  $(".content-body a:first-of-type").addClass("back-link");
  $(".content-body .nav-item a").removeClass("back-link");
  // add calss to trigger green color on hover

  // Trigger content-editable
  $(".edit-content").click(function() {
    $(".content-edit").attr("contenteditable", "true");
  });

  // Edit Category name initialization

  $("#editCatName").click(function() {
    $("#editName").slideDown(400);
  });
  $("#editCatName2").click(function() {
    $("#editName2").slideDown(400);
  });

  // view/edit role setting new page
  $(".edit-role").click(function() {
    window.open("role-setting-edit.html", "_self");
    // $("body").load("role-setting-edit.html");
  });

  // view/edit role setting new page
  $(".edit-email-seq").click(function() {
    window.open("email-temp-sequencing-edit.html", "_self");
    // $("body").load("role-setting-edit.html");
  });

  // login submit
  $("#login-submit").click(function() {
    // window.open("dashboard.html", "_self");
  });

  // Lead workflow send welcome message by email, sms, whatsapp activation
  $("#welcome-by-email").hide();
  $(".welcome-by-email").click(function() {
    $("#welcome-by-email").show("");
  });
  $(".welcome-by-email").click(function() {
    $("#welcome-by-sms").hide("");
  });

  $("#welcome-by-sms").hide();
  $(".welcome-by-sms").click(function() {
    $("#welcome-by-sms").show("");
  });
  $(".welcome-by-sms").click(function() {
    $("#welcome-by-email").hide("");
  });

  // edit-role-name in role settings
  $("#edit-role-name").click(function() {
    $(this).hide();
    $("#role-name-edit").attr("contenteditable", "true", "slow");
    $("#role-name-edit").addClass("editable");
    $("#save-role-name").show();
  });
  $("#save-role-name").click(function() {
    $("#role-name-edit").removeAttr("contenteditable", "slow");
    $("#role-name-edit").removeClass("editable");
    $(this).hide();
    $("#edit-role-name").show();
  });
  $(".edit-role-name").click(function() {
    $(".role-name-edit").attr("contenteditable", "true", "slow");
    $(".role-name-edit").addClass("editable");
    $(this).hide();
    $(".save-role-name").show();
  });
  $(".save-role-name").click(function() {
    $(".role-name-edit").removeAttr("contenteditable", "slow");
    $(".role-name-edit").removeClass("editable");
    $(this).hide();
    $(".edit-role-name").show();
  });

  // sortabel workflow transitions
  $("#sortable").sortable();
  $("#sortable2").sortable();
  $("#sortable").disableSelection();

  // mselect custom input
  $(".chosen-choices").addClass("gen-input2");
  $(".chosen-single").addClass("gen-input2");

  // edit email template
  $(".save-email-temp").hide();
  $(".edit-email-temp").click(function() {
    $("#emailTemplateEdit").attr("contenteditable", "true");
    $("#emailTemplateEdit").addClass("active-edit");
    $(".save-email-temp").fadeIn();
  });
  $(".save-email-temp").click(function() {
    $("#emailTemplateEdit").removeAttr("contenteditable", "true");
    $(".save-email-temp").fadeOut();
    $("#emailTemplateEdit").removeClass("active-edit");
  });

  // edit sms template
  $(".save-sms-temp").hide();
  $(".edit-sms-temp").click(function() {
    $("#smsTemplateEdit").attr("contenteditable", "true");
    $("#smsTemplateEdit").addClass("active-edit");
    $(".save-sms-temp").fadeIn();
  });
  $(".save-sms-temp").click(function() {
    $("#smsTemplateEdit").removeAttr("contenteditable", "true");
    $(".save-sms-temp").fadeOut();
    $("#smsTemplateEdit").removeClass("active-edit");
  });

  // edit whatsapp template
  $(".save-whatsapp-temp").hide();
  $(".edit-whatsapp-temp").click(function() {
    $("#whatsappTemplateEdit").attr("contenteditable", "true");
    $("#whatsappTemplateEdit").addClass("active-edit");
    $(".save-whatsapp-temp").fadeIn();
  });
  $(".save-whatsapp-temp").click(function() {
    $("#whatsappTemplateEdit").removeAttr("contenteditable", "true");
    $(".save-whatsapp-temp").fadeOut();
    $("#whatsappTemplateEdit").removeClass("active-edit");
  });

  // Selectables
  $("#selectable").selectable();
  $("#selectable2").selectable();
  $("#selectable3").selectable();
  $("#selectable h3").removeClass("ui-selected");

  $(init);

  function init() {
    $(".droppable-area1, .droppable-area2, .droppable-area3, .droppable-area4")
      .sortable({
        connectWith: ".connected-sortable",
        stack: ".connected-sortable ul",
      })
      .disableSelection();
  }

  // toggle checkbox
  $(".checkbox-all").click(function() {
    var checkBoxes = $("input[name=recipients\\[\\]]");
    checkBoxes.prop("checked", !checkBoxes.prop("checked"));
  });

  // Within a Company/Contact/leaf
  $(".about-contact-toggler").click(function() {
    $(".about-contact").toggleClass("d-none");
    $(".eng-prediction").addClass("d-none");
  });

  $(".about-within").click(function() {
    $(".about-within .fa-angle-right").toggleClass("d-none");
    $(".about-within .fa-angle-down").toggleClass("d-none");
  });

  // engagement prediction show and hide
  $(".ep-toggler").click(function() {
    $(".eng-prediction").toggleClass("d-none");
    $(".about-contact").addClass("d-none");
    $(".leadWorkflowContent").addClass("d-none");
  });
  $(".ep-within").click(function() {
    $(".ep-within .fa-angle-right").toggleClass("d-none");
    $(".ep-within .fa-angle-down").toggleClass("d-none");
  });

  // Leadworkflow show and hide
  $(".lw-toggler").click(function() {
    $(".leadWorkflowContent").toggleClass("d-none");
    $(".about-contact").addClass("d-none");
    $(".eng-prediction").addClass("d-none");
  });
  $(".lw-within").click(function() {
    $(".lw-within .fa-angle-right").toggleClass("d-none");
    $(".lw-within .fa-angle-down").toggleClass("d-none");
  });

  // add active class to contnet body headers
  $(".content-body-header li a").click(function() {
    $("li a").removeClass("cbh-active");
    $(this).addClass("cbh-active");
  });
  // $('.content-body-header li a svg').click(function () {
  //     $('li a span svg').removeClass("fa-angle-right");
  //     $(this).addClass("fa-angle-down");
  // });

  // Rich text editor
  // tslint:disable-next-line:max-line-length
  var colorPalette = [
    "000000",
    "FF9966",
    "6699FF",
    "99FF66",
    "CC0000",
    "00CC00",
    "0000CC",
    "333333",
    "0066FF",
    "FFFFFF",
  ];
  var forePalette = $(".fore-palette");
  var backPalette = $(".back-palette");

  for (var i = 0; i < colorPalette.length; i++) {
    // tslint:disable-next-line:max-line-length

    forePalette.append(
      '<a href="#" data-command="forecolor" data-value="' +
        "#" +
        colorPalette[i] +
        '" style="background-color:' +
        "#" +
        colorPalette[i] +
        ';" class="palette-item"></a>'
    );
    backPalette.append(
      '<a href="#" data-command="backcolor" data-value="' +
        "#" +
        colorPalette[i] +
        '" style="background-color:' +
        "#" +
        colorPalette[i] +
        ';" class="palette-item"></a>'
    );
  }

  $(".toolbar a").click(function(e) {
    var command = $(this).data("command");
    if (command === "h1" || command === "h2" || command === "p") {
      document.execCommand("formatBlock", false, command);
    }
    if (command === "forecolor" || command === "backcolor") {
      document.execCommand(
        $(this).data("command"),
        false,
        $(this).data("value")
      );
    }
    if (command === "createlink" || command === "insertimage") {
      url = prompt("Enter the link here: ", "http://");
      document.execCommand($(this).data("command"), false, url);
    } else {
      document.execCommand($(this).data("command"), false, null);
    }
  });

  // placeholders
  $("#editor").attr("placeholder", "Enter note here");

  // select 2 dropdown multiple select
  $("#mselect0").chosen();
  $("#mselect").chosen();
  $("#mselect1").chosen();
  $("#mselect2").chosen();
  $("#mselect3").chosen();
  $("#mselect4").chosen();
  $("#mselect5").chosen();
  $("#mselect6").chosen();
  $("#mselect7").chosen();
  $("#mselect8").chosen();
  $("#mselect9").chosen();
  $("#mselect10").chosen();
  $("#mselect11").chosen();
  $("#mselect12").chosen();
  $("#mselect13").chosen();
  $("#mselect14").chosen();

  // emoji plugin
  $.getScript("assets/js/modules/emojionearea.min.js", function() {
    $("#emoji-task-comments").emojioneArea();
    $("#emoji-tasks").emojioneArea();
  });

  // text-editor
  $.getScript("assets/js/modules/jquery.richtext.min.js", function() {
    $(".txtEditor").richText();
    $("#txtEditor").richText();
    $("#txtEditor2").richText();
    $("#txtEditor3").richText();
    $("#txtEditor4").richText();
    $("#txtEditor5").richText();
    $("#txtEditor6").richText();
    $("#txtEditor7").richText();
    $(".richText-editor").addClass("emoji1");
  });

  // schedule
  $(".fc-day").click(function() {
    $(".calendar").hide("slow");
    $(".calendar-int-container").hide("slow");
    $(".add-meeting").removeClass("d-none");
  });
  $(".fc-content-skeleton tbody").click(function() {
    $("#calendar").hide("slow");
    $(".calendar-int-container").hide("slow");
    $(".add-meeting").removeClass("d-none");
  });

  // View more options tool tip
  $("td:last-of-type").attr("title", "View more options");
  $("td:last-of-type").attr("data-toggle", "tooltip");
  $("td:last-of-type").addClass("tooltip-test");
  // $("td:last-of-type").attr("data-toggle", "tooltip");
  // $("td:last-of-type").attr("data-placement", "left");
  $(".table-editable td:last-of-type").removeAttr("title", "View more options");
  $(".eng-table td:last-of-type").removeAttr("title", "View more options");

  // full calendar
  document.addEventListener("DOMContentLoaded", function() {
    var calendarEl = document.getElementById("calendar");

    if (calendarEl) {
      var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ["interaction", "dayGrid"],
        header: {
          left: "prevYear,prev,next,nextYear today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        },
        defaultDate: "2019-04-12",
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: [
          {
            title: "All Day Event",
            start: "2019-04-01",
          },
          {
            title: "Long Event",
            start: "2019-04-07",
            end: "2019-04-10",
          },
          {
            groupId: 999,
            title: "Repeating Event",
            start: "2019-04-09T16:00:00",
          },
          {
            groupId: 999,
            title: "Repeating Event",
            start: "2019-04-16T16:00:00",
          },
          {
            title: "Conference",
            start: "2019-04-11",
            end: "2019-04-13",
          },
          {
            title: "Meeting",
            start: "2019-04-12T10:30:00",
            end: "2019-04-12T12:30:00",
          },
          {
            title: "Lunch",
            start: "2019-04-12T12:00:00",
          },
          {
            title: "Meeting",
            start: "2019-04-12T14:30:00",
          },
          {
            title: "Happy Hour",
            start: "2019-04-12T17:30:00",
          },
          {
            title: "Dinner",
            start: "2019-04-12T20:00:00",
          },
          {
            title: "Birthday Party",
            start: "2019-04-13T07:00:00",
          },
          {
            title: "Click for Google",
            url: "http://google.com/",
            start: "2019-04-28",
          },
        ],
      });
      calendar.render();
    }
  });

  // upload picture
  var readURL = function(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function(e) {
        $(".avatar").attr("src", e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
    }
  };

  $(".file-upload").on("change", function() {
    readURL(this);
  });
  // on scroll dont show sub nav
  var position = $(window).scrollTop();

  // should start at 0

  $(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll > position) {
      // console.log('scrollDown');
      $(".sub-nav").fadeOut("fast");
      $("nav").addClass("box-shadow");
    } else {
      // console.log('scrollUp');
      $(".sub-nav").fadeIn("fast");
      $("nav").removeClass("box-shadow");
    }
    position = scroll;
  });

  // editable tables

  var $TABLE = $("#table");
  var $TABLE2 = $("#table2");
  var $BTN = $("#export-btn");
  var $EXPORT = $("#export");

  $(".table-add").click(function() {
    var $clone = $TABLE
      .find("tr.hide")
      .clone(true)
      .removeClass("hide table-line");
    $TABLE.find("table").append($clone);
  });

  $(".table-add2").click(function() {
    var $clone2 = $TABLE2
      .find("tr.hide")
      .clone(true)
      .removeClass("hide table-line");
    $TABLE2.find("table").append($clone2);
  });

  $(".table-remove").click(function() {
    $(this)
      .parents("tr")
      .detach();
  });

  $(".table-up").click(function() {
    var $row = $(this).parents("tr");
    if ($row.index() === 1) {
      return;
    } // Don't go above the header
    $row.prev().before($row.get(0));
  });

  $(".table-down").click(function() {
    var $row = $(this).parents("tr");
    $row.next().after($row.get(0));
  });

  // A few jQuery helpers for exporting only
  jQuery.fn.pop = [].pop;
  jQuery.fn.shift = [].shift;

  $BTN.click(function() {
    var $rows = $TABLE.find("tr:not(:hidden)");
    var headers = [];
    var data = [];

    // Get the headers (add special header logic here)
    $($rows.shift())
      .find("th:not(:empty)")
      .each(function() {
        headers.push(
          $(this)
            .text()
            .toLowerCase()
        );
      });

    // Turn all existing rows into a loopable array
    $rows.each(function() {
      var $td = $(this).find("td");
      var h = {};

      // Use the headers from earlier to name our hash keys
      headers.forEach(function(header, i) {
        h[header] = $td.eq(i).text();
      });

      data.push(h);
    });

    // Output the result
    $EXPORT.text(JSON.stringify(data));
  });

  // Progressive deal workflow
  var navListItems = $("div.setup-panel div a"),
    allWells = $(".setup-content"),
    allNextBtn = $(".nextBtn");

  allWells.hide();

  navListItems.click(function(e) {
    var $target = $($(this).attr("href")),
      $item = $(this);

    if (!$item.hasClass("disabled")) {
      navListItems.removeClass("btn-success").addClass("btn-default");
      $item.addClass("btn-success");
      allWells.hide();
      $target.show();
      $target.find("input:eq(0)").focus();
    }
  });

  allNextBtn.click(function() {
    var curStep = $(this).closest(".setup-content"),
      curStepBtn = curStep.attr("id"),
      nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]')
        .parent()
        .next()
        .children("a"),
      curInputs = curStep.find("input[type='text'],input[type='url']"),
      isValid = true;

    $(".form-group").removeClass("has-error");
    for (var i = 0; i < curInputs.length; i++) {
      if (!curInputs[i].validity.valid) {
        isValid = false;
        $(curInputs[i])
          .closest(".form-group")
          .addClass("has-error");
      }
    }

    if (isValid) {
      nextStepWizard.removeAttr("disabled").trigger("click");
    }
  });

  $("div.setup-panel div a.btn-success").trigger("click");

  // Progress BArs
  $("#demo").on("click", function() {
    var progress = parseInt(
      ($("#pg").width() /
        $("#pg")
          .parent()
          .width()) *
        100
    );
    $("#pg").width(progress + 10 + "%");
    $("#pg").html(progress + 10 + "%");
  });

  // Progress BArs end

  // target gauge chart
  window.feed = function(callback) {
    var tick = {};
    tick.plot0 = Math.ceil(350 + Math.random() * 500);
    callback(JSON.stringify(tick));
  };

  var myConfig = {
    type: "gauge",
    globals: {
      fontSize: 25,
    },
    plotarea: {
      marginTop: 80,
    },
    plot: {
      size: "100%",
      valueBox: {
        placement: "center",
        text: "%v", //default
        fontSize: 35,
        rules: [
          {
            rule: "%v >= 700",
            text: "%v<br>EXCELLENT",
          },
          {
            rule: "%v < 700 && %v > 640",
            text: "%v<br>Good",
          },
          {
            rule: "%v < 640 && %v > 580",
            text: "%v<br>Fair",
          },
          {
            rule: "%v <  580",
            text: "%v<br>Bad",
          },
        ],
      },
    },
    tooltip: {
      borderRadius: 5,
    },
    scaleR: {
      aperture: 180,
      minValue: 300,
      maxValue: 850,
      step: 50,
      center: {
        visible: false,
      },
      tick: {
        visible: false,
      },
      item: {
        offsetR: 0,
        rules: [
          {
            rule: "%i == 9",
            offsetX: 15,
          },
        ],
      },
      labels: [
        "300",
        "",
        "",
        "",
        "",
        "",
        "580",
        "640",
        "700",
        "750",
        "",
        "1000",
      ],
      ring: {
        size: 50,
        rules: [
          {
            rule: "%v <= 580",
            backgroundColor: "#E53935",
          },
          {
            rule: "%v > 580 && %v < 640",
            backgroundColor: "#EF5350",
          },
          {
            rule: "%v >= 640 && %v < 700",
            backgroundColor: "#FFA726",
          },
          {
            rule: "%v >= 700",
            backgroundColor: "#29B6F6",
          },
        ],
      },
    },
    refresh: {
      type: "feed",
      transport: "js",
      url: "feed()",
      interval: 1500,
      resetTimeout: 1000,
    },
    series: [
      {
        values: [755], // starting value
        backgroundColor: "black",
        indicator: [10, 10, 10, 10, 0.75],
        animation: {
          effect: 2,
          method: 1,
          sequence: 4,
          speed: 900,
        },
      },
    ],
  };

  // $.getScript("http://cdn.zingchart.com/zingchart.min.js", function() {
  //   zingchart.render({
  //     id: "myChart",
  //     data: myConfig,
  //     height: "500",
  //     width: "100%",
  //   });
  // });

  // target gauge chart end

  // CURVATURE
  function controlPoints(p) {
    // given the points array p calculate the control points
    var pc = [];
    for (var i = 1; i < p.length - 1; i++) {
      var dx = p[i - 1].x - p[i + 1].x; // difference x
      var dy = p[i - 1].y - p[i + 1].y; // difference y
      // the first control point
      var x1 = p[i].x - dx * t;
      var y1 = p[i].y - dy * t;
      var o1 = {
        x: x1,
        y: y1,
      };

      // the second control point
      var x2 = p[i].x + dx * t;
      var y2 = p[i].y + dy * t;
      var o2 = {
        x: x2,
        y: y2,
      };

      // building the control points array
      pc[i] = [];
      pc[i].push(o1);
      pc[i].push(o2);
    }
    return pc;
  }

  function drawCurve(p) {
    var pc = controlPoints(p); // the control points array

    ctx.beginPath();
    //ctx.moveTo(p[0].x, B.y- 25);
    ctx.lineTo(p[0].x, p[0].y);
    // the first & the last curve are quadratic Bezier
    // because I'm using push(), pc[i][1] comes before pc[i][0]
    ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);

    if (p.length > 2) {
      // central curves are cubic Bezier
      for (var i = 1; i < p.length - 2; i++) {
        ctx.bezierCurveTo(
          pc[i][0].x,
          pc[i][0].y,
          pc[i + 1][1].x,
          pc[i + 1][1].y,
          p[i + 1].x,
          p[i + 1].y
        );
      }
      // the first & the last curve are quadratic Bezier
      var n = p.length - 1;
      ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
    }

    //ctx.lineTo(p[p.length-1].x, B.y- 25);
    ctx.stroke();
    ctx.save();
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
  }

  function arrayMax(array) {
    return Math.max.apply(Math, array);
  }

  function arrayMin(array) {
    return Math.min.apply(Math, array);
  }

  function oMousePos(canvas, evt) {
    var ClientRect = canvas.getBoundingClientRect();
    return {
      //objeto
      x: Math.round(evt.clientX - ClientRect.left),
      y: Math.round(evt.clientY - ClientRect.top),
    };
  }
  // Tooltips Initialization
  $('[data-toggle="tooltip"]').tooltip();
  //  embed company profile link-
  $(".tenant").attr("href", "profile-company.html");
  $(".accordion .card-header button").attr(
    "title",
    "Click to view/edit fields"
  );
  // embed company profile link end
});
