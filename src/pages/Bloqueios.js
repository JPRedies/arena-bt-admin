import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Bloqueios() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [bloqueios, setBloqueios] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [novoBloqueio, setNovoBloqueio] = useState(false);
  const [form, setForm] = useState({ quadra_id: '', slot_inicio: '', slot_fim: '', tipo: 'aula', esporte: 'beach_tennis', motivo: '' });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resBloqueios, resQuadras] = await Promise.all([
        api.get('/bloqueios/hoje'),
        api.get('/quadras/')
      ]);
      setBloqueios(resBloqueios.data);
      setQuadras(resQuadras.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function criarBloqueio() {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      await api.post('/bloqueios/', {
        ...form,
        quadra_id: parseInt(form.quadra_id),
        data: `${hoje}T00:00:00`,
        slot_inicio: `${hoje}T${form.slot_inicio}:00`,
        slot_fim: `${hoje}T${form.slot_fim}:00`,
      });
      setNovoBloqueio(false);
      setForm({ quadra_id: '', slot_inicio: '', slot_fim: '', tipo: 'aula', esporte: 'beach_tennis', motivo: '' });
      carregarDados();
    } catch (err) {
      alert('Erro ao criar bloqueio. Verifique os dados.');
    }
  }

  async function deletarBloqueio(id) {
    if (!window.confirm('Deseja remover este bloqueio?')) return;
    try {
      await api.delete(`/bloqueios/${id}`);
      carregarDados();
    } catch (err) {
      alert('Erro ao remover bloqueio.');
    }
  }

  const tipoStyle = (t) => ({
    aula: { background: '#fff3e0', color: '#e65100' },
    manutencao: { background: '#fce4ec', color: '#880e4f' },
    evento: { background: '#e8eaf6', color: '#283593' },
  }[t] || {});

  const esporteLabel = (e) => ({ beach_tennis: 'Beach Tennis', volei: 'Vôlei' }[e] || '—');
  const formatarHora = (dt) => new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const quadraNome = (id) => quadras.find(q => q.id === id)?.nome || `Quadra ${id}`;

  const HORARIOS = ['16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30'];

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
            { label: 'Quadras', rota: '/quadras' },
            { label: 'Usuários', rota: '/usuarios' },
            { label: 'Bloqueios', rota: '/bloqueios', ativo: true },
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
          <span style={styles.topbarTitle}>Bloqueios</span>
          <button style={styles.btnNovo} onClick={() => setNovoBloqueio(!novoBloqueio)}>
            {novoBloqueio ? 'Cancelar' : '+ Novo bloqueio'}
          </button>
        </div>

        <div style={styles.content}>
          {novoBloqueio && (
            <div style={styles.formCard}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.inputLabel}>Quadra</label>
                  <select style={styles.input} value={form.quadra_id} onChange={e => setForm({ ...form, quadra_id: e.target.value })}>
                    <option value="">Selecione</option>
                    {quadras.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Tipo</label>
                  <select style={styles.input} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="aula">Aula</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="evento">Evento</option>
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Esporte</label>
                  <select style={styles.input} value={form.esporte} onChange={e => setForm({ ...form, esporte: e.target.value })}>
                    <option value="beach_tennis">Beach Tennis</option>
                    <option value="volei">Vôlei</option>
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Início</label>
                  <select style={styles.input} value={form.slot_inicio} onChange={e => setForm({ ...form, slot_inicio: e.target.value })}>
                    <option value="">Selecione</option>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Fim</label>
                  <select style={styles.input} value={form.slot_fim} onChange={e => setForm({ ...form, slot_fim: e.target.value })}>
                    <option value="">Selecione</option>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Motivo (opcional)</label>
                  <input style={styles.input} value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} />
                </div>
              </div>
              <button style={styles.btnSalvar} onClick={criarBloqueio}>Criar bloqueio</button>
            </div>
          )}

          {carregando ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Carregando...</div>
          ) : (
            <div style={styles.tabelaWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['#', 'Quadra', 'Horário', 'Tipo', 'Esporte', 'Motivo', 'Ação'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bloqueios.map(b => (
                    <tr key={b.id} style={styles.tr}>
                      <td style={{ ...styles.td, color: '#aaa', fontSize: 12 }}>#{b.id}</td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{quadraNome(b.quadra_id)}</td>
                      <td style={styles.td}>{formatarHora(b.slot_inicio)} – {formatarHora(b.slot_fim)}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, ...tipoStyle(b.tipo) }}>{b.tipo}</span></td>
                      <td style={styles.td}>{esporteLabel(b.esporte)}</td>
                      <td style={{ ...styles.td, color: '#888' }}>{b.motivo || '—'}</td>
                      <td style={styles.td}>
                        <button style={styles.btnDeletar} onClick={() => deletarBloqueio(b.id)}>Remover</button>
                      </td>
                    </tr>
                  ))}
                  {bloqueios.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Nenhum bloqueio hoje</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
  content: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  formCard: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: 20, marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 },
  inputLabel: { display: 'block', fontSize: 11, color: '#888', marginBottom: 4 },
  input: { width: '100%', padding: '7px 10px', borderRadius: 8, border: '0.5px solid #e0e0e0', fontSize: 13, outline: 'none', background: '#fafafa' },
  btnNovo: { padding: '8px 16px', borderRadius: 8, fontSize: 13, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontWeight: 500 },
  btnSalvar: { padding: '8px 24px', borderRadius: 8, fontSize: 13, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontWeight: 500 },
  btnDeletar: { padding: '4px 10px', borderRadius: 6, fontSize: 11, border: '0.5px solid #ffcdd2', background: '#fff5f5', color: '#c62828', cursor: 'pointer' },
  tabelaWrap: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', fontSize: 11, fontWeight: 500, color: '#888', borderBottom: '0.5px solid #e0e0e0', textAlign: 'left', background: '#fafafa' },
  tr: { borderBottom: '0.5px solid #f0f0f0' },
  td: { padding: '10px 14px', fontSize: 13, color: '#333', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
};