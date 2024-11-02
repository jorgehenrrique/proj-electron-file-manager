import { useState, useEffect } from 'react';
import { TraderConfig } from '../../electron/shared/types';
import '../styles/TraderForm.css';

interface Props {
  onSave: (config: TraderConfig) => void;
  isRunning: boolean;
  initialConfig: TraderConfig;
}

export function TraderForm({ onSave, isRunning, initialConfig }: Props) {
  const [config, setConfig] = useState<TraderConfig>({
    scriptPath: '',
    locationsPath: '',
    intervalMinutes: 60,
    isRunning: false,
  });

  // Carrega a configuração inicial quando disponível
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Adicione logs para debug
    console.log('Enviando configurações:', config);

    onSave({ ...config, isRunning: true });
  };

  const handleStop = () => {
    onSave({ ...config, isRunning: false });
  };

  return (
    <form onSubmit={handleSubmit} className='trader-form'>
      <div className='form-group'>
        <label>Caminho do Script Original:</label>
        <input
          type='text'
          value={config.scriptPath}
          onChange={(e) => setConfig({ ...config, scriptPath: e.target.value })}
          disabled={isRunning}
        />
        <small>Ex: C:/DayZ/scripts/trader.json</small>
      </div>

      <div className='form-group'>
        <label>Pasta com Localizações:</label>
        <input
          type='text'
          value={config.locationsPath}
          onChange={(e) =>
            setConfig({ ...config, locationsPath: e.target.value })
          }
          disabled={isRunning}
        />
        <small>Ex: C:/DayZ/trader-locations/</small>
      </div>

      <div className='form-group'>
        <label>Intervalo (minutos):</label>
        <input
          type='number'
          value={config.intervalMinutes}
          onChange={(e) =>
            setConfig({ ...config, intervalMinutes: Number(e.target.value) })
          }
          min='1'
          disabled={isRunning}
        />
      </div>

      {isRunning ? (
        <button type='button' onClick={handleStop}>
          Parar
        </button>
      ) : (
        <button
          type='submit'
          disabled={!config.scriptPath || !config.locationsPath}
        >
          Iniciar
        </button>
      )}
    </form>
  );
}

// Interface do usuário para configuração
// Responsável por:
// 1. Campos de Entrada:
//    - scriptPath: Caminho do arquivo original do trader
//    - locationsPath: Pasta com as localizações alternativas
//    - intervalMinutes: Intervalo entre as trocas

// 2. Controles:
//    - Botão Iniciar: Começa o processo de troca
//    - Botão Parar: Interrompe o processo
//    - Validação de campos obrigatórios

// 3. Estado:
//    - Mantém estado local do formulário
//    - Sincroniza com configurações iniciais
//    - Desabilita campos durante execução
