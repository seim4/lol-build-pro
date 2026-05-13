import {Injectable, signal, computed, PLATFORM_ID, inject} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

export type AiProvider = 'gemini' | 'groq' | 'openai';

export interface ProviderConfig {
  provider: AiProvider;
  model: string;
  apiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  
  readonly providers = signal<Record<string, ProviderConfig>>({});
  readonly activeProviderId = signal<AiProvider>('gemini');

  readonly aiProvider = computed(() => this.activeProviderId());
  readonly aiModel = computed(() => this.providers()[this.activeProviderId()]?.model || 'gemini-2.5-flash');
  readonly apiKey = computed(() => this.providers()[this.activeProviderId()]?.apiKey || null);

  readonly configuredProviders = computed(() => Object.keys(this.providers()) as AiProvider[]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedProviders = localStorage.getItem('ai_providers');
      if (storedProviders) {
        try {
          this.providers.set(JSON.parse(storedProviders));
        } catch(e) {}
      } else {
        const oldKey = localStorage.getItem('ai_api_key') || localStorage.getItem('gemini_api_key');
        if (oldKey) {
          const oldProv = (localStorage.getItem('ai_provider') as AiProvider) || 'gemini';
          const oldModel = localStorage.getItem('ai_model') || 'gemini-2.5-flash';
          this.providers.set({
            [oldProv]: { provider: oldProv, model: oldModel, apiKey: oldKey }
          });
          this.activeProviderId.set(oldProv);
        }
      }

      const active = localStorage.getItem('ai_active_provider') as AiProvider;
      if (active && this.providers()[active]) {
        this.activeProviderId.set(active);
      } else {
        const available = Object.keys(this.providers()) as AiProvider[];
        if (available.length > 0) {
          this.activeProviderId.set(available[0]);
        }
      }
    }
  }

  saveProviderConfig(provider: AiProvider, model: string, apiKey: string) {
    const current = this.providers();
    const updated = {
      ...current,
      [provider]: { provider, model, apiKey }
    };
    this.providers.set(updated);
    
    if (Object.keys(current).length === 0 || this.activeProviderId() === provider) {
      this.setActiveProvider(provider);
    }
    
    this.persist();
  }
  
  removeProviderConfig(provider: AiProvider) {
    const current = { ...this.providers() };
    delete current[provider];
    this.providers.set(current);
    
    if (this.activeProviderId() === provider) {
      const remaining = Object.keys(current) as AiProvider[];
      if (remaining.length > 0) {
        this.setActiveProvider(remaining[0]);
      } else {
        this.activeProviderId.set('gemini'); // Default fallback when all removed
      }
    }
    this.persist();
  }

  setActiveProvider(provider: AiProvider) {
    this.activeProviderId.set(provider);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('ai_active_provider', provider);
    }
  }

  private persist() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('ai_providers', JSON.stringify(this.providers()));
    }
  }
}
