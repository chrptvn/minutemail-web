import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-vpn-banner',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './vpn-banner.component.html',
  styleUrl: './vpn-banner.component.scss'
})
export class VpnBannerComponent {}