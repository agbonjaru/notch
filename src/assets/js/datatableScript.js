$.getScript("assets/js/modules/datatables.min.js", function() {
  // table
  $("#dtBasicExample").DataTable({
    // "searching": false,
    // "bLengthChange": false,
    pagingType: "simple_numbers", // "simple" option for 'Previous' and 'Next' buttons only
  });
  $("#dtBasicExample2").DataTable({
    // "searching": false,
    // "bLengthChange": false,
    pagingType: "simple_numbers", // "simple" option for 'Previous' and 'Next' buttons only
  });
  $(".dataTables_length").addClass("bs-select");
  $(".form-control").addClass("browser-default");

  $("#dtBasicExample_filter input").addClass("content-list-search");
});
