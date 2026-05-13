import {Component, inject, signal, output, effect, OnDestroy} from '@angular/core';
import {ReactiveFormsModule, FormControl} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {debounceTime, distinctUntilChanged, Subject, takeUntil, map, combineLatest, startWith} from 'rxjs';
import {RiotDataService, Champion} from '../services/riot-data.service';

@Component({
  selector: 'app-champion-search',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, MatIconModule],
  template: `
    <div class="relative w-full">
      <div class="relative">
        <mat-icon class="absolute left-[20px] top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none">search</mat-icon>
        <input
          [formControl]="searchControl"
          type="text"
          class="glass-input w-full pl-[56px] pr-[20px] py-[14px] text-[16px] placeholder-[var(--color-text-secondary)]"
          placeholder="Search Champions..."
          (focus)="isFocused.set(true)"
          (blur)="onBlur()"
        />
      </div>

      @if (isFocused() && (filteredChampions$ | async)?.length) {
        <div class="absolute w-full mt-[10px] glass-panel max-h-[300px] overflow-y-auto z-40 p-2 flex flex-col gap-1 shadow-2xl">
          @for (champ of filteredChampions$ | async; track champ.id) {
            <button 
              (click)="selectChampion(champ)"
              class="flex items-center gap-[12px] p-[8px] rounded-[8px] hover:bg-white/5 transition-colors text-left w-full cursor-pointer">
              <div 
                class="w-[32px] h-[32px] rounded-[4px] border border-[var(--color-accent-gold)] bg-cover bg-center shrink-0"
                [style.backgroundImage]="'url(' + getChampionImageUrl(champ) + ')'"
              ></div>
              <div>
                <div class="font-[700] text-white text-[14px] leading-tight">{{ champ.name }}</div>
                <div class="text-[11px] text-[var(--color-text-secondary)] leading-tight mt-0.5">{{ champ.title }}</div>
              </div>
            </button>
          }
        </div>
      }
    </div>
  `
})
export class ChampionSearchComponent implements OnDestroy {
  private riotData = inject(RiotDataService);
  private destroy$ = new Subject<void>();

  searchControl = new FormControl('');
  isFocused = signal(false);
  
  championSelected = output<Champion>();

  private version = '';

  constructor() {
    this.riotData.selectedVersion$.pipe(takeUntil(this.destroy$)).subscribe(v => this.version = v);
  }

  filteredChampions$ = combineLatest([
    this.riotData.champions$,
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged()
    )
  ]).pipe(
    map(([champions, searchTerm]) => {
      if (!champions) return [];
      const term = (searchTerm || '').toLowerCase().trim();
      if (!term) return Object.values(champions).slice(0, 50); // Show tip of iceberg
      return Object.values(champions)
        .filter(c => c.name.toLowerCase().includes(term))
        .slice(0, 10);
    })
  );

  getChampionImageUrl(champ: Champion): string {
    return `https://ddragon.leagueoflegends.com/cdn/${this.version}/img/champion/${champ.id}.png`;
  }

  selectChampion(champ: Champion) {
    this.searchControl.setValue(champ.name, {emitEvent: false});
    this.isFocused.set(false);
    this.championSelected.emit(champ);
  }

  onBlur() {
    // Timeout to allow click event on button to fire before hiding the dropdown
    setTimeout(() => this.isFocused.set(false), 200);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
