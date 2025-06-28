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
    <td><span>${data.id}</span> ${data.description}</td>
    <td class="cross-icon"><i class="fas fa-times"></i></td>
  `
  return row
}

// Function to calculate and update totals in gas composition table
function updateGasCompositionTotals() {
  const gasCompositionTable = document.querySelector(
    '.gas-composition-table table'
  )
  if (!gasCompositionTable) return

  const totalRow = gasCompositionTable.querySelector(
    '.gas-composition-total-row'
  )
  if (!totalRow) return

  // Get all input columns (skip first 3 columns: drag icon, description, and unit)
  const inputColumns = Array.from(totalRow.cells).slice(3)

  // For each input column
  inputColumns.forEach((totalCell, columnIndex) => {
    // Get all input values in this column (excluding total row)
    const inputs = gasCompositionTable.querySelectorAll(
      `tbody tr:not(.gas-composition-total-row) td:nth-child(${
        columnIndex + 4
      }) input`
    )
    let sum = 0

    // Sum up all valid input values
    inputs.forEach((input) => {
      const value = parseFloat(input.value) || 0
      sum += value
    })

    // Update total cell with formatted sum
    totalCell.textContent = sum.toFixed(3)
  })
}

// Function to create a gas composition row
function createGasCompositionRow(data) {
  const row = document.createElement('tr')
  row.id = `composition-${data.componentId}`
  row.dataset.componentId = data.componentId

  // Get the number of case columns (excluding drag, description, and unit columns)
  const gasCompositionTable = document.querySelector(
    '.gas-composition-table table'
  )
  let numCaseColumns = 0
  if (gasCompositionTable) {
    const headerRow = gasCompositionTable.querySelector('thead tr')
    if (headerRow) {
      // Exclude the first 3 columns (drag, description, unit)
      numCaseColumns = headerRow.children.length - 3
      if (numCaseColumns < 1) numCaseColumns = 1 // fallback to at least 1
    } else {
      numCaseColumns = 3 // fallback
    }
  } else {
    numCaseColumns = 3 // fallback
  }

  let inputCells = ''
  for (let i = 0; i < numCaseColumns; i++) {
    inputCells += `<td><input type="number" placeholder="Enter Value" step="0.001" min="0"></td>`
  }

  row.innerHTML = `
    <td><img src="assets/images/drag-icon.png" alt=""></td>
    <td>${data.description}</td>
    <td>mol %</td>
    ${inputCells}
  `

  // Add input event listeners to calculate totals
  const inputs = row.querySelectorAll('input')
  inputs.forEach((input) => {
    input.addEventListener('input', updateGasCompositionTotals)
  })

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
    const firstCell = row.cells[0]
    const id = firstCell.querySelector('span').textContent.trim()
    const description = firstCell.textContent.replace(id, '').trim()
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

// Function to sort table
function sortTable(column, type = 'string') {
  const headerTable = document.querySelector(
    '.select-gas-components-header table'
  )
  const bodyTable = document.querySelector(
    '.select-gas-components .table-responsive table'
  )
  if (!headerTable || !bodyTable) return

  const tableBody = bodyTable.querySelector('tbody')
  const headers = headerTable.querySelectorAll('th')
  if (!tableBody || !headers.length) return

  // Get current sort direction
  const currentHeader = headers[column]
  const isAsc = currentHeader.classList.contains('sort-asc')

  // Update sort classes
  headers.forEach((header) => {
    header.classList.remove('sort-asc', 'sort-desc')
    const icon = header.querySelector('i')
    if (icon) {
      icon.className = 'fas fa-sort ms-1'
    }
  })

  // Set new sort direction (skip icon update for ID column)
  currentHeader.classList.add(isAsc ? 'sort-desc' : 'sort-asc')
  if (column !== 0) {
    // Skip icon update for ID column
    const currentIcon = currentHeader.querySelector('i')
    if (currentIcon) {
      currentIcon.className = isAsc
        ? 'fas fa-sort-down ms-1'
        : 'fas fa-sort-up ms-1'
    }
  }

  // Get and sort rows
  const rows = Array.from(tableBody.getElementsByTagName('tr'))
  rows.sort((a, b) => {
    let aValue = a.cells[column].textContent.trim()
    let bValue = b.cells[column].textContent.trim()

    if (type === 'number') {
      aValue = parseFloat(aValue) || 0
      bValue = parseFloat(bValue) || 0
    } else if (type === 'date') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (aValue < bValue) return isAsc ? -1 : 1
    if (aValue > bValue) return isAsc ? 1 : -1
    return 0
  })

  // Reorder rows
  rows.forEach((row) => tableBody.appendChild(row))
}

// Function to handle decimal controls
function handleDecimalControls(decimalCell, initialValue = 97.33) {
  const valueSpan = decimalCell.querySelector('.value')
  const decreaseBtn = decimalCell.querySelector('.decrease-decimal')
  const increaseBtn = decimalCell.querySelector('.increase-decimal')

  if (!valueSpan || !decreaseBtn || !increaseBtn) return

  let currentValue = parseFloat(initialValue)
  let decimalPlaces = 2 // Start with 2 decimal places
  const maxDecimalPlaces = 4 // Maximum number of decimal places
  const minDecimalPlaces = 0 // Minimum number of decimal places

  function updateDisplay() {
    // Use toFixed() to round the actual value to the specified decimal places
    // This mimics Excel's decimal function behavior
    const displayValue = currentValue.toFixed(decimalPlaces)
    valueSpan.textContent = displayValue
  }

  // Store the update function on the cell for global updates
  decimalCell.updateDecimalPlaces = function (newDecimalPlaces) {
    decimalPlaces = Math.max(
      minDecimalPlaces,
      Math.min(maxDecimalPlaces, newDecimalPlaces)
    )
    updateDisplay()
  }

  decreaseBtn.addEventListener('click', () => {
    if (decimalPlaces > minDecimalPlaces) {
      decimalPlaces--
      updateDisplay()
      // Update global decimal value display
      const globalDecimalValue = document.getElementById('globalDecimalValue')
      if (globalDecimalValue) {
        globalDecimalValue.textContent = decimalPlaces
      }
    }
  })

  increaseBtn.addEventListener('click', () => {
    if (decimalPlaces < maxDecimalPlaces) {
      decimalPlaces++
      updateDisplay()
      // Update global decimal value display
      const globalDecimalValue = document.getElementById('globalDecimalValue')
      if (globalDecimalValue) {
        globalDecimalValue.textContent = decimalPlaces
      }
    }
  })

  // Initial display
  updateDisplay()
}

// Function to update all decimal cells globally
function updateGlobalDecimalPlaces(decimalPlaces) {
  const decimalCells = document.querySelectorAll('.decimal-value')
  decimalCells.forEach((cell) => {
    if (cell.updateDecimalPlaces) {
      cell.updateDecimalPlaces(decimalPlaces)
    }
  })
}

// Function to add a new column to all tables
function addNewColumn() {
  // Get all three tables
  const projectPropertiesTable = document.querySelector(
    '.project-properties-table table'
  )
  const gasCompositionTable = document.querySelector(
    '.gas-composition-table table'
  )
  const calculatedPropertiesTable = document.querySelector(
    '.calculated-properties-table table'
  )

  if (
    !projectPropertiesTable ||
    !gasCompositionTable ||
    !calculatedPropertiesTable
  )
    return

  // Generate new case number
  const existingCases = document.querySelectorAll('.case-column')
  const newCaseNumber = existingCases.length + 1

  // Add column to Project Properties table
  const projectHeader = projectPropertiesTable.querySelector('thead tr')
  const newProjectHeader = document.createElement('th')
  newProjectHeader.className = 'case-column'
  newProjectHeader.innerHTML = `
    <span>
      Case ${newCaseNumber}
      <button class="delete-column-btn"><i class="fas fa-times"></i></button>
    </span>
  `
  projectHeader.appendChild(newProjectHeader)

  // Add column to Project Properties table body rows
  const projectBodyRows = projectPropertiesTable.querySelectorAll('tbody tr')
  projectBodyRows.forEach((row) => {
    const newCell = document.createElement('td')
    const firstInput = row.querySelector('input')
    if (firstInput) {
      const inputType = firstInput.type
      if (inputType === 'radio') {
        // For radio buttons, add the same name attribute to maintain single-select behavior
        const name = firstInput.name || 'guarantee-point'
        newCell.innerHTML = `<input type="${inputType}" name="${name}">`
      } else if (inputType === 'checkbox') {
        newCell.innerHTML = `<input type="${inputType}">`
      } else {
        newCell.innerHTML = `<input type="${inputType}" placeholder="Enter Value">`
      }
    } else {
      newCell.innerHTML = ''
    }
    row.appendChild(newCell)
  })

  // Add column to Gas Composition table
  const gasHeader = gasCompositionTable.querySelector('thead tr')
  const newGasHeader = document.createElement('th')
  newGasHeader.innerHTML = ''
  gasHeader.appendChild(newGasHeader)

  // Add column to Gas Composition table body rows (except total row)
  const gasBodyRows = gasCompositionTable.querySelectorAll(
    'tbody tr:not(.gas-composition-total-row)'
  )
  gasBodyRows.forEach((row) => {
    const newCell = document.createElement('td')
    newCell.innerHTML =
      '<input type="number" placeholder="Enter Value" step="0.001" min="0">'
    row.appendChild(newCell)

    // Add input event listener to new input
    const input = newCell.querySelector('input')
    if (input) {
      input.addEventListener('input', updateGasCompositionTotals)
    }
  })

  // Add column to Gas Composition total row
  const gasTotalRow = gasCompositionTable.querySelector(
    '.gas-composition-total-row'
  )
  if (gasTotalRow) {
    const newTotalCell = document.createElement('td')
    newTotalCell.innerHTML = '0.000'
    gasTotalRow.appendChild(newTotalCell)
  }

  // Add column to Calculated Properties table
  const calcBodyRows = calculatedPropertiesTable.querySelectorAll('tbody tr')
  calcBodyRows.forEach((row) => {
    const newCell = document.createElement('td')
    const firstDecimalValue = row.querySelector('.decimal-value')
    if (firstDecimalValue) {
      // Get the value from the first cell in the row
      const firstValue =
        parseFloat(firstDecimalValue.querySelector('.value').textContent) ||
        97.33

      newCell.className = 'decimal-value'
      newCell.innerHTML = `
        <div class="position-relative">
          <span class="value">${firstValue.toFixed(2)}</span>
          <div class="decimal-controls">
            <button class="decrease-decimal"><i class="fas fa-angle-left"></i></button>
            <button class="increase-decimal"><i class="fas fa-angle-right"></i></button>
          </div>
        </div>
      `
      // Initialize decimal controls with the same value as the first cell
      handleDecimalControls(newCell, firstValue)
    } else {
      newCell.innerHTML = ''
    }
    row.appendChild(newCell)
  })

  // Add delete column functionality to the new column
  const newDeleteBtn = newProjectHeader.querySelector('.delete-column-btn')
  if (newDeleteBtn) {
    newDeleteBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const columnIndex = Array.from(projectHeader.children).indexOf(
        newProjectHeader
      )

      // Only allow deletion if it's not Case 1
      if (!newProjectHeader.classList.contains('case-one')) {
        // Remove column from all tables
        projectPropertiesTable.querySelectorAll('tr').forEach((row) => {
          const cell = row.cells[columnIndex]
          if (cell) cell.remove()
        })

        gasCompositionTable.querySelectorAll('tr').forEach((row) => {
          const cell = row.cells[columnIndex]
          if (cell) cell.remove()
        })

        calculatedPropertiesTable.querySelectorAll('tr').forEach((row) => {
          const cell = row.cells[columnIndex]
          if (cell) cell.remove()
        })
      }
    })
  }
}

// Function to relabel case columns sequentially
function relabelCaseColumns() {
  // Project Properties Table
  const projectPropertiesTable = document.querySelector(
    '.project-properties-table table'
  )
  if (projectPropertiesTable) {
    const headerRow = projectPropertiesTable.querySelector('thead tr')
    if (headerRow) {
      let caseIndex = 1
      Array.from(headerRow.children).forEach((th) => {
        if (th.classList.contains('case-column')) {
          th.innerHTML = `
            <span>
              Case ${caseIndex}
              <button class="delete-column-btn"><i class="fas fa-times"></i></button>
            </span>
          `
          caseIndex++
        }
      })
    }
  }

  // Gas Composition Table
  const gasCompositionTable = document.querySelector(
    '.gas-composition-table table'
  )
  if (gasCompositionTable) {
    const headerRow = gasCompositionTable.querySelector('thead tr')
    if (headerRow) {
      // Exclude the first 3 columns (drag, description, unit)
      for (
        let i = 3, caseIndex = 1;
        i < headerRow.children.length;
        i++, caseIndex++
      ) {
        headerRow.children[i].innerHTML = '' // You can add a label if needed
      }
    }
  }

  // Calculated Properties Table
  const calculatedPropertiesTable = document.querySelector(
    '.calculated-properties-table table'
  )
  if (calculatedPropertiesTable) {
    const headerRow = calculatedPropertiesTable.querySelector('thead tr')
    if (headerRow) {
      let caseIndex = 1
      Array.from(headerRow.children).forEach((th) => {
        if (th.classList.contains('case-column')) {
          th.innerHTML = `
            <span>
              Case ${caseIndex}
              <button class="delete-column-btn"><i class="fas fa-times"></i></button>
            </span>
          `
          caseIndex++
        }
      })
    }
  }

  // Re-attach delete button event listeners after relabeling
  const deleteButtons = document.querySelectorAll('.delete-column-btn')
  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const headerCell = btn.closest('th')
      // Only allow deletion if it's not Case 1
      if (!headerCell.classList.contains('case-one')) {
        const columnIndex = Array.from(
          headerCell.parentElement.children
        ).indexOf(headerCell)
        // Get all tables
        const projectPropertiesTable = document.querySelector(
          '.project-properties-table table'
        )
        const gasCompositionTable = document.querySelector(
          '.gas-composition-table table'
        )
        const calculatedPropertiesTable = document.querySelector(
          '.calculated-properties-table table'
        )
        if (
          projectPropertiesTable &&
          gasCompositionTable &&
          calculatedPropertiesTable
        ) {
          // Remove column from all tables
          projectPropertiesTable.querySelectorAll('tr').forEach((row) => {
            const cell = row.cells[columnIndex]
            if (cell) cell.remove()
          })
          gasCompositionTable.querySelectorAll('tr').forEach((row) => {
            const cell = row.cells[columnIndex]
            if (cell) cell.remove()
          })
          calculatedPropertiesTable.querySelectorAll('tr').forEach((row) => {
            const cell = row.cells[columnIndex]
            if (cell) cell.remove()
          })
        }
      }
    })
  })
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  // Initialize drag and drop for gas composition table
  const gasCompositionTableBody = document.querySelector(
    '.gas-composition-table table tbody'
  )
  if (gasCompositionTableBody) {
    new Sortable(gasCompositionTableBody, {
      handle: 'td:first-child img, td:nth-child(2)', // Allow dragging by drag icon or gas name cell
      animation: 150,
      ghostClass: 'dragging',
      dragClass: 'dragging',
      filter: '.gas-composition-total-row', // Don't allow dragging the total row
      onEnd: function (evt) {
        // Update the order of components if needed
        const rows = gasCompositionTableBody.querySelectorAll(
          'tr:not(.gas-composition-total-row)'
        )
        const totalRow = gasCompositionTableBody.querySelector(
          '.gas-composition-total-row'
        )

        // Move total row to the end if it's not already there
        if (totalRow && totalRow.nextElementSibling) {
          gasCompositionTableBody.appendChild(totalRow)
        }
      },
    })
  }

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
    const firstCell = row.cells[0]
    const id = firstCell.querySelector('span').textContent.trim()
    const description = firstCell.textContent.replace(id, '').trim()
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

  // Add sorting functionality to gas components table
  const headers = document.querySelectorAll('.select-gas-components-header th')
  headers.forEach((header, index) => {
    // Skip if header doesn't have text content
    if (!header.textContent.trim()) return

    // Add cursor pointer and sort icon (now for all columns including ID)
    header.style.cursor = 'pointer'
    if (!header.querySelector('i')) {
      const sortIcon = document.createElement('i')
      sortIcon.className = 'fas fa-sort ms-1'
      header.appendChild(sortIcon)
    }

    // Add click handler
    header.addEventListener('click', () => {
      // Determine sort type based on column
      let sortType = 'string'
      if (index === 0) sortType = 'number' // ID column
      if (index === 4) sortType = 'date' // Last Modified column

      sortTable(index, sortType)
    })
  })

  // Add click handler for gas composition add button
  const addButton = document.querySelector('.gas-composition-add-btn')
  if (addButton) {
    addButton.addEventListener('click', addNewColumn)
  }

  // Add delete column functionality to existing columns
  const deleteButtons = document.querySelectorAll('.delete-column-btn')
  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const headerCell = btn.closest('th')

      // Only allow deletion if it's not Case 1
      if (!headerCell.classList.contains('case-one')) {
        const columnIndex = Array.from(
          headerCell.parentElement.children
        ).indexOf(headerCell)

        // Get all tables
        const projectPropertiesTable = document.querySelector(
          '.project-properties-table table'
        )
        const gasCompositionTable = document.querySelector(
          '.gas-composition-table table'
        )
        const calculatedPropertiesTable = document.querySelector(
          '.calculated-properties-table table'
        )

        if (
          projectPropertiesTable &&
          gasCompositionTable &&
          calculatedPropertiesTable
        ) {
          // Remove column from all tables
          projectPropertiesTable.querySelectorAll('tr').forEach((row) => {
            const cell = row.cells[columnIndex]
            if (cell) cell.remove()
          })

          gasCompositionTable.querySelectorAll('tr').forEach((row) => {
            const cell = row.cells[columnIndex]
            if (cell) cell.remove()
          })

          calculatedPropertiesTable.querySelectorAll('tr').forEach((row) => {
            const cell = row.cells[columnIndex]
            if (cell) cell.remove()
          })
        }
      }
    })
  })

  // Add input event listeners to existing gas composition inputs
  const existingGasInputs = document.querySelectorAll(
    '.gas-composition-table input[type="number"]'
  )
  existingGasInputs.forEach((input) => {
    input.addEventListener('input', updateGasCompositionTotals)
  })

  // Initial calculation of totals
  updateGasCompositionTotals()

  // Initialize decimal controls for existing cells
  const decimalCells = document.querySelectorAll('.decimal-value')
  decimalCells.forEach((cell) => {
    const valueSpan = cell.querySelector('.value')
    if (valueSpan) {
      const value = parseFloat(valueSpan.textContent) || 97.33
      handleDecimalControls(cell, value)
    }
  })

  // Add global decimal controls functionality
  const globalDecreaseBtn = document.getElementById('globalDecreaseDecimal')
  const globalIncreaseBtn = document.getElementById('globalIncreaseDecimal')
  const globalDecimalValue = document.getElementById('globalDecimalValue')

  if (globalDecreaseBtn && globalIncreaseBtn && globalDecimalValue) {
    let currentGlobalDecimals = 2
    const minDecimalPlaces = 0
    const maxDecimalPlaces = 4

    globalDecreaseBtn.addEventListener('click', () => {
      if (currentGlobalDecimals > minDecimalPlaces) {
        currentGlobalDecimals--
        globalDecimalValue.textContent = currentGlobalDecimals
        updateGlobalDecimalPlaces(currentGlobalDecimals)
      }
    })

    globalIncreaseBtn.addEventListener('click', () => {
      if (currentGlobalDecimals < maxDecimalPlaces) {
        currentGlobalDecimals++
        globalDecimalValue.textContent = currentGlobalDecimals
        updateGlobalDecimalPlaces(currentGlobalDecimals)
      }
    })
  }

  // Add refresh button handler
  const refreshBtn = document.querySelector('.gas-composition-refresh-btn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', relabelCaseColumns)
  }
})
