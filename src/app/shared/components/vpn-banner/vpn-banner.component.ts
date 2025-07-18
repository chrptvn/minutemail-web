import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BannerComponent} from '../banner/banner.component';

@Component({
  selector: 'app-vpn-banner',
  standalone: true,
  imports: [CommonModule, BannerComponent],
  templateUrl: './vpn-banner.component.html'
})
export class VpnBannerComponent {}
