import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  loadSettings,
  saveSettings,
  updateTraderLocation,
  getRandomLocation,
} from './services/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

// Registra os handlers IPC antes de criar a janela
function registerIpcHandlers() {
  // IPC Handlers
  ipcMain.handle('load-settings', async () => {
    try {
      return await loadSettings();
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      throw error;
    }
  });

  ipcMain.handle('save-settings', async (_, settings) => {
    try {
      await saveSettings(settings);
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  });

  ipcMain.handle('get-random-location', async (_, locationsPath) => {
    try {
      return await getRandomLocation(locationsPath);
    } catch (error) {
      console.error('Erro ao obter localização aleatória:', error);
      throw error;
    }
  });

  ipcMain.handle('update-location', async (_, { originalPath, newPath }) => {
    try {
      await updateTraderLocation(originalPath, newPath);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      throw error;
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../build/icon.png'), // ícone da janela
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // Desabilita integração direta com Node
      preload: path.join(__dirname, 'preload.js'), // Adiciona script preload
    },
  });

  // Em desenvolvimento, conecta ao servidor Vite
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // Em produção, carrega o arquivo buildado
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Registra handlers e cria janela quando o app estiver pronto
app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  // Verifica se o sistema operacional não é macOS (darwin)
  // No Windows e Linux, o app fecha quando todas as janelas são fechadas
  // No macOS, é comum manter o app rodando mesmo sem janelas
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Verifica se não há nenhuma janela aberta
  // Se não houver, cria uma nova janela
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
