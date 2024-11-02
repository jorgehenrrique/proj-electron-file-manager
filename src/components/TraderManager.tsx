import { useState, useEffect, useRef } from 'react';
import { TraderForm } from './TraderForm';
import { TraderConfig, AppSettings } from '../../electron/shared/types';
import { electronAPI } from '../services/electron';
import '../styles/TraderManager.css';

const MAX_HISTORY_SIZE = 10;

export function TraderManager() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    electronAPI
      .loadSettings()
      .then(setSettings)
      .catch((err) =>
        setError('Erro ao carregar configurações: ' + err.message)
      );

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const startTrader = async (config: TraderConfig) => {
    try {
      // Se estiver parando, limpa o timer
      if (!config.isRunning && timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Busca as configurações atuais antes de atualizar
      const currentSettings = await electronAPI.loadSettings();

      // Mantém apenas os últimos MAX_HISTORY_SIZE registros do histórico existente
      const limitedHistory = (currentSettings?.history || []).slice(
        -MAX_HISTORY_SIZE
      );

      const newSettings: AppSettings = {
        config, // Usa a configuração recebida
        history: limitedHistory, // Mantém o histórico existente
      };

      await electronAPI.saveSettings(newSettings);
      setSettings(newSettings);

      // Só inicia o loop se estiver configurado para rodar
      if (config.isRunning) {
        updateLoop(config);
      }
    } catch (err) {
      setError('Erro ao iniciar o trader: ' + (err as Error).message);
    }
  };

  const updateLoop = async (config: TraderConfig) => {
    try {
      const newLocation = await electronAPI.getRandomLocation(
        config.locationsPath
      );
      await electronAPI.updateLocation({
        originalPath: config.scriptPath,
        newPath: newLocation,
      });

      // Busca as configurações atuais antes de atualizar
      const currentSettings = await electronAPI.loadSettings();

      // Cria novo array de histórico mantendo apenas os últimos registros
      const updatedHistory = [
        ...(currentSettings?.history || []),
        {
          timestamp: new Date(),
          location: newLocation,
        },
      ].slice(-MAX_HISTORY_SIZE); // Mantém apenas os últimos registros

      const updatedSettings = {
        config: { ...config },
        history: updatedHistory,
      };

      await electronAPI.saveSettings(updatedSettings);
      setSettings(updatedSettings);

      // Agenda próxima atualização
      if (config.isRunning) {
        timerRef.current = setTimeout(() => {
          updateLoop(config);
        }, config.intervalMinutes * 60 * 1000);
      }
    } catch (err) {
      setError('Erro ao atualizar localização: ' + (err as Error).message);
      // Para o trader em caso de erro
      startTrader({ ...config, isRunning: false });
    }
  };

  if (!settings) return <div>Carregando...</div>;

  return (
    <div className='trader-manager'>
      <TraderForm
        onSave={startTrader}
        isRunning={settings.config.isRunning}
        initialConfig={settings.config}
      />

      {error && (
        <div className='error'>
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className='history'>
        <h3>Histórico de Alterações</h3>
        <ul>
          {settings.history.map((entry, index) => (
            <li key={index}>
              {new Date(entry.timestamp).toLocaleString()} - {entry.location}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Este é o componente central que gerencia toda a lógica da aplicação
// Responsável por:
// 1. Gerenciamento de Estado:
//    - Configurações do trader (settings)
//    - Estado de erro (error)
//    - Referência do timer (timerRef)

// 2. Funções Principais:
//    - loadSettings(): Carrega as configurações salvas
//    - startTrader(): Inicia/Para o processo de troca de localização
//    - updateLoop(): Executa a troca periódica de localização

// 3. Ciclo de Vida:
//    - Carrega configurações ao iniciar
//    - Limpa timers ao desmontar
//    - Mantém histórico de alterações

// 4. Renderização:
//    - Formulário de configuração (TraderForm)
//    - Mensagens de erro
//    - Histórico de alterações
