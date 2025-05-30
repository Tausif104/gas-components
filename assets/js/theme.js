document.addEventListener('DOMContentLoaded', function () {
  const themeSelect = document.querySelector('.theme-select')
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')

  // Function to set theme
  function setTheme(theme) {
    if (theme === 'system') {
      theme = prefersDarkScheme.matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    themeSelect.value = theme
  }

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'system'
  setTheme(savedTheme)

  // Handle theme selection change
  themeSelect.addEventListener('change', function () {
    setTheme(this.value)
  })

  // Listen for system theme changes
  prefersDarkScheme.addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'system') {
      setTheme('system')
    }
  })
})
