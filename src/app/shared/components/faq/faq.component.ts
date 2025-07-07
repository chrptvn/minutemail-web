import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, TablerIconComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  expandedItems = new Set<number>();

  faqItems = [
    {
      question: "How long does a MinuteMail disposable inbox last?",
      answer: "Each inbox self-destructs exactly 60 minutes after creation—no action required. Custom expiry options are planned for the near future."
    },
    {
      question: "Does MinuteMail store any of my emails or logs?",
      answer: "Messages are kept in memory only. Once the 60-minute timer ends, all data is wiped. We keep zero server logs—no IPs, user agents, or tracking cookies."
    },
    {
      question: "Can I receive and download attachments with MinuteMail?",
      answer: "Yes. We accept common file types and show a download link right in the inbox. The current soft limit is 10 MB per email."
    },
    {
      question: "Does MinuteMail provide an API for developers?",
      answer: "Absolutely—everything in the UI is available via REST. Visit our API page for full docs or import our Postman collection to automate inbox creation and message retrieval."
    },
    {
      question: "Can I use my own domain with MinuteMail?",
      answer: "Coming soon! You'll be able to point your MX record at MinuteMail and run disposable addresses under your own domain (e.g., you@yourdomain.com). Perfect for power users and dev teams."
    }
  ];


  toggleItem(index: number) {
    if (this.expandedItems.has(index)) {
      this.expandedItems.delete(index);
    } else {
      this.expandedItems.add(index);
    }
  }

  isExpanded(index: number): boolean {
    return this.expandedItems.has(index);
  }
}
