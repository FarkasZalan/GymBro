import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <div class="spinner">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">{{ 'loading.loading' | translate }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 150px !important;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }

    .spinner {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .spinner-border {
      width: 5rem;
      height: 5rem;
      color: #0b8e92;
      border-width: 0.25em;
      animation: spinner-border 1s linear infinite;
    }

    @keyframes spinner-border {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() overlay: boolean = false;
} 