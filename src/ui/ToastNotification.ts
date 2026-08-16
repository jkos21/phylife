export interface ToastOptions {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

export class ToastNotificationManager {
  private container: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      this.container.setAttribute('role', 'status');
      this.container.setAttribute('aria-live', 'polite');
      if (document.body) {
        document.body.appendChild(this.container);
      }
    }
  }

  public show(options: ToastOptions): void {
    if (typeof document === 'undefined' || !this.container) return;

    const toast = document.createElement('div');
    toast.className = 'phylife-toast';

    const icon = options.icon || '✨';
    const duration = options.durationMs || 4500;

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${options.title}</div>
        <div class="toast-message">${options.message}</div>
      </div>
      ${options.actionLabel ? `<button class="toast-action-btn">${options.actionLabel}</button>` : ''}
      <button class="toast-close-btn" aria-label="Close notification">✕</button>
    `;

    if (options.actionLabel && options.onAction) {
      toast.querySelector('.toast-action-btn')?.addEventListener('click', () => {
        options.onAction!();
        this.dismiss(toast);
      });
    }

    toast.querySelector('.toast-close-btn')?.addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  }

  private dismiss(toast: HTMLElement): void {
    if (!toast.classList.contains('dismissing')) {
      toast.classList.add('dismissing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }
}

export const toastManager = new ToastNotificationManager();
