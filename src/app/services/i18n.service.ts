import {Injectable, inject, computed} from '@angular/core';
import {RiotDataService} from './riot-data.service';
import {toSignal} from '@angular/core/rxjs-interop';

const EN = {
  'app.subtitle': 'Discover the Perfect Build.',
  'app.description': 'Select your champion and let the AI calculate the best item and rune strategies for the current meta.',
  'app.analyzing': 'Analyzing the Meta...',
  'app.error_title': 'Error generating builds',
  'app.config_key': 'Config API',
  'app.footer': 'Generated via Gemini Pro AI & Riot Games Data Dragon API',
  'app.search_placeholder': 'Search Champions...',
  'app.selected': 'Selected',
  'app.normal_mode': 'Normal',
  'app.aram_mode': 'ARAM',
  'config.title': 'Configuration (BYOK)',
  'config.description': 'Provide your Google Gemini API key to enable AI-generated recommendations. The key is saved only in your browser (localStorage).',
  'config.get_key': 'Get an API key',
  'config.cancel': 'Cancel',
  'config.save': 'Save',
  'build.augments': 'Augments',
  'build.prismatic': 'Prismatic',
  'build.gold': 'Gold',
  'build.silver': 'Silver',
  'build.best_build': 'Best Build',
  'build.skill_order': 'Skill Order',
  'build.item_order': 'Item Order',
  'selector.current_patch': 'Current Patch:'
};

const PT = {
  'app.subtitle': 'Descubra a Build Perfeita.',
  'app.description': 'Selecione seu campeão e deixe a IA calcular as melhores estratégias de itens e runas para o meta atual.',
  'app.analyzing': 'Analisando o Meta...',
  'app.error_title': 'Erro ao gerar builds',
  'app.config_key': 'Configurar API',
  'app.footer': 'Gerado via Gemini Pro AI e API Data Dragon da Riot Games',
  'app.search_placeholder': 'Buscar Campeão...',
  'app.selected': 'Selecionado',
  'app.normal_mode': 'Normal',
  'app.aram_mode': 'ARAM',
  'config.title': 'Configuração (BYOK)',
  'config.description': 'Forneça sua chave de API do Google Gemini para habilitar recomendações por IA. A chave é salva apenas no seu navegador.',
  'config.get_key': 'Obter chave de API',
  'config.cancel': 'Cancelar',
  'config.save': 'Salvar',
  'build.augments': 'Aprimoramentos',
  'build.prismatic': 'Prismático',
  'build.gold': 'Ouro',
  'build.silver': 'Prata',
  'build.best_build': 'Melhor Build',
  'build.skill_order': 'Ordem das Habilidades',
  'build.item_order': 'Ordem dos Itens',
  'selector.current_patch': 'Patch Atual:'
};

const ES = {
  'app.subtitle': 'Descubre la Build Perfecta.',
  'app.description': 'Selecciona tu campeón y deja que la IA calcule las mejores estrategias de objetos y runas para el meta actual.',
  'app.analyzing': 'Analizando el Meta...',
  'app.error_title': 'Error al generar builds',
  'app.config_key': 'Configurar API',
  'app.footer': 'Generado vía Gemini Pro AI & API Data Dragon de Riot Games',
  'app.search_placeholder': 'Buscar Campeones...',
  'app.selected': 'Seleccionado',
  'app.normal_mode': 'Normal',
  'app.aram_mode': 'ARAM',
  'config.title': 'Configuración (BYOK)',
  'config.description': 'Proporciona tu clave de API de Google Gemini para habilitar recomendaciones por IA. La clave se guarda solo en tu navegador.',
  'config.get_key': 'Obtener clave de API',
  'config.cancel': 'Cancelar',
  'config.save': 'Guardar',
  'build.augments': 'Aumentos',
  'build.prismatic': 'Prismático',
  'build.gold': 'Oro',
  'build.silver': 'Plata',
  'build.best_build': 'Mejor Build',
  'build.skill_order': 'Orden de Habilidades',
  'build.item_order': 'Orden de Objetos',
  'selector.current_patch': 'Parche Actual:'
};

const DICTS: Record<string, Record<string, string>> = {
  'en_US': EN, 'en_AU': EN, 'en_GB': EN, 'en_PH': EN, 'en_SG': EN,
  'pt_BR': PT,
  'es_AR': ES, 'es_ES': ES, 'es_MX': ES
};

@Injectable({providedIn: 'root'})
export class I18nService {
  private riotData = inject(RiotDataService);
  private lang = toSignal(this.riotData.selectedLanguage$, {initialValue: 'en_US'});

  t(key: string): string {
    const currentLang = this.lang();
    const dict = DICTS[currentLang] || EN;
    return dict[key] || EN[key as keyof typeof EN] || key;
  }
}
