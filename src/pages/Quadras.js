import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Quadras() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    carregarQuadras();
  }, []);

  async function carregarQuadras() {
    try {
      const res = await api.get('/quadras/');
      setQuadras(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarEdicao(id, dados) {
    try {
      await api.patch(`/quadras/${id}`, dados);
      setEditando(null);
      carregarQuadras();
    } catch (err) {
      alert('Erro ao atualizar quadra.');
    }
  }

  const statusLabel = (s) => ({ ativa: 'Ativa', manutencao: 'Manutenção', evento: 'Evento' }[s] || s);
  const esporteLabel = (e) => ({ beach_tennis: 'Beach Tennis', volei: 'Vôlei', ambos: 'Ambos' }[e] || e);

  const statusStyle = (s) => ({
    ativa: { background: '#e8f5e9', color: '#2e7d32' },
    manutencao: { background: '#fce4ec', color: '#880e4f' },
    evento: { background: '#fff3e0', color: '#e65100' },
  }[s] || {});

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <img src="/images/logo-dakota.png" alt="Dakota" style={{ width: '140px' }} />
        </div>
        <div style={styles.sidebarNav}>
          {[
            { label: 'Agenda do dia', rota: '/dashboard' },
            { label: 'Reservas', rota: '/reservas' },
            { label: 'Quadras', rota: '/quadras', ativo: true },
            { label: 'Usuários', rota: '/usuarios' },
            { label: 'Bloqueios', rota: '/bloqueios' },
          ].map((item) => (
            <div key={item.label} onClick={() => navigate(item.rota)} style={{ ...styles.navItem, ...(item.ativo ? styles.navAtivo : {}) }}>
              {item.label}
            </div>
          ))}
        </div>
        <div style={styles.sidebarUser}>
          <div style={styles.userName}>{usuario?.nome}</div>
          <div style={styles.logoutBtn} onClick={logout}>Sair</div>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <span style={styles.topbarTitle}>Quadras</span>
          <span style={styles.topbarDate}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <div style={styles.content}>
          {carregando ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Carregando...</div>
          ) : (
            <div style={styles.grid}>
              {quadras.map(q => (
                <div key={q.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardNome}>{q.nome}</span>
                    <span style={{ ...styles.badge, ...statusStyle(q.status) }}>{statusLabel(q.status)}</span>
                  </div>
                  <div style={styles.cardInfo}>
                    <span style={styles.cardLabel}>Esporte</span>
                    <span style={styles.cardValor}>{esporteLabel(q.esporte)}</span>
                  </div>

                  {editando === q.id ? (
                    <EditarQuadra quadra={q} onSalvar={(dados) => salvarEdicao(q.id, dados)} onCancelar={() => setEditando(null)} />
                  ) : (
                    <button style={styles.btnEditar} onClick={() => setEditando(q.id)}>Editar</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditarQuadra({ quadra, onSalvar, onCancelar }) {
  const [status, setStatus] = useState(quadra.status);
  const [esporte, setEsporte] = useState(quadra.esporte);
  const [nome, setNome] = useState(quadra.nome);

  return (
    <div style={{ marginTop: 12, borderTop: '0.5px solid #e0e0e0', paddingTop: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <label style={styles.inputLabel}>Nome</label>
        <input style={styles.input} value={nome} onChange={e => setNome(e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={styles.inputLabel}>Status</label>
        <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="ativa">Ativa</option>
          <option value="manutencao">Manutenção</option>
          <option value="evento">Evento</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.inputLabel}>Esporte</label>
        <select style={styles.input} value={esporte} onChange={e => setEsporte(e.target.value)}>
          <option value="ambos">Ambos</option>
          <option value="beach_tennis">Beach Tennis</option>
          <option value="volei">Vôlei</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={styles.btnSalvar} onClick={() => onSalvar({ nome, status, esporte })}>Salvar</button>
        <button style={styles.btnCancelar} onClick={onCancelar}>Cancelar</button>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' },
  sidebar: { width: 220, background: '#111', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarLogo: { padding: '24px 20px', borderBottom: '0.5px solid #333' },
  sidebarNav: { padding: '16px 0', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', padding: '10px 20px', fontSize: 13, color: '#aaa', cursor: 'pointer', borderLeft: '3px solid transparent' },
  navAtivo: { color: '#fff', borderLeft: '3px solid #4caf50', background: 'rgba(255,255,255,0.05)' },
  sidebarUser: { padding: '16px 20px', borderTop: '0.5px solid #333' },
  userName: { fontSize: 13, color: '#aaa' },
  logoutBtn: { fontSize: 12, color: '#666', cursor: 'pointer', marginTop: 4 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  topbar: { background: '#fff', borderBottom: '0.5px solid #e0e0e0', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarTitle: { fontSize: 16, fontWeight: 500, color: '#222' },
  topbarDate: { fontSize: 13, color: '#888' },
  content: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '16px' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardNome: { fontSize: 15, fontWeight: 500, color: '#222' },
  cardInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 12, color: '#888' },
  cardValor: { fontSize: 13, color: '#333' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  btnEditar: { width: '100%', padding: '8px', borderRadius: 8, fontSize: 13, border: '0.5px solid #e0e0e0', background: '#f5f5f5', color: '#333', cursor: 'pointer' },
  btnSalvar: { flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontWeight: 500 },
  btnCancelar: { flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, border: '0.5px solid #e0e0e0', background: '#fff', color: '#888', cursor: 'pointer' },
  inputLabel: { display: 'block', fontSize: 11, color: '#888', marginBottom: 4 },
  input: { width: '100%', padding: '7px 10px', borderRadius: 8, border: '0.5px solid #e0e0e0', fontSize: 13, outline: 'none', background: '#fafafa' },
};