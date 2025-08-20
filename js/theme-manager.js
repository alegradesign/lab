class ThemeManager {
  constructor(options = {}) {
    this.themeToggleSelector = options.themeToggleSelector || '#theme-toggle';
    this.themeAttr = options.themeAttr || 'data-theme';
    this.storageKey = options.storageKey || 'theme';
    this.defaultTheme = options.defaultTheme || 'light';
    this.themeToggle = document.querySelector(this.themeToggleSelector);
    this.init();
  }

  getCurrentTheme() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme) return savedTheme;
    return this.defaultTheme;
  }

  applyTheme(theme) {
    document.documentElement.setAttribute(this.themeAttr, theme);
    localStorage.setItem(this.storageKey, theme);
    if (this.themeToggle) {
      this.themeToggle.checked = theme === 'dark';
    }
  }

  handleToggleChange = () => {
    const theme = this.themeToggle.checked ? 'dark' : 'light';
    this.applyTheme(theme);
  }

  init() {
    // Aplicar el tema inicial solo según localStorage o default
    this.applyTheme(this.getCurrentTheme());

    // Escuchar cambios manuales
    if (this.themeToggle) {
      this.themeToggle.addEventListener('change', this.handleToggleChange);
    }
  }
}

// Exportar globalmente
window.ThemeManager = ThemeManager; 