

$(document).ready(function(){
    $('.menu_on_btn').on('click touchstart', function() {
        $(".main_menu").addClass("on");
        $("body").addClass("fix");
    });
});

$(document).ready(function(){
    $('.menu_off_btn').on('click touchstart', function() {
        $(".main_menu").removeClass("on");
        $("body").removeClass("fix");
    });
});

function darkMode(id) {
    var elem= document.getElementById(id);

    let light="invert(0)";
    let dark="invert(0.8)";
    if (elem.style.filter.includes(dark))
    {
        elem.style.filter= light;

    }else{
        elem.style.filter=dark;

    }
    

  }