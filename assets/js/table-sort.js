document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('.select-gas-components table')
  const headers = table.querySelectorAll('th')
  let currentSort = {
    column: null,
    direction: 'asc',
  }

  headers.forEach((header, index) => {
    // Skip the first column (ID) and last column (empty)
    if (index === 0 || index === headers.length - 1) return

    header.style.cursor = 'pointer'

    // Add sort indicator
    const sortIndicator = document.createElement('i')
    sortIndicator.className = 'fas fa-sort'
    sortIndicator.style.marginLeft = '5px'
    header.appendChild(sortIndicator)

    header.addEventListener('click', () => {
      const column = index
      const direction =
        currentSort.column === column && currentSort.direction === 'asc'
          ? 'desc'
          : 'asc'

      // Update sort indicators
      headers.forEach((h) => {
        const icon = h.querySelector('i')
        if (icon) {
          icon.className = 'fas fa-sort'
        }
      })

      const clickedIcon = header.querySelector('i')
      clickedIcon.className =
        direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'

      // Sort the table
      sortTable(table, column, direction)

      // Update current sort
      currentSort = { column, direction }
    })
  })

  function sortTable(table, column, direction) {
    const tbody = table.querySelector('tbody')
    const rows = Array.from(tbody.querySelectorAll('tr'))

    // Sort the rows
    rows.sort((a, b) => {
      const aValue = a.cells[column].textContent.trim()
      const bValue = b.cells[column].textContent.trim()

      // Check if the values are dates
      const aDate = new Date(aValue)
      const bDate = new Date(bValue)

      if (!isNaN(aDate) && !isNaN(bDate)) {
        return direction === 'asc' ? aDate - bDate : bDate - aDate
      }

      // Regular string comparison
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    // Reorder the rows in the table
    rows.forEach((row) => tbody.appendChild(row))
  }
})
