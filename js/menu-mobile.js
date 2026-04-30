// Menu hamburguer mobile
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  const toggle = document.querySelector(".menu-toggle");
  const menuLinks = document.querySelectorAll("#main-menu a");

  if (!header || !toggle) return;

  // Overlay para fechar clicando fora
  let overlay = document.querySelector(".menu-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    document.body.appendChild(overlay);
  }

  const firstLink = menuLinks[0];

  const openMenu = () => {
    header.classList.add("menu-open");
    overlay.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    if (firstLink) firstLink.focus();
  };

  const closeMenu = () => {
    if (!header.classList.contains("menu-open")) return;

    header.classList.remove("menu-open");
    overlay.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

    toggle.focus();
  };

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.contains("menu-open");
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  // Fecha ao clicar em qualquer link do menu
  menuLinks.forEach((link) => link.addEventListener("click", closeMenu));

  // Fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Se voltar para desktop, garante que o menu feche
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
});