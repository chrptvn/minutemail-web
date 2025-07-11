import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import {ButtonComponent} from '../ui/button.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './footer.component.html'
})
export class FooterComponent {

  constructor(
    private router: Router,
  ) {}

  goToPrivacy() {
    this.router.navigate(['/privacy']);
  }
}
