import {Component, inject, signal, OnInit, OnDestroy, computed} from '@angular/core';
import {ReactiveFormsModule, FormControl, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {Subject, takeUntil} from 'rxjs';
import {ConfigService, AiProvider} from '../services/config.service';
import {I18nService} from '../services/i18n.service';

const MODELS: Record<string, string[]> = {
  'gemini': ['gemini-2.5-flash', 'gemini-2.5-pro'],
  'groq': ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  'openai': ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
};

const URLS: Record<string, string> = {
  'gemini': 'https://aistudio.google.com/app/apikey',
  'groq': 'https://console.groq.com/keys',
  'openai': 'https://platform.openai.com/api-keys'
};

@Component({
  selector: 'app-config-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="glass-panel w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-display font-semibold">{{ t('config.title') }}</h2>
            <button (click)="close()" class="text-gray-400 hover:text-white transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <p class="text-[13px] text-[var(--color-text-secondary)]">
            Configure seu provedor de Inteligência Artificial para gerar as builds. Cadastre múltiplos provedores ou use opções gratuitas.
          </p>
          
          <a [href]="getKeyUrl()" target="_blank" class="text-[12px] text-[var(--color-accent-cyan)] hover:text-white transition-colors flex items-center gap-1 w-fit">
            {{ t('config.get_key') }} <mat-icon class="text-[14px]">open_in_new</mat-icon>
          </a>

          <div class="flex flex-col gap-2 relative mt-2">
            <label class="text-xs font-semibold text-gray-300 uppercase tracking-widest">AI Provider</label>
            <select [formControl]="providerControl" class="glass-input w-full appearance-none">
              <option value="gemini" class="bg-[#0f0f13] text-white">Google Gemini (Free Tier)</option>
              <option value="groq" class="bg-[#0f0f13] text-white">Groq (Free Tier)</option>
              <option value="openai" class="bg-[#0f0f13] text-white">OpenAI</option>
            </select>
            <mat-icon class="absolute right-2 top-[34px] -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none text-[16px]">expand_more</mat-icon>
          </div>

          <div class="flex flex-col gap-2 relative mt-2">
             <label class="text-xs font-semibold text-gray-300 uppercase tracking-widest">Model</label>
             <select [formControl]="modelControl" class="glass-input w-full appearance-none">
                @for (model of availableModels; track model) {
                  <option [value]="model" class="bg-[#0f0f13] text-white">{{ model }}</option>
                }
             </select>
             <mat-icon class="absolute right-2 top-[34px] -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none text-[16px]">expand_more</mat-icon>
          </div>

          <div class="flex flex-col gap-2 relative mt-2">
            <label class="text-xs font-semibold text-gray-300 uppercase tracking-widest">API Key</label>
            <input 
              [formControl]="keyControl" 
              type="password" 
              class="glass-input w-full"
              placeholder="Sua chave de API..."
            />
          </div>

          <div class="flex gap-[12px] pt-[8px] mt-2">
            <button (click)="close()" class="flex-1 py-[12px] rounded-[8px] bg-white/5 hover:bg-white/10 text-white font-[600] text-[13px] transition-colors border border-white/5">
              {{ t('config.cancel') }}
            </button>
            @if (isCurrentProviderSaved()) {
              <button (click)="remove()" class="flex-1 py-[12px] rounded-[8px] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-[600] text-[13px] transition-colors border border-red-500/20">
                Remover
              </button>
            }
            <button (click)="save()" [disabled]="!keyControl.valid" class="flex-1 py-[12px] rounded-[8px] text-white font-[600] text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed" style="background: linear-gradient(135deg, var(--color-accent-cyan), #4ade80); box-shadow: 0 4px 12px rgba(74,222,128,0.2);">
              {{ t('config.save') }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfigDialogComponent implements OnInit, OnDestroy {
  private configService = inject(ConfigService);
  private i18n = inject(I18nService);
  t = (key: string) => this.i18n.t(key);
  
  private destroy$ = new Subject<void>();

  isOpen = signal(false);
  
  providerControl = new FormControl<AiProvider>('gemini', {nonNullable: true});
  modelControl = new FormControl<string>('gemini-2.5-flash', {nonNullable: true});
  keyControl = new FormControl('', [Validators.required]);

  availableModels: string[] = MODELS['gemini'];

  isCurrentProviderSaved = computed(() => {
    return !!this.configService.providers()[this.providerControl.value as AiProvider];
  });

  ngOnInit() {
    this.providerControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(provider => {
        this.availableModels = MODELS[provider];
        
        const existingConfig = this.configService.providers()[provider];
        if (existingConfig) {
           this.modelControl.setValue(existingConfig.model, {emitEvent: false});
           this.keyControl.setValue(existingConfig.apiKey, {emitEvent: false});
        } else {
           this.keyControl.setValue('');
           this.modelControl.setValue(this.availableModels[0], {emitEvent: false});
        }

        if (!this.availableModels.includes(this.modelControl.value)) {
          this.modelControl.setValue(this.availableModels[0], {emitEvent: false});
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getKeyUrl(): string {
    return URLS[this.providerControl.value];
  }

  open() {
    const provider = this.configService.aiProvider() || 'gemini';
    
    this.providerControl.setValue(provider, {emitEvent: true});
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  save() {
    if (this.keyControl.valid) {
      this.configService.saveProviderConfig(
        this.providerControl.value,
        this.modelControl.value,
        this.keyControl.value!
      );
      this.close();
    }
  }

  remove() {
    this.configService.removeProviderConfig(this.providerControl.value);
    this.keyControl.setValue('');
  }
}

