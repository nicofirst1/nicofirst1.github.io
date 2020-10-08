// Load navbar

$(function () {
  $("#nav-placeholder").load("html/navbar.html");
});


// Load home on first load instance

function load() {
  $("#placeholder").load("html/home.html");
  window.location.hash = "#home"
}


// Function to load correct html based on hash

$(window).on('hashchange', function () {

  let hash = window.location.hash
  if (hash == '#projects') {
    $("#placeholder").load("html/projects.html");
  } else if (hash == "#publications") {
    $("#placeholder").load("html/publications.html");

  } else if (hash == "#cv") {
    $("#placeholder").load("html/cv.html");

  } else if (hash == "#about") {
    $("#placeholder").load("html/about.html");

  } else {
    $("#placeholder").load("html/home.html");
  }

  // Activate the correct navbar button
  $('.navbar').find('.active').removeClass('active');
  $('.navbar a').each(function () {
    if (this.href.indexOf(hash) > -1) {
      $(this).addClass('active');
    }
  });


});