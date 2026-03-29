import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const usuario = await login(email, senha);
      if (usuario.tipo === 'admin') {
        navigate('/dashboard');
      } else {
        setErro('Acesso restrito a administradores.');
      }
    } catch (err) {
      setErro('Email ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src="/images/logo-dakota.png" alt="Dakota Beach Tennis" style={styles.logo} />
        </div>
        <div style={styles.form}>
          <label style={styles.label}>EMAIL:</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
          />
          <label style={styles.label}>SENHA:</label>
          <input
            style={styles.input}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder=""
          />
          <span style={styles.esqueci}>Esqueci a senha</span>
          {erro && <p style={styles.erro}>{erro}</p>}
          <button
            style={{...styles.botao, opacity: carregando ? 0.7 : 1}}
            onClick={handleLogin}
            disabled={carregando}
          >
            {carregando ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2c3e50 0%, #3d5166 50%, #2c3e50 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '400px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  header: {
    backgroundColor: '#000',
    padding: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '220px',
  },
  form: {
    backgroundColor: '#fff',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '6px',
    marginTop: '12px',
  },
  input: {
    height: '48px',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '8px',
    padding: '0 16px',
    fontSize: '15px',
    outline: 'none',
  },
  esqueci: {
    fontSize: '13px',
    color: '#666',
    textAlign: 'center',
    marginTop: '8px',
    cursor: 'pointer',
  },
  botao: {
    marginTop: '20px',
    height: '52px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '1px',
  },
  erro: {
    color: 'red',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '8px',
  }
};