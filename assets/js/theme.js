document.addEventListener('DOMContentLoaded', () => {
  const themeToggles = document.querySelectorAll('.theme-toggle')

  // Function to set theme
  const setTheme = (theme) => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      document.documentElement.setAttribute('data-theme', systemTheme)
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }

    // Update active state
    themeToggles.forEach((toggle) => {
      toggle.classList.remove('active')
      if (toggle.getAttribute('data-theme') === theme) {
        toggle.classList.add('active')
      }
    })

    localStorage.setItem('theme', theme)
  }

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'system'
  setTheme(savedTheme)

  // Handle theme selection
  themeToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const theme = toggle.getAttribute('data-theme')
      setTheme(theme)
    })
  })

  // Listen for system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === 'system') {
        setTheme('system')
      }
    })
})
