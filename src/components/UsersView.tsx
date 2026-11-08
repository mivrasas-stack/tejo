import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Edit3,
  Trash2,
  KeyRound,
  Lock,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UsersViewProps {
  users: User[];
  activeUser: User;
  onAddUser: (newUserData: Omit<User, 'id'>) => void;
  onEditUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onSelectActiveUser: (user: User) => void;
}

const ROLE_PRESETS: { role: UserRole; title: string; badge: string; desc: string }[] = [
  {
    role: 'admin',
    title: 'Administrador General',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/35',
    desc: 'Acceso total al sistema, contabilidad, inventario y usuarios',
  },
  {
    role: 'bartender',
    title: 'Jefe de Barra & POS',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    desc: 'Operación de punto de venta, cuentas e inventario de barra',
  },
  {
    role: 'mesero',
    title: 'Capitán de Servicio & Canchas',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    desc: 'Atención de mesas, comandas abiertas y canchas de tejo',
  },
];

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  activeUser,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onSelectActiveUser,
}) => {
  // Quick Add / Edit Form State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [revealedUserIds, setRevealedUserIds] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setPin('');
    setRole('admin');
    setFormError(null);
  };

  const startEditUser = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username || '');
    setEmail(u.email || '');
    setPassword(u.password || '');
    setPin(u.pin || '');
    setRole(u.role || 'admin');
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanUsername =
      username.trim().toLowerCase() ||
      cleanName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    const cleanEmail = email.trim().toLowerCase() || `${cleanUsername}@aura.com`;
    const cleanPassword = password.trim();
    const cleanPin = pin.replace(/\D/g, '').slice(0, 4) || '1234';

    if (!cleanName) {
      setFormError('Por favor ingresa el nombre de la persona.');
      return;
    }
    if (!cleanPassword) {
      setFormError('Por favor asigna una contraseña de acceso.');
      return;
    }
    if (cleanPin.length !== 4) {
      setFormError('El PIN rápido debe tener 4 dígitos numéricos.');
      return;
    }

    const duplicate = users.find(
      (u) =>
        u.id !== editingUser?.id &&
        (u.username?.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail)
    );
    if (duplicate) {
      setFormError(`Ya existe un usuario con el identificador "${cleanUsername}".`);
      return;
    }

    const roleMeta = ROLE_PRESETS.find((r) => r.role === role) || ROLE_PRESETS[0];

    if (editingUser) {
      onEditUser({
        ...editingUser,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        pin: cleanPin,
        role,
        roleTitle: roleMeta.title,
      });
    } else {
      onAddUser({
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        pin: cleanPin,
        role,
        roleTitle: roleMeta.title,
      });
    }

    resetForm();
  };

  const toggleRevealCredentials = (id: string) => {
    setRevealedUserIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/35 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 font-display">
                Gestión de Usuarios & Administradores
              </h2>
              <p className="text-xs text-zinc-400">
                Crea usuarios nuevos en segundos, asigna claves o PIN y administra accesos al sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
            <strong className="text-indigo-400">{users.length}</strong> usuarios activos
          </span>
        </div>
      </div>

      {/* Main Responsive Grid: Left Form (Add/Edit) + Right Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (Col 5): Quick Form to Create / Edit User */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 rounded-3xl bg-zinc-900/95 border border-indigo-500/30 p-5 sm:p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/35 flex items-center justify-center">
                {editingUser ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                  {editingUser ? `Editar Usuario: ${editingUser.name}` : 'Agregar Nuevo Usuario'}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {editingUser
                    ? 'Actualiza los datos de acceso y guarda los cambios'
                    : 'Completa los datos básicos para habilitar el acceso inmediato'}
                </p>
              </div>
            </div>

            {editingUser && (
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
                title="Cancelar edición"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError(null);
                }}
                placeholder="Ej. Carlos Ramírez, Laura Gómez..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Username & Optional Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  Usuario (Login) *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Ej. carlos, admin2..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  Correo (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="carlos@aura.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password & 4-Digit PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="Ej. Clave2026*"
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  PIN Rápido (4 dígitos) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setFormError(null);
                  }}
                  placeholder="Ej. 4444"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-amber-400 font-bold placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono tracking-widest"
                />
              </div>
            </div>

            {/* Simple Role Selector defaulting to Administrador */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">
                Perfil / Rol (Por defecto Administrador):
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_PRESETS.map((preset) => {
                  const isSelected = role === preset.role;
                  return (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => setRole(preset.role)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500/60 text-zinc-100 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-zinc-100 flex items-center gap-2">
                          <span>{preset.title}</span>
                          {preset.role === 'admin' && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{preset.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-indigo-500 border-indigo-400 text-white'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              {editingUser && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer transition-all active:scale-[0.98]"
              >
                {editingUser ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Usuario Ahora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT COLUMN (Col 7): Registered Users Directory */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Usuarios Registrados con Acceso al Sistema</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {users.map((u) => {
              const isCurrent = activeUser.id === u.id;
              const isRevealed = Boolean(revealedUserIds[u.id]);
              const rolePreset =
                ROLE_PRESETS.find((r) => r.role === u.role) || ROLE_PRESETS[0];

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-indigo-500/12 via-zinc-900 to-zinc-950 border-indigo-500/50 shadow-lg'
                      : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 flex items-center justify-center font-bold text-base shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-zinc-100 truncate">{u.name}</h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                Activo
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${rolePreset.badge}`}
                          >
                            {u.roleTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Credentials Info Box */}
                    <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Usuario:
                        </span>
                        <span className="font-mono font-bold text-zinc-200 truncate">
                          {u.username || u.email}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Correo:
                        </span>
                        <span className="font-mono text-zinc-300 truncate text-[11px]">
                          {u.email}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/70">
                        <span className="text-zinc-500 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          Clave / PIN:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-amber-400">
                            {isRevealed
                              ? `${u.password || 'Sin clave'} · PIN: ${u.pin}`
                              : '•••••••• · PIN: ••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealCredentials(u.id)}
                            className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                            title={isRevealed ? 'Ocultar credenciales' : 'Ver credenciales'}
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                    {!isCurrent ? (
                      <button
                        type="button"
                        onClick={() => onSelectActiveUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Usar Turno</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Sesión en curso
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditUser(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Editar</span>
                      </button>

                      {users.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 cursor-pointer transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
