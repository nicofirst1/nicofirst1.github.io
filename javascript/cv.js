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
// disable resizing for cv
function no_resize() {
    var screenWidth = $(window).width();
    $('container').css('width', 1200 + 'px');
    $('container').css('height', 2000 + 'px');
}

function init_colors() {
    console.log(document.getElementById("dark_color"))
    document.getElementById("dark_color").value = "#042F33";
    document.getElementById("light_color").value = "#06727C";
    document.getElementById("gray_color").value = "#CBCDCD";
    document.getElementById("contrast_color").value = "#53A0A7";

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




function download_cv() {

    var opt = {
        margin: 0,
        filename: 'NicoloBrandizziCV.pdf',
        image: {
            type: 'jpeg',
            quality: 1
        },
        html2canvas: {
            scale: 2,

        },
        //height, width
        jsPDF: {
            unit: 'mm',
            format: [300, 300],
            orientation: 'portrait'
        },
        enableLinks: true,
        mode: ["avoid-all"],
    };


    let container = document.getElementById('cv_container');
    html2pdf(container, opt);


}