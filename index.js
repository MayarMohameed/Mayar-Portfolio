(function () {
    const toggle = document.getElementById("modeToggle");
    const root = document.documentElement;
  
    // Dark mode toggle
    toggle.addEventListener("click", () => {
      root.classList.toggle("dark");
      toggle.textContent = root.classList.contains("dark") ? "☀️" : "🌙";
    });
  
    // Reveal on scroll
    const reveals = document.querySelectorAll(".reveal");
  
    function revealElements() {
      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect().top;
        if (rect < window.innerHeight - 60) {
          el.classList.add("active");
        }
      });
    }
  
    window.addEventListener("scroll", revealElements);
    window.addEventListener("load", revealElements);
  })();
  