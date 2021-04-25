(function($) {
    "use strict";

    // mobile menu
    $(".menu_on_btn").click(function() {
        $(".main_menu").addClass("on");
        $("body").addClass("fix");
    });

    $(".menu_off_btn").click(function() {
        $(".main_menu").removeClass("on");
        $("body").removeClass("fix");
    });
    // mobile menu

}(jQuery));


function darkMode(id) {
    console.log("aia")
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