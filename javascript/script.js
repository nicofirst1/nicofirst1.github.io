// Download CV
function download_cv2() {
  const filename = 'NicoloBrandizziCV.pdf';

  html2canvas(document.getElementById('cv_container'), {
    scale: 1
  }).then(canvas => {
    let pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save(filename);
  });

}



function download_cv() {
  const filename = 'NicoloBrandizziCV.pdf';

  var deferreds = [];
  let doc = new jsPDF('p', 'mm', 'a4');
  let container = document.getElementById('cv_container');
  var children = Array.from(container.children);
  console.log(children)
  for (var i = 0; i < children.length; i++) {
    var deferred = $.Deferred();
    deferreds.push(deferred.promise());
    generateCanvas(children[i], doc, deferred);
  }

  $.when.apply($, deferreds).then(function () { // executes after adding all images
    doc.save(filename);
  });

  function generateCanvas(elem, doc, deferred) {

    html2canvas(elem, {
      scale: 4,
      onrendered: function (canvas) {

        var img = canvas.toDataURL();
        doc.addImage(img, 'JPEG', 0, 0, 210, 297);
        doc.addPage();

        deferred.resolve();
      }
    });
  }

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

function init_colors() {
  console.log(document.getElementById("dark_color"))
  document.getElementById("dark_color").value = "#2c67fc";
  document.getElementById("light_color").value = "#e2f7ff";
  document.getElementById("gray_color").value = "#bbc6f0";
  document.getElementById("contrast_color").value = "#7f45eb";

}

// modify cv colors
function modify_color(elem) {
  console.log(elem)
  let id = elem.id;
  if (id.includes("light")) {
    less.modifyVars({
      light: elem.value
    });
  } else if (id.includes("dark")) {
    less.modifyVars({
      dark: elem.value
    });
  } else if (id.includes("gray")) {
    less.modifyVars({
      gray: elem.value
    });
  } else if (id.includes("contrast")) {
    less.modifyVars({
      other: elem.value
    });
  }

}

// Load home on first load instance

function load() {
  $("#placeholder").load("html/cv/main.html");
  window.location.hash = "#home"

}

// load cv parts
function load_cv() {
  $("#hl1-placeholder").load("../html/cv/highlights/hl1.html");
  $("#hl2-placeholder").load("../html/cv/highlights/hl2.html");
  $("#education-placeholder").load("../html/cv/sections/education.html");
  $("#research-int-placeholder").load("../html/cv/sections/research_int.html");
  $("#publication-placeholder").load("../html/cv/sections/publications.html");
  $("#experiences-placeholder").load("../html/cv/sections/experiences.html");
  $("#headline-placeholder").load("../html/cv/headline.html");

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

  } else if (id == "egg") {
    $("#project-placeholder").load("../html/projects/egg.html");

  }
}