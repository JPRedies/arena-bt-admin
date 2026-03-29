import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Usuarios() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [carregando, setCarregando] = useState(true);
  const [novoUsuario, setNovoUsuario] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', tipo: 'cliente' });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const res = await api.get('/auth/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function cadastrarUsuario() {
    try {
      await api.post('/auth/cadastro', form);
      setNovoUsuario(false);
      setForm({ nome: '', email: '', telefone: '', senha: '', tipo: 'cliente' });
      carregarUsuarios();
    } catch (err) {
      alert('Erro ao cadastrar usuário. Verifique os dados.');
    }
  }

  const lista = filtro === 'todos' ? usuarios : usuarios.filter(u => u.tipo === filtro);

  const tipoStyle = (t) => ({
    admin: { background: '#e8eaf6', color: '#283593' },
    professor: { background: '#e0f2f1', color: '#00695c' },
    aluno: { background: '#fff3e0', color: '#e65100' },
    cliente: { background: '#f5f5f5', color: '#616161' },
  }[t] || {});

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
            { label: 'Usuários', rota: '/usuarios', ativo: true },
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
          <span style={styles.topbarTitle}>Usuários</span>
          <button style={styles.btnNovo} onClick={() => setNovoUsuario(!novoUsuario)}>
            {novoUsuario ? 'Cancelar' : '+ Novo usuário'}
          </button>
        </div>

        <div style={styles.content}>
          {novoUsuario && (
            <div style={styles.formCard}>
              <div style={styles.formGrid}>
                {[
                  { label: 'Nome', key: 'nome', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Telefone', key: 'telefone', type: 'text' },
                  { label: 'Senha', key: 'senha', type: 'password' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={styles.inputLabel}>{f.label}</label>
                    <input style={styles.input} type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label style={styles.inputLabel}>Tipo</label>
                  <select style={styles.input} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="cliente">Cliente</option>
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button style={styles.btnSalvar} onClick={cadastrarUsuario}>Cadastrar</button>
            </div>
          )}

          <div style={styles.filtros}>
            {['todos', 'cliente', 'aluno', 'professor', 'admin'].map(f => (
              <button key={f} onClick={() => setFiltro(f)} style={{ ...styles.filtroBtn, ...(filtro === f ? styles.filtroAtivo : {}) }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span style={styles.total}>{lista.length} usuário{lista.length !== 1 ? 's' : ''}</span>
          </div>

          {carregando ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Carregando...</div>
          ) : (
            <div style={styles.tabelaWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['#', 'Nome', 'Email', 'Telefone', 'Tipo', 'Status'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lista.map(u => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={{ ...styles.td, color: '#aaa', fontSize: 12 }}>#{u.id}</td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{u.nome}</td>
                      <td style={{ ...styles.td, color: '#888' }}>{u.email}</td>
                      <td style={styles.td}>{u.telefone}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...tipoStyle(u.tipo) }}>{u.tipo}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...(u.ativo ? { background: '#e8f5e9', color: '#2e7d32' } : { background: '#fce4ec', color: '#880e4f' }) }}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {lista.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Nenhum usuário encontrado</td>
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
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 },
  inputLabel: { display: 'block', fontSize: 11, color: '#888', marginBottom: 4 },
  input: { width: '100%', padding: '7px 10px', borderRadius: 8, border: '0.5px solid #e0e0e0', fontSize: 13, outline: 'none', background: '#fafafa' },
  btnNovo: { padding: '8px 16px', borderRadius: 8, fontSize: 13, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontWeight: 500 },
  btnSalvar: { padding: '8px 24px', borderRadius: 8, fontSize: 13, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontWeight: 500 },
  filtros: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  filtroBtn: { padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '0.5px solid #e0e0e0', background: '#fff', color: '#888' },
  filtroAtivo: { background: '#111', color: '#fff', borderColor: '#111' },
  total: { fontSize: 12, color: '#888', marginLeft: 'auto' },
  tabelaWrap: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', fontSize: 11, fontWeight: 500, color: '#888', borderBottom: '0.5px solid #e0e0e0', textAlign: 'left', background: '#fafafa' },
  tr: { borderBottom: '0.5px solid #f0f0f0' },
  td: { padding: '10px 14px', fontSize: 13, color: '#333', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
};