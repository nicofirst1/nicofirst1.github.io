// wait for the page to load
window.onload = function () {
  // get all the timeline items
  var timelineItems = document.querySelectorAll('.ag-timeline_item');
  // set a variable to store the currently active item
  var activeItem = null;

  // loop through each timeline item
  for (var i = 0; i < timelineItems.length; i++) {
    // add an event listener to each item to handle clicks
    timelineItems[i].addEventListener('click', function () {
      // if the clicked item is already active, do nothing
      if (this.classList.contains('js-ag-active')) {
        return;
      }

      // remove the active class from any currently active item
      if (activeItem !== null) {
        activeItem.classList.remove('js-ag-active');
      }

      // add the active class to the clicked item
      this.classList.add('js-ag-active');
      // set the clicked item as the currently active item
      activeItem = this;
    });
  }

  var container = document.querySelector('.certificate');
  var timelineHeight = document.querySelector('.ag-timeline').offsetHeight;
  var PADDING = 300;
  // update the active certificate based on the scroll position
  function updateActiveCertificate() {
    var scrollPosition = container.scrollTop + container.offsetHeight * 0.65 - PADDING;



    // add console log with text
    console.log("\n\nscrollPosition: " + scrollPosition + "px");


    // loop through each timeline item
    for (var i = 0; i < timelineItems.length; i++) {
      // get the position of the timeline item
      var itemTopPosition = timelineItems[i].offsetTop;
      var itemBottomPosition = itemTopPosition + timelineItems[i].offsetHeight;
      console.log("itemTopPosition: " + itemTopPosition + "px");
      console.log("itemBottomPosition: " + itemBottomPosition + "px");

      // if the item is in view, set it as the active item and set the current active item to inactive
      if (scrollPosition >= itemTopPosition && scrollPosition <= itemBottomPosition) {
        console.log("break on " + i + " item");
        if (activeItem !== null) {
          activeItem.classList.remove('js-ag-active');
        }
        timelineItems[i].classList.add('js-ag-active');
        activeItem = timelineItems[i];
        break;
      }


    }
  }

  // add an event listener to the project section_padding 
  // to update the active certificate on scroll
  container.addEventListener('scroll', updateActiveCertificate);

};