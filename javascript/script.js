

  $(function(){
    $("#nav-placeholder").load("html/navbar.html");
  });



  $(window).on('hashchange', function () {

    let hash=window.location.hash
    if (hash == '#projects') {
        $("#placeholder").load("html/projects.html");
    }

    else if(hash == "#publications"){
        $("#placeholder").load("html/publications.html");

    }

    else if(hash == "#cv"){
        $("#placeholder").load("html/cv.html");

    }

    else if(hash == "#about"){
        $("#placeholder").load("html/about.html");

    }


    else{
        $("#placeholder").load("html/home.html");
    }


});