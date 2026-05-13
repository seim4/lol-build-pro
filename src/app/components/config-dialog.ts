import {Component, inject, signal} from '@angular/core';
import {ReactiveFormsModule, FormControl, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ConfigService} from '../services/config.service';

@Component({
  selector: 'app-config-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-md rounded-2xl p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-display font-semibold">Configuração (BYOK)</h2>
            <button (click)="close()" class="text-gray-400 hover:text-white transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <p class="text-[13px] text-[var(--color-text-secondary)]">
            Forneça a sua chave de API do Google Gemini para habilitar as recomendações geradas por IA. A chave é salva apenas no seu navegador (localStorage).
          </p>
          
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-[12px] text-[var(--color-accent-cyan)] hover:text-white transition-colors flex items-center gap-1 w-fit">
            Obter uma chave de API <mat-icon class="text-[14px]">open_in_new</mat-icon>
          </a>

          <div class="flex flex-col gap-2 relative">
            <label class="text-xs font-semibold text-gray-300 uppercase tracking-widest">Gemini API Key</label>
            <input 
              [formControl]="keyControl" 
              type="password" 
              class="glass-input w-full"
              placeholder="AIzaSy..."
            />
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button 
              (click)="close()" 
              class="px-4 py-2 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button 
              (click)="save()" 
              [disabled]="keyControl.invalid"
              class="px-4 py-2 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20">
              Salvar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfigDialogComponent {
  private configService = inject(ConfigService);
  isOpen = signal(false);
  
  keyControl = new FormControl('', [Validators.required]);

  open() {
    this.keyControl.setValue(this.configService.apiKey() || '');
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  save() {
    if (this.keyControl.valid) {
      this.configService.setApiKey(this.keyControl.value!);
      this.close();
    }
  }
}
