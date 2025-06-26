import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="'tabler-icon ' + customClass"
    >
      @switch(name) {
        @case('copy') {
          <g>
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </g>
        }

        @case('check') {
          <g>
            <path d="m9 12 2 2 4-4"/>
          </g>
        }

        @case('mail') {
          <g>
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-10 5L2 7"/>
          </g>
        }

        @case('trash') {
          <g>
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </g>
        }

        @case('refresh') {
          <g>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </g>
        }

        @case('sun') {
          <g>
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </g>
        }

        @case('moon') {
          <g>
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </g>
        }

        @case('clock') {
          <g>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </g>
        }

        @case('external-link') {
          <g>
            <path d="M15 3h6v6"/>
            <path d="M10 14 21 3"/>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          </g>
        }

        @case('shield') {
          <g>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
          </g>
        }

        @case('x') {
          <g>
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </g>
        }

        @case('menu') {
          <g>
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </g>
        }

        @case('loader') {
          <g>
            <line x1="12" x2="12" y1="2" y2="6"/>
            <line x1="12" x2="12" y1="18" y2="22"/>
            <line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/>
            <line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/>
            <line x1="2" x2="6" y1="12" y2="12"/>
            <line x1="18" x2="22" y1="12" y2="12"/>
            <line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/>
            <line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>
          </g>
        }

        @case('arrow-left') {
          <g>
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </g>
        }

        @case('alert-circle') {
          <g>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </g>
        }

        @case('info') {
          <g>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </g>
        }

        @case('alert-triangle') {
          <g>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </g>
        }

        @case('file-text') {
          <g>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" x2="8" y1="13" y2="13"/>
            <line x1="16" x2="8" y1="17" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </g>
        }

        @case('chevron-right') {
          <g>
            <polyline points="9,18 15,12 9,6"/>
          </g>
        }
      }
    </svg>
  `
})
export class TablerIconComponent {
  @Input() name: string = '';
  @Input() size: number = 24;
  @Input() strokeWidth: number = 2;
  @Input() customClass: string = '';
}