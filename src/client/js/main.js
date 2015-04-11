$(function() {
  $( "#slider" ).slider({
    min: 1,
    max: 20,
    step: 1,
    value: 5,
    slide: function (event, ui) {
      $("#distance").html(ui.value);
    }
  });
});
