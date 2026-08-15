export type AppTheme = 'modern-dark' | 'bioluminescent' | 'academic-light';

export class ThemeManager {
  private currentTheme: AppTheme = 'modern-dark';

  constructor() {
    const saved = localStorage.getItem('phylife_theme') as AppTheme;
    if (saved && ['modern-dark', 'bioluminescent', 'academic-light'].includes(saved)) {
      this.setTheme(saved);
    } else {
      this.setTheme('modern-dark');
    }
  }

  public getTheme(): AppTheme {
    return this.currentTheme;
  }

  public setTheme(theme: AppTheme): void {
    this.currentTheme = theme;
    localStorage.setItem('phylife_theme', theme);
    document.body.setAttribute('data-theme', theme);
  }
}

export const themeManager = new ThemeManager();
