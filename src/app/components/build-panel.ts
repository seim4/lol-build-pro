import {Component, input, inject, computed} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ChampionBuilds, BuildSetup} from '../services/ai.service';
import {RiotDataService} from '../services/riot-data.service';
import {I18nService} from '../services/i18n.service';

@Component({
  selector: 'app-build-panel',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-[20px] w-full mt-4">
      <!-- Anti-Squishy -->
      <section class="glass-card flex flex-col p-[20px]">
        <span class="text-[11px] uppercase tracking-[2px] text-[var(--color-accent-cyan)] mb-[4px] font-[700]">Slayer</span>
        <h2 class="text-[18px] font-[600] mb-[16px] border-b border-[var(--color-glass-border)] pb-[8px] flex items-center justify-between">
          {{ t('build.anti_squishy') }}
        </h2>
        
        <div class="mb-[20px] flex items-center gap-[10px] bg-white/5 p-[10px] rounded-[8px]">
          <div class="w-[28px] h-[28px] bg-[#222] rounded-full border border-[var(--color-accent-cyan)] flex items-center justify-center">
             <mat-icon class="text-[var(--color-accent-cyan)] text-[16px]">api</mat-icon>
          </div>
          <div>
            <p class="text-[12px] font-[600] leading-tight text-white">{{ builds()?.antiSquishy?.runes }}</p>
            <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight mt-0.5">{{ t('build.burst_focus') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-[12px]">
          @for (item of builds()?.antiSquishy?.items; track item.id) {
            <div class="flex gap-[12px] hover:bg-white/5 p-1 -m-1 rounded-lg transition-colors">
              <img [src]="getItemImageUrl(item.id)" [alt]="item.name" class="w-[42px] h-[42px] rounded-[6px] border border-white/10 bg-[#050505] shrink-0" referrerpolicy="no-referrer" (error)="handleImgError($event)">
              <div class="flex flex-col justify-center">
                <p class="text-[13px] font-[600] text-white leading-tight">{{ item.name }}</p>
                <p class="text-[11px] text-[var(--color-text-secondary)] leading-[1.3] mt-0.5">{{ item.reason }}</p>
              </div>
            </div>
          }
        </div>

        @if (builds()?.antiSquishy?.augments; as augments) {
          <div class="mt-[20px] pt-[16px] border-t border-[var(--color-glass-border)] flex flex-col gap-[10px]">
             <h3 class="text-[12px] uppercase tracking-[1px] font-[700] text-white flex items-center gap-[6px]">
               <mat-icon class="text-[14px] text-[var(--color-accent-cyan)]">auto_awesome</mat-icon> {{ t('build.augments') }}
             </h3>
             <div class="flex flex-col gap-[8px]">
                @for (aug of augments.prismatic; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[#d946ef]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[#d946ef] ml-1 uppercase font-bold">{{ t('build.prismatic') }}</span></p>
                    <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
                @for (aug of augments.gold; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[var(--color-accent-gold)]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[var(--color-accent-gold)] ml-1 uppercase font-bold">{{ t('build.gold') }}</span></p>
                    <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
                @for (aug of augments.silver; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[#cbd5e1]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[#cbd5e1] ml-1 uppercase font-bold">{{ t('build.silver') }}</span></p>
                    <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
             </div>
          </div>
        }
      </section>

      <!-- Anti-Tank -->
      <section class="glass-card flex flex-col p-[20px]">
        <span class="text-[11px] uppercase tracking-[2px] text-[#ef4444] mb-[4px] font-[700]">Skirmisher</span>
        <h2 class="text-[18px] font-[600] mb-[16px] border-b border-[var(--color-glass-border)] pb-[8px] flex items-center justify-between">
          {{ t('build.anti_tank') }}
        </h2>
        
        <div class="mb-[20px] flex items-center gap-[10px] bg-white/5 p-[10px] rounded-[8px]">
          <div class="w-[28px] h-[28px] bg-[#222] rounded-full border border-[#ef4444] flex items-center justify-center">
             <mat-icon class="text-[#ef4444] text-[16px]">api</mat-icon>
          </div>
          <div>
            <p class="text-[12px] font-[600] leading-tight text-white">{{ builds()?.antiTank?.runes }}</p>
            <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight mt-0.5">{{ t('build.sustained_combat') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-[12px]">
          @for (item of builds()?.antiTank?.items; track item.id) {
            <div class="flex gap-[12px] hover:bg-white/5 p-1 -m-1 rounded-lg transition-colors">
              <img [src]="getItemImageUrl(item.id)" [alt]="item.name" class="w-[42px] h-[42px] rounded-[6px] border border-white/10 bg-[#050505] shrink-0" referrerpolicy="no-referrer" (error)="handleImgError($event)">
              <div class="flex flex-col justify-center">
                <p class="text-[13px] font-[600] text-white leading-tight">{{ item.name }}</p>
                <p class="text-[11px] text-[var(--color-text-secondary)] leading-[1.3] mt-0.5">{{ item.reason }}</p>
              </div>
            </div>
          }
        </div>

        @if (builds()?.antiTank?.augments; as augments) {
          <div class="mt-[20px] pt-[16px] border-t border-[var(--color-glass-border)] flex flex-col gap-[10px]">
             <h3 class="text-[12px] uppercase tracking-[1px] font-[700] text-white flex items-center gap-[6px]">
               <mat-icon class="text-[14px] text-[#ef4444]">auto_awesome</mat-icon> {{ t('build.augments') }}
             </h3>
             <div class="flex flex-col gap-[8px]">
                @for (aug of augments.prismatic; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[#d946ef]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[#d946ef] ml-1 uppercase font-bold">{{ t('build.prismatic') }}</span></p>
                    <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
                @for (aug of augments.gold; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[var(--color-accent-gold)]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[var(--color-accent-gold)] ml-1 uppercase font-bold">{{ t('build.gold') }}</span></p>
                     <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
                @for (aug of augments.silver; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[#cbd5e1]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[#cbd5e1] ml-1 uppercase font-bold">{{ t('build.silver') }}</span></p>
                    <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
             </div>
          </div>
        }
      </section>

      <!-- Poke / Safe -->
      <section class="glass-card flex flex-col p-[20px]">
        <span class="text-[11px] uppercase tracking-[2px] text-[var(--color-accent-gold)] mb-[4px] font-[700]">Strategic</span>
        <h2 class="text-[18px] font-[600] mb-[16px] border-b border-[var(--color-glass-border)] pb-[8px] flex items-center justify-between">
          {{ t('build.poke_safe') }}
        </h2>
        
        <div class="mb-[20px] flex items-center gap-[10px] bg-white/5 p-[10px] rounded-[8px]">
          <div class="w-[28px] h-[28px] bg-[#222] rounded-full border border-[var(--color-accent-gold)] flex items-center justify-center">
             <mat-icon class="text-[var(--color-accent-gold)] text-[16px]">api</mat-icon>
          </div>
          <div>
            <p class="text-[12px] font-[600] leading-tight text-white">{{ builds()?.poke?.runes }}</p>
            <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight mt-0.5">{{ t('build.infinite_scaling') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-[12px]">
          @for (item of builds()?.poke?.items; track item.id) {
            <div class="flex gap-[12px] hover:bg-white/5 p-1 -m-1 rounded-lg transition-colors">
              <img [src]="getItemImageUrl(item.id)" [alt]="item.name" class="w-[42px] h-[42px] rounded-[6px] border border-white/10 bg-[#050505] shrink-0" referrerpolicy="no-referrer" (error)="handleImgError($event)">
              <div class="flex flex-col justify-center">
                <p class="text-[13px] font-[600] text-white leading-tight">{{ item.name }}</p>
                <p class="text-[11px] text-[var(--color-text-secondary)] leading-[1.3] mt-0.5">{{ item.reason }}</p>
              </div>
            </div>
          }
        </div>

        @if (builds()?.poke?.augments; as augments) {
          <div class="mt-[20px] pt-[16px] border-t border-[var(--color-glass-border)] flex flex-col gap-[10px]">
             <h3 class="text-[12px] uppercase tracking-[1px] font-[700] text-white flex items-center gap-[6px]">
               <mat-icon class="text-[14px] text-[var(--color-accent-gold)]">auto_awesome</mat-icon> {{ t('build.augments') }}
             </h3>
             <div class="flex flex-col gap-[8px]">
                @for (aug of augments.prismatic; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[#d946ef]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[#d946ef] ml-1 uppercase font-bold">{{ t('build.prismatic') }}</span></p>
                    <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
                @for (aug of augments.gold; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[var(--color-accent-gold)]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[var(--color-accent-gold)] ml-1 uppercase font-bold">{{ t('build.gold') }}</span></p>
                     <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
                @for (aug of augments.silver; track aug.name) {
                  <div class="bg-black/20 p-[8px] rounded-[6px] border border-white/5 border-l-2 border-l-[#cbd5e1]">
                    <p class="text-[12px] font-[600] text-white leading-tight mb-1">{{ aug.name }} <span class="text-[9px] text-[#cbd5e1] ml-1 uppercase font-bold">{{ t('build.silver') }}</span></p>
                    <p class="text-[10px] text-[var(--color-text-secondary)] leading-tight">{{ aug.reason }}</p>
                  </div>
                }
             </div>
          </div>
        }
      </section>
    </div>
  `
})
export class BuildPanelComponent {
  private riotData = inject(RiotDataService);
  private i18n = inject(I18nService);
  t = (key: string) => this.i18n.t(key);
  
  builds = input<ChampionBuilds | null>(null);

  selectedVersion = '';

  constructor() {
    this.riotData.selectedVersion$.subscribe(v => this.selectedVersion = v);
  }

  getItemImageUrl(itemId: string): string {
    // Basic formatting clean to ensure the AI didn't pass strings that won't match
    const cleanId = itemId.toString().replace(/[^0-9]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/${this.selectedVersion}/img/item/${cleanId}.png`;
  }

  handleImgError(event: any) {
    // If image fails to load, fallback to a placeholder
    event.target.src = 'https://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/items.png';
  }
}
