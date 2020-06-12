// intrnational tel dropdown
$.getScript("assets/js/modules/intlTelInput.js", function() {
  var input = document.querySelector("#phone");
  window.intlTelInput(input, {
    // separateDialCode: true,
    utilsScript: "build/js/utils.js",
  });
  var input2 = document.querySelector("#phone2");
  window.intlTelInput(input2, {
    // separateDialCode: true,
    utilsScript: "build/js/utils.js",
  });
  var input3 = document.querySelector("#phone3");
  window.intlTelInput(input3, {
    // separateDialCode: true,
    utilsScript: "build/js/utils.js",
  });
});
// intrnational tel dropdown
