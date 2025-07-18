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

        @case('plus') {
          <g>
            <line x1="12" x2="12" y1="5" y2="19"/>
            <line x1="5" x2="19" y1="12" y2="12"/>
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

        @case('download') {
          <g>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </g>
        }

        @case('paperclip') {
          <g>
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </g>
        }

        @case('image') {
          <g>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </g>
        }

        @case('file') {
          <g>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
          </g>
        }

        @case('table') {
          <g>
            <path d="M12 3v18"/>
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M3 15h18"/>
          </g>
        }

        @case('presentation') {
          <g>
            <path d="M2 3h20v14H2z"/>
            <path d="m7 21 5-5 5 5"/>
          </g>
        }

        @case('archive') {
          <g>
            <rect width="20" height="5" x="2" y="3" rx="1"/>
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
            <path d="M10 12h4"/>
          </g>
        }

        @case('code') {
          <g>
            <polyline points="16,18 22,12 16,6"/>
            <polyline points="8,6 2,12 8,18"/>
          </g>
        }

        @case('user') {
          <g>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </g>
        }

        @case('user-hook') {
          <g>
            <!-- original user icon -->
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>

            <circle cx="17" cy="14" r="6" fill="rgb(14,165,233)"/>
            <path
              d="M14 14l4 4l5-6"
              stroke="#fff"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        }

        @case('login') {
          <g>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" x2="3" y1="12" y2="12"/>
          </g>
        }

        @case('logout') {
          <g>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </g>
        }

        @case('user-plus') {
          <g>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" x2="19" y1="8" y2="14"/>
            <line x1="22" x2="16" y1="11" y2="11"/>
          </g>
        }

        @case('check-circle') {
          <g>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </g>
        }

        @case('alert-triangle-filled') {
          <g>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="currentColor"/>
            <path d="M12 9v4" stroke="white" stroke-width="2"/>
            <path d="M12 17h.01" stroke="white" stroke-width="2"/>
          </g>
        }

        @case('globe') {
          <g>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </g>
        }

        @case('dns') {
          <g>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
            <path d="M12 2v20"/>
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
