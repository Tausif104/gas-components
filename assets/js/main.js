// Get the search input and table
const searchInput = document.querySelector('.search-bar input[type="search"]')
const gasTable = document.querySelector('.select-gas-components table tbody')

// Add event listener for search input
searchInput.addEventListener('input', function (e) {
  const searchTerm = e.target.value.toLowerCase()
  const rows = gasTable.getElementsByTagName('tr')

  // Loop through all table rows
  for (let row of rows) {
    const cells = row.getElementsByTagName('td')
    let found = false

    // Loop through all cells in the row
    for (let cell of cells) {
      // Skip the last cell (add button)
      if (cell.classList.contains('add-button')) continue

      const text = cell.textContent.toLowerCase()
      if (text.includes(searchTerm)) {
        found = true
        break
      }
    }

    // Show/hide row based on search match
    row.style.display = found ? '' : 'none'
  }
})
