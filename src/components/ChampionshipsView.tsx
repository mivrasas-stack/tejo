import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Flame,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  RotateCcw,
  Award,
  Users,
  Sparkles,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  Sliders,
  X,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../services/storage';

export type ChampionshipMode = 'TEJO_PUNTOS' | 'TEJO_BALAZOS' | 'BOLIRANA';

export interface ChampionshipScoreEvent {
  id: string;
  team: 'A' | 'B';
  teamName: string;
  label: string;
  points: number;
  timestamp: string;
}

export interface ChampionshipMatch {
  id: string;
  roundName: string; // 'Cuartos de Final' | 'Semifinal' | 'Gran Final' | 'Partida Directa'
  matchNumber: number;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  ranasOrBalazosA: number;
  ranasOrBalazosB: number;
  mononasA: number;
  mononasB: number;
  status: 'PENDIENTE' | 'EN_JUEGO' | 'FINALIZADO';
  winner?: string;
  canchaAsignada?: string;
  events: ChampionshipScoreEvent[];
}

export interface Championship {
  id: string;
  name: string;
  mode: ChampionshipMode;
  targetScore: number; // e.g. 27 pts (Tejo), 5 balazos (A Balazos), 3000 pts (Bolirana), or any custom number
  entryFee: number;
  prizePool: number;
  teams: string[];
  matches: ChampionshipMatch[];
  status: 'ACTIVO' | 'FINALIZADO';
  champion?: string;
  createdAt: string;
}

const STORAGE_KEY_CHAMPIONSHIPS = 'aura_pos_championships_v1';

function buildInitialMatches(teams: string[]): ChampionshipMatch[] {
  const clean = teams.filter(Boolean);
  const matches: ChampionshipMatch[] = [];

  if (clean.length >= 4) {
    // Semifinales (primeros 4 equipos) + Gran Final
    matches.push({
      id: `m-${Date.now()}-1`,
      roundName: 'Semifinal 1',
      matchNumber: 1,
      teamA: clean[0] || 'Equipo 1',
      teamB: clean[1] || 'Equipo 2',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'EN_JUEGO',
      canchaAsignada: 'Cancha Principal #1',
      events: [],
    });
    matches.push({
      id: `m-${Date.now()}-2`,
      roundName: 'Semifinal 2',
      matchNumber: 2,
      teamA: clean[2] || 'Equipo 3',
      teamB: clean[3] || 'Equipo 4',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'PENDIENTE',
      canchaAsignada: 'Cancha Principal #2',
      events: [],
    });
    matches.push({
      id: `m-${Date.now()}-3`,
      roundName: 'Gran Final',
      matchNumber: 3,
      teamA: 'Ganador Semifinal 1',
      teamB: 'Ganador Semifinal 2',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'PENDIENTE',
      canchaAsignada: 'Cancha VIP / Final',
      events: [],
    });
  } else {
    matches.push({
      id: `m-${Date.now()}-1`,
      roundName: 'Gran Final Directa',
      matchNumber: 1,
      teamA: clean[0] || 'Equipo A',
      teamB: clean[1] || 'Equipo B',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'EN_JUEGO',
      canchaAsignada: 'Cancha #1',
      events: [],
    });
  }

  return matches;
}

const DEFAULT_CHAMPIONSHIPS: Championship[] = [
  {
    id: 'champ-tejo-puntos',
    name: 'Gran Torneo Nocturno de Tejo AURA',
    mode: 'TEJO_PUNTOS',
    targetScore: 27,
    entryFee: 50000,
    prizePool: 300000,
    teams: ['Los Caciques', 'Mecha Brava', 'Bocín de Oro', 'Combo del Sur'],
    status: 'ACTIVO',
    createdAt: 'Hoy · 08:00 PM',
    matches: [
      {
        id: 'm-default-1',
        roundName: 'Semifinal 1',
        matchNumber: 1,
        teamA: 'Los Caciques',
        teamB: 'Mecha Brava',
        scoreA: 18,
        scoreB: 15,
        ranasOrBalazosA: 3,
        ranasOrBalazosB: 2,
        mononasA: 1,
        mononasB: 1,
        status: 'EN_JUEGO',
        canchaAsignada: 'Cancha de Tejo #1',
        events: [
          {
            id: 'ev-1',
            team: 'A',
            teamName: 'Los Caciques',
            label: '🔥 Moñona (Embocinada + Mecha)',
            points: 9,
            timestamp: '08:15 PM',
          },
          {
            id: 'ev-2',
            team: 'B',
            teamName: 'Mecha Brava',
            label: '🎯 Embocinada en el Bocín',
            points: 6,
            timestamp: '08:18 PM',
          },
        ],
      },
      {
        id: 'm-default-2',
        roundName: 'Semifinal 2',
        matchNumber: 2,
        teamA: 'Bocín de Oro',
        teamB: 'Combo del Sur',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Cancha de Tejo #2',
        events: [],
      },
      {
        id: 'm-default-3',
        roundName: 'Gran Final',
        matchNumber: 3,
        teamA: 'Ganador Semifinal 1',
        teamB: 'Ganador Semifinal 2',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Cancha Principal',
        events: [],
      },
    ],
  },
  {
    id: 'champ-tejo-balazos',
    name: 'Relámpago de Tejo "A Balazos" (Mecha Limpia)',
    mode: 'TEJO_BALAZOS',
    targetScore: 5,
    entryFee: 30000,
    prizePool: 150000,
    teams: ['Pólvora Pura', 'Los Francotiradores', 'Trueno del Norte', 'Reyes del Bocín'],
    status: 'ACTIVO',
    createdAt: 'Hoy · 09:00 PM',
    matches: [
      {
        id: 'm-bal-1',
        roundName: 'Semifinal 1',
        matchNumber: 1,
        teamA: 'Pólvora Pura',
        teamB: 'Los Francotiradores',
        scoreA: 3,
        scoreB: 2,
        ranasOrBalazosA: 3,
        ranasOrBalazosB: 2,
        mononasA: 0,
        mononasB: 0,
        status: 'EN_JUEGO',
        canchaAsignada: 'Cancha de Tejo #2',
        events: [
          {
            id: 'ev-b1',
            team: 'A',
            teamName: 'Pólvora Pura',
            label: '💥 ¡Balazo! (Mecha Explotada)',
            points: 1,
            timestamp: '09:05 PM',
          },
        ],
      },
      {
        id: 'm-bal-2',
        roundName: 'Semifinal 2',
        matchNumber: 2,
        teamA: 'Trueno del Norte',
        teamB: 'Reyes del Bocín',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Cancha de Tejo #1',
        events: [],
      },
      {
        id: 'm-bal-3',
        roundName: 'Gran Final',
        matchNumber: 3,
        teamA: 'Ganador Semifinal 1',
        teamB: 'Ganador Semifinal 2',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Cancha Principal',
        events: [],
      },
    ],
  },
  {
    id: 'champ-bolirana',
    name: 'Copa Bolirana Electrónica · Rana de Oro',
    mode: 'BOLIRANA',
    targetScore: 3000,
    entryFee: 40000,
    prizePool: 200000,
    teams: ['Rana Maestra', 'Tiro Fijo VIP', 'Los Compadres', 'Combo Bolirana'],
    status: 'ACTIVO',
    createdAt: 'Hoy · 09:30 PM',
    matches: [
      {
        id: 'm-bol-1',
        roundName: 'Semifinal 1',
        matchNumber: 1,
        teamA: 'Rana Maestra',
        teamB: 'Tiro Fijo VIP',
        scoreA: 1450,
        scoreB: 1100,
        ranasOrBalazosA: 2,
        ranasOrBalazosB: 1,
        mononasA: 0,
        mononasB: 0,
        status: 'EN_JUEGO',
        canchaAsignada: 'Bolirana Electrónica #1',
        events: [
          {
            id: 'ev-r1',
            team: 'A',
            teamName: 'Rana Maestra',
            label: '🐸 ¡Rana Principal! (+500)',
            points: 500,
            timestamp: '09:35 PM',
          },
        ],
      },
      {
        id: 'm-bol-2',
        roundName: 'Semifinal 2',
        matchNumber: 2,
        teamA: 'Los Compadres',
        teamB: 'Combo Bolirana',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Bolirana Electrónica #2',
        events: [],
      },
      {
        id: 'm-bol-3',
        roundName: 'Gran Final',
        matchNumber: 3,
        teamA: 'Ganador Semifinal 1',
        teamB: 'Ganador Semifinal 2',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Bolirana VIP',
        events: [],
      },
    ],
  },
];

export const ChampionshipsView: React.FC = () => {
  const [championships, setChampionships] = useState<Championship[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHAMPIONSHIPS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return DEFAULT_CHAMPIONSHIPS;
  });

  const [selectedChampId, setSelectedChampId] = useState<string>(() => {
    return championships[0]?.id || DEFAULT_CHAMPIONSHIPS[0].id;
  });

  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Custom Score / Target Editor inline
  const [editingTargetScore, setEditingTargetScore] = useState<string>('');
  const [customPointsInputA, setCustomPointsInputA] = useState<string>('');
  const [customPointsInputB, setCustomPointsInputB] = useState<string>('');

  // Create Championship Form State
  const [newChampName, setNewChampName] = useState('');
  const [newChampMode, setNewChampMode] = useState<ChampionshipMode>('TEJO_PUNTOS');
  const [newChampTarget, setNewChampTarget] = useState<number>(27);
  const [newChampEntryFee, setNewChampEntryFee] = useState<number>(40000);
  const [newChampPrizePool, setNewChampPrizePool] = useState<number>(200000);
  const [newTeam1, setNewTeam1] = useState('Equipo 1');
  const [newTeam2, setNewTeam2] = useState('Equipo 2');
  const [newTeam3, setNewTeam3] = useState('Equipo 3');
  const [newTeam4, setNewTeam4] = useState('Equipo 4');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAMPIONSHIPS, JSON.stringify(championships));
  }, [championships]);

  const activeChamp =
    championships.find((c) => c.id === selectedChampId) || championships[0];

  useEffect(() => {
    if (activeChamp) {
      setEditingTargetScore(String(activeChamp.targetScore));
      const inProgress =
        activeChamp.matches.find((m) => m.status === 'EN_JUEGO') ||
        activeChamp.matches[0];
      if (inProgress && (!selectedMatchId || !activeChamp.matches.some((m) => m.id === selectedMatchId))) {
        setSelectedMatchId(inProgress.id);
      }
    }
  }, [activeChamp?.id]);

  const activeMatch =
    activeChamp?.matches.find((m) => m.id === selectedMatchId) ||
    activeChamp?.matches[0];

  const getModeBadge = (mode: ChampionshipMode) => {
    switch (mode) {
      case 'TEJO_PUNTOS':
        return {
          label: 'Tejo Tradicional (Por Puntos)',
          unit: 'ptos',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
        };
      case 'TEJO_BALAZOS':
        return {
          label: 'Tejo "A Balazos" (Por Mechas)',
          unit: 'balazos',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
        };
      case 'BOLIRANA':
        return {
          label: 'Bolirana / Rana Oficial',
          unit: 'ptos',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
        };
    }
  };

  // Update the target score of the active championship at any time
  const handleUpdateTargetScore = (newTarget: number) => {
    if (!activeChamp || isNaN(newTarget) || newTarget <= 0) return;
    setEditingTargetScore(String(newTarget));
    setChampionships((prev) =>
      prev.map((c) =>
        c.id === activeChamp.id ? { ...c, targetScore: newTarget } : c
      )
    );
  };

  // Switch active championship mode on the fly if desired
  const handleSwitchChampMode = (newMode: ChampionshipMode) => {
    if (!activeChamp) return;
    const defaultTarget =
      newMode === 'TEJO_PUNTOS' ? 27 : newMode === 'TEJO_BALAZOS' ? 5 : 3000;
    setEditingTargetScore(String(defaultTarget));
    setChampionships((prev) =>
      prev.map((c) =>
        c.id === activeChamp.id
          ? { ...c, mode: newMode, targetScore: defaultTarget }
          : c
      )
    );
  };

  // Score a play for Team A or Team B in the active match
  const handleAddScore = (
    team: 'A' | 'B',
    points: number,
    label: string,
    options?: { isBalazoOrRana?: boolean; isMonona?: boolean }
  ) => {
    if (!activeChamp || !activeMatch || points <= 0) return;

    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setChampionships((prev) =>
      prev.map((champ) => {
        if (champ.id !== activeChamp.id) return champ;

        let updatedMatches = champ.matches.map((m) => {
          if (m.id !== activeMatch.id) return m;

          const nextScoreA = team === 'A' ? m.scoreA + points : m.scoreA;
          const nextScoreB = team === 'B' ? m.scoreB + points : m.scoreB;

          const nextRanasA =
            team === 'A' && options?.isBalazoOrRana
              ? m.ranasOrBalazosA + 1
              : m.ranasOrBalazosA;
          const nextRanasB =
            team === 'B' && options?.isBalazoOrRana
              ? m.ranasOrBalazosB + 1
              : m.ranasOrBalazosB;

          const nextMononasA =
            team === 'A' && options?.isMonona ? m.mononasA + 1 : m.mononasA;
          const nextMononasB =
            team === 'B' && options?.isMonona ? m.mononasB + 1 : m.mononasB;

          const newEvent: ChampionshipScoreEvent = {
            id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            team,
            teamName: team === 'A' ? m.teamA : m.teamB,
            label,
            points,
            timestamp: nowStr,
          };

          // Check if targetScore is reached
          let nextStatus: ChampionshipMatch['status'] = 'EN_JUEGO';
          let winner = m.winner;

          if (nextScoreA >= champ.targetScore) {
            nextStatus = 'FINALIZADO';
            winner = m.teamA;
          } else if (nextScoreB >= champ.targetScore) {
            nextStatus = 'FINALIZADO';
            winner = m.teamB;
          }

          return {
            ...m,
            scoreA: nextScoreA,
            scoreB: nextScoreB,
            ranasOrBalazosA: nextRanasA,
            ranasOrBalazosB: nextRanasB,
            mononasA: nextMononasA,
            mononasB: nextMononasB,
            status: nextStatus,
            winner,
            events: [newEvent, ...m.events],
          };
        });

        // Propagate semifinal winners to Gran Final automatically
        const semi1 = updatedMatches.find((m) => m.matchNumber === 1);
        const semi2 = updatedMatches.find((m) => m.matchNumber === 2);
        const finalMatch = updatedMatches.find((m) => m.matchNumber === 3);

        let tournamentChampion = champ.champion;
        let tournamentStatus = champ.status;

        if (finalMatch) {
          const nextFinalTeamA = semi1?.winner ? semi1.winner : finalMatch.teamA;
          const nextFinalTeamB = semi2?.winner ? semi2.winner : finalMatch.teamB;
          const shouldActivateFinal =
            semi1?.status === 'FINALIZADO' &&
            semi2?.status === 'FINALIZADO' &&
            finalMatch.status === 'PENDIENTE';

          updatedMatches = updatedMatches.map((m) =>
            m.id === finalMatch.id
              ? {
                  ...m,
                  teamA: nextFinalTeamA,
                  teamB: nextFinalTeamB,
                  status: shouldActivateFinal ? 'EN_JUEGO' : m.status,
                }
              : m
          );

          const refreshedFinal = updatedMatches.find((m) => m.id === finalMatch.id);
          if (refreshedFinal?.status === 'FINALIZADO' && refreshedFinal.winner) {
            tournamentChampion = refreshedFinal.winner;
            tournamentStatus = 'FINALIZADO';
          }
        } else if (semi1?.status === 'FINALIZADO' && semi1.winner) {
          tournamentChampion = semi1.winner;
          tournamentStatus = 'FINALIZADO';
        }

        return {
          ...champ,
          matches: updatedMatches,
          champion: tournamentChampion,
          status: tournamentStatus,
        };
      })
    );
  };

  // Undo last score event in the active match
  const handleUndoLastEvent = () => {
    if (!activeChamp || !activeMatch || activeMatch.events.length === 0) return;
    const [lastEvent, ...remainingEvents] = activeMatch.events;

    setChampionships((prev) =>
      prev.map((champ) => {
        if (champ.id !== activeChamp.id) return champ;
        return {
          ...champ,
          status: 'ACTIVO',
          champion: undefined,
          matches: champ.matches.map((m) => {
            if (m.id !== activeMatch.id) return m;
            const nextScoreA =
              lastEvent.team === 'A'
                ? Math.max(0, m.scoreA - lastEvent.points)
                : m.scoreA;
            const nextScoreB =
              lastEvent.team === 'B'
                ? Math.max(0, m.scoreB - lastEvent.points)
                : m.scoreB;
            return {
              ...m,
              scoreA: nextScoreA,
              scoreB: nextScoreB,
              status: 'EN_JUEGO',
              winner: undefined,
              events: remainingEvents,
            };
          }),
        };
      })
    );
  };

  // Reset match scores
  const handleResetMatch = () => {
    if (!activeChamp || !activeMatch) return;
    setChampionships((prev) =>
      prev.map((champ) => {
        if (champ.id !== activeChamp.id) return champ;
        return {
          ...champ,
          status: 'ACTIVO',
          champion: undefined,
          matches: champ.matches.map((m) =>
            m.id === activeMatch.id
              ? {
                  ...m,
                  scoreA: 0,
                  scoreB: 0,
                  ranasOrBalazosA: 0,
                  ranasOrBalazosB: 0,
                  mononasA: 0,
                  mononasB: 0,
                  status: 'EN_JUEGO',
                  winner: undefined,
                  events: [],
                }
              : m
          ),
        };
      })
    );
  };

  // Create a new championship
  const handleCreateChampionship = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName =
      newChampName.trim() ||
      `Torneo ${
        newChampMode === 'TEJO_BALAZOS'
          ? 'Tejo A Balazos'
          : newChampMode === 'TEJO_PUNTOS'
          ? 'Tejo Tradicional'
          : 'Bolirana'
      }`;
    const teams = [newTeam1, newTeam2, newTeam3, newTeam4]
      .map((t) => t.trim())
      .filter(Boolean);

    const createdMatches = buildInitialMatches(teams);
    const created: Championship = {
      id: `champ-${Date.now()}`,
      name: cleanName,
      mode: newChampMode,
      targetScore: Math.max(1, Number(newChampTarget) || 27),
      entryFee: Math.max(0, Number(newChampEntryFee) || 0),
      prizePool: Math.max(0, Number(newChampPrizePool) || 0),
      teams,
      matches: createdMatches,
      status: 'ACTIVO',
      createdAt: 'Recién creado',
    };

    setChampionships((prev) => [created, ...prev]);
    setSelectedChampId(created.id);
    setSelectedMatchId(createdMatches[0].id);
    setShowCreateModal(false);
    setNewChampName('');
  };

  const handleDeleteChampionship = (id: string) => {
    if (championships.length <= 1) return;
    const remaining = championships.filter((c) => c.id !== id);
    setChampionships(remaining);
    if (selectedChampId === id && remaining[0]) {
      setSelectedChampId(remaining[0].id);
    }
  };

  if (!activeChamp || !activeMatch) return null;

  const badge = getModeBadge(activeChamp.mode);
  const progressA = Math.min(
    100,
    Math.round((activeMatch.scoreA / Math.max(1, activeChamp.targetScore)) * 100)
  );
  const progressB = Math.min(
    100,
    Math.round((activeMatch.scoreB / Math.max(1, activeChamp.targetScore)) * 100)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* TOP HEADER BANNER */}
      <div className="rounded-3xl border border-amber-500/35 bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-zinc-950 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 text-[10px] font-bold uppercase tracking-wider">
                  Reglamento Oficial FEDETEJO & Bolirana Colombia
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 font-display mt-1">
                Campeonatos de Tejo, A Balazos & Bolirana
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5 max-w-2xl">
                Gestiona torneos en vivo por puntos tradicionales, relámpagos a balazos (mechas) o bolirana, personalizando en cualquier momento la meta para ganar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowRulesModal((prev) => !prev)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{showRulesModal ? 'Ocultar Reglamento' : 'Ver Reglamento & Puntajes'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Campeonato</span>
            </button>
          </div>
        </div>

        {/* TOURNAMENT SELECTOR PILLS */}
        <div className="relative z-10 mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-zinc-400 shrink-0 mr-1">
            Torneos Activos:
          </span>
          {championships.map((c) => {
            const isSelected = c.id === activeChamp.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedChampId(c.id)}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                    : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-amber-500/40'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>{c.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-amber-400'
                  }`}
                >
                  Meta: {c.targetScore}{' '}
                  {c.mode === 'TEJO_BALAZOS' ? 'balazos' : 'ptos'}
                </span>
                {championships.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChampionship(c.id);
                    }}
                    className={`p-0.5 rounded hover:bg-rose-500/20 ${
                      isSelected ? 'text-zinc-900 hover:text-rose-900' : 'text-zinc-500 hover:text-rose-400'
                    }`}
                    title="Eliminar torneo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* COLLAPSIBLE OFFICIAL RULES & SCORING REFERENCE */}
      {showRulesModal && (
        <div className="rounded-3xl bg-zinc-900/95 border border-amber-500/35 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Reglamento Oficial en Colombia: Tejo Tradicional, Tejo A Balazos y Bolirana</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-lg bg-zinc-800 cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-2">
              <div className="font-bold text-rose-400 uppercase tracking-wider">
                1. Tejo Tradicional (FEDETEJO)
              </div>
              <ul className="space-y-1.5 text-zinc-300">
                <li>• <strong>Mano (+1 pto):</strong> Tejo más cercano al bocín al cerrar la ronda (si no hubo mecha, embocinada ni moñona).</li>
                <li>• <strong>Mecha / Balazo (+3 ptos):</strong> Explosión válida del triángulo de pólvora en el bocín.</li>
                <li>• <strong>Embocinada (+6 ptos):</strong> El tejo cae y queda fijo dentro del bocín.</li>
                <li>• <strong>Moñona (+9 ptos):</strong> Embocinada + explosión de mecha en el mismo tiro.</li>
                <li>• <strong>Meta del Chico:</strong> Oficialmente a <strong>27 puntos</strong> (o 21 en minitejo), pero aquí puedes fijar <strong>cualquier puntaje meta</strong>.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-2">
              <div className="font-bold text-amber-400 uppercase tracking-wider">
                2. Tejo "A Balazos" (Mecha Limpia)
              </div>
              <ul className="space-y-1.5 text-zinc-300">
                <li>• <strong>Solo valen las explosiones:</strong> Ideal para torneos relámpago de bar y apuestas rápidas; no se cuenta la "mano".</li>
                <li>• <strong>Balazo / Mecha (+1 balazo):</strong> Cada mecha reventada limpiamente suma 1 balazo al marcador.</li>
                <li>• <strong>Moñona Especial (+2 balazos):</strong> Embocinar reventando mecha suma 2 balazos directos.</li>
                <li>• <strong>Meta Libre:</strong> Se pacta a <strong>3, 5, 7 o 10 balazos</strong> (ajustable al instante en el panel).</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-2">
              <div className="font-bold text-emerald-400 uppercase tracking-wider">
                3. Bolirana / Rana Colombiana
              </div>
              <ul className="space-y-1.5 text-zinc-300">
                <li>• <strong>6 balines por turno:</strong> Lanzamiento uno por uno a 3.50m sin pisar la línea (pisar línea anula el tiro).</li>
                <li>• <strong>Rana Principal:</strong> <strong>+500 ptos</strong> (tiro de máxima jerarquía y criterio de desempate).</li>
                <li>• <strong>Ranita / Botella:</strong> <strong>+250 ptos</strong> · <strong>Molino:</strong> <strong>+150 ptos</strong>.</li>
                <li>• <strong>Puentes y Base:</strong> <strong>+100, +50 y +20 ptos</strong> · <strong>Blanqueada:</strong> 0 ptos.</li>
                <li>• <strong>Meta Libre:</strong> Ajustable a <strong>1.500, 3.000, 5.000 ptos</strong> o el valor que definas.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CUSTOMIZATION BAR: CHANGE MODE OR TARGET SCORE AT ANY TIME */}
      <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Mode Switcher */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Modalidad de Juego del Torneo Activo:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSwitchChampMode('TEJO_PUNTOS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                activeChamp.mode === 'TEJO_PUNTOS'
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-rose-500/40'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Tejo por Puntos (1 / 3 / 6 / 9)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchChampMode('TEJO_BALAZOS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                activeChamp.mode === 'TEJO_BALAZOS'
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-amber-500/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Tejo "A Balazos" (Solo Mechas)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchChampMode('BOLIRANA')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                activeChamp.mode === 'BOLIRANA'
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Bolirana / Rana</span>
            </button>
          </div>
        </div>

        {/* Right: Custom Target Score Input + Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
            Puntaje o Meta para Ganar el Partido (Personalizable):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-amber-500/40 rounded-xl px-3 py-1.5">
              <input
                type="number"
                min={1}
                value={editingTargetScore}
                onChange={(e) => {
                  setEditingTargetScore(e.target.value);
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    handleUpdateTargetScore(val);
                  }
                }}
                className="w-20 bg-transparent text-sm font-extrabold text-amber-300 focus:outline-none font-mono text-center"
              />
              <span className="text-xs font-bold text-zinc-400">{badge.unit}</span>
            </div>

            {/* Quick Target Presets depending on active mode */}
            {activeChamp.mode === 'TEJO_PUNTOS' &&
              [15, 21, 27, 35].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleUpdateTargetScore(preset)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer ${
                    activeChamp.targetScore === preset
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset} ptos
                </button>
              ))}

            {activeChamp.mode === 'TEJO_BALAZOS' &&
              [3, 5, 7, 10, 12].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleUpdateTargetScore(preset)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer ${
                    activeChamp.targetScore === preset
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset} balazos
                </button>
              ))}

            {activeChamp.mode === 'BOLIRANA' &&
              [1500, 2500, 3000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleUpdateTargetScore(preset)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer ${
                    activeChamp.targetScore === preset
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset} ptos
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* CHAMPION BANNER IF TOURNAMENT IS FINISHED */}
      {activeChamp.champion && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-zinc-900 border border-amber-400/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                ¡Campeón Oficial del Torneo!
              </span>
              <h3 className="text-xl font-extrabold text-white">
                🏆 {activeChamp.champion}
              </h3>
              <p className="text-xs text-amber-200/90">
                Premio acumulado del campeonato: <strong>{formatCurrency(activeChamp.prizePool)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID: LEFT LIVE MATCH SCOREBOARD (Col 7) + RIGHT BRACKET & LOG (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIVE SCOREBOARD & 1-CLICK PLAY BUTTONS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Match Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                    {activeMatch.roundName}
                  </span>
                  {activeMatch.canchaAsignada && (
                    <span className="text-xs text-zinc-400 font-medium">
                      · {activeMatch.canchaAsignada}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 mt-1">
                  Tablero Marcador en Vivo — Meta: {activeChamp.targetScore} {badge.unit}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndoLastEvent}
                  disabled={activeMatch.events.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Deshacer última jugada"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Deshacer</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetMatch}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                >
                  Reiniciar Chico
                </button>
              </div>
            </div>

            {/* TWO TEAMS SCORE CARDS & SCORING CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['A', 'B'] as const).map((side) => {
                const isA = side === 'A';
                const teamName = isA ? activeMatch.teamA : activeMatch.teamB;
                const score = isA ? activeMatch.scoreA : activeMatch.scoreB;
                const progress = isA ? progressA : progressB;
                const balazosCount = isA
                  ? activeMatch.ranasOrBalazosA
                  : activeMatch.ranasOrBalazosB;
                const mononasCount = isA ? activeMatch.mononasA : activeMatch.mononasB;
                const isWinner = activeMatch.winner === teamName;
                const customInput = isA ? customPointsInputA : customPointsInputB;
                const setCustomInput = isA ? setCustomPointsInputA : setCustomPointsInputB;

                return (
                  <div
                    key={side}
                    className={`rounded-2xl p-4 border transition-all space-y-4 ${
                      isWinner
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-zinc-950/90 border-zinc-800'
                    }`}
                  >
                    {/* Team Name & Big Digital Score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Equipo / Jugador {side}
                        </span>
                        <h4 className="text-base sm:text-lg font-extrabold text-zinc-100 truncate">
                          {teamName}
                        </h4>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ¡Ganador del Chico!
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tabular-nums leading-none">
                          {score}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          de {activeChamp.targetScore} {badge.unit}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar to Target Score */}
                    <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Sub-counters (Balazos / Ranas / Moñonas) */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-900">
                      <span>
                        {activeChamp.mode === 'BOLIRANA' ? '🐸 Ranas:' : '💥 Balazos/Mechas:'}{' '}
                        <strong className="text-zinc-200">{balazosCount}</strong>
                      </span>
                      {activeChamp.mode !== 'BOLIRANA' && (
                        <span>
                          🔥 Moñonas: <strong className="text-amber-300">{mononasCount}</strong>
                        </span>
                      )}
                    </div>

                    {/* MODE-SPECIFIC 1-CLICK SCORING BUTTONS */}
                    {activeChamp.mode === 'TEJO_PUNTOS' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 1, '✋ Mano (+1 pto)')
                          }
                          className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                        >
                          <span>✋ Mano</span>
                          <span className="text-amber-400 font-mono text-sm font-extrabold">
                            +1 pto
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 3, '💥 Mecha / Balazo (+3 ptos)', {
                              isBalazoOrRana: true,
                            })
                          }
                          className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-bold flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                        >
                          <span>💥 Mecha / Balazo</span>
                          <span className="text-amber-400 font-mono text-sm font-extrabold">
                            +3 ptos
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 6, '🎯 Embocinada (+6 ptos)')
                          }
                          className="p-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 text-xs font-bold flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                        >
                          <span>🎯 Embocinada</span>
                          <span className="text-sky-400 font-mono text-sm font-extrabold">
                            +6 ptos
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 9, '🔥 ¡MOÑONA! (+9 ptos)', {
                              isBalazoOrRana: true,
                              isMonona: true,
                            })
                          }
                          className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 text-xs font-bold flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                        >
                          <span>🔥 ¡Moñona!</span>
                          <span className="text-rose-400 font-mono text-sm font-extrabold">
                            +9 ptos
                          </span>
                        </button>
                      </div>
                    )}

                    {activeChamp.mode === 'TEJO_BALAZOS' && (
                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(
                              side,
                              1,
                              '💥 ¡Balazo! (Mecha Explotada)',
                              { isBalazoOrRana: true }
                            )
                          }
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-zinc-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                        >
                          <Flame className="w-4 h-4" />
                          <span>💥 ¡BALAZO! (+1 Mecha)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(
                              side,
                              2,
                              '🔥 ¡Moñona en Balazos! (+2 Balazos)',
                              { isBalazoOrRana: true, isMonona: true }
                            )
                          }
                          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <span>🔥 Moñona (Embocinada + Mecha): +2 Balazos</span>
                        </button>
                      </div>
                    )}

                    {activeChamp.mode === 'BOLIRANA' && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 500, '🐸 ¡Rana Principal! (+500)', {
                              isBalazoOrRana: true,
                            })
                          }
                          className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex flex-col items-center cursor-pointer"
                        >
                          <span>🐸 Rana Mayor</span>
                          <span className="text-emerald-400 font-mono font-extrabold">+500</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 250, '🍾 Ranita / Botella (+250)')
                          }
                          className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-bold flex flex-col items-center cursor-pointer"
                        >
                          <span>🍾 Ranita / Botella</span>
                          <span className="text-amber-400 font-mono font-extrabold">+250</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 150, '🎡 Molino (+150)')
                          }
                          className="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 text-xs font-bold flex flex-col items-center cursor-pointer"
                        >
                          <span>🎡 Molino</span>
                          <span className="text-sky-400 font-mono font-extrabold">+150</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 100, '🌉 Puente (+100)')
                          }
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex flex-col items-center cursor-pointer"
                        >
                          <span>🌉 Puente</span>
                          <span className="text-zinc-300 font-mono font-extrabold">+100</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 50, '⭕ Orificio Lateral (+50)')
                          }
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex flex-col items-center cursor-pointer"
                        >
                          <span>⭕ Lateral</span>
                          <span className="text-zinc-400 font-mono font-extrabold">+50</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 20, '⚪ Hueco Base (+20)')
                          }
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex flex-col items-center cursor-pointer"
                        >
                          <span>⚪ Base</span>
                          <span className="text-zinc-400 font-mono font-extrabold">+20</span>
                        </button>
                      </div>
                    )}

                    {/* Free Custom Score Input for any custom rule or bonus */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const pts = parseInt(customInput, 10);
                        if (!isNaN(pts) && pts > 0) {
                          handleAddScore(side, pts, `➕ Puntaje Manual (+${pts})`);
                          setCustomInput('');
                        }
                      }}
                      className="flex items-center gap-1.5 pt-2 border-t border-zinc-900"
                    >
                      <input
                        type="number"
                        min={1}
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder={`Otro valor (+${badge.unit})...`}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={!customInput.trim()}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-40 text-zinc-200 text-xs font-bold cursor-pointer shrink-0 transition-colors"
                      >
                        Sumar
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TOURNAMENT BRACKET (LLAVES) & PLAY-BY-PLAY LOG */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tournament Matches / Bracket */}
          <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">
                  Llaves y Partidos del Torneo ({activeChamp.matches.length})
                </h3>
              </div>
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                Premio: {formatCurrency(activeChamp.prizePool)}
              </span>
            </div>

            <div className="space-y-2.5">
              {activeChamp.matches.map((m) => {
                const isSelected = m.id === activeMatch.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-amber-500/35'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wider text-amber-400">
                        {m.roundName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'FINALIZADO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : m.status === 'EN_JUEGO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {m.status === 'FINALIZADO'
                          ? `Ganador: ${m.winner}`
                          : m.status === 'EN_JUEGO'
                          ? 'En Juego'
                          : 'Pendiente'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-bold truncate ${
                          m.winner === m.teamA ? 'text-emerald-400' : 'text-zinc-100'
                        }`}
                      >
                        {m.teamA}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono font-extrabold text-amber-300 shrink-0">
                        {m.scoreA} - {m.scoreB}
                      </span>
                      <span
                        className={`font-bold truncate text-right ${
                          m.winner === m.teamB ? 'text-emerald-400' : 'text-zinc-100'
                        }`}
                      >
                        {m.teamB}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Play-by-Play History of the Active Match */}
          <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Historial de Jugadas ({activeMatch.events.length})
              </span>
              <span className="text-[11px] text-zinc-500">{activeMatch.roundName}</span>
            </div>

            {activeMatch.events.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Aún no se han registrado jugadas en este partido. Usa los botones del tablero para anotar.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeMatch.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-100 truncate">{ev.teamName}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{ev.label}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-extrabold">
                        +{ev.points}
                      </span>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{ev.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TO CREATE A NEW CHAMPIONSHIP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
          <form
            onSubmit={handleCreateChampionship}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Crear Nuevo Campeonato
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Elige Tejo por Puntos, Tejo A Balazos o Bolirana y define tu meta para ganar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  Nombre del Campeonato *
                </label>
                <input
                  type="text"
                  required
                  value={newChampName}
                  onChange={(e) => setNewChampName(e.target.value)}
                  placeholder="Ej. Relámpago Viernes de Balazos / Copa Bolirana"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  Modalidad del Torneo *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChampMode('TEJO_PUNTOS');
                      setNewChampTarget(27);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      newChampMode === 'TEJO_PUNTOS'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>🎯 Tejo por Puntos</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Mano 1, Mecha 3, Emb 6, Moñ 9</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewChampMode('TEJO_BALAZOS');
                      setNewChampTarget(5);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      newChampMode === 'TEJO_BALAZOS'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>💥 Tejo A Balazos</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Solo Mechas Explotadas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewChampMode('BOLIRANA');
                      setNewChampTarget(3000);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      newChampMode === 'BOLIRANA'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>🐸 Bolirana / Rana</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Rana, Ranita, Molino, Puentes</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-amber-400 mb-1">
                    Meta para Ganar ({newChampMode === 'TEJO_BALAZOS' ? 'Balazos' : 'Puntos'}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newChampTarget}
                    onChange={(e) => setNewChampTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-300 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    Inscripción por Equipo
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newChampEntryFee}
                    onChange={(e) => setNewChampEntryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    Premio al Campeón
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newChampPrizePool}
                    onChange={(e) => setNewChampPrizePool(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">
                    Equipo / Jugador 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeam1}
                    onChange={(e) => setNewTeam1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">
                    Equipo / Jugador 2 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeam2}
                    onChange={(e) => setNewTeam2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">
                    Equipo / Jugador 3 (Semifinal 2)
                  </label>
                  <input
                    type="text"
                    value={newTeam3}
                    onChange={(e) => setNewTeam3(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">
                    Equipo / Jugador 4 (Semifinal 2)
                  </label>
                  <input
                    type="text"
                    value={newTeam4}
                    onChange={(e) => setNewTeam4(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Crear e Iniciar Torneo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
