document.addEventListener('DOMContentLoaded', function () {
  // Add toast container to the body
  const toastContainer = document.createElement('div')
  toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3'
  toastContainer.innerHTML = `
    <div id="case1Toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-theme="auto">
      <div class="toast-header">
        <strong class="me-auto">Warning</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        Case 1 cannot be deleted!
      </div>
    </div>
  `
  document.body.appendChild(toastContainer)

  // Initialize the toast
  const toastElement = document.getElementById('case1Toast')
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000,
  })

  // Store original values for each cell
  const originalValues = new Map()

  // Initialize decimal controls for a specific cell
  function initializeCellDecimalControls(cell) {
    const originalValue = parseFloat(cell.textContent)
    if (!isNaN(originalValue)) {
      originalValues.set(cell, originalValue)
      updateDisplay(cell, 2) // Start with 2 decimals
    }
  }

  // Initialize decimal controls
  function initializeDecimalControls() {
    // Global decimal control
    const globalDecimalValue = document.getElementById('globalDecimalValue')
    const globalDecreaseDecimal = document.getElementById(
      'globalDecreaseDecimal'
    )
    const globalIncreaseDecimal = document.getElementById(
      'globalIncreaseDecimal'
    )

    // Store original values and set initial display for all existing cells
    document.querySelectorAll('.decimal-value .value').forEach((cell) => {
      initializeCellDecimalControls(cell)
    })

    // Global decimal control handlers
    globalDecreaseDecimal?.addEventListener('click', () => {
      const currentDecimals = parseInt(globalDecimalValue.textContent)
      if (currentDecimals > 0) {
        globalDecimalValue.textContent = currentDecimals - 1
        updateAllDisplays(currentDecimals - 1)
      }
    })

    globalIncreaseDecimal?.addEventListener('click', () => {
      const currentDecimals = parseInt(globalDecimalValue.textContent)
      if (currentDecimals < 6) {
        // Limit to 6 decimal places
        globalDecimalValue.textContent = currentDecimals + 1
        updateAllDisplays(currentDecimals + 1)
      }
    })
  }

  // Get current number of decimals for a cell
  function getCurrentDecimals(cell) {
    const displayValue = cell.textContent
    const decimalPart = displayValue.split('.')[1]
    return decimalPart ? decimalPart.length : 0
  }

  // Update display format for a single cell
  function updateDisplay(cell, decimals) {
    const originalValue = originalValues.get(cell)
    if (originalValue !== undefined) {
      cell.textContent = originalValue.toFixed(decimals)
    }
  }

  // Update display format for all cells
  function updateAllDisplays(decimals) {
    document.querySelectorAll('.decimal-value .value').forEach((cell) => {
      updateDisplay(cell, decimals)
    })
  }

  // Initialize drag and drop immediately
  initializeDragAndDrop()

  // Initialize decimal controls
  initializeDecimalControls()

  // Event delegation for decimal controls
  document.addEventListener('click', function (event) {
    const decreaseBtn = event.target.closest('.decrease-decimal')
    const increaseBtn = event.target.closest('.increase-decimal')

    if (decreaseBtn || increaseBtn) {
      const valueCell = event.target
        .closest('.decimal-value')
        ?.querySelector('.value')
      if (!valueCell) return

      // Initialize the cell if it hasn't been initialized yet
      if (!originalValues.has(valueCell)) {
        initializeCellDecimalControls(valueCell)
      }

      const currentDecimals = getCurrentDecimals(valueCell)

      if (decreaseBtn && currentDecimals > 0) {
        updateDisplay(valueCell, currentDecimals - 1)
      } else if (increaseBtn && currentDecimals < 6) {
        updateDisplay(valueCell, currentDecimals + 1)
      }
    }
  })

  // Add click handler for the select gas components table
  document
    .querySelector('.select-gas-components')
    .addEventListener('click', function (event) {
      // Get the clicked row
      const row = event.target.closest('tr')
      if (!row) return

      // Skip if clicking the header row
      if (row.parentElement.tagName === 'THEAD') return

      // Get the gas component details from the row
      const gasId = row.cells[0].textContent
      const gasName = row.cells[1].textContent
      const plusButton = row.querySelector('.add-button')

      // Get both tables
      const gasCompositionTable = document.querySelector(
        '.gas-composition-table table:first-of-type tbody'
      )
      const selectedComponentsTable = document.querySelector(
        '.selected-components-table table tbody'
      )

      // Check if this gas component already exists in either table
      const existingInGasComposition = Array.from(
        gasCompositionTable.rows
      ).find(
        (row) =>
          row.cells[1]?.textContent === gasName &&
          !row.classList.contains('gas-composition-total-row')
      )

      const existingInSelected = Array.from(selectedComponentsTable.rows).find(
        (row) => row.cells[1]?.textContent === gasName
      )

      // If component exists in either table, remove it
      if (existingInGasComposition || existingInSelected) {
        if (existingInGasComposition) {
          existingInGasComposition.remove()
        }
        if (existingInSelected) {
          existingInSelected.remove()
        }
        // Change back to plus icon
        plusButton.innerHTML = '<i class="fas fa-plus"></i>'
        plusButton.classList.remove('checked')
      } else {
        // Add to gas composition table
        const gasRows = Array.from(gasCompositionTable.rows)
        const totalRow = gasRows.find((row) =>
          row.classList.contains('gas-composition-total-row')
        )

        // Find the first data row for structure
        const firstDataRow = gasRows.find(
          (row) =>
            !row.classList.contains('gas-composition-total-row') &&
            row.cells.length > 3
        )

        // Build the new row for gas composition
        let newGasRowHtml = ''
        if (firstDataRow) {
          newGasRowHtml += `<td><img src="assets/images/drag-icon.png" alt="" draggable="false"></td>`
          newGasRowHtml += `<td>${gasName}</td>`
          newGasRowHtml += `<td>mol %</td>`
          for (let i = 3; i < firstDataRow.cells.length; i++) {
            const cell = firstDataRow.cells[i]
            if (cell.querySelector('input')) {
              newGasRowHtml +=
                '<td><input type="number" placeholder="Enter Value"></td>'
            } else {
              newGasRowHtml += '<td></td>'
            }
          }
        }

        // Create and insert new row in gas composition
        const newGasRow = document.createElement('tr')
        newGasRow.innerHTML = newGasRowHtml
        if (totalRow) {
          totalRow.parentNode.insertBefore(newGasRow, totalRow)
        } else {
          gasCompositionTable.appendChild(newGasRow)
        }

        // Add to selected components table (without drag icon)
        const newSelectedRow = document.createElement('tr')
        newSelectedRow.innerHTML = `
          <td>${gasId}</td>
          <td>${gasName}</td>
          <td class="cross-icon"><i class="fas fa-times"></i></td>
        `
        selectedComponentsTable.appendChild(newSelectedRow)

        // Change to check icon
        plusButton.innerHTML = '<i class="fas fa-check"></i>'
        plusButton.classList.add('checked')
      }

      // Visual feedback
      row.style.backgroundColor = 'rgba(34, 193, 169, 0.1)'
      setTimeout(() => {
        row.style.backgroundColor = ''
      }, 200)

      // Re-initialize drag and drop only for gas composition table
      setTimeout(() => {
        const gasCompositionTable = document.querySelector(
          '.gas-composition-table table:first-of-type tbody'
        )
        if (gasCompositionTable) {
          // Only initialize drag and drop for gas composition table rows
          const rows = gasCompositionTable.querySelectorAll(
            'tr:not(.gas-composition-total-row)'
          )
          rows.forEach((row) => {
            if (!row.classList.contains('gas-composition-total-row')) {
              row.setAttribute('draggable', 'true')
            }
          })
          initializeDragAndDrop()
        }
      }, 100)
    })

  // Add click handler for removing components from selected components table
  document
    .querySelector('.selected-components-table')
    .addEventListener('click', function (event) {
      if (event.target.closest('.cross-icon')) {
        const row = event.target.closest('tr')
        const gasName = row.cells[1].textContent

        // Remove from selected components table
        row.remove()

        // Also remove from gas composition table if it exists
        const gasCompositionTable = document.querySelector(
          '.gas-composition-table table:first-of-type tbody'
        )
        const existingInGasComposition = Array.from(
          gasCompositionTable.rows
        ).find(
          (row) =>
            row.cells[1]?.textContent === gasName &&
            !row.classList.contains('gas-composition-total-row')
        )
        if (existingInGasComposition) {
          existingInGasComposition.remove()
          // Re-initialize drag and drop only for gas composition table
          setTimeout(() => {
            const gasCompositionTable = document.querySelector(
              '.gas-composition-table table:first-of-type tbody'
            )
            if (gasCompositionTable) {
              initializeDragAndDrop()
            }
          }, 100)
        }

        // Change back to plus icon in the select gas components table
        const selectGasTable = document.querySelector(
          '.select-gas-components table tbody'
        )
        const sourceRow = Array.from(selectGasTable.rows).find(
          (row) => row.cells[1].textContent === gasName
        )
        if (sourceRow) {
          const plusButton = sourceRow.querySelector('.add-button')
          plusButton.innerHTML = '<i class="fas fa-plus"></i>'
          plusButton.classList.remove('checked')
        }
      }
    })

  // Add click handler for case cells in gas composition table
  document
    .querySelector('.gas-composition-table')
    .addEventListener('click', function (event) {
      const cell = event.target.closest('td')
      if (cell && cell.textContent.startsWith('Case')) {
        // Get the column index of the clicked cell
        const columnIndex = Array.from(cell.parentElement.children).indexOf(
          cell
        )

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

        // Remove column from Project Properties table
        projectPropertiesTable.querySelectorAll('tr').forEach((row) => {
          const cells = row.children
          if (cells[columnIndex]) {
            cells[columnIndex].remove()
          }
        })

        // Remove column from Gas Composition table
        gasCompositionTable.querySelectorAll('tr').forEach((row) => {
          const cells = row.children
          if (cells[columnIndex]) {
            cells[columnIndex].remove()
          }
        })

        // Remove column from Calculated Properties table
        calculatedPropertiesTable.querySelectorAll('tr').forEach((row) => {
          const cells = row.children
          if (cells[columnIndex]) {
            cells[columnIndex].remove()
          }
        })

        // Update case numbers in headers
        updateCaseNumbers()
      }
    })

  // Add click handler for closing columns
  document.addEventListener('click', function (event) {
    if (event.target.closest('.gas-composition-close-btn')) {
      const closeButton = event.target.closest('.gas-composition-close-btn')
      const headerCell = closeButton.closest('th')
      const headerRow = headerCell.closest('tr')
      const columnIndex = Array.from(headerRow.children).indexOf(headerCell)

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

      // Remove column from Project Properties table
      projectPropertiesTable.querySelectorAll('tr').forEach((row) => {
        const cells = row.children
        if (cells[columnIndex]) {
          cells[columnIndex].remove()
        }
      })

      // Remove column from Gas Composition table
      gasCompositionTable.querySelectorAll('tr').forEach((row) => {
        const cells = row.children
        if (cells[columnIndex]) {
          cells[columnIndex].remove()
        }
      })

      // Remove column from Calculated Properties table
      calculatedPropertiesTable.querySelectorAll('tr').forEach((row) => {
        const cells = row.children
        if (cells[columnIndex]) {
          cells[columnIndex].remove()
        }
      })

      // Update case numbers in headers
      const projectHeaders = Array.from(
        projectPropertiesTable.querySelector('thead tr').children
      ).slice(3)

      // Update case numbers while preserving close buttons
      projectHeaders.forEach((header, index) => {
        const closeButton = header.querySelector('.gas-composition-close-btn')
        header.innerHTML = `Case ${index + 1}`
        if (closeButton) {
          header.appendChild(closeButton)
        } else {
          header.innerHTML +=
            ' <button class="gas-composition-close-btn"><i class="fas fa-times"></i></button>'
        }
      })
    }
  })

  // Add click handler for adding new columns
  document
    .querySelector('.gas-composition-add-btn')
    .addEventListener('click', function () {
      // Get all three tables
      const projectPropertiesTable = document.querySelector(
        '.project-properties-table table'
      )
      const gasCompositionTable = document.querySelector(
        '.gas-composition-table table:first-of-type'
      )
      const calculatedPropertiesTable = document.querySelector(
        '.calculated-properties-table table'
      )

      // Get current number of cases
      const currentCases =
        projectPropertiesTable.querySelector('thead tr').children.length - 3 // Subtract header columns
      const newCaseNumber = currentCases + 1

      // Add new column to Project Properties table
      const projectHeaderRow = projectPropertiesTable.querySelector('thead tr')
      const newProjectHeader = document.createElement('th')
      newProjectHeader.className = 'case-column'
      // Only add delete button if it's not one of the first three columns
      if (currentCases >= 0) {
        // This ensures we're adding to columns after the first three
        newProjectHeader.innerHTML = `<span>Case ${newCaseNumber} <button class="delete-column-btn"><i class="fas fa-times"></i></button></span>`
      } else {
        newProjectHeader.innerHTML = `<span>Case ${newCaseNumber}</span>`
      }
      projectHeaderRow.appendChild(newProjectHeader)

      // Add new column to all rows in Project Properties table
      projectPropertiesTable.querySelectorAll('tbody tr').forEach((row) => {
        const newCell = document.createElement('td')
        if (row.querySelector('input[type="number"]')) {
          newCell.innerHTML = '<input type="number" placeholder="Enter Value">'
        } else if (row.querySelector('input[type="radio"]')) {
          // Add radio button with the same name for grouping
          newCell.innerHTML = '<input type="radio" name="guarantee-point">'
        } else if (row.querySelector('input[type="checkbox"]')) {
          newCell.innerHTML = '<input type="checkbox">'
        } else if (row.querySelector('select')) {
          newCell.innerHTML = row.querySelector('td').innerHTML // Copy the select element
        } else {
          newCell.innerHTML = row.querySelector('td').innerHTML // Copy existing content
        }
        row.appendChild(newCell)
      })

      // Add new column to Gas Composition table
      const gasHeaderRow = gasCompositionTable.querySelector('thead tr')
      const newGasHeader = document.createElement('th')
      newGasHeader.textContent = `Case ${newCaseNumber}`
      gasHeaderRow.appendChild(newGasHeader)

      // Add new column to all rows in Gas Composition table
      gasCompositionTable.querySelectorAll('tbody tr').forEach((row) => {
        const newCell = document.createElement('td')
        if (row.classList.contains('gas-composition-total-row')) {
          newCell.textContent = '0'
        } else if (row.classList.contains('gas-composition-last-row')) {
          newCell.innerHTML = '' // Remove close button from last row
        } else {
          newCell.innerHTML = '<input type="number" placeholder="Enter Value">'
        }
        row.appendChild(newCell)
      })

      // Add new column to Calculated Properties table
      const calculatedHeaderRow =
        calculatedPropertiesTable.querySelector('thead tr')
      if (calculatedHeaderRow) {
        const newCalculatedHeader = document.createElement('th')
        newCalculatedHeader.textContent = `Case ${newCaseNumber}`
        calculatedHeaderRow.appendChild(newCalculatedHeader)
      }

      // Add new column to all rows in Calculated Properties table
      calculatedPropertiesTable.querySelectorAll('tbody tr').forEach((row) => {
        const newCell = document.createElement('td')
        if (row.querySelector('.decimal-value')) {
          // Get the current decimal value from the global control
          const globalDecimals = parseInt(
            document.getElementById('globalDecimalValue').textContent
          )
          newCell.innerHTML = `
            <div class="d-flex align-items-center justify-content-between decimal-value">
              <span class="value">0.00</span>
              <div class="decimal-controls">
                <button class="decrease-decimal"><i class="fas fa-minus"></i></button>
                <button class="increase-decimal"><i class="fas fa-plus"></i></button>
              </div>
            </div>
          `
          // Initialize the new decimal value cell
          const valueSpan = newCell.querySelector('.value')
          if (valueSpan) {
            initializeCellDecimalControls(valueSpan)
          }
        } else if (row.querySelector('select')) {
          // Copy the select element if it exists
          newCell.innerHTML = row.querySelector('td').innerHTML
        } else {
          // Copy existing content for other cells
          newCell.innerHTML = row.querySelector('td').innerHTML
        }
        row.appendChild(newCell)
      })

      // After adding new columns, initialize decimal controls for new cells
      document.querySelectorAll('.decimal-value .value').forEach((cell) => {
        if (!originalValues.has(cell)) {
          initializeCellDecimalControls(cell)
        }
      })

      // Re-initialize drag and drop for the gas composition table
      setTimeout(() => {
        initializeDragAndDrop()
      }, 100)

      // Re-initialize radio button handling
      initializeGuaranteePointRadios()
    })

  // Function to update case numbers in headers
  function updateCaseNumbers() {
    const projectPropertiesTable = document.querySelector(
      '.project-properties-table table'
    )

    // Get all header cells (excluding the first three columns)
    const projectHeaders = Array.from(
      projectPropertiesTable.querySelector('thead tr').children
    ).slice(3)

    // Update case numbers
    projectHeaders.forEach((header, index) => {
      header.textContent = `Case ${index + 1}`
    })
  }

  // Add click handler for deleting columns
  document.addEventListener('click', function (event) {
    if (event.target.closest('.delete-column-btn')) {
      const deleteButton = event.target.closest('.delete-column-btn')
      const headerCell = deleteButton.closest('th')
      const headerRow = headerCell.closest('tr')
      const columnIndex = Array.from(headerRow.children).indexOf(headerCell)

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

      // Get the case number from the header
      const caseNumber = parseInt(headerCell.textContent.match(/Case (\d+)/)[1])

      // Don't allow deletion of Case 1
      if (caseNumber === 1) {
        toast.show()
        return
      }

      // Remove column from Project Properties table
      projectPropertiesTable.querySelectorAll('tr').forEach((row) => {
        const cells = row.children
        if (cells[columnIndex]) {
          cells[columnIndex].remove()
        }
      })

      // Remove column from Gas Composition table
      gasCompositionTable.querySelectorAll('tr').forEach((row) => {
        const cells = row.children
        if (cells[columnIndex]) {
          cells[columnIndex].remove()
        }
      })

      // Remove column from Calculated Properties table
      calculatedPropertiesTable.querySelectorAll('tr').forEach((row) => {
        const cells = row.children
        if (cells[columnIndex]) {
          cells[columnIndex].remove()
        }
      })

      // Update case numbers in headers
      const projectHeaders = Array.from(
        projectPropertiesTable.querySelector('thead tr').children
      ).slice(3)

      // Update case numbers while preserving delete buttons
      projectHeaders.forEach((header, index) => {
        const deleteButton = header.querySelector('.delete-column-btn')
        header.innerHTML = `<span>Case ${index + 1}`
        if (deleteButton) {
          header.querySelector('span').appendChild(deleteButton)
        } else {
          header.querySelector('span').innerHTML +=
            ' <button class="delete-column-btn"><i class="fas fa-times"></i></button>'
        }
        header.querySelector('span').innerHTML += '</span>'
      })
    }
  })

  // Function to update row numbers
  function updateRowNumbers() {
    const gasCompositionTable = document.querySelector(
      '.gas-composition-table table:first-of-type tbody'
    )
    if (!gasCompositionTable) return

    const rows = gasCompositionTable.querySelectorAll(
      'tr:not(.gas-composition-total-row)'
    )
    rows.forEach((row) => {
      const firstCell = row.cells[0]
      if (firstCell) {
        // Always use the drag icon
        firstCell.innerHTML = `<img src="assets/images/drag-icon.png" alt="" draggable="false">`
      }
    })
  }

  // Add radio button handling for Guarantee point row
  function initializeGuaranteePointRadios() {
    const projectPropertiesTable = document.querySelector(
      '.project-properties-table table'
    )
    if (!projectPropertiesTable) return

    // Find the Guarantee point row
    const guaranteeRow = Array.from(
      projectPropertiesTable.querySelectorAll('tbody tr')
    ).find((row) => row.cells[1]?.textContent === 'Guarantee point')
    if (!guaranteeRow) return

    // Add name attribute to all radio buttons in this row to group them
    guaranteeRow.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.setAttribute('name', 'guarantee-point')
    })

    // Add event listener to handle radio button changes
    guaranteeRow.addEventListener('change', (e) => {
      if (e.target.type === 'radio') {
        // Uncheck all other radio buttons in the row
        guaranteeRow
          .querySelectorAll('input[type="radio"]')
          .forEach((radio) => {
            if (radio !== e.target) {
              radio.checked = false
            }
          })
      }
    })
  }

  // Initialize radio buttons when the page loads
  initializeGuaranteePointRadios()
})

// Move initializeDragAndDrop outside of DOMContentLoaded
function initializeDragAndDrop() {
  const gasCompositionTable = document.querySelector(
    '.gas-composition-table table:first-of-type tbody'
  )
  if (!gasCompositionTable) return

  let draggedRow = null
  let placeholder = null
  let dragStartY = 0
  const DRAG_THRESHOLD = 5

  // Remove any existing drag and drop event listeners
  gasCompositionTable
    .querySelectorAll('tr:not(.gas-composition-total-row)')
    .forEach((row) => {
      const newRow = row.cloneNode(true)
      row.parentNode.replaceChild(newRow, row)
    })

  // Make rows draggable only when clicking the drag icon
  gasCompositionTable
    .querySelectorAll('tr:not(.gas-composition-total-row)')
    .forEach((row) => {
      // Initially set draggable to false
      row.setAttribute('draggable', 'false')

      // Get the drag icon cell
      const dragIconCell = row.querySelector('td:first-child')
      if (!dragIconCell) return

      // Mouse down event on drag icon
      dragIconCell.addEventListener('mousedown', (e) => {
        // Only start drag if clicking directly on the drag icon image
        if (e.target.tagName === 'IMG') {
          e.stopPropagation() // Prevent event from bubbling up
          dragStartY = e.clientY
          row.setAttribute('draggable', 'true')
        }
      })

      // Mouse up event to reset draggable state
      document.addEventListener(
        'mouseup',
        () => {
          row.setAttribute('draggable', 'false')
        },
        { once: true }
      )

      // Drag start
      row.addEventListener('dragstart', (e) => {
        // Only allow drag if clicking the drag icon
        if (!e.target.closest('td:first-child img')) {
          e.preventDefault()
          return
        }

        draggedRow = row
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', '') // Required for Firefox

        // Create a placeholder
        placeholder = document.createElement('tr')
        placeholder.style.height = `${row.offsetHeight}px`
        placeholder.style.backgroundColor = '#f8f9fa'
        placeholder.style.border = '2px dashed #22c1a9'

        // Add dragging class after a small delay
        requestAnimationFrame(() => {
          row.classList.add('dragging')
        })
      })

      // Drag end
      row.addEventListener('dragend', () => {
        draggedRow = null
        row.classList.remove('dragging')
        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.removeChild(placeholder)
        }
        placeholder = null
        row.setAttribute('draggable', 'false')
      })

      // Drag over
      row.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'

        if (!draggedRow || row.classList.contains('gas-composition-total-row'))
          return

        const rect = row.getBoundingClientRect()
        const midY = rect.top + rect.height / 2

        if (placeholder) {
          if (e.clientY < midY) {
            row.parentNode.insertBefore(placeholder, row)
          } else {
            row.parentNode.insertBefore(placeholder, row.nextSibling)
          }
        }
      })
    })

  // Drop handler for the table
  gasCompositionTable.addEventListener('drop', (e) => {
    e.preventDefault()
    if (!draggedRow || !placeholder) return

    // Insert the dragged row where the placeholder is
    placeholder.parentNode.insertBefore(draggedRow, placeholder)

    // Remove the placeholder
    placeholder.parentNode.removeChild(placeholder)
    placeholder = null

    // Ensure total row stays at bottom
    const totalRow = gasCompositionTable.querySelector(
      '.gas-composition-total-row'
    )
    if (totalRow) {
      gasCompositionTable.appendChild(totalRow)
    }

    // Update row numbers
    updateRowNumbers()
  })

  // Prevent default drag behavior for the entire table
  gasCompositionTable.addEventListener('dragenter', (e) => {
    e.preventDefault()
  })

  gasCompositionTable.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  // Add click event delegation for interactive elements
  gasCompositionTable.addEventListener('click', (e) => {
    // Allow clicks on inputs and other interactive elements
    if (e.target.closest('input, button, select, .decimal-controls')) {
      e.stopPropagation()
      return
    }
  })

  // Add mousedown event delegation for interactive elements
  gasCompositionTable.addEventListener('mousedown', (e) => {
    // Allow mousedown on inputs and other interactive elements
    if (e.target.closest('input, button, select, .decimal-controls')) {
      e.stopPropagation()
      return
    }
  })
}
