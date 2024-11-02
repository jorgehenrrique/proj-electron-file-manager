import { TraderManager } from './components/TraderManager';
import './styles/App.css';

function App() {
  return (
    <div className='App'>
      <h1>DayZ Trader Location Manager</h1>
      <TraderManager />
      <footer className='footer'>
        <p>
          Developed by{' '}
          <a
            href='https://github.com/jorgehenrrique'
            target='_blank'
            rel='noopener noreferrer'
          >
            Jorge Henrique
          </a>{' '}
          | Licensed under{' '}
          <a
            href='https://opensource.org/licenses/MIT'
            target='_blank'
            rel='noopener noreferrer'
          >
            MIT License
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

// Este é o componente raiz da aplicação
// Responsável por:
// - Estrutura básica da página
// - Header com o título
// - Renderizar o TraderManager
// - Footer com informações de autoria e licença
