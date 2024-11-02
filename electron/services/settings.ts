import { app } from 'electron';
import { AppSettings } from '../shared/types';
import * as fs from 'fs/promises';
import * as path from 'path';

// Adiciona interface para resultados de validação
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const CONFIG_FILE = path.join(__dirname, '../../trader-settings.json');
const CONFIG_FILE =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'trader-settings.json')
    : path.join(app.getPath('userData'), 'trader-settings.json');

export async function loadSettings(): Promise<AppSettings> {
  try {
    // Tenta ler o arquivo de configuração
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Se o arquivo não existir ou der erro, retorna configuração padrão
    return {
      config: {
        scriptPath: '',
        locationsPath: '',
        intervalMinutes: 60,
        isRunning: false,
      },
      history: [],
    };
  }
}

// SaveSettings inclui validação e checagem de permissões e diretórios
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    // Verifica se o diretório do arquivo de configuração existe
    const configDir = path.dirname(CONFIG_FILE);

    // Tenta criar o diretório apenas se ele não existir
    try {
      await fs.access(configDir);
    } catch {
      await fs.mkdir(configDir, { recursive: true });
    }

    // Log para debug
    console.log('Salvando configurações em:', CONFIG_FILE);
    console.log('Configurações:', settings);

    // Se houver caminhos configurados, valida-os
    if (settings.config.scriptPath && settings.config.locationsPath) {
      const pathValidation = await validatePaths(
        settings.config.scriptPath,
        settings.config.locationsPath
      );

      if (!pathValidation.isValid) {
        throw new Error(
          `Erro na validação dos caminhos: ${pathValidation.error}`
        );
      }
    }

    // Salva as configurações no arquivo JSON
    await fs.writeFile(CONFIG_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    throw new Error(
      `Falha ao salvar configurações: ${
        error instanceof Error ? error.message : 'Erro desconhecido'
      }`
    );
  }
}

export async function getRandomLocation(
  locationsPath: string
): Promise<string> {
  // Lê todos os arquivos do diretório
  const files = await fs.readdir(locationsPath);
  // Filtra apenas arquivos .json
  const locationFiles = files.filter((file) => file.endsWith('.json'));

  // Verifica se existem localizações
  if (locationFiles.length === 0) {
    throw new Error('Nenhuma localização encontrada');
  }

  // Seleciona um arquivo aleatório
  const randomFile =
    locationFiles[Math.floor(Math.random() * locationFiles.length)];
  // Constrói o caminho completo para o arquivo selecionado
  const scriptPath = path.join(locationsPath, randomFile);

  return scriptPath;
}

export async function updateTraderLocation(
  originalPath: string, // Caminho do arquivo original
  newLocationPath: string // Caminho do novo arquivo
): Promise<void> {
  // Lê o conteúdo do novo arquivo
  const newContent = await fs.readFile(newLocationPath, 'utf-8');
  // Sobrescreve o arquivo original com o novo conteúdo
  await fs.writeFile(originalPath, newContent);
}

// Gerencia a persistência e operações de arquivo
// Responsável por:
// 1. Funções de Arquivo:
//    - loadSettings(): Lê configurações do arquivo
//    - saveSettings(): Salva configurações
//    - getRandomLocation(): Seleciona localização aleatória
//    - updateTraderLocation(): Atualiza arquivo do trader

// 2. Persistência:
//    - Mantém configurações em arquivo JSON
//    - Gerencia histórico de alterações

// Função para verificar permissões de arquivo
async function checkFilePermissions(
  filePath: string
): Promise<ValidationResult> {
  try {
    await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Erro de permissão no arquivo: ${
        error instanceof Error ? error.message : 'Desconhecido'
      }`,
    };
  }
}

// Função para validar caminhos
export async function validatePaths(
  scriptPath: string,
  locationsPath: string
): Promise<ValidationResult> {
  try {
    // Verifica se os caminhos existem
    if (!scriptPath || !locationsPath) {
      return {
        isValid: false,
        error: 'Caminhos não podem estar vazios',
      };
    }

    // Verifica se os diretórios existem
    const [scriptExists, locationsExists] = await Promise.all([
      fs
        .access(scriptPath)
        .then(() => true)
        .catch(() => false),
      fs
        .access(locationsPath)
        .then(() => true)
        .catch(() => false),
    ]);

    if (!scriptExists || !locationsExists) {
      return {
        isValid: false,
        error: 'Um ou mais caminhos não existem',
      };
    }

    // Verifica permissões
    const [scriptPerms, locationsPerms] = await Promise.all([
      checkFilePermissions(scriptPath),
      checkFilePermissions(locationsPath),
    ]);

    if (!scriptPerms.isValid) {
      return {
        isValid: false,
        error: `Erro nas permissões do script: ${scriptPerms.error}`,
      };
    }

    if (!locationsPerms.isValid) {
      return {
        isValid: false,
        error: `Erro nas permissões das localizações: ${locationsPerms.error}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Erro na validação dos caminhos: ${
        error instanceof Error ? error.message : 'Desconhecido'
      }`,
    };
  }
}
