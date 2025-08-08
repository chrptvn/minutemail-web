import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { CardComponent } from '../ui/card.component';
import { CountdownComponent } from '../ui/countdown.component';

@Component({
  selector: 'app-address-card',
  standalone: true,
  imports: [CommonModule, FormsModule, TablerIconComponent, ButtonComponent, CardComponent, CountdownComponent],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.scss'
})
export class AddressCardComponent {
  @Input() alias?: string | undefined;
  @Input() expiresAt?: string | null | undefined;
  @Input() generating = false;
  @Input() copying = false;
  @Input() copied = false;
  @Input() showDomainSelector = false;
  @Input() availableDomains: string[] = ['minutemail.co'];
  @Input() selectedDomain = 'minutemail.co';
  @Input() isAuthenticated = false;

  @Output() onGenerate = new EventEmitter<string>();
  @Output() onCopy = new EventEmitter<void>();
  @Output() onViewInbox = new EventEmitter<void>();
  @Output() onDomainChange = new EventEmitter<string>();

  generation: number = 0;

  generate() {
    this.generation++;
    this.onGenerate.emit(this.selectedDomain);
  }

  ngOnChanges() {
    // Emit domain change when selectedDomain changes
    this.onDomainChange.emit(this.selectedDomain);
  }
}
