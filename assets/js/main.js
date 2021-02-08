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