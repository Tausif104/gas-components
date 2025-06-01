// Get the tables
const gasTable = document.querySelector('.select-gas-components table tbody')
const selectedComponentsTable = document.querySelector(
  '.selected-components-table table tbody'
)
const gasCompositionTable = document.querySelector(
  '.gas-composition-table table tbody'
)

// Function to generate a unique ID for a component
function generateComponentId(id, description) {
  return `component-${id}-${description.toLowerCase().replace(/\s+/g, '-')}`
}

// Function to get component data from a row
function getComponentData(row) {
  const cells = row.getElementsByTagName('td')
  return {
    id: cells[0].textContent.trim(),
    description: cells[1].textContent.trim(),
    cas: cells[2].textContent.trim(),
    formula: cells[3].textContent.trim(),
    lastModified: cells[4].textContent.trim(),
    source: cells[5].textContent.trim(),
    componentId: generateComponentId(
      cells[0].textContent.trim(),
      cells[1].textContent.trim()
    ),
  }
}

// Function to create a selected component row
function createSelectedComponentRow(data) {
  const row = document.createElement('tr')
  row.id = data.componentId
  row.dataset.componentId = data.componentId
  row.innerHTML = `
    <td>${data.id}</td>
    <td>${data.description}</td>
    <td class="cross-icon"><i class="fas fa-times"></i></td>
  `
  return row
}

// Function to create a gas composition row
function createGasCompositionRow(data) {
  const row = document.createElement('tr')
  row.id = `composition-${data.componentId}`
  row.dataset.componentId = data.componentId
  row.innerHTML = `
    <td><img src="assets/images/drag-icon.png" alt=""></td>
    <td>${data.description}</td>
    <td>mol %</td>
    <td><input type="number" placeholder="Enter Value"></td>
    <td><input type="number" placeholder="Enter Value"></td>
    <td><input type="number" placeholder="Enter Value"></td>
  `
  return row
}

// Function to sync selection state
function syncSelectionState() {
  // Get all selected component IDs
  const selectedIds = new Set(
    Array.from(selectedComponentsTable.getElementsByTagName('tr')).map(
      (row) => row.dataset.componentId
    )
  )

  // Update gas components table
  const gasRows = gasTable.getElementsByTagName('tr')
  Array.from(gasRows).forEach((row) => {
    const data = getComponentData(row)
    if (selectedIds.has(data.componentId)) {
      row.classList.add('selected')
      row.style.backgroundColor = '#e3f2fd'
    } else {
      row.classList.remove('selected')
      row.style.backgroundColor = ''
      row.style.borderLeft = ''
      row.style.fontWeight = ''
    }
  })
}

// Function to sync gas composition table
function syncGasCompositionTable() {
  // Get the total row
  const totalRow = gasCompositionTable.querySelector(
    '.gas-composition-total-row'
  )

  // Clear all rows except total
  while (gasCompositionTable.firstChild) {
    if (gasCompositionTable.firstChild === totalRow) {
      break
    }
    gasCompositionTable.removeChild(gasCompositionTable.firstChild)
  }

  // Get all selected components
  const selectedRows = selectedComponentsTable.getElementsByTagName('tr')
  Array.from(selectedRows).forEach((row) => {
    const id = row.cells[0].textContent.trim()
    const description = row.cells[1].textContent.trim()
    const data = {
      id,
      description,
      componentId: row.dataset.componentId,
    }

    // Create and add new composition row
    const compositionRow = createGasCompositionRow(data)
    gasCompositionTable.insertBefore(compositionRow, totalRow)
  })
}

// Function to handle row click
function handleRowClick(row) {
  const data = getComponentData(row)
  const existingRow = document.getElementById(data.componentId)

  if (existingRow) {
    // Remove from selected components
    existingRow.remove()
    row.classList.remove('selected')
    row.style.backgroundColor = ''
  } else {
    // Add to selected components
    const newRow = createSelectedComponentRow(data)
    selectedComponentsTable.appendChild(newRow)

    // Add click handler for delete button
    const deleteButton = newRow.querySelector('.cross-icon')
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation()
      handleRowClick(row)
    })

    // Update selection state
    row.classList.add('selected')
    row.style.backgroundColor = '#e3f2fd'
  }

  // Sync gas composition table after any change
  syncGasCompositionTable()
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  // Add search functionality
  const searchInput = document.querySelector('.search-bar input[type="search"]')
  if (searchInput && gasTable) {
    searchInput.addEventListener('input', function (e) {
      const searchQuery = e.target.value.toLowerCase().trim()
      const rows = gasTable.getElementsByTagName('tr')

      Array.from(rows).forEach((row) => {
        const cells = row.getElementsByTagName('td')
        let found = false

        // Search through all cells except the first one (drag icon)
        for (let i = 1; i < cells.length; i++) {
          if (cells[i].textContent.toLowerCase().includes(searchQuery)) {
            found = true
            break
          }
        }

        // Show/hide row based on search match
        row.style.display = found ? '' : 'none'
      })
    })
  }

  // Add click handlers to gas component rows
  const gasRows = gasTable.getElementsByTagName('tr')
  Array.from(gasRows).forEach((row) => {
    row.addEventListener('click', () => handleRowClick(row))

    // Add hover effect
    row.addEventListener('mouseover', function () {
      if (!this.classList.contains('selected')) {
        this.style.backgroundColor = '#f5f5f5'
      }
    })

    row.addEventListener('mouseout', function () {
      if (!this.classList.contains('selected')) {
        this.style.backgroundColor = ''
      }
    })
  })

  // Add componentId to existing selected components
  const selectedRows = selectedComponentsTable.getElementsByTagName('tr')
  Array.from(selectedRows).forEach((row) => {
    const id = row.cells[0].textContent.trim()
    const description = row.cells[1].textContent.trim()
    const componentId = generateComponentId(id, description)
    row.id = componentId
    row.dataset.componentId = componentId

    // Add click handler for delete button
    const deleteButton = row.querySelector('.cross-icon')
    if (deleteButton) {
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation()
        const gasRow = Array.from(gasTable.getElementsByTagName('tr')).find(
          (r) => getComponentData(r).componentId === componentId
        )
        if (gasRow) {
          handleRowClick(gasRow)
        }
      })
    }
  })

  // Initial sync of selection state
  syncSelectionState()
  syncGasCompositionTable()

  // Add clear all button handler
  const clearAllButton = document.querySelector(
    '.button-wrapper button:last-child'
  )
  if (clearAllButton) {
    clearAllButton.addEventListener('click', () => {
      // Clear selected components
      selectedComponentsTable.innerHTML = ''

      // Clear selection state
      const gasRows = gasTable.getElementsByTagName('tr')
      Array.from(gasRows).forEach((row) => {
        row.classList.remove('selected')
        row.style.backgroundColor = ''
      })

      // Clear gas composition table except total row
      syncGasCompositionTable()
    })
  }
})
