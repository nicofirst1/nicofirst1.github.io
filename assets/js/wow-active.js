jQuery(document).ready(function($) {
    //new WOW().init();

    wow = new WOW({
        animateClass: 'animated',
        offset: 10,
        callback: function(box) {
            //console.log("boxx", box.id );
            if (box.id == "counterdiv") {
                runCounter();
            }
        },
    });
    wow.init();


    function runCounter() {
        //counter 
        $('.counter').each(function() {
            var $this = $(this),
                countTo = $this.attr('data-count');

            $({ countNum: $this.text() }).animate({
                    countNum: countTo
                },

                {

                    duration: 2000,
                    easing: 'linear',
                    step: function() {
                        $this.text(Math.floor(this.countNum));
                    },
                    complete: function() {
                        $this.text(this.countNum + "%");
                        //alert('finished');
                    }

                });



        });

    }

});