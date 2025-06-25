import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';

@Component({
  selector: 'app-vpn-banner',
  standalone: true,
  imports: [CommonModule, TablerIconComponent],
  templateUrl: './vpn-banner.component.html',
  styleUrl: './vpn-banner.component.scss'
})
export class VpnBannerComponent {}
