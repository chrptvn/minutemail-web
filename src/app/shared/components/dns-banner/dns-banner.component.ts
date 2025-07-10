import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BannerComponent} from '../banner/banner.component';

@Component({
  selector: 'app-dns-banner',
  standalone: true,
  imports: [CommonModule, BannerComponent],
  templateUrl: './dns-banner.component.html'
})
export class DnsBannerComponent {}
