document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const hrefFinal = href.split("/").pop().replace("./", "");

    if (hrefFinal === paginaAtual) {
      link.classList.add("active");
    }
  });
});