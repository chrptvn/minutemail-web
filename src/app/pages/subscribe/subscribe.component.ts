import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import {TopMenu} from "../../shared/components/top-menu/top-menu";
import {FooterComponent} from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, TopMenu, FooterComponent],
  templateUrl: './subscribe.component.html',
  styleUrl: './subscribe.component.scss'
})
export class SubscribeComponent {
}
