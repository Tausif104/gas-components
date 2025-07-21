document.addEventListener("DOMContentLoaded", function () {
  const themeSelect = document.querySelector(".theme-select");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Function to set theme
  function setTheme(theme) {
    if (theme === "system") {
      theme = prefersDarkScheme.matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    themeSelect.value = theme;
  }

  // Initialize theme
  const savedTheme = localStorage.getItem("theme") || "system";
  setTheme(savedTheme);

  // Handle theme selection change
  themeSelect.addEventListener("change", function () {
    setTheme(this.value);
  });

  // Listen for system theme changes
  prefersDarkScheme.addEventListener("change", (e) => {
    if (localStorage.getItem("theme") === "system") {
      setTheme("system");
    }
  });
});

const tables = [
  document.querySelector(".project-properties-table"),
  document.querySelector(".project-properties-table-two"),
  document.querySelector(".calculated-properties-table"),
  document.querySelector(".gas-composition-table"),
];

// Mouse wheel horizontal scroll sync
tables.forEach((table, index) => {
  table.addEventListener("wheel", (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      table.scrollLeft += e.deltaY;
      syncAllScroll(table);
    }
  });

  // Scrollbar sync
  table.addEventListener("scroll", () => {
    syncAllScroll(table);
  });
});

// Sync scrollLeft across all tables except the source
function syncAllScroll(sourceTable) {
  const scrollLeft = sourceTable.scrollLeft;
  tables.forEach((t) => {
    if (t !== sourceTable) {
      t.scrollLeft = scrollLeft;
    }
  });
}

function scrollTable(amount) {
  const wrapper = document.querySelector(
    ".project-properties-table.position-stickey"
  );
  if (wrapper) {
    wrapper.scrollLeft += amount;
  }
}

function updateLastRowBorder() {
  const table = document.querySelector(".selected-components-table");
  if (!table) return;

  const rows = table.querySelectorAll("tr");

  // First, remove any previously added "no-border" class
  rows.forEach((row) => row.classList.remove("no-border"));

  if (rows.length > 6) {
    rows[rows.length - 1].classList.add("no-border");
  }
}

// Run once on initial load
updateLastRowBorder();

// Watch for dynamic changes in the table body
const tableBody = document.querySelector(".selected-components-table tbody");

if (tableBody) {
  const observer = new MutationObserver(() => {
    updateLastRowBorder();
  });

  observer.observe(tableBody, { childList: true, subtree: false });
}
