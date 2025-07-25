import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import {TopMenu} from "../../shared/components/top-menu/top-menu";

@Component({
  selector: 'app-privacy',
  standalone: true,
    imports: [CommonModule, TablerIconComponent, TopMenu],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
}
