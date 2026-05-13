import {Component, input, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ChampionOptimalBuild} from '../services/ai.service';
import {RiotDataService} from '../services/riot-data.service';
import {I18nService} from '../services/i18n.service';

@Component({
  selector: 'app-build-panel',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="mt-4 w-full max-w-4xl mx-auto">
      <section class="glass-card flex flex-col p-[24px]">
        <span class="text-[11px] uppercase tracking-[2px] text-[var(--color-accent-gold)] mb-[4px] font-[700]">{{ t('build.best_build') }}</span>
        <h2 class="text-[24px] font-[600] mb-[8px] text-white flex items-center justify-between">
          {{ build()?.buildName }}
        </h2>
        <p class="text-[14px] text-[var(--color-text-secondary)] mb-[24px] leading-relaxed border-b border-[var(--color-glass-border)] pb-[16px]">
          {{ build()?.description }}
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[24px] mb-[24px]">
          <div class="flex flex-col gap-[10px] bg-white/5 p-[16px] rounded-[12px]">
            <div class="flex items-center gap-[10px] mb-2">
              <div class="w-[32px] h-[32px] bg-[#222] rounded-full border border-[var(--color-accent-gold)] flex items-center justify-center">
                 <mat-icon class="text-[var(--color-accent-gold)] text-[18px]">api</mat-icon>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-[1px] text-[var(--color-text-secondary)] font-[600]">Runes</p>
                <p class="text-[14px] font-[600] leading-tight text-white mt-0.5">{{ build()?.runes }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-[10px] bg-white/5 p-[16px] rounded-[12px]">
            <div class="flex items-center gap-[10px] mb-2">
              <div class="w-[32px] h-[32px] bg-[#222] rounded-full border border-[var(--color-accent-cyan)] flex items-center justify-center">
                 <mat-icon class="text-[var(--color-accent-cyan)] text-[18px]">bolt</mat-icon>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-[1px] text-[var(--color-text-secondary)] font-[600]">{{ t('build.skill_order') }}</p>
                <p class="text-[14px] font-[600] leading-tight text-white mt-0.5">{{ build()?.skillOrder }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-[24px]">
          <h3 class="text-[14px] font-[600] text-white mb-[16px] flex items-center gap-2">
            <mat-icon class="text-[18px] text-[#ef4444]">shopping_cart</mat-icon> {{ t('build.item_order') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            @for (item of build()?.items; track item.id; let idx = $index) {
              <div class="flex gap-[12px] bg-white/5 hover:bg-white/10 p-[12px] rounded-xl transition-colors border border-white/5">
                <div class="relative shrink-0">
                   <img [src]="getItemImageUrl(item.id, item.name)" [alt]="item.name" class="w-[48px] h-[48px] rounded-[8px] border border-white/20 bg-[#050505]" referrerpolicy="no-referrer" (error)="handleImgError($event)">
                   <div class="absolute -top-2 -left-2 w-[20px] h-[20px] bg-[#222] border border-white/20 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10">{{ idx + 1 }}</div>
                </div>
                <div class="flex flex-col justify-center">
                  <p class="text-[14px] font-[600] text-white leading-tight mb-1">{{ item.name }}</p>
                  <p class="text-[12px] text-[var(--color-text-secondary)] leading-[1.4]">{{ item.reason }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        @if (build()?.augments; as augments) {
          <div class="pt-[24px] border-t border-[var(--color-glass-border)] flex flex-col gap-[16px]">
             <h3 class="text-[14px] uppercase tracking-[1px] font-[700] text-white flex items-center gap-[8px]">
               <mat-icon class="text-[18px] text-[#d946ef]">auto_awesome</mat-icon> {{ t('build.augments') }}
             </h3>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                <div class="flex flex-col gap-2">
                  <p class="text-[11px] uppercase tracking-[1px] text-[#d946ef] font-bold">{{ t('build.prismatic') }}</p>
                  @for (aug of augments.prismatic; track aug.name) {
                    <div class="bg-black/20 p-[12px] rounded-[8px] border border-white/5 border-l-2 border-l-[#d946ef] h-full">
                      <p class="text-[13px] font-[600] text-white leading-tight mb-1">{{ aug.name }}</p>
                      <p class="text-[11px] text-[var(--color-text-secondary)] leading-[1.4]">{{ aug.reason }}</p>
                    </div>
                  }
                </div>
                <div class="flex flex-col gap-2">
                  <p class="text-[11px] uppercase tracking-[1px] text-[var(--color-accent-gold)] font-bold">{{ t('build.gold') }}</p>
                  @for (aug of augments.gold; track aug.name) {
                    <div class="bg-black/20 p-[12px] rounded-[8px] border border-white/5 border-l-2 border-l-[var(--color-accent-gold)] h-full">
                      <p class="text-[13px] font-[600] text-white leading-tight mb-1">{{ aug.name }}</p>
                       <p class="text-[11px] text-[var(--color-text-secondary)] leading-[1.4]">{{ aug.reason }}</p>
                    </div>
                  }
                </div>
                <div class="flex flex-col gap-2">
                  <p class="text-[11px] uppercase tracking-[1px] text-[#cbd5e1] font-bold">{{ t('build.silver') }}</p>
                  @for (aug of augments.silver; track aug.name) {
                    <div class="bg-black/20 p-[12px] rounded-[8px] border border-white/5 border-l-2 border-l-[#cbd5e1] h-full">
                      <p class="text-[13px] font-[600] text-white leading-tight mb-1">{{ aug.name }}</p>
                      <p class="text-[11px] text-[var(--color-text-secondary)] leading-[1.4]">{{ aug.reason }}</p>
                    </div>
                  }
                </div>
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
  
  build = input<ChampionOptimalBuild | null>(null);

  selectedVersion = '';
  itemsMap: Record<string, any> = {};

  constructor() {
    this.riotData.selectedVersion$.subscribe(v => this.selectedVersion = v);
    this.riotData.items$.subscribe(items => this.itemsMap = items);
  }

  getItemImageUrl(itemId: string, itemName: string): string {
    let finalId = itemId.toString().replace(/[^0-9]/g, '');
    
    if (!this.itemsMap[finalId]) {
      const targetName = (itemName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      let bestMatchId = finalId;
      let highestScore = 0;

      for (const [id, item] of Object.entries(this.itemsMap)) {
        const currentName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (currentName === targetName) {
          bestMatchId = id;
          break;
        } else if (currentName.includes(targetName) || targetName.includes(currentName)) {
           const score = currentName.length > targetName.length ? targetName.length / currentName.length : currentName.length / targetName.length;
           if (score > highestScore && score > 0.4) {
             highestScore = score;
             bestMatchId = id;
           }
        }
      }
      finalId = bestMatchId;
    }

    return `https://ddragon.leagueoflegends.com/cdn/${this.selectedVersion}/img/item/${finalId}.png`;
  }

  handleImgError(event: any) {
    event.target.src = 'https://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/items.png';
  }
}
