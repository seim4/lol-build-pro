import {Injectable, inject, PLATFORM_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {BehaviorSubject, Observable, of, tap, switchMap, catchError} from 'rxjs';

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface Item {
  name: string;
  description: string;
  plaintext: string;
  image: {
    full: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RiotDataService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private versionsSubject = new BehaviorSubject<string[]>([]);
  versions$ = this.versionsSubject.asObservable();

  private selectedVersionSubject = new BehaviorSubject<string>('');
  selectedVersion$ = this.selectedVersionSubject.asObservable();

  champions$: Observable<Champion[]> = this.selectedVersion$.pipe(
    switchMap(version => {
      if (!version) return of([]);
      return this.fetchChampions(version);
    })
  );

  items$: Observable<Record<string, Item>> = this.selectedVersion$.pipe(
    switchMap(version => {
      if (!version) return of({});
      return this.fetchItems(version);
    })
  );

  constructor() {
    this.loadVersions();
  }

  private loadVersions() {
    this.http.get<string[]>('https://ddragon.leagueoflegends.com/api/versions.json').subscribe(
      versions => {
        this.versionsSubject.next(versions);
        if (versions.length > 0) {
          this.setVersion(versions[0]);
        }
      }
    );
  }

  setVersion(version: string) {
    this.selectedVersionSubject.next(version);
  }

  private fetchChampions(version: string): Observable<Champion[]> {
    const cacheKey = `champions_${version}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<{data: Record<string, Champion>}>(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`).pipe(
      switchMap(res => {
        const championsList = Object.values(res.data);
        this.saveToCache(cacheKey, championsList);
        return of(championsList);
      }),
      catchError(() => of([]))
    );
  }

  private fetchItems(version: string): Observable<Record<string, Item>> {
    const cacheKey = `items_${version}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<{data: Record<string, Item>}>(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/item.json`).pipe(
      switchMap(res => {
        this.saveToCache(cacheKey, res.data);
        return of(res.data);
      }),
      catchError(() => of({}))
    );
  }

  private getFromCache(key: string): any {
    if (isPlatformBrowser(this.platformId)) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private saveToCache(key: string, data: any) {
    if (isPlatformBrowser(this.platformId)) {
      // Clear old versions cache to avoid localStorage quota issues
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('champions_') || k.startsWith('items_')) && k !== key) {
           keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
    }
  }
}
