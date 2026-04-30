document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("[data-reveal]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((el) => {
    // efeito cascata só nos cards
    if (el.classList.contains("card")) {
      const cards = [...document.querySelectorAll(".card[data-reveal]")];
      const index = cards.indexOf(el);
      el.style.setProperty("--delay", `${index * 0.08}s`);
    }

    observer.observe(el);
  });
});