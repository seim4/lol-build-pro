import {Injectable, signal, PLATFORM_ID, inject} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly apiKey = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        this.apiKey.set(storedKey);
      }
    }
  }

  setApiKey(key: string) {
    this.apiKey.set(key);
    if (isPlatformBrowser(this.platformId)) {
      if (key) {
        localStorage.setItem('gemini_api_key', key);
      } else {
        localStorage.removeItem('gemini_api_key');
      }
    }
  }
}
