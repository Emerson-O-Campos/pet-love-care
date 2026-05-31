document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("[data-reveal]");
  
  // Verifica se é mobile (largura <= 768px)
  const isMobile = window.innerWidth <= 768;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { 
      threshold: 0.12,
      rootMargin: "50px 0px"
    }
  );

  elements.forEach((el) => {
    // Efeito cascata SOMENTE em desktop (remove no mobile)
    if (el.classList.contains("card") && !isMobile) {
      const cards = [...document.querySelectorAll(".card[data-reveal]")];
      const index = cards.indexOf(el);
      el.style.setProperty("--delay", `${index * 0.08}s`);
    } else if (el.classList.contains("card") && isMobile) {
      // No mobile, remove delay completamente
      el.style.setProperty("--delay", "0s");
    }

    observer.observe(el);
  });
});
