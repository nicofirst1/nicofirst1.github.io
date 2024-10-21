document.addEventListener("DOMContentLoaded", function () {
    const progressBar = document.getElementById("reading-progress");
  
    if (!progressBar) {
      console.error("Progress bar element not found");
      return;
    }
  
    // Function to update the progress bar width
    const updateProgressBar = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
  
      progressBar.style.width = `${scrollPercentage}%`;
    };
  
    // Listen for scroll events to update the progress bar
    window.addEventListener("scroll", updateProgressBar);
  });
  