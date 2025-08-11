import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DomainPreferenceService {
  private readonly STORAGE_KEY = 'minutemail_preferred_domain';
  private readonly DEFAULT_DOMAIN = 'minutemail.cc';

  private preferredDomain$ = new BehaviorSubject<string>(this.DEFAULT_DOMAIN);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Load saved preference on initialization
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.preferredDomain$.next(saved);
      }
    }
  }

  /**
   * Get the current preferred domain
   */
  getPreferredDomain(): string {
    return this.preferredDomain$.value;
  }

  /**
   * Get preferred domain as observable
   */
  getPreferredDomain$(): Observable<string> {
    return this.preferredDomain$.asObservable();
  }

  /**
   * Set and persist the preferred domain
   */
  setPreferredDomain(domain: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, domain);
    }
    this.preferredDomain$.next(domain);
  }

  /**
   * Clear the preferred domain (revert to default)
   */
  clearPreferredDomain(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.preferredDomain$.next(this.DEFAULT_DOMAIN);
  }

  /**
   * Check if a domain is valid from the available list
   */
  isValidDomain(domain: string, availableDomains: string[]): boolean {
    return availableDomains.includes(domain);
  }

  /**
   * Get preferred domain or fallback to first available
   */
  getValidPreferredDomain(availableDomains: string[]): string {
    const preferred = this.getPreferredDomain();

    if (this.isValidDomain(preferred, availableDomains)) {
      return preferred;
    }

    // Fallback to first available domain
    return availableDomains[0] || this.DEFAULT_DOMAIN;
  }
}
