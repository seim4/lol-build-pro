import {Component, inject, OnInit, OnDestroy} from '@angular/core';
import {ReactiveFormsModule, FormControl} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {Subject, takeUntil} from 'rxjs';
import {RiotDataService} from '../services/riot-data.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [AsyncPipe, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center gap-[10px] text-[14px]">
      <mat-icon class="text-[18px] text-[var(--color-text-secondary)]">language</mat-icon>
      <div class="relative">
        <select 
          [formControl]="langControl"
          class="appearance-none bg-white/5 border border-[var(--color-glass-border)] text-[var(--color-text-primary)] px-[12px] py-[6px] pr-8 rounded-[6px] outline-none cursor-pointer">
          @for (lang of languages$ | async; track lang) {
            <option [value]="lang" class="bg-[#0f0f13] text-white">{{ getLanguageLabel(lang) }}</option>
          }
        </select>
        <mat-icon class="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none text-[16px]">expand_more</mat-icon>
      </div>
    </div>
  `
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  private riotData = inject(RiotDataService);
  private destroy$ = new Subject<void>();

  languages$ = this.riotData.languages$;
  langControl = new FormControl('en_US');

  private languageMap: Record<string, string> = {
    'en_US': 'English',
    'cs_CZ': 'Czech',
    'de_DE': 'Deutsch',
    'el_GR': 'Greek',
    'en_AU': 'English (AU)',
    'en_GB': 'English (UK)',
    'en_PH': 'English (PH)',
    'en_SG': 'English (SG)',
    'es_AR': 'Español (AR)',
    'es_ES': 'Español (ES)',
    'es_MX': 'Español (MX)',
    'fr_FR': 'Français',
    'hu_HU': 'Magyar',
    'id_ID': 'Bahasa Indonesia',
    'it_IT': 'Italiano',
    'ja_JP': '日本語 (Japanese)',
    'ko_KR': '한국어 (Korean)',
    'pl_PL': 'Polski',
    'pt_BR': 'Português (BR)',
    'ro_RO': 'Română',
    'ru_RU': 'Русский (Russian)',
    'th_TH': 'ภาษาไทย (Thai)',
    'tr_TR': 'Türkçe',
    'vn_VN': 'Tiếng Việt',
    'zh_CN': '简体中文 (Chinese)',
    'zh_MY': '简体中文 (MY)',
    'zh_TW': '繁體中文 (Taiwan)'
  };

  ngOnInit() {
    this.riotData.selectedLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        if (lang && this.langControl.value !== lang) {
          this.langControl.setValue(lang, {emitEvent: false});
        }
      });

    this.langControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        if (lang) {
          this.riotData.setLanguage(lang);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLanguageLabel(code: string): string {
    return this.languageMap[code] || code;
  }
}
