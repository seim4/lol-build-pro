import {Injectable, inject} from '@angular/core';
import {GoogleGenAI, Type} from '@google/genai';
import {ConfigService} from './config.service';

export interface BuildItem {
  id: string;
  name: string;
  reason: string;
}

export interface Augment {
  name: string;
  reason: string;
}

export interface BuildSetup {
  items: BuildItem[];
  runes: string;
  augments?: {
    prismatic: Augment[];
    gold: Augment[];
    silver: Augment[];
  };
}

export interface ChampionBuilds {
  antiTank: BuildSetup;
  antiSquishy: BuildSetup;
  poke: BuildSetup;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private configService = inject(ConfigService);

  async generateBuilds(championName: string, gameMode: 'Normal' | 'ARAM Desordem' = 'Normal'): Promise<ChampionBuilds> {
    const apiKey = this.configService.apiKey();
    if (!apiKey) {
      throw new Error('API Key do Gemini não configurada.');
    }

    const ai = new GoogleGenAI({apiKey});

    let prompt = `Você é um analista especialista em League of Legends. Recomende 3 builds diferentes para o campeão ${championName} no patch atual, no modo de jogo: ${gameMode}.
    As 3 builds são:
    1. antiTank: Otimizada para derreter tanques (HP alto, Armadura, MR).
    2. antiSquishy: Focada em burst e letalidade para deletar alvos frágeis.
    3. poke (ou Safe/Sustain): Focada em alcance, sobrevivência ou sustain.

    Para cada build, forneça:
    - O nome da árvore principal de runas com a runa principal (ex: "Precisão - Conquistador").
    - Lista de 6 itens finais completos necessários.
    ATENÇÃO: O 'id' do item deve ser o ID estrito do item no Data Dragon da Riot Games (ex: "3031" para Gume do Infinito, "3153" para Espada do Rei Destruído, "3089" para Rabadon, "3157" para Zhonyas). Se não souber o ID numérico exato do Data Dragon, aproxime seu palpite, mas priorize os números de 4 dígitos clássicos.`;

    if (gameMode === 'ARAM Desordem') {
      prompt += `
      - Como o modo é ARAM Desordem com aprimoramentos (como no Arena/Modo Horda), inclua sugestões de aprimoramentos (Augments) ideais para essa build:
        - Liste até 2 aprimoramentos Prismáticos.
        - Liste até 2 aprimoramentos Dourados (Gold).
        - Liste até 2 aprimoramentos Prateados (Silver).`;
    }

    const itemSchema = {
      type: Type.OBJECT,
      properties: {
        id: {type: Type.STRING},
        name: {type: Type.STRING},
        reason: {type: Type.STRING}
      },
      required: ['id', 'name', 'reason']
    };

    const augmentSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {type: Type.STRING},
          reason: {type: Type.STRING}
        },
        required: ['name', 'reason']
      }
    };

    const buildSetupSchemaProperties: Record<string, any> = {
      runes: {type: Type.STRING},
      items: {
        type: Type.ARRAY,
        items: itemSchema
      }
    };

    const requiredBuildSetupProperties = ['runes', 'items'];

    if (gameMode === 'ARAM Desordem') {
      buildSetupSchemaProperties['augments'] = {
        type: Type.OBJECT,
        properties: {
          prismatic: augmentSchema,
          gold: augmentSchema,
          silver: augmentSchema
        },
        required: ['prismatic', 'gold', 'silver']
      };
      requiredBuildSetupProperties.push('augments');
    }

    const buildSetupSchema = {
      type: Type.OBJECT,
      properties: buildSetupSchemaProperties,
      required: requiredBuildSetupProperties
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            antiTank: buildSetupSchema,
            antiSquishy: buildSetupSchema,
            poke: buildSetupSchema
          },
          required: ['antiTank', 'antiSquishy', 'poke']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Sem resposta do Gemini');
    }

    return JSON.parse(text) as ChampionBuilds;
  }
}
