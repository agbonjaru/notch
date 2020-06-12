// chat box dark
// (function() {
//
//     $('#live-chat header').on('click', function() {
//
//         $('.chat').slideToggle(300, 'swing');
//         $('.chat-message-counter').fadeToggle(300, 'swing');
//
//     });
//
//     $('.chat-close').on('click', function(e) {
//
//         e.preventDefault();
//         $('#live-chat').fadeOut(300);
//
//     });
//
// }) ();

// General Triggers
$(function () {

    $('.dropdown-trigger').dropdown();
//        chat box

    $(".ai-character").click(function () {
        $(".ai-chat-card").toggleClass("d-none");
    });
    $(".chat-close").click(function () {
        $(".ai-chat-card").toggleClass("d-none")
    });

    // Trigger content-editable
    $('.edit-content').click(function () {
        $('.content-edit').attr('contenteditable', 'true');
    });

    // Edit Category name initialization

    $('#editCatName').click(function () {
        $('#editName').slideDown(400);
    });
    $('#editCatName2').click(function () {
        $('#editName2').slideDown(400);
    });

    // view/edit role setting new page
    $(".edit-role").click(function () {
        window.open("role-setting-edit.html", "_self");
        // $("body").load("role-setting-edit.html");
    });

    // view/edit role setting new page
    $(".edit-email-seq").click(function () {
        window.open("email-temp-sequencing-edit.html", "_self");
        // $("body").load("role-setting-edit.html");
    });

    // login submit
    $("#login-submit").click(function () {
        // window.open("dashboard.html", "_self");
    });

    // Lead workflow send welcome message by email, sms, whatsapp activation
    $("#welcome-by-email").hide();
    $(".welcome-by-email").click(function () {
        $("#welcome-by-email").show("")
    });
    $(".welcome-by-email").click(function () {
        $("#welcome-by-sms").hide("")
    });

    $("#welcome-by-sms").hide();
    $(".welcome-by-sms").click(function () {
        $("#welcome-by-sms").show("")
    });
    $(".welcome-by-sms").click(function () {
        $("#welcome-by-email").hide("")
    });


    // edit-role-name in role settings
    $("#edit-role-name").click(function () {
        $(this).hide();
        $("#role-name-edit").attr('contenteditable', 'true', 'slow');
        $("#role-name-edit").addClass('editable');
        $('#save-role-name').show();
    });
    $("#save-role-name").click(function () {
        $("#role-name-edit").removeAttr('contenteditable', 'slow');
        $("#role-name-edit").removeClass('editable');
        $(this).hide();
        $('#edit-role-name').show();
    });
    $(".edit-role-name").click(function () {
        $(".role-name-edit").attr('contenteditable', 'true', 'slow');
        $(".role-name-edit").addClass('editable');
        $(this).hide();
        $('.save-role-name').show();
    });
    $(".save-role-name").click(function () {
        $(".role-name-edit").removeAttr('contenteditable', 'slow');
        $(".role-name-edit").removeClass('editable');
        $(this).hide();
        $('.edit-role-name').show();
    });

    // sortabel workflow transitions
    $(function () {
        $("#sortable").sortable();
        $("#sortable2").sortable();
        $("#sortable").disableSelection();
    });

    // mselect custom input
    $(function () {
        $(".chosen-choices").addClass("gen-input2");
        $(".chosen-single").addClass("gen-input2");
    });

    // edit email template
    $(".save-email-temp").hide();
    $(".edit-email-temp").click(function () {
        $("#emailTemplateEdit").attr("contenteditable", 'true');
        $("#emailTemplateEdit").addClass("active-edit");
        $("#whatsappTemplateEdit").attr("contenteditable", 'true');
        $("#whatsappTemplateEdit").addClass("active-edit");
        $(".save-email-temp").fadeIn();

    });
    $(".save-email-temp").click(function () {
        $("#emailTemplateEdit").removeAttr("contenteditable", 'true');
        $(".save-email-temp").fadeOut();
        $("#emailTemplateEdit").removeClass("active-edit");

    });

    // Selectables
    $(function () {
        $("#selectable").selectable();
        $("#selectable2").selectable();
        $("#selectable3").selectable();
        $("#selectable h3").removeClass("ui-selected")
    });


    $(init);

    function init() {
        $(".droppable-area1, .droppable-area2, .droppable-area3, .droppable-area4").sortable({
            connectWith: ".connected-sortable",
            stack: '.connected-sortable ul'
        }).disableSelection();
    }

//        search nav
//     $(".nav-search-icon").click(function () {
//         $(".nav-search").fadeToggle("");
//     });
});


// nav search

$(document).ready(function () {
    $(".nav-search").hide();

    $('.nav_search_icon').click(function (e) {

        e.preventDefault(); // stops link from making page jump to the top
        e.stopPropagation(); // when you click the button, it stops the page from seeing it as clicking the body too
        $('.nav-search').fadeToggle();

    });

    $('.nav-search').click(function (e) {

        e.stopPropagation(); // when you click within the content area, it stops the page from seeing it as clicking the body too

    });
    $('body').click(function () {
        $('.nav-search').hide();
    });
});

// table
$(document).ready(function () {
    $('#dtBasicExample').DataTable({
        // "searching": false,
        // "bLengthChange": false,
        "pagingType": "simple_numbers" // "simple" option for 'Previous' and 'Next' buttons only
    });
    $('.dataTables_length').addClass('bs-select');
    $(".form-control").addClass("browser-default");

    // $(".table-row").click(function () {
    //     document.location.href = ("login.html");
    //     }
    // )
    $("#dtBasicExample_filter input").addClass("content-list-search");

    // toggle checkbox
    $(".checkbox-all").click(function () {
        var checkBoxes = $("input[name=recipients\\[\\]]");
        checkBoxes.prop("checked", !checkBoxes.prop("checked"));
    });

    // $(".fin-pry-btn").click(function () {
    //     //this will find the selected website from the dropdown
    //     var go_to_url = $(".content-list-search").find(":selected").val();
    //     //this will redirect us in same window
    //     document.location.href = go_to_url;
    // });

});

// Within a Company/Contact
$(document).ready(function () {
    $(".about-contact-toggler").click(function () {
        $(".about-contact").toggleClass("d-none");
    });

    $(".about-within").click(function () {
        $(".about-within .fa-angle-right").toggleClass("d-none");
        $(".about-within .fa-angle-down").toggleClass("d-none");
    });


    // Rich text editor
    var colorPalette = ['000000', 'FF9966', '6699FF', '99FF66', 'CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
    var forePalette = $('.fore-palette');
    var backPalette = $('.back-palette');

    for (var i = 0; i < colorPalette.length; i++) {
        forePalette.append('<a href="#" data-command="forecolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="palette-item"></a>');
        backPalette.append('<a href="#" data-command="backcolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="palette-item"></a>');
    }

    $('.toolbar a').click(function (e) {
        var command = $(this).data('command');
        if (command == 'h1' || command == 'h2' || command == 'p') {
            document.execCommand('formatBlock', false, command);
        }
        if (command == 'forecolor' || command == 'backcolor') {
            document.execCommand($(this).data('command'), false, $(this).data('value'));
        }
        if (command == 'createlink' || command == 'insertimage') {
            url = prompt('Enter the link here: ', 'http:\/\/');
            document.execCommand($(this).data('command'), false, url);
        }
        else document.execCommand($(this).data('command'), false, null);
    });

    // placeholders
    $("#editor").attr("placeholder", "Enter note here");

});

// select 2 dropdown multiple select
$(document).ready(function () {
    // $('.js-example-basic-multiple').select2();
    // $('select').formSelect();
    // var instance = M.FormSelect.getInstance(elem);
    $('#mselect0').chosen();
    $('#mselect').chosen();
    $('#mselect1').chosen();
    $('#mselect2').chosen();
    $('#mselect3').chosen();
    $('#mselect4').chosen();
    $('#mselect5').chosen();
    $('#mselect6').chosen();
    $('#mselect7').chosen();
    $('#mselect8').chosen();
    $('#mselect9').chosen();
    $('#mselect10').chosen();
    $('#mselect11').chosen();
    $('#mselect12').chosen();
    $('#mselect13').chosen();
    $('#mselect14').chosen();
    // $('.search-field').val(Add Clients);


});

// emoji plugin
$(document).ready(function () {
    $("#emoji-task-comments").emojioneArea();
    $("#emoji-tasks").emojioneArea();
    // $(".emoji").attr('id', 'emoji-tasks');

});

// text-editor
$(document).ready(function () {
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
$(function () {
    $(".fc-day").click(function () {
        $(".calendar").hide("slow");
        $(".calendar-int-container").hide("slow");
        $(".add-meeting").removeClass("d-none");

    });
    $(".fc-content-skeleton tbody").click(function () {
        $("#calendar").hide("slow");
        $(".calendar-int-container").hide("slow");
        $(".add-meeting").removeClass("d-none");
    });


    // View more options tool tip
    $("td:last-of-type").attr("title", "View more options");
    // $("td:last-of-type").attr("data-toggle", "tooltip");
    // $("td:last-of-type").attr("data-placement", "left");
    $(".table-editable td:last-of-type").removeAttr("title", "View more options");
    // $('[data-toggle="tooltip"]').tooltip();
});
// full calendar

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['interaction', 'dayGrid'],
        header: {
            left: 'prevYear,prev,next,nextYear today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        defaultDate: '2019-04-12',
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: [
            {
                title: 'All Day Event',
                start: '2019-04-01'
            },
            {
                title: 'Long Event',
                start: '2019-04-07',
                end: '2019-04-10'
            },
            {
                groupId: 999,
                title: 'Repeating Event',
                start: '2019-04-09T16:00:00'
            },
            {
                groupId: 999,
                title: 'Repeating Event',
                start: '2019-04-16T16:00:00'
            },
            {
                title: 'Conference',
                start: '2019-04-11',
                end: '2019-04-13'
            },
            {
                title: 'Meeting',
                start: '2019-04-12T10:30:00',
                end: '2019-04-12T12:30:00'
            },
            {
                title: 'Lunch',
                start: '2019-04-12T12:00:00'
            },
            {
                title: 'Meeting',
                start: '2019-04-12T14:30:00'
            },
            {
                title: 'Happy Hour',
                start: '2019-04-12T17:30:00'
            },
            {
                title: 'Dinner',
                start: '2019-04-12T20:00:00'
            },
            {
                title: 'Birthday Party',
                start: '2019-04-13T07:00:00'
            },
            {
                title: 'Click for Google',
                url: 'http://google.com/',
                start: '2019-04-28'
            }
        ]
    });

    calendar.render();
});


// upload picture

$(document).ready(function () {


    var readURL = function (input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('.avatar').attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    };


    $(".file-upload").on('change', function () {
        readURL(this);
    });
// on scroll dont show sub nav
    var position = $(window).scrollTop();

// should start at 0

    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll > position) {
            // console.log('scrollDown');
            $('.sub-nav').fadeOut("fast");
            $('nav').addClass("box-shadow");
        } else {
            // console.log('scrollUp');
            $('.sub-nav').fadeIn("fast");
            $('nav').removeClass("box-shadow");
        }
        position = scroll;
    });
});


// editable tables

var $TABLE = $('#table');
var $BTN = $('#export-btn');
var $EXPORT = $('#export');

$('.table-add').click(function () {
    var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
    $TABLE.find('table').append($clone);
});

$('.table-remove').click(function () {
    $(this).parents('tr').detach();
});

$('.table-up').click(function () {
    var $row = $(this).parents('tr');
    if ($row.index() === 1) return; // Don't go above the header
    $row.prev().before($row.get(0));
});

$('.table-down').click(function () {
    var $row = $(this).parents('tr');
    $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.click(function () {
    var $rows = $TABLE.find('tr:not(:hidden)');
    var headers = [];
    var data = [];

// Get the headers (add special header logic here)
    $($rows.shift()).find('th:not(:empty)').each(function () {
        headers.push($(this).text().toLowerCase());
    });

// Turn all existing rows into a loopable array
    $rows.each(function () {
        var $td = $(this).find('td');
        var h = {};

// Use the headers from earlier to name our hash keys
        headers.forEach(function (header, i) {
            h[header] = $td.eq(i).text();
        });

        data.push(h);
    });

// Output the result
    $EXPORT.text(JSON.stringify(data));
});


// Progressive deal workflow

$(document).ready(function () {

    var navListItems = $('div.setup-panel div a'),
        allWells = $('.setup-content'),
        allNextBtn = $('.nextBtn');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-success').addClass('btn-default');
            $item.addClass('btn-success');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allNextBtn.click(function () {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

        $(".form-group").removeClass("has-error");
        for (var i = 0; i < curInputs.length; i++) {
            if (!curInputs[i].validity.valid) {
                isValid = false;
                $(curInputs[i]).closest(".form-group").addClass("has-error");
            }
        }

        if (isValid) nextStepWizard.removeAttr('disabled').trigger('click');
    });

    $('div.setup-panel div a.btn-success').trigger('click');
});

// intrnational tel dropdown
$(function () {
    var input = document.querySelector("#phone");
    window.intlTelInput(input, {
        // separateDialCode: true,
        utilsScript: "build/js/utils.js"
    });
    var input2 = document.querySelector("#phone2");
    window.intlTelInput(input2, {
        // separateDialCode: true,
        utilsScript: "build/js/utils.js"
    });
    var input3 = document.querySelector("#phone3");
    window.intlTelInput(input3, {
        // separateDialCode: true,
        utilsScript: "build/js/utils.js"
    });
// intrnational tel dropdown

});


// Progress BArs

$(document).ready(function () {
    $("#demo").on('click', function () {
        var progress = parseInt($("#pg").width() / $('#pg').parent().width() * 100);
        $("#pg").width((progress + 10) + '%');
        $("#pg").html((progress + 10) + '%');
    });
});

// Progress BArs end


// target gauge chart

$(function () {
    window.feed = function (callback) {
        var tick = {};
        tick.plot0 = Math.ceil(350 + (Math.random() * 500));
        callback(JSON.stringify(tick));
    };

    var myConfig = {
        type: "gauge",
        globals: {
            fontSize: 25
        },
        plotarea: {
            marginTop: 80
        },
        plot: {
            size: '100%',
            valueBox: {

                placement: 'center',
                text: '%v', //default
                fontSize: 35,
                rules: [
                    {
                        rule: '%v >= 700',
                        text: '%v<br>EXCELLENT'
                    },
                    {
                        rule: '%v < 700 && %v > 640',
                        text: '%v<br>Good'
                    },
                    {
                        rule: '%v < 640 && %v > 580',
                        text: '%v<br>Fair'
                    },
                    {
                        rule: '%v <  580',
                        text: '%v<br>Bad'
                    }
                ]
            }
        },
        tooltip: {
            borderRadius: 5
        },
        scaleR: {
            aperture: 180,
            minValue: 300,
            maxValue: 850,
            step: 50,
            center: {
                visible: false
            },
            tick: {
                visible: false
            },
            item: {
                offsetR: 0,
                rules: [
                    {
                        rule: '%i == 9',
                        offsetX: 15
                    }
                ]
            },
            labels: ['300', '', '', '', '', '', '580', '640', '700', '750', '', '1000'],
            ring: {
                size: 50,
                rules: [
                    {
                        rule: '%v <= 580',
                        backgroundColor: '#E53935'
                    },
                    {
                        rule: '%v > 580 && %v < 640',
                        backgroundColor: '#EF5350'
                    },
                    {
                        rule: '%v >= 640 && %v < 700',
                        backgroundColor: '#FFA726'
                    },
                    {
                        rule: '%v >= 700',
                        backgroundColor: '#29B6F6'
                    }
                ]
            }
        },
        refresh: {
            type: "feed",
            transport: "js",
            url: "feed()",
            interval: 1500,
            resetTimeout: 1000
        },
        series: [
            {
                values: [755], // starting value
                backgroundColor: 'black',
                indicator: [10, 10, 10, 10, 0.75],
                animation: {
                    effect: 2,
                    method: 1,
                    sequence: 4,
                    speed: 900
                },
            }
        ]
    };

    zingchart.render({
        id: 'myChart',
        data: myConfig,
        height: '500',
        width: '100%'
    });

});

// target gauge chart end


// file upload dropzone

$(document).ready(function () {

    initFileUploader("#zdrop");

    function initFileUploader(target) {
        var previewNode = document.querySelector("#zdrop-template");
        previewNode.id = "";
        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);


        var zdrop = new Dropzone(target, {
            url: 'upload.php',
            maxFiles: 5,
            maxFilesize: 30,
            previewTemplate: previewTemplate,
            previewsContainer: "#previews",
            clickable: "#upload-label"
        });

        zdrop.on("addedfile", function (file) {
            $('.preview-container').css('visibility', 'visible');
        });

        zdrop.on("totaluploadprogress", function (progress) {
            var progr = document.querySelector(".progress .determinate");
            if (progr === undefined || progr === null)
                return;

            progr.style.width = progress + "%";
        });

        zdrop.on('dragenter', function () {
            $('.fileuploader').addClass("active");
        });

        zdrop.on('dragleave', function () {
            $('.fileuploader').removeClass("active");
        });

        zdrop.on('drop', function () {
            $('.fileuploader').removeClass("active");
        });

    }

});

// file upload dropzone end


// chart
var label = document.querySelector(".label");
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cw = c.width = 700;
var ch = c.height = 350;
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
    "2015": 9.0
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
    y: offset
}
var B = {
    x: offset,
    y: offset + chartHeight
}
var C = {
    x: offset + chartWidth,
    y: offset + chartHeight
}

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
var aStep = (chartHeight - 50) / (vData);

var Max = Math.ceil(arrayMax(valuesRy) / 10) * 10;
var Min = Math.floor(arrayMin(valuesRy) / 10) * 10;
var aStepValue = (Max - Min) / (vData);
console.log("aStepValue: " + aStepValue); //8 units
var verticalUnit = aStep / aStepValue;

var a = [];
ctx.textAlign = "right";
ctx.textBaseline = "middle";
for (var i = 0; i <= vData; i++) {

    if (i == 0) {
        a[i] = {
            x: A.x,
            y: A.y + 25,
            val: Max
        }
    } else {
        a[i] = {}
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
    if (i == 0) {
        b[i] = {
            x: B.x + bStep,
            y: B.y,
            val: propsRy[0]
        };
    } else {
        b[i] = {}
        b[i].x = b[i - 1].x + bStep;
        b[i].y = b[i - 1].y;
        b[i].val = propsRy[i]
    }
    drawCoords(b[i], 0, 3)
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

for (var prop in oData) {
    oDots[i] = {}
    oFlat[i] = {}

    oDots[i].x = b[i].x;
    oFlat[i].x = b[i].x;

    oDots[i].y = b[i].y - oData[prop] * verticalUnit - 25;
    oFlat[i].y = b[i].y - 25;

    oDots[i].val = oData[b[i].val];

    i++
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
c.addEventListener("mousemove", function (e) {
    label.innerHTML = "";
    label.style.display = "none";
    this.style.cursor = "default";

    var m = oMousePos(this, e);
    for (var i = 0; i < oDots.length; i++) {

        output(m, i);
    }

}, false);

function output(m, i) {
    ctx.beginPath();
    ctx.arc(oDots[i].x, oDots[i].y, 20, 0, 2 * Math.PI);
    if (ctx.isPointInPath(m.x, m.y)) {
        //console.log(i);
        label.style.display = "block";
        label.style.top = (m.y + 10) + "px";
        label.style.left = (m.x + 10) + "px";
        label.innerHTML = "<strong>" + propsRy[i] + "</strong>: " + valuesRy[i] + "%";
        c.style.cursor = "pointer";
    }
}

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
            y: y1
        };

        // the second control point
        var x2 = p[i].x + dx * t;
        var y2 = p[i].y + dy * t;
        var o2 = {
            x: x2,
            y: y2
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
            ctx.bezierCurveTo(pc[i][0].x, pc[i][0].y, pc[i + 1][1].x, pc[i + 1][1].y, p[i + 1].x, p[i + 1].y);
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
    return { //objeto
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
    }
}

// Tooltips Initialization
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

