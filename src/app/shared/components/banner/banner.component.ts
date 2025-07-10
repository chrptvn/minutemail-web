import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, TablerIconComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() icon?: string;
  @Input() link?: string;
  @Input() linkText?: string;
  @Input() ariaLabel?: string;
}
