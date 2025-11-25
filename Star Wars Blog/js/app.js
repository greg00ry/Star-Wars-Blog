document.addEventListener("DOMContentLoaded", () => {
  Sidebar.init();

  const cards = document.querySelectorAll(".category-card[data-type]");

  cards.forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); 

      const type = card.dataset.type;
      const submenu = document.getElementById(`submenu-${type}`);

      // otwórz sidebar
      Sidebar.el.classList.add("open"); 
      // załaduj dane do odpowiedniego submenu
      Sidebar.toggleSubmenu(type, submenu);

      // przewiń na górę (żeby sidebar i dane były od razu widoczne)
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
});
