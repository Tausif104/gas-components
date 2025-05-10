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

  // Global decimal control
  const globalDecimalValue = document.getElementById('globalDecimalValue')
  const globalDecreaseBtn = document.getElementById('globalDecreaseDecimal')
  const globalIncreaseBtn = document.getElementById('globalIncreaseDecimal')
  const decimalValues = document.querySelectorAll('.decimal-value .value')

  // Function to format number with specified decimals
  function formatNumber(number, decimals) {
    // Ensure number doesn't exceed 100
    const cappedNumber = Math.min(Number(number), 100)
    return cappedNumber.toFixed(decimals)
  }

  // Function to update all values with specified decimals
  function updateAllDecimals(decimals) {
    decimalValues.forEach((value) => {
      const currentValue = parseFloat(value.textContent)
      value.textContent = formatNumber(currentValue, decimals)
    })
  }

  // Global decimal control handlers
  let globalDecimals = 2 // Default to 2 decimals

  globalDecreaseBtn.addEventListener('click', function () {
    if (globalDecimals > 0) {
      globalDecimals--
      globalDecimalValue.textContent = globalDecimals
      updateAllDecimals(globalDecimals)
    }
  })

  globalIncreaseBtn.addEventListener('click', function () {
    if (globalDecimals < 4) {
      globalDecimals++
      globalDecimalValue.textContent = globalDecimals
      updateAllDecimals(globalDecimals)
    }
  })

  // Individual decimal controls
  document.querySelectorAll('.decimal-value').forEach((cell) => {
    const value = cell.querySelector('.value')
    const decreaseBtn = cell.querySelector('.decrease-decimal')
    const increaseBtn = cell.querySelector('.increase-decimal')

    let currentDecimals = 2 // Default to 2 decimals

    decreaseBtn.addEventListener('click', function () {
      if (currentDecimals > 0) {
        currentDecimals--
        const currentValue = parseFloat(value.textContent)
        value.textContent = formatNumber(currentValue, currentDecimals)
      }
    })

    increaseBtn.addEventListener('click', function () {
      if (currentDecimals < 4) {
        currentDecimals++
        const currentValue = parseFloat(value.textContent)
        value.textContent = formatNumber(currentValue, currentDecimals)
      }
    })
  })

  // Add click handler for the plus button in select gas components
  document
    .querySelector('.select-gas-components')
    .addEventListener('click', function (event) {
      if (event.target.closest('.add-button')) {
        const button = event.target.closest('.add-button')
        const sourceRow = button.closest('tr')
        const gasCompositionTable = document.querySelector(
          '.gas-composition-table table:first-of-type tbody'
        )

        // Get all rows
        const rows = Array.from(gasCompositionTable.rows)

        // Find the Total row
        const totalRow = rows.find((row) =>
          row.classList.contains('gas-composition-total-row')
        )

        // Get the gas component name
        const gasName = sourceRow.cells[1].textContent

        // Check if this gas component already exists in the table
        const existingGas = rows.find(
          (row) =>
            row.cells[1]?.textContent === gasName &&
            !row.classList.contains('gas-composition-total-row')
        )

        // Only add if the gas component doesn't already exist
        if (!existingGas) {
          // Find the first data row (not header, not total row)
          const firstDataRow = rows.find(
            (row) =>
              !row.classList.contains('gas-composition-total-row') &&
              row.cells.length > 3
          )

          // Build the new row by cloning the structure of the first data row
          let newRowHtml = ''
          if (firstDataRow) {
            // First three columns: row number, gas name, unit
            newRowHtml += `<td>${rows.length - 1}</td>`
            newRowHtml += `<td>${gasName}</td>`
            newRowHtml += `<td>mol %</td>`
            // For each cell after the first three, clone structure
            for (let i = 3; i < firstDataRow.cells.length; i++) {
              const cell = firstDataRow.cells[i]
              if (cell.querySelector('input')) {
                newRowHtml +=
                  '<td><input type="number" placeholder="Enter Value"></td>'
              } else {
                newRowHtml += '<td></td>'
              }
            }
          }

          // Create new row
          const newRow = document.createElement('tr')
          newRow.innerHTML = newRowHtml

          // Insert before Total row
          if (totalRow) {
            totalRow.parentNode.insertBefore(newRow, totalRow)
          } else {
            gasCompositionTable.appendChild(newRow)
          }
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
        '.gas-composition-table table'
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
          newCell.innerHTML = '<input type="radio">'
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
        newCalculatedHeader.textContent = `Case ${newCaseNumber}` // Remove close button from header
        calculatedHeaderRow.appendChild(newCalculatedHeader)
      }

      // Add new column to all rows in Calculated Properties table
      calculatedPropertiesTable.querySelectorAll('tbody tr').forEach((row) => {
        const newCell = document.createElement('td')
        if (row.querySelector('.decimal-value')) {
          newCell.innerHTML = `
          <div class="d-flex align-items-center justify-content-between">
            <span class="value">0.00</span>
            <div class="decimal-controls">
              <button class="decrease-decimal"><i class="fas fa-minus"></i></button>
              <button class="increase-decimal"><i class="fas fa-plus"></i></button>
            </div>
          </div>
        `
        } else {
          newCell.innerHTML = row.querySelector('td').innerHTML // Copy existing content
        }
        row.appendChild(newCell)
      })

      // Initialize decimal controls for the new column
      initializeDecimalControls()
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

  // Function to initialize decimal controls
  function initializeDecimalControls() {
    document.querySelectorAll('.decimal-value').forEach((cell) => {
      const value = cell.querySelector('.value')
      const decreaseBtn = cell.querySelector('.decrease-decimal')
      const increaseBtn = cell.querySelector('.increase-decimal')

      let currentDecimals = 2 // Default to 2 decimals

      decreaseBtn.addEventListener('click', function () {
        if (currentDecimals > 0) {
          currentDecimals--
          const currentValue = parseFloat(value.textContent)
          value.textContent = formatNumber(currentValue, currentDecimals)
        }
      })

      increaseBtn.addEventListener('click', function () {
        if (currentDecimals < 4) {
          currentDecimals++
          const currentValue = parseFloat(value.textContent)
          value.textContent = formatNumber(currentValue, currentDecimals)
        }
      })
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
})
