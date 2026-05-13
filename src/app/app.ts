import {ChangeDetectionStrategy, Component, inject, signal, ViewChild} from '@angular/core';
import {ChampionSearchComponent} from './components/champion-search';
import {VersionSelectorComponent} from './components/version-selector';
import {LanguageSelectorComponent} from './components/language-selector';
import {ConfigDialogComponent} from './components/config-dialog';
import {BuildPanelComponent} from './components/build-panel';
import {Champion, RiotDataService} from './services/riot-data.service';
import {AiService, ChampionOptimalBuild} from './services/ai.service';
import {ConfigService} from './services/config.service';
import {I18nService} from './services/i18n.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    ChampionSearchComponent,
    VersionSelectorComponent,
    LanguageSelectorComponent,
    ConfigDialogComponent,
    BuildPanelComponent,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen flex flex-col relative z-0">
      
      <!-- Top Navigation -->
      <nav class="w-full border-b border-[var(--color-glass-border)] sticky top-0 z-40" style="background: var(--color-glass-bg); backdrop-filter: blur(12px);">
        <div class="max-w-[1024px] w-full mx-auto px-[24px] h-[60px] flex items-center justify-between">
          <div class="flex items-center gap-[12px]">
            <div class="w-[40px] h-[40px] rounded-[8px] flex items-center justify-center p-[8px]" style="background: linear-gradient(135deg, var(--color-accent-cyan), #7000ff);">
              <img src="https://cdn.simpleicons.org/leagueoflegends/white" alt="LoL Icon" class="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 class="text-[18px] font-[700] text-white leading-tight">
                LoL Build Pro
              </h1>
              <p class="text-[11px] text-[#4ade80] flex items-center gap-[6px] mt-0.5">
                <span class="w-[6px] h-[6px] rounded-full bg-[#4ade80]" style="box-shadow: 0 0 8px #4ade80;"></span> Gemini AI Connected
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-[10px] text-[14px]">
            <app-language-selector />
            <app-version-selector />
            
            <button 
              (click)="configDialog.open()"
              class="glass-panel flex items-center gap-2 px-[16px] py-[8px] text-white text-[12px] cursor-pointer ml-[10px] transition-colors hover:border-white/20">
              <mat-icon class="text-[16px]">vpn_key</mat-icon>
              <span>{{ t('app.config_key') }}</span>
              @if (!config.apiKey()) {
                <span class="w-[6px] h-[6px] rounded-full bg-red-500 animate-pulse" style="box-shadow: 0 0 8px #ef4444;"></span>
              }
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex flex-col flex-1 h-full px-[24px] py-[24px] gap-[20px] relative z-10 w-full max-w-[1024px] mx-auto">
        
        <div class="flex items-center gap-[16px] w-full">
          <!-- Game Mode Toggle -->
          <div class="flex items-center bg-black/40 border border-[var(--color-glass-border)] rounded-xl p-1 shrink-0">
            <button 
              (click)="setGameMode('Normal')"
              [class]="gameMode() === 'Normal' ? 'px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white bg-white/10' : 'px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white'">
              {{ t('app.normal_mode') }}
            </button>
            <button 
              (click)="setGameMode('ARAM Desordem')"
              [class]="gameMode() === 'ARAM Desordem' ? 'px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white bg-white/10 flex items-center gap-2' : 'px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white flex items-center gap-2'">
              <mat-icon class="text-[16px]">shuffle</mat-icon> {{ t('app.aram_mode') }}
            </button>
          </div>

          <app-champion-search class="flex-1" (championSelected)="onChampionSelected($event)" />
          
          @if (activeChampion()) {
            <div class="flex items-center gap-[12px] px-[16px] py-[8px] rounded-[8px] min-w-[180px]" style="background: rgba(200, 170, 110, 0.1); border: 1px solid var(--color-accent-gold);">
              <div class="w-[32px] h-[32px] rounded-[4px] border border-[var(--color-accent-gold)] bg-cover bg-center" [style.backgroundImage]="'url(' + getChampionImageUrl(activeChampion()!.id) + ')'"></div>
              <div>
                <p class="text-[10px] opacity-60 uppercase leading-tight">{{ t('app.selected') }}</p>
                <p class="font-[700] text-[var(--color-accent-gold)] leading-tight">{{ activeChampion()?.name }}</p>
              </div>
            </div>
          }
        </div>

        @if (isLoading()) {
          <div class="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 rounded-full border-t-2 border-[var(--color-accent-cyan)] animate-spin"></div>
              <div class="absolute inset-2 rounded-full border-r-2 border-[var(--color-accent-gold)] animate-spin" style="animation-direction: reverse;"></div>
              <mat-icon class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-50">auto_awesome</mat-icon>
            </div>
            <p class="text-[11px] text-[var(--color-accent-cyan)] uppercase tracking-[2px] font-[700]">{{ t('app.analyzing') }}</p>
          </div>
        }

        @if (errorMsg()) {
          <div class="mt-8 glass-panel border-red-500/30 bg-red-500/5 p-4 rounded-xl flex items-start gap-3 w-full">
            <mat-icon class="text-red-400">error_outline</mat-icon>
            <div>
              <h4 class="text-red-200 font-medium font-display">{{ t('app.error_title') }}</h4>
              <p class="text-sm text-red-300/80 mt-1">{{ errorMsg() }}</p>
              @if (errorMsg()?.includes('API Key')) {
                 <button (click)="configDialog.open()" class="mt-2 text-[12px] bg-red-500/20 text-red-100 px-3 py-1 rounded-md hover:bg-red-500/30 transition-colors">{{ t('app.config_key') }}</button>
              }
            </div>
          </div>
        }

        @if (activeChampion() && build() && !isLoading()) {
          <div class="flex-1 flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-700 w-full">
            <app-build-panel class="flex-1 flex" [build]="build()" />
          </div>
        }
        
        <footer class="text-center text-[10px] text-[var(--color-text-secondary)] pt-[10px] pb-[10px] mt-auto">
          {{ t('app.footer') }}
        </footer>
      </main>

      <app-config-dialog #configDialog />
    </div>
  `
})
export class App {
  @ViewChild('configDialog') configDialog!: ConfigDialogComponent;
  
  private aiService = inject(AiService);
  private riotData = inject(RiotDataService);
  config = inject(ConfigService);
  
  i18n = inject(I18nService);
  t = (key: string) => this.i18n.t(key);
  
  activeChampion = signal<Champion | null>(null);
  build = signal<ChampionOptimalBuild | null>(null);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  gameMode = signal<'Normal' | 'ARAM Desordem'>('Normal');

  selectedVersion = '';

  constructor() {
    this.riotData.selectedVersion$.subscribe(v => this.selectedVersion = v);
  }

  getChampionImageUrl(id: string) {
    return `https://ddragon.leagueoflegends.com/cdn/${this.selectedVersion}/img/champion/${id}.png`;
  }

  async setGameMode(mode: 'Normal' | 'ARAM Desordem') {
    this.gameMode.set(mode);
    if (this.activeChampion()) {
      await this.onChampionSelected(this.activeChampion()!);
    }
  }

  async onChampionSelected(champion: Champion) {
    this.activeChampion.set(champion);
    this.errorMsg.set(null);
    this.build.set(null);
    
    if (!this.config.apiKey()) {
      this.errorMsg.set('Você precisa configurar sua API Key do Gemini antes de continuar.');
      this.configDialog.open();
      return;
    }

    this.isLoading.set(true);
    
    try {
      const language = this.riotData.currentLanguage;
      const result = await this.aiService.generateBuilds(champion.name, this.gameMode(), language);
      this.build.set(result);
    } catch (err: any) {
      console.error(err);
      this.errorMsg.set(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
