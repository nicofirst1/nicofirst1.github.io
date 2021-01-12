
// Download CV

//Create PDf from HTML...
function download_cv(){
  const filename  = 'NicoloBrandizziCV.pdf';

  html2canvas(document.getElementById('cv_container'), 
              {scale: 1}
           ).then(canvas => {
    let pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298);
    pdf.save(filename);
  });

}


// Load navbar

$(function () {
  $("#nav-placeholder").load("html/navbar.html");

});

// disable resizing for cv
function no_resize() {
  var screenWidth = $(window).width();
  $('container').css('width', 1200 + 'px');
  $('container').css('height', 2000 + 'px');
}

// Load home on first load instance

function load() {
  $("#placeholder").load("html/cv/main.html");
  window.location.hash = "#cv"

}

// load cv parts
function load_cv(){
  $("#highlights-placeholder").load("../html/cv/highlights.html");
  $("#education-placeholder").load("../html/cv/sections/education.html");
  $("#research-int-placeholder").load("../html/cv/sections/research_int.html");
  $("#publication-placeholder").load("../html/cv/sections/publications.html");
  $("#experiences-placeholder").load("../html/cv/sections/experiences.html");

}

// Function to load correct html based on hash

$(window).on('hashchange', function () {

  let hash = window.location.hash
  if (hash == '#projects') {
    $("#placeholder").load("html/projects/main.html");
  } else if (hash == "#publications") {
    $("#placeholder").load("html/publications.html");

  } else if (hash == "#cv") {
    $("#placeholder").load("html/cv/main.html");

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

// Load project description based on hover
function show_project(prj) {

  let id = prj.id

  if (id == "ledypi") {
    $("#project-placeholder").load("../html/projects/ledypi.html");

  } else if (id == "robotic") {
    $("#project-placeholder").load("../html/projects/robotic.html");

  } else if (id == "motionbot") {
    $("#project-placeholder").load("../html/projects/motionbot.html");

  } else if (id == "mas-traffic") {
    $("#project-placeholder").load("../html/projects/mas_traffic.html");

  } else if (id == "ai-notes") {
    $("#project-placeholder").load("../html/projects/ai_notes.html");

  } else if (id == "rl-werewolf") {
    $("#project-placeholder").load("../html/projects/rl_werewolf.html");

  }
}