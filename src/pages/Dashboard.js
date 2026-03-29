import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HORARIOS = ['16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30'];
const QUADRAS = ['Quadra 1','Quadra 2','Quadra 3','Quadra 4','Quadra 5','Quadra 6','Quadra 7'];

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [resReservas, resBloqueios, resQuadras] = await Promise.all([
          api.get('/reservas/hoje'),
          api.get('/bloqueios/hoje'),
          api.get('/quadras/')
        ]);
        setReservas(resReservas.data);
        setBloqueios(resBloqueios.data);
        setQuadras(resQuadras.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  function getSlot(quadraId, hora) {
    const [h, m] = hora.split(':').map(Number);
    const reserva = reservas.find(r => {
      const inicio = new Date(r.slot_inicio);
      const fim = new Date(r.slot_fim);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      return r.quadra_id === quadraId && slotDate >= inicio && slotDate < fim && r.status !== 'cancelada';
    });
    if (reserva) return { tipo: 'reservado', nome: reserva.usuario_nome || 'Cliente', esporte: reserva.esporte };

    const bloqueio = bloqueios.find(b => {
      const inicio = new Date(b.slot_inicio);
      const fim = new Date(b.slot_fim);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      return b.quadra_id === quadraId && slotDate >= inicio && slotDate < fim;
    });
    if (bloqueio) return { tipo: bloqueio.tipo, nome: bloqueio.responsavel_nome || 'Prof.', esporte: bloqueio.esporte };

    return { tipo: 'livre' };
  }

  const totalReservas = reservas.filter(r => r.status !== 'cancelada').length;
  const confirmadas = reservas.filter(r => r.status === 'confirmada').length;
  const faturamento = reservas.filter(r => r.status !== 'cancelada').reduce((acc, r) => acc + parseFloat(r.valor), 0);
  const quadrasAtivas = quadras.filter(q => q.status === 'ativa').length;

  const esporteLabel = (e) => {
    if (!e) return '';
    if (e === 'beach_tennis') return 'Beach Tennis';
    if (e === 'volei') return 'Vôlei';
    return e;
  };

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <img src="/images/logo-dakota.png" alt="Dakota" style={{ width: '140px' }} />
        </div>
        <div style={styles.sidebarNav}>
          {[
            { label: 'Agenda do dia', ativo: true },
            { label: 'Reservas' },
            { label: 'Quadras' },
            { label: 'Usuários' },
            { label: 'Bloqueios' },
          ].map((item) => (
            <div key={item.label} style={{ ...styles.navItem, ...(item.ativo ? styles.navAtivo : {}) }}>
              {item.label}
            </div>
          ))}
        </div>
        <div style={styles.sidebarUser}>
          <div style={styles.userName}>{usuario?.nome}</div>
          <div style={styles.logout} onClick={logout}>Sair</div>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <span style={styles.topbarTitle}>Agenda do dia</span>
          <span style={styles.topbarDate}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <div style={styles.content}>
          <div style={styles.stats}>
            {[
              { label: 'Reservas hoje', valor: totalReservas, sub: `${confirmadas} confirmadas`, cor: '#4caf50' },
              { label: 'Quadras ativas', valor: quadrasAtivas, sub: `de ${quadras.length} total` },
              { label: 'Faturamento do dia', valor: `R$ ${faturamento.toFixed(2)}`, sub: 'estimado' },
              { label: 'Slots disponíveis', valor: (HORARIOS.length * quadrasAtivas) - totalReservas, sub: 'das 16h às 22h' },
            ].map((card) => (
              <div key={card.label} style={styles.statCard}>
                <div style={styles.statLabel}>{card.label}</div>
                <div style={styles.statValue}>{card.valor}</div>
                <div style={{ ...styles.statSub, color: card.cor || '#888' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={styles.sectionTitle}>Grade de horários</div>
          <div style={styles.legenda}>
            {[
              { cor: '#e8f5e9', borda: '#4caf50', label: 'Reservado' },
              { cor: '#fff3e0', borda: '#e65100', label: 'Aula / bloqueio' },
              { cor: '#fce4ec', borda: '#880e4f', label: 'Manutenção' },
            ].map(l => (
              <div key={l.label} style={styles.legItem}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.cor, border: `1px solid ${l.borda}` }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          {carregando ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Carregando agenda...</div>
          ) : (
            <div style={styles.agendaWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: 54, textAlign: 'left', paddingLeft: 10 }}>Hora</th>
                    {quadras.map(q => <th key={q.id} style={styles.th}>{q.nome}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS.map(hora => (
                    <tr key={hora} style={styles.tr}>
                      <td style={styles.horaCell}>{hora}</td>
                      {quadras.map(q => {
                        const slot = getSlot(q.id, hora);
                        return (
                          <td key={q.id} style={styles.td}>
                            {slot.tipo === 'livre' && <span style={styles.slotLivre}>—</span>}
                            {slot.tipo === 'reservado' && (
                              <span style={styles.slotReservado}>
                                <span style={styles.slotNome}>{slot.nome}</span>
                                <span style={styles.slotEsporte}>{esporteLabel(slot.esporte)}</span>
                              </span>
                            )}
                            {slot.tipo === 'aula' && (
                              <span style={styles.slotAula}>
                                <span style={styles.slotNome}>Aula {slot.nome}</span>
                                <span style={styles.slotEsporte}>{esporteLabel(slot.esporte)}</span>
                              </span>
                            )}
                            {slot.tipo === 'manutencao' && (
                              <span style={styles.slotManutencao}>
                                <span style={styles.slotNome}>Manut.</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
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
  logout: { fontSize: 12, color: '#666', cursor: 'pointer', marginTop: 4 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  topbar: { background: '#fff', borderBottom: '0.5px solid #e0e0e0', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarTitle: { fontSize: 16, fontWeight: 500, color: '#222' },
  topbarDate: { fontSize: 13, color: '#888' },
  content: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 20 },
  statCard: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '14px 16px' },
  statLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 500, color: '#222' },
  statSub: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 8 },
  legenda: { display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' },
  legItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#888' },
  agendaWrap: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  th: { padding: '8px 6px', fontSize: 11, fontWeight: 500, color: '#888', borderBottom: '0.5px solid #e0e0e0', borderRight: '0.5px solid #e0e0e0', textAlign: 'center', background: '#fff' },
  tr: { borderBottom: '0.5px solid #e0e0e0' },
  td: { padding: '5px 4px', borderRight: '0.5px solid #e0e0e0', textAlign: 'center', verticalAlign: 'middle' },
  horaCell: { fontSize: 11, fontWeight: 500, color: '#888', textAlign: 'left', paddingLeft: 10, whiteSpace: 'nowrap' },
  slotLivre: { fontSize: 11, color: '#ccc' },
  slotReservado: { background: '#e8f5e9', color: '#2e7d32', fontSize: 10, fontWeight: 500, borderRadius: 4, padding: '4px 5px', display: 'block' },
  slotAula: { background: '#fff3e0', color: '#e65100', fontSize: 10, fontWeight: 500, borderRadius: 4, padding: '4px 5px', display: 'block' },
  slotManutencao: { background: '#fce4ec', color: '#880e4f', fontSize: 10, fontWeight: 500, borderRadius: 4, padding: '4px 5px', display: 'block' },
  slotNome: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  slotEsporte: { display: 'block', fontWeight: 400, opacity: 0.8, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
};