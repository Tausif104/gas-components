// Get the search input and table
const searchInput = document.querySelector('.search-bar input[type="search"]')
const gasTable = document.querySelector('.select-gas-components table tbody')
const selectedComponentsTable = document.querySelector(
  '.selected-components-table table tbody'
)
const gasCompositionTable = document.querySelector(
  '.gas-composition-table table tbody'
)
const clearAllButton = document.querySelector(
  '.button-wrapper button:last-child'
)

// Add event listeners for guarantee point radio buttons
const guaranteeRadios = document.querySelectorAll('input[type="radio"]')
guaranteeRadios.forEach((radio) => {
  radio.addEventListener('change', function () {
    if (this.checked) {
      // Uncheck all other radio buttons in the same row
      const row = this.closest('tr')
      const otherRadios = row.querySelectorAll('input[type="radio"]')
      otherRadios.forEach((otherRadio) => {
        if (otherRadio !== this) {
          otherRadio.checked = false
        }
      })
    }
  })
})

// Function to get component data from a row
function getComponentData(row) {
  const cells = row.getElementsByTagName('td')
  return {
    id: cells[0].textContent,
    description: cells[1].textContent,
    cas: cells[2].textContent,
    formula: cells[3].textContent,
    lastModified: cells[4].textContent,
    source: cells[5].textContent,
  }
}

// Function to create a selected component row
function createSelectedComponentRow(data) {
  const row = document.createElement('tr')
  row.innerHTML = `
    <td>${data.id}</td>
    <td>${data.description}</td>
    <td class="cross-icon"><i class="fas fa-times"></i></td>
    <td><img src="assets/images/drag-icon.png" alt=""></td>
  `
  return row
}

// Function to create a gas composition row
function createGasCompositionRow(data) {
  const row = document.createElement('tr')
  row.innerHTML = `
    <td>${data.id}</td>
    <td>${data.description}</td>
    <td>mol %</td>
    <td><input type="text" placeholder="Enter Value"></td>
    <td><input type="text" placeholder="Enter Value"></td>
    <td><input type="text" placeholder="Enter Value"></td>
  `
  return row
}

// Function to delete a component from all tables
function deleteComponent(selectedRow) {
  const id = selectedRow.cells[0].textContent
  const description = selectedRow.cells[1].textContent

  // Remove from selected components table
  selectedRow.remove()

  // Remove from gas composition table
  const compositionRows = gasCompositionTable.getElementsByTagName('tr')
  for (let row of compositionRows) {
    if (
      row.cells[0].textContent === id &&
      row.cells[1].textContent === description
    ) {
      row.remove()
      break
    }
  }

  // Update the add button in gas components table
  const gasRows = gasTable.getElementsByTagName('tr')
  for (let row of gasRows) {
    if (row.cells[0].textContent === id) {
      const addButton = row.querySelector('.add-button')
      if (addButton) {
        addButton.innerHTML = '<i class="fas fa-plus"></i>'
        addButton.classList.remove('selected')
      }
      break
    }
  }
}

// Add click handlers for existing delete buttons
const existingDeleteButtons = document.querySelectorAll(
  '.selected-components-table .cross-icon'
)
existingDeleteButtons.forEach((button) => {
  button.addEventListener('click', function () {
    const row = this.closest('tr')
    deleteComponent(row)
  })
})

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

// Function to add a component to all tables
function addComponent(row) {
  const data = getComponentData(row)

  // Check if component is already selected
  const existingRows = selectedComponentsTable.getElementsByTagName('tr')
  for (let existingRow of existingRows) {
    if (existingRow.cells[0].textContent === data.id) {
      return // Component already exists
    }
  }

  // Add to selected components table
  const newSelectedRow = createSelectedComponentRow(data)
  selectedComponentsTable.appendChild(newSelectedRow)

  // Add to gas composition table
  const newCompositionRow = createGasCompositionRow(data)
  gasCompositionTable.insertBefore(
    newCompositionRow,
    gasCompositionTable.lastElementChild
  )

  // Update the add button in gas components table
  const addButton = row.querySelector('.add-button')
  if (addButton) {
    addButton.innerHTML = '<i class="fas fa-check"></i>'
    addButton.classList.add('selected')
  }

  // Add click handler for the delete button
  const deleteButton = newSelectedRow.querySelector('.cross-icon')
  deleteButton.addEventListener('click', function () {
    deleteComponent(newSelectedRow)
  })
}

// Add click handlers for all add buttons
const addButtons = document.querySelectorAll('.add-button')
addButtons.forEach((button) => {
  button.addEventListener('click', function () {
    const row = this.closest('tr')
    addComponent(row)
  })
})

// Clear all button functionality
clearAllButton.addEventListener('click', function () {
  // Clear selected components table (except header)
  while (selectedComponentsTable.firstChild) {
    selectedComponentsTable.removeChild(selectedComponentsTable.firstChild)
  }

  // Clear gas composition table (except header and total row)
  const compositionRows = gasCompositionTable.getElementsByTagName('tr')
  while (compositionRows.length > 1) {
    // Keep the total row
    gasCompositionTable.removeChild(compositionRows[0])
  }

  // Reset all add buttons in gas components table
  const addButtons = document.querySelectorAll('.add-button')
  addButtons.forEach((button) => {
    button.innerHTML = '<i class="fas fa-plus"></i>'
    button.classList.remove('selected')
  })
})
