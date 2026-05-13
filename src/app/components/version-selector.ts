import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {RiotDataService} from '../services/riot-data.service';
import {I18nService} from '../services/i18n.service';

@Component({
  selector: 'app-version-selector',
  standalone: true,
  imports: [AsyncPipe, MatIconModule],
  template: `
    <div class="flex items-center gap-[10px] text-[14px]">
      <span>{{ t('selector.current_patch') }}</span>
      <div class="relative">
        <select 
          class="appearance-none bg-white/5 border border-[var(--color-glass-border)] text-[var(--color-text-primary)] px-[12px] py-[6px] pr-8 rounded-[6px] outline-none cursor-pointer"
          [value]="selectedVersion$ | async"
          (change)="onVersionChange($event)">
          @for (version of versions$ | async; track version) {
            <option [value]="version" class="bg-[#0f0f13] text-white">{{ version }}</option>
          }
        </select>
        <mat-icon class="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none text-[16px]">expand_more</mat-icon>
      </div>
    </div>
  `
})
export class VersionSelectorComponent {
  private riotData = inject(RiotDataService);
  private i18n = inject(I18nService);
  t = (key: string) => this.i18n.t(key);

  versions$ = this.riotData.versions$;
  selectedVersion$ = this.riotData.selectedVersion$;

  onVersionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.riotData.setVersion(target.value);
    }
  }
}
