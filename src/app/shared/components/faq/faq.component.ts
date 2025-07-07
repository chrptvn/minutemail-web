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
      question: "How long do MinuteMail inboxes live?",
      answer: "Each inbox self-destructs exactly 60 minutes after creation—no action required. Custom expiry options are planned for the near future."
    },
    {
      question: "Do you store my emails or logs?",
      answer: "Messages are kept in memory only. Once the 60-minute timer ends, all data is wiped. We keep zero server logs—no IPs, user agents, or tracking cookies."
    },
    {
      question: "Do attachments work?",
      answer: "Yes. We accept common file types and show a download link right in the inbox. The current soft limit is 10 MB per email."
    },
    {
      question: "Is there an API?",
      answer: "Absolutely—everything in the UI is available via REST. Visit https://minutemail.co/api for full docs or import our Postman collection to automate inbox creation and message retrieval."
    },
    {
      question: "Can I use my own domain?",
      answer: "Coming soon! You'll be able to point your MX record at MinuteMail and run disposable addresses under your own domain (e.g., you@yourdomain.com). Perfect for power users and dev teams."
    },
    {
      question: "How is this free?",
      answer: "We keep the lights on through small affiliate links to privacy tools like NordVPN or domain registrars. Clicking is optional—your experience stays ad-free."
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