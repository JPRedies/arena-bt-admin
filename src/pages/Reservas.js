import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Reservas() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarReservas();
  }, []);

  async function carregarReservas() {
    try {
      const res = await api.get('/reservas/hoje');
      setReservas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function cancelarReserva(id) {
    if (!window.confirm('Deseja cancelar esta reserva?')) return;
    try {
      await api.patch(`/reservas/${id}/cancelar`);
      carregarReservas();
    } catch (err) {
      alert('Erro ao cancelar reserva.');
    }
  }

  const lista = filtro === 'todas' ? reservas : reservas.filter(r => r.status === filtro);

  const esporteLabel = (e) => e === 'beach_tennis' ? 'Beach Tennis' : 'Vôlei';

  const formatarHora = (dt) => new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <img src="/images/logo-dakota.png" alt="Dakota" style={{ width: '140px' }} />
        </div>
        <div style={styles.sidebarNav}>
          {[
            { label: 'Agenda do dia', rota: '/dashboard' },
            { label: 'Reservas', rota: '/reservas', ativo: true },
            { label: 'Quadras', rota: '/quadras' },
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
          <span style={styles.topbarTitle}>Reservas</span>
          <span style={styles.topbarDate}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <div style={styles.content}>
          <div style={styles.filtros}>
            {['todas', 'confirmada', 'cancelada'].map(f => (
              <button key={f} onClick={() => setFiltro(f)} style={{ ...styles.filtroBtn, ...(filtro === f ? styles.filtroAtivo : {}) }}>
                {f === 'todas' ? 'Todas' : f === 'confirmada' ? 'Confirmadas' : 'Canceladas'}
              </button>
            ))}
            <span style={styles.total}>{lista.length} reserva{lista.length !== 1 ? 's' : ''}</span>
          </div>

          {carregando ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Carregando...</div>
          ) : (
            <div style={styles.tabelaWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['#', 'Cliente', 'Quadra', 'Horário', 'Esporte', 'Valor', 'Status', 'Ação'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lista.map(r => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={{ ...styles.td, color: '#aaa', fontSize: 12 }}>#{r.id}</td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{r.usuario_nome || 'Cliente'}</td>
                      <td style={styles.td}>Quadra {r.quadra_id}</td>
                      <td style={styles.td}>{formatarHora(r.slot_inicio)} – {formatarHora(r.slot_fim)}</td>
                      <td style={{ ...styles.td, color: r.esporte === 'beach_tennis' ? '#1565c0' : '#6a1b9a', fontSize: 12 }}>{esporteLabel(r.esporte)}</td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>R$ {parseFloat(r.valor).toFixed(2)}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...(r.status === 'confirmada' ? styles.badgeConfirmada : styles.badgeCancelada) }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {r.status !== 'cancelada'
                          ? <button style={styles.btnCancelar} onClick={() => cancelarReserva(r.id)}>Cancelar</button>
                          : <span style={{ color: '#ccc' }}>—</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {lista.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Nenhuma reserva encontrada</td>
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
  topbarDate: { fontSize: 13, color: '#888' },
  content: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  filtros: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' },
  filtroBtn: { padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '0.5px solid #e0e0e0', background: '#fff', color: '#888' },
  filtroAtivo: { background: '#111', color: '#fff', borderColor: '#111' },
  total: { fontSize: 12, color: '#888', marginLeft: 'auto' },
  tabelaWrap: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', fontSize: 11, fontWeight: 500, color: '#888', borderBottom: '0.5px solid #e0e0e0', textAlign: 'left', background: '#fafafa' },
  tr: { borderBottom: '0.5px solid #f0f0f0' },
  td: { padding: '10px 14px', fontSize: 13, color: '#333', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  badgeConfirmada: { background: '#e8f5e9', color: '#2e7d32' },
  badgeCancelada: { background: '#fce4ec', color: '#880e4f' },
  btnCancelar: { padding: '4px 10px', borderRadius: 6, fontSize: 11, border: '0.5px solid #ffcdd2', background: '#fff5f5', color: '#c62828', cursor: 'pointer' },
};