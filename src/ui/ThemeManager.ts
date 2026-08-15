export type AppTheme = 'modern-dark' | 'bioluminescent' | 'academic-light';

export class ThemeManager {
  private currentTheme: AppTheme = 'modern-dark';

  constructor() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('phylife_theme') as AppTheme;
        if (saved && ['modern-dark', 'bioluminescent', 'academic-light'].includes(saved)) {
          this.setTheme(saved);
          return;
        }
      }
    } catch {
      // Fallback
    }
    this.setTheme('modern-dark');
  }

  public getTheme(): AppTheme {
    return this.currentTheme;
  }

  public setTheme(theme: AppTheme): void {
    this.currentTheme = theme;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('phylife_theme', theme);
      }
      if (typeof document !== 'undefined' && document.body) {
        document.body.setAttribute('data-theme', theme);
      }
    } catch {
      // Ignore
    }
  }
}

export const themeManager = new ThemeManager();
