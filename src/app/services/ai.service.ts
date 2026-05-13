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

export interface ChampionOptimalBuild {
  buildName: string;
  description: string;
  runes: string;
  skillOrder: string;
  items: BuildItem[];
  augments?: {
    prismatic: Augment[];
    gold: Augment[];
    silver: Augment[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private configService = inject(ConfigService);

  async generateBuilds(championName: string, gameMode: 'Normal' | 'ARAM Desordem' = 'Normal', languageCode: string = 'en_US'): Promise<ChampionOptimalBuild> {
    const apiKey = this.configService.apiKey();
    if (!apiKey) {
      throw new Error('API Key do Gemini não configurada.');
    }

    const ai = new GoogleGenAI({apiKey});

    let prompt = `Você é um analista especialista em League of Legends. A resposta deve ser ESCRITA estritamente no idioma associado ao código de localização "${languageCode}" (ex: en_US = Inglês, pt_BR = Português Brasil).
    Recomende a MELHOR build atual para o campeão ${championName} no patch atual, no modo de jogo: ${gameMode}.
    
    A resposta deve conter:
    - O nome da build (ex: "Build Letalidade Anti-Squishy").
    - Uma breve descrição estratégica de como e por que usar esta build.
    - O nome da árvore principal de runas com a runa principal (ex: "Precisão - Conquistador").
    - A ordem de evolução das habilidades (ex: "Q -> E -> W. Max Q, depois E.").
    - A lista e ordem de compra de 6 itens finais completos necessários.
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

    const buildSchemaProperties: Record<string, any> = {
      buildName: {type: Type.STRING},
      description: {type: Type.STRING},
      runes: {type: Type.STRING},
      skillOrder: {type: Type.STRING},
      items: {
        type: Type.ARRAY,
        items: itemSchema
      }
    };

    const requiredBuildProperties = ['buildName', 'description', 'runes', 'skillOrder', 'items'];

    if (gameMode === 'ARAM Desordem') {
      buildSchemaProperties['augments'] = {
        type: Type.OBJECT,
        properties: {
          prismatic: augmentSchema,
          gold: augmentSchema,
          silver: augmentSchema
        },
        required: ['prismatic', 'gold', 'silver']
      };
      requiredBuildProperties.push('augments');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: buildSchemaProperties,
          required: requiredBuildProperties
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Sem resposta do Gemini');
    }

    return JSON.parse(text) as ChampionOptimalBuild;
  }
}
