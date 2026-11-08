import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  X, 
  Play, 
  Square, 
  Beer, 
  Wine, 
  Phone, 
  DollarSign, 
  Sparkles, 
  AlertCircle, 
  Trash2, 
  Edit2, 
  Layers, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  GameTrack, 
  GameType, 
  Reservation, 
  ReservationStatus, 
  PaymentMethod 
} from '../types';
import { formatCurrency, formatShortDate } from '../services/storage';

interface ReservationsViewProps {
  reservations: Reservation[];
  gameTracks: GameTrack[];
  onAddReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (reservationId: string, status: ReservationStatus) => void;
  onOpenBarTabForReservation: (reservation: Reservation) => void;
  onAddGameTrack: (track: Omit<GameTrack, 'id'>) => void;
  onUpdateGameTrack: (track: GameTrack) => void;
  onDeleteGameTrack: (trackId: string) => void;
  onStartGameTrack: (trackId: string, clientName: string, tabId?: string) => void;
  onFinishGameTrack: (trackId: string) => void;
  onOpenBarTabForTrack: (track: GameTrack) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  gameTracks,
  onAddReservation,
  onUpdateStatus,
  onOpenBarTabForReservation,
  onAddGameTrack,
  onUpdateGameTrack,
  onDeleteGameTrack,
  onStartGameTrack,
  onFinishGameTrack,
  onOpenBarTabForTrack,
}) => {
  // Navigation inside Tejo & Bolirana
  const [activeTab, setActiveTab] = useState<'TRACKS' | 'RESERVATIONS'>('TRACKS');
  const [gameTypeFilter, setGameTypeFilter] = useState<'ALL' | GameType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [newReservationModalOpen, setNewReservationModalOpen] = useState(false);
  const [newTrackModalOpen, setNewTrackModalOpen] = useState(false);
  const [startGameModalOpen, setStartGameModalOpen] = useState(false);
  const [selectedTrackForStart, setSelectedTrackForStart] = useState<GameTrack | null>(null);
  const [startClientName, setStartClientName] = useState('');

  // Form for New Reservation
  const [resClientName, setResClientName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resTrackId, setResTrackId] = useState('');
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resStartTime, setResStartTime] = useState('19:00');
  const [resEndTime, setResEndTime] = useState('21:00');
  const [resPeopleCount, setResPeopleCount] = useState(6);
  const [resDepositAmount, setResDepositAmount] = useState(25000);
  const [resDepositPaymentMethod, setResDepositPaymentMethod] = useState<PaymentMethod>('TRANSFERENCIA');
  const [resNotes, setResNotes] = useState('');

  // Form for New Track / Bolirana
  const [trackName, setTrackName] = useState('');
  const [trackGameType, setTrackGameType] = useState<GameType>('CANCHA_TEJO');
  const [trackHourlyRate, setTrackHourlyRate] = useState(35000);
  const [trackPricePerGame, setTrackPricePerGame] = useState(5000);
  const [trackNotes, setTrackNotes] = useState('');

  // Filtered Game Tracks
  const filteredTracks = useMemo(() => {
    return gameTracks.filter((track) => {
      const matchesType = gameTypeFilter === 'ALL' || track.gameType === gameTypeFilter;
      const matchesSearch =
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.activeClient && track.activeClient.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (track.notes && track.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [gameTracks, gameTypeFilter, searchQuery]);

  // Filtered Reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchesType = gameTypeFilter === 'ALL' || res.gameType === gameTypeFilter;
      const matchesSearch =
        res.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.trackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.phone.includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [reservations, gameTypeFilter, searchQuery]);

  // Handle Create Reservation
  const handleCreateReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resClientName.trim() || !resTrackId) return;

    const chosenTrack = gameTracks.find((t) => t.id === resTrackId);
    if (!chosenTrack) return;

    const [startH, startM] = resStartTime.split(':').map(Number);
    const [endH, endM] = resEndTime.split(':').map(Number);
    let durationMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (durationMins <= 0) durationMins = 60;

    const totalEstimated = Math.round((durationMins / 60) * chosenTrack.hourlyRate);

    onAddReservation({
      clientName: resClientName.trim(),
      phone: resPhone.trim() || 'Sin teléfono',
      trackId: chosenTrack.id,
      trackName: chosenTrack.name,
      gameType: chosenTrack.gameType,
      date: resDate,
      startTime: resStartTime,
      endTime: resEndTime,
      durationMinutes: durationMins,
      hourlyRate: chosenTrack.hourlyRate,
      peopleCount: resPeopleCount,
      depositAmount: resDepositAmount,
      depositPaymentMethod: resDepositPaymentMethod,
      totalEstimated,
      status: 'CONFIRMADA',
      notes: resNotes.trim() || undefined,
      zoneId: chosenTrack.id,
      zoneName: chosenTrack.name,
      zoneType: chosenTrack.gameType,
    });

    setNewReservationModalOpen(false);
    setResClientName('');
    setResPhone('');
    setResNotes('');
  };

  // Handle Create Track
  const handleCreateTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackName.trim()) return;

    onAddGameTrack({
      name: trackName.trim(),
      gameType: trackGameType,
      trackNumber: gameTracks.filter((t) => t.gameType === trackGameType).length + 1,
      hourlyRate: trackHourlyRate,
      pricePerGame: trackPricePerGame > 0 ? trackPricePerGame : undefined,
      status: 'DISPONIBLE',
      notes: trackNotes.trim() || undefined,
    });

    setNewTrackModalOpen(false);
    setTrackName('');
    setTrackNotes('');
  };

  // Handle Start Game
  const handleConfirmStartGame = () => {
    if (!selectedTrackForStart || !startClientName.trim()) return;
    onStartGameTrack(selectedTrackForStart.id, startClientName.trim());
    setStartGameModalOpen(false);
    setSelectedTrackForStart(null);
    setStartClientName('');
  };

  const getGameBadge = (type: GameType) => {
    switch (type) {
      case 'CANCHA_TEJO':
        return {
          label: 'Cancha de Tejo',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          desc: 'Greda, mechas y bocín',
        };
      case 'BOLIRANA':
        return {
          label: 'Bolirana',
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
          desc: 'Electrónica / Pantalla HD',
        };
      case 'MINI_TEJO':
        return {
          label: 'Mini Tejo',
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          desc: 'Pista corta plastilina',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-zinc-100 font-display">
              Juegos: Canchas de Tejo & Boliranas
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Control de pistas de tejo tradicional, mini tejo y boliranas. Cobro por hora o chico, reservas con abono y comanda directa de cerveza y trago.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewTrackModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Agregar Pista / Bolirana</span>
          </button>

          <button
            onClick={() => {
              if (gameTracks.length > 0) {
                setResTrackId(gameTracks[0].id);
              }
              setNewReservationModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Reserva</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Sub-Tabs: Pistas en Vivo vs Reservas Programadas */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('TRACKS')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'TRACKS'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pistas en Vivo ({gameTracks.length})
          </button>
          <button
            onClick={() => setActiveTab('RESERVATIONS')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'RESERVATIONS'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Reservas Programadas ({reservations.length})
          </button>
        </div>

        {/* Filter by Game Type */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'Todos los Juegos' },
            { id: 'CANCHA_TEJO', label: 'Canchas de Tejo' },
            { id: 'BOLIRANA', label: 'Boliranas' },
            { id: 'MINI_TEJO', label: 'Mini Tejo' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setGameTypeFilter(type.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                gameTypeFilter === type.id
                  ? 'bg-zinc-800 text-amber-300 font-semibold border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: PISTAS EN VIVO (TEJO & BOLIRANA) */}
      {activeTab === 'TRACKS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTracks.map((track) => {
              const badge = getGameBadge(track.gameType);
              const isPlaying = track.status === 'EN_JUEGO';
              const isReserved = track.status === 'RESERVADA';
              const isAvailable = track.status === 'DISPONIBLE';

              return (
                <div
                  key={track.id}
                  className={`rounded-3xl border p-5 transition-all duration-200 backdrop-blur-xl relative flex flex-col justify-between ${
                    isPlaying
                      ? 'bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border-amber-500/40 shadow-xl shadow-amber-500/5'
                      : isReserved
                      ? 'bg-zinc-900/60 border-purple-500/30'
                      : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <h3 className="text-base font-bold text-zinc-100 mt-1.5">{track.name}</h3>
                        {track.notes && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{track.notes}</p>
                        )}
                      </div>

                      {/* Status badge */}
                      <div>
                        {isPlaying ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            En Juego
                          </span>
                        ) : isReserved ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold uppercase tracking-wider">
                            Reservada
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                            Disponible
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active Match Details */}
                    {isPlaying && (
                      <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-amber-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            Equipo / Cliente:
                          </span>
                          <span className="font-bold text-zinc-100">{track.activeClient || 'Jugadores'}</span>
                        </div>

                        {track.activeStartTime && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              Inicio de partida:
                            </span>
                            <span className="font-mono text-amber-300 font-semibold">{track.activeStartTime}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rates */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 block">Tarifa por Hora</span>
                        <span className="font-bold text-zinc-200 tabular-nums">
                          {formatCurrency(track.hourlyRate)}
                        </span>
                      </div>

                      {track.pricePerGame ? (
                        <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">Por Chico / Tiro</span>
                          <span className="font-bold text-amber-400 tabular-nums">
                            {formatCurrency(track.pricePerGame)}
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">Modalidad</span>
                          <span className="font-semibold text-zinc-400">Tiempo Libre</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-zinc-800/80 space-y-2">
                    {isAvailable && (
                      <button
                        onClick={() => {
                          setSelectedTrackForStart(track);
                          setStartGameModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar Juego Ahora</span>
                      </button>
                    )}

                    {isPlaying && (
                      <div className="space-y-2">
                        <button
                          onClick={() => onOpenBarTabForTrack(track)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Beer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Abrir Comanda de Trago / Cerveza</span>
                        </button>

                        <button
                          onClick={() => onFinishGameTrack(track.id)}
                          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 text-rose-400" />
                          <span>Finalizar Partida / Liberar Pista</span>
                        </button>
                      </div>
                    )}

                    {isReserved && (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedTrackForStart(track);
                            setStartGameModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Pasar a En Juego</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: RESERVAS PROGRAMADAS (TEJO & BOLIRANA) */}
      {activeTab === 'RESERVATIONS' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Agenda de Reservas de Canchas de Tejo & Boliranas</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Reservaciones anticipadas con registro de abonos en Efectivo o Transferencia.
                </p>
              </div>

              <span className="text-xs text-zinc-500 font-mono">
                {filteredReservations.length} reservas registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Cliente / Equipo</th>
                    <th className="py-3 px-3">Pista / Juego</th>
                    <th className="py-3 px-3">Fecha & Horario</th>
                    <th className="py-3 px-3 text-center">Jugadores</th>
                    <th className="py-3 px-3 text-right">Abono Registrado</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500 font-sans">
                        No hay reservas programadas para este filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((res) => {
                      const badge = getGameBadge(res.gameType);
                      return (
                        <tr key={res.id} className="hover:bg-zinc-850/50 transition-colors">
                          {/* Client */}
                          <td className="py-3 px-4 font-sans">
                            <div className="font-semibold text-zinc-100">{res.clientName}</div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-zinc-600" />
                              {res.phone}
                            </div>
                          </td>

                          {/* Track */}
                          <td className="py-3 px-3 font-sans">
                            <div className="text-zinc-200 font-medium">{res.trackName}</div>
                            <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-3 text-zinc-300">
                            <div>{res.date}</div>
                            <div className="text-[11px] text-amber-400 font-bold">
                              {res.startTime} - {res.endTime} ({res.durationMinutes} min)
                            </div>
                          </td>

                          {/* Players */}
                          <td className="py-3 px-3 text-center text-zinc-300 font-bold">
                            {res.peopleCount} pers.
                          </td>

                          {/* Deposit */}
                          <td className="py-3 px-3 text-right">
                            {res.depositAmount > 0 ? (
                              <div>
                                <span className="font-bold text-emerald-400 tabular-nums">
                                  {formatCurrency(res.depositAmount)}
                                </span>
                                <div className="text-[10px] text-zinc-500 font-sans">
                                  {res.depositPaymentMethod || 'Transferencia'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-600">Sin abono</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            {res.status === 'EN_CURSO' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/40">
                                En Juego
                              </span>
                            )}
                            {res.status === 'CONFIRMADA' && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/40">
                                Confirmada
                              </span>
                            )}
                            {res.status === 'COMPLETADA' && (
                              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                Finalizada
                              </span>
                            )}
                            {res.status === 'CANCELADA' && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                Cancelada
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 font-sans">
                              {res.status !== 'COMPLETADA' && res.status !== 'CANCELADA' && (
                                <>
                                  <button
                                    onClick={() => onOpenBarTabForReservation(res)}
                                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Abrir comanda de bar para esta cancha/bolirana"
                                  >
                                    <Beer className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Comanda Bar</span>
                                  </button>

                                  <button
                                    onClick={() => onUpdateStatus(res.id, 'COMPLETADA')}
                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-400 text-xs transition-colors cursor-pointer"
                                    title="Marcar como Finalizada"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NUEVA RESERVA DE TEJO / BOLIRANA */}
      {newReservationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Nueva Reserva de Cancha / Bolirana</h3>
                  <p className="text-xs text-zinc-400">Agendar partida de Tejo o Bolirana con anticipo</p>
                </div>
              </div>
              <button
                onClick={() => setNewReservationModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservationSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre del Cliente / Equipo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Los Compadres del Tejo, Carlos Pérez..."
                  value={resClientName}
                  onChange={(e) => setResClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Teléfono WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="ej. 312 884 9201"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Pista de Juego *</label>
                  <select
                    value={resTrackId}
                    onChange={(e) => setResTrackId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {gameTracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({formatCurrency(t.hourlyRate)}/h)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={resStartTime}
                    onChange={(e) => setResStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={resEndTime}
                    onChange={(e) => setResEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Jugadores</label>
                  <input
                    type="number"
                    min={1}
                    value={resPeopleCount}
                    onChange={(e) => setResPeopleCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Abono / Anticipo ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={resDepositAmount}
                    onChange={(e) => setResDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Medio de Pago</label>
                  <select
                    value={resDepositPaymentMethod}
                    onChange={(e) => setResDepositPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="EFECTIVO">Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Notas o pedidos especiales</label>
                <input
                  type="text"
                  placeholder="ej. Dejar listo balde de cerveza fría, mechas extras..."
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewReservationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AGREGAR NUEVA PISTA O BOLIRANA */}
      {newTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Agregar Pista / Bolirana</h3>
                  <p className="text-xs text-zinc-400">Crear una nueva cancha de tejo o bolirana</p>
                </div>
              </div>
              <button
                onClick={() => setNewTrackModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrackSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Tipo de Juego *</label>
                <select
                  value={trackGameType}
                  onChange={(e) => setTrackGameType(e.target.value as GameType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="CANCHA_TEJO">Cancha de Tejo Tradicional (Greda & Mechas)</option>
                  <option value="BOLIRANA">Bolirana (Electrónica / Clásica)</option>
                  <option value="MINI_TEJO">Pista Mini Tejo</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre de la Cancha / Pista *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Cancha de Tejo #3, Bolirana Digital #4..."
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Tarifa por Hora ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={trackHourlyRate}
                    onChange={(e) => setTrackHourlyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Tarifa por Chico ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={trackPricePerGame}
                    onChange={(e) => setTrackPricePerGame(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Notas o Características</label>
                <input
                  type="text"
                  placeholder="ej. Con marcador digital, plastilina blanca..."
                  value={trackNotes}
                  onChange={(e) => setTrackNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewTrackModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Guardar Pista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INICIAR JUEGO EN PISTA */}
      {startGameModalOpen && selectedTrackForStart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Iniciar Partida</h3>
                <p className="text-xs text-amber-400">{selectedTrackForStart.name}</p>
              </div>
              <button
                onClick={() => setStartGameModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nombre del Cliente / Equipo *</label>
              <input
                type="text"
                autoFocus
                required
                placeholder="ej. Los Galácticos, Carlos & Amigos..."
                value={startClientName}
                onChange={(e) => setStartClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs font-mono space-y-1 text-zinc-400">
              <div className="flex justify-between">
                <span>Tarifa por hora:</span>
                <span className="font-bold text-zinc-200">{formatCurrency(selectedTrackForStart.hourlyRate)}</span>
              </div>
              {selectedTrackForStart.pricePerGame && (
                <div className="flex justify-between">
                  <span>Por chico:</span>
                  <span className="font-bold text-amber-300">{formatCurrency(selectedTrackForStart.pricePerGame)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setStartGameModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStartGame}
                disabled={!startClientName.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                Comenzar Partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
