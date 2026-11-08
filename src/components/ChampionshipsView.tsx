import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Users,
  BookOpen,
  Sliders,
  X,
  UserPlus,
  Shuffle,
  Lock,
  CircleDollarSign,
  ArrowRight,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../services/storage';

export type ChampionshipMode = 'TEJO_PUNTOS' | 'TEJO_BALAZOS' | 'BOLIRANA';

export type TeamFormatType = 'INDIVIDUAL' | 'PAREJAS' | 'TRIOS' | 'CUARTETOS' | 'LIBRE';

export interface ChampionshipTeam {
  id: string;
  name: string;
  players: string[];
  paidEntry?: boolean;
  contactPhone?: string;
}

export interface ChampionshipScoreEvent {
  id: string;
  team: 'A' | 'B';
  teamName: string;
  playerName?: string;
  label: string;
  points: number;
  timestamp: string;
}

export interface ChampionshipMatch {
  id: string;
  roundName: string;
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
  // Turn tracking per match
  turnSide?: 'A' | 'B';
  turnIndexA?: number;
  turnIndexB?: number;
  inactivePlayers?: string[];
}

export interface Championship {
  id: string;
  name: string;
  mode: ChampionshipMode;
  teamFormat: TeamFormatType;
  playersPerTeam: number;
  targetScore: number;
  entryFee: number;
  prizePool: number;
  teams: string[];
  teamDetails?: ChampionshipTeam[];
  matches: ChampionshipMatch[];
  status: 'ACTIVO' | 'FINALIZADO';
  champion?: string;
  createdAt: string;
}

export const STORAGE_KEY_CHAMPIONSHIPS = 'aura_pos_championships_v2';

export function getFormatLabel(format: TeamFormatType, count?: number): string {
  switch (format) {
    case 'INDIVIDUAL':
      return 'Individual (1 vs 1)';
    case 'PAREJAS':
      return 'Parejas / Duplas (2 vs 2)';
    case 'TRIOS':
      return 'Tríos / Ternas (3 vs 3)';
    case 'CUARTETOS':
      return 'Equipos de 4 (4 vs 4)';
    case 'LIBRE':
      return `Equipos (${count || 2} jugadores c/u)`;
  }
}

function buildInitialMatches(teams: string[]): ChampionshipMatch[] {
  const clean = teams.map((t) => t.trim()).filter(Boolean);
  const ts = Date.now();
  const matches: ChampionshipMatch[] = [];

  if (clean.length >= 8) {
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: `m-${ts}-q${i + 1}`,
        roundName: `Cuartos de Final ${i + 1}`,
        matchNumber: i + 1,
        teamA: clean[i * 2] || `Inscrito ${i * 2 + 1}`,
        teamB: clean[i * 2 + 1] || `Inscrito ${i * 2 + 2}`,
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: i === 0 ? 'EN_JUEGO' : 'PENDIENTE',
        canchaAsignada: `Cancha #${(i % 3) + 1}`,
        events: [],
        turnSide: 'A',
        turnIndexA: 0,
        turnIndexB: 0,
        inactivePlayers: [],
      });
    }
    matches.push({
      id: `m-${ts}-s1`,
      roundName: 'Semifinal 1',
      matchNumber: 5,
      teamA: 'Ganador Cuartos 1',
      teamB: 'Ganador Cuartos 2',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'PENDIENTE',
      canchaAsignada: 'Cancha #1',
      events: [],
      turnSide: 'A',
      turnIndexA: 0,
      turnIndexB: 0,
      inactivePlayers: [],
    });
    matches.push({
      id: `m-${ts}-s2`,
      roundName: 'Semifinal 2',
      matchNumber: 6,
      teamA: 'Ganador Cuartos 3',
      teamB: 'Ganador Cuartos 4',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'PENDIENTE',
      canchaAsignada: 'Cancha #2',
      events: [],
      turnSide: 'A',
      turnIndexA: 0,
      turnIndexB: 0,
      inactivePlayers: [],
    });
    matches.push({
      id: `m-${ts}-f`,
      roundName: 'Gran Final',
      matchNumber: 7,
      teamA: 'Ganador Semifinal 1',
      teamB: 'Ganador Semifinal 2',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'PENDIENTE',
      canchaAsignada: 'Cancha Principal VIP',
      events: [],
      turnSide: 'A',
      turnIndexA: 0,
      turnIndexB: 0,
      inactivePlayers: [],
    });
  } else if (clean.length >= 4) {
    matches.push({
      id: `m-${ts}-1`,
      roundName: 'Semifinal 1',
      matchNumber: 1,
      teamA: clean[0] || 'Inscrito 1',
      teamB: clean[1] || 'Inscrito 2',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'EN_JUEGO',
      canchaAsignada: 'Cancha Principal #1',
      events: [],
      turnSide: 'A',
      turnIndexA: 0,
      turnIndexB: 0,
      inactivePlayers: [],
    });
    matches.push({
      id: `m-${ts}-2`,
      roundName: 'Semifinal 2',
      matchNumber: 2,
      teamA: clean[2] || 'Inscrito 3',
      teamB: clean[3] || 'Inscrito 4',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'PENDIENTE',
      canchaAsignada: 'Cancha Principal #2',
      events: [],
      turnSide: 'A',
      turnIndexA: 0,
      turnIndexB: 0,
      inactivePlayers: [],
    });
    matches.push({
      id: `m-${ts}-3`,
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
      turnSide: 'A',
      turnIndexA: 0,
      turnIndexB: 0,
      inactivePlayers: [],
    });
  } else {
    matches.push({
      id: `m-${ts}-1`,
      roundName: 'Gran Final Directa',
      matchNumber: 1,
      teamA: clean[0] || 'Participante A',
      teamB: clean[1] || 'Participante B',
      scoreA: 0,
      scoreB: 0,
      ranasOrBalazosA: 0,
      ranasOrBalazosB: 0,
      mononasA: 0,
      mononasB: 0,
      status: 'EN_JUEGO',
      canchaAsignada: 'Cancha #1',
      events: [],
      turnSide: 'A',
      turnIndexA: 0,
      turnIndexB: 0,
      inactivePlayers: [],
    });
  }

  return matches;
}

export const DEFAULT_CHAMPIONSHIPS: Championship[] = [
  {
    id: 'champ-tejo-puntos',
    name: 'Gran Torneo Nocturno de Tejo AURA',
    mode: 'TEJO_PUNTOS',
    teamFormat: 'TRIOS',
    playersPerTeam: 3,
    targetScore: 27,
    entryFee: 60000,
    prizePool: 350000,
    teams: [
      'Los Caciques del Bocín',
      'Furia Boyacense',
      'Mecha de Oro VIP',
      'Combo Turmequé',
    ],
    teamDetails: [
      {
        id: 'td-1',
        name: 'Los Caciques del Bocín',
        players: ['Carlos Alvarado', 'Andrés Rincón', 'Jairo Méndez'],
        paidEntry: true,
      },
      {
        id: 'td-2',
        name: 'Furia Boyacense',
        players: ['Wilmar Vargas', 'Darío López', 'Édgar Pedraza'],
        paidEntry: true,
      },
      {
        id: 'td-3',
        name: 'Mecha de Oro VIP',
        players: ['Camilo Roa', 'Sebastián Díaz', 'Mauricio Ruiz'],
        paidEntry: true,
      },
      {
        id: 'td-4',
        name: 'Combo Turmequé',
        players: ['Hernán Cortés', 'Gustavo Parra', 'Felipe Mora'],
        paidEntry: true,
      },
    ],
    status: 'ACTIVO',
    createdAt: 'Hoy · 08:00 PM',
    matches: [
      {
        id: 'm-tejo-1',
        roundName: 'Semifinal 1',
        matchNumber: 1,
        teamA: 'Los Caciques del Bocín',
        teamB: 'Furia Boyacense',
        scoreA: 15,
        scoreB: 6,
        ranasOrBalazosA: 2,
        ranasOrBalazosB: 1,
        mononasA: 1,
        mononasB: 0,
        status: 'EN_JUEGO',
        canchaAsignada: 'Cancha de Tejo #1',
        turnSide: 'A',
        turnIndexA: 1,
        turnIndexB: 1,
        inactivePlayers: [],
        events: [
          {
            id: 'ev-2',
            team: 'B',
            teamName: 'Furia Boyacense',
            playerName: 'Wilmar Vargas',
            label: '🎯 Bocín / Embocinada (+6)',
            points: 6,
            timestamp: '08:22 PM',
          },
          {
            id: 'ev-1',
            team: 'A',
            teamName: 'Los Caciques del Bocín',
            playerName: 'Carlos Alvarado',
            label: '🔥 ¡Moñona! (+9)',
            points: 9,
            timestamp: '08:20 PM',
          },
        ],
      },
      {
        id: 'm-tejo-2',
        roundName: 'Semifinal 2',
        matchNumber: 2,
        teamA: 'Mecha de Oro VIP',
        teamB: 'Combo Turmequé',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Cancha de Tejo #2',
        turnSide: 'A',
        turnIndexA: 0,
        turnIndexB: 0,
        inactivePlayers: [],
        events: [],
      },
      {
        id: 'm-tejo-3',
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
        canchaAsignada: 'Cancha Principal VIP',
        turnSide: 'A',
        turnIndexA: 0,
        turnIndexB: 0,
        inactivePlayers: [],
        events: [],
      },
    ],
  },
  {
    id: 'champ-tejo-balazos',
    name: 'Relámpago "A Balazos" (Mecha y Bocín)',
    mode: 'TEJO_BALAZOS',
    teamFormat: 'PAREJAS',
    playersPerTeam: 2,
    targetScore: 10,
    entryFee: 40000,
    prizePool: 200000,
    teams: [
      'Pólvora Pura',
      'Los Francotiradores',
      'Reyes de la Mecha',
      'Trago & Balazo',
    ],
    teamDetails: [
      {
        id: 'td-b1',
        name: 'Pólvora Pura',
        players: ['Diego Rodríguez', 'Julián Castro'],
        paidEntry: true,
      },
      {
        id: 'td-b2',
        name: 'Los Francotiradores',
        players: ['Óscar Mejía', 'Iván Pineda'],
        paidEntry: true,
      },
      {
        id: 'td-b3',
        name: 'Reyes de la Mecha',
        players: ['Néstor Cano', 'Héctor Gómez'],
        paidEntry: true,
      },
      {
        id: 'td-b4',
        name: 'Trago & Balazo',
        players: ['Fabián Ortiz', 'Ramiro Silva'],
        paidEntry: true,
      },
    ],
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
        canchaAsignada: 'Cancha Rápida #3',
        turnSide: 'B',
        turnIndexA: 1,
        turnIndexB: 0,
        inactivePlayers: [],
        events: [
          {
            id: 'ev-b1',
            team: 'A',
            teamName: 'Pólvora Pura',
            playerName: 'Diego Rodríguez',
            label: '💥 Balazo / Mecha (+1)',
            points: 1,
            timestamp: '09:12 PM',
          },
        ],
      },
      {
        id: 'm-bal-2',
        roundName: 'Semifinal 2',
        matchNumber: 2,
        teamA: 'Reyes de la Mecha',
        teamB: 'Trago & Balazo',
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: 'PENDIENTE',
        canchaAsignada: 'Cancha Rápida #4',
        turnSide: 'A',
        turnIndexA: 0,
        turnIndexB: 0,
        inactivePlayers: [],
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
        canchaAsignada: 'Cancha VIP',
        turnSide: 'A',
        turnIndexA: 0,
        turnIndexB: 0,
        inactivePlayers: [],
        events: [],
      },
    ],
  },
  {
    id: 'champ-bolirana',
    name: 'Copa Bolirana de Oro AURA',
    mode: 'BOLIRANA',
    teamFormat: 'PAREJAS',
    playersPerTeam: 2,
    targetScore: 3000,
    entryFee: 30000,
    prizePool: 180000,
    teams: [
      'Rana Maestra',
      'Puntería Fina',
      'Los Compadres',
      'Combo Bolirana',
    ],
    teamDetails: [
      {
        id: 'td-r1',
        name: 'Rana Maestra',
        players: ['Fernando Gómez', 'Luis Patiño'],
        paidEntry: true,
      },
      {
        id: 'td-r2',
        name: 'Puntería Fina',
        players: ['Jorge Arias', 'Daniel Suárez'],
        paidEntry: true,
      },
      {
        id: 'td-r3',
        name: 'Los Compadres',
        players: ['Miguel Ángel', 'Pedro Nel'],
        paidEntry: true,
      },
      {
        id: 'td-r4',
        name: 'Combo Bolirana',
        players: ['César Augusto', 'Álvaro Uribe'],
        paidEntry: true,
      },
    ],
    status: 'ACTIVO',
    createdAt: 'Hoy · 09:30 PM',
    matches: [
      {
        id: 'm-bol-1',
        roundName: 'Semifinal 1',
        matchNumber: 1,
        teamA: 'Rana Maestra',
        teamB: 'Puntería Fina',
        scoreA: 1250,
        scoreB: 900,
        ranasOrBalazosA: 2,
        ranasOrBalazosB: 1,
        mononasA: 0,
        mononasB: 0,
        status: 'EN_JUEGO',
        canchaAsignada: 'Bolirana Electrónica #1',
        turnSide: 'B',
        turnIndexA: 1,
        turnIndexB: 0,
        inactivePlayers: [],
        events: [
          {
            id: 'ev-r1',
            team: 'A',
            teamName: 'Rana Maestra',
            playerName: 'Fernando Gómez',
            label: '🐸 Rana Mayor (+500)',
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
        turnSide: 'A',
        turnIndexA: 0,
        turnIndexB: 0,
        inactivePlayers: [],
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
        turnSide: 'A',
        turnIndexA: 0,
        turnIndexB: 0,
        inactivePlayers: [],
        events: [],
      },
    ],
  },
];

function createEmptyTeamDrafts(count: number, playersPerTeam: number): ChampionshipTeam[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `draft-team-${Date.now()}-${idx}`,
    name: '',
    players: Array.from({ length: playersPerTeam }, () => ''),
    paidEntry: true,
  }));
}

function formatCopCurrencyInput(raw: string | number): string {
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  if (isNaN(num)) return '';
  return `$ ${num.toLocaleString('es-CO')}`;
}

function parseCopCurrencyInput(formatted: string): number {
  const digits = String(formatted).replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) || 0;
}

type ChampSubView = 'LIVE_BOARD' | 'BRACKET' | 'ROSTER' | 'PRIVATE_FINANCES';

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

  const [activeSubView, setActiveSubView] = useState<ChampSubView>('LIVE_BOARD');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Target Score & Custom Turn Score input
  const [editingTargetScore, setEditingTargetScore] = useState<string>('');
  const [customTurnPointsInput, setCustomTurnPointsInput] = useState<string>('');

  // Create Championship Form State
  const [newChampName, setNewChampName] = useState('');
  const [newChampMode, setNewChampMode] = useState<ChampionshipMode>('TEJO_PUNTOS');
  const [newTeamFormat, setNewTeamFormat] = useState<TeamFormatType>('PAREJAS');
  const [newPlayersPerTeam, setNewPlayersPerTeam] = useState<number>(2);
  const [newPlayersPerTeamInput, setNewPlayersPerTeamInput] = useState<string>('2');
  const [newChampTargetInput, setNewChampTargetInput] = useState<string>('27');
  const [newChampEntryFeeInput, setNewChampEntryFeeInput] = useState<string>(
    formatCopCurrencyInput(40000)
  );
  const [newChampPrizePoolInput, setNewChampPrizePoolInput] = useState<string>(
    formatCopCurrencyInput(200000)
  );
  const [draftTeams, setDraftTeams] = useState<ChampionshipTeam[]>(() =>
    createEmptyTeamDrafts(4, 2)
  );
  const [draftTeamsCountInput, setDraftTeamsCountInput] = useState<string>('4');

  // Ensure draft inputs never have pre-filled placeholder values
  useEffect(() => {
    setDraftTeams((prev) =>
      prev.map((t) => ({
        ...t,
        name: /^Equipo \d+$/i.test(t.name.trim()) ? '' : t.name,
        players: t.players.map((p) => (/^Jugador \d+$/i.test(p.trim()) ? '' : p)),
      }))
    );
  }, []);

  // Quick Add New Team to Active Championship inline state
  const [showInlineAddTeam, setShowInlineAddTeam] = useState(false);
  const [inlineNewTeamName, setInlineNewTeamName] = useState('');
  const [inlineNewTeamPlayers, setInlineNewTeamPlayers] = useState<string[]>(['', '']);

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
      if (
        inProgress &&
        (!selectedMatchId || !activeChamp.matches.some((m) => m.id === selectedMatchId))
      ) {
        setSelectedMatchId(inProgress.id);
      }
    }
  }, [activeChamp?.id]);

  const activeMatch =
    activeChamp?.matches.find((m) => m.id === selectedMatchId) ||
    activeChamp?.matches[0];

  const teamADetails = activeChamp?.teamDetails?.find(
    (td) => td.name === activeMatch?.teamA
  );
  const teamBDetails = activeChamp?.teamDetails?.find(
    (td) => td.name === activeMatch?.teamB
  );

  // Full player lists for Team A and Team B
  const allPlayersA: string[] =
    teamADetails && teamADetails.players.length > 0
      ? teamADetails.players
      : activeMatch
      ? [activeMatch.teamA]
      : ['Jugador A'];

  const allPlayersB: string[] =
    teamBDetails && teamBDetails.players.length > 0
      ? teamBDetails.players
      : activeMatch
      ? [activeMatch.teamB]
      : ['Jugador B'];

  const inactiveSet = new Set(activeMatch?.inactivePlayers || []);

  // Active (still playing) players for each side; if all were marked inactive, fallback to all
  const activePlayersA = allPlayersA.filter((p) => !inactiveSet.has(`A:${p}`));
  const effectivePlayersA = activePlayersA.length > 0 ? activePlayersA : allPlayersA;

  const activePlayersB = allPlayersB.filter((p) => !inactiveSet.has(`B:${p}`));
  const effectivePlayersB = activePlayersB.length > 0 ? activePlayersB : allPlayersB;

  const currentTurnSide: 'A' | 'B' = activeMatch?.turnSide || 'A';
  const currentIdxA = (activeMatch?.turnIndexA ?? 0) % effectivePlayersA.length;
  const currentIdxB = (activeMatch?.turnIndexB ?? 0) % effectivePlayersB.length;

  const currentShooterA = effectivePlayersA[currentIdxA] || allPlayersA[0];
  const currentShooterB = effectivePlayersB[currentIdxB] || allPlayersB[0];

  const currentTurnPlayerName =
    currentTurnSide === 'A' ? currentShooterA : currentShooterB;
  const currentTurnTeamName =
    currentTurnSide === 'A' ? activeMatch?.teamA || '' : activeMatch?.teamB || '';

  const nextTurnSide: 'A' | 'B' = currentTurnSide === 'A' ? 'B' : 'A';
  const nextTurnPlayerName =
    currentTurnSide === 'A' ? currentShooterB : currentShooterA;
  const nextTurnTeamName =
    currentTurnSide === 'A' ? activeMatch?.teamB || '' : activeMatch?.teamA || '';

  const applyPlayersCountToDraftTeams = (targetCount: number) => {
    const safeCount = Math.max(1, Math.min(20, targetCount));
    setNewPlayersPerTeam(safeCount);
    setDraftTeams((prev) =>
      prev.map((team) => {
        const currentPlayers = team.players.map((p) =>
          /^Jugador \d+$/i.test(p.trim()) ? '' : p
        );
        if (currentPlayers.length < safeCount) {
          while (currentPlayers.length < safeCount) {
            currentPlayers.push('');
          }
        } else if (currentPlayers.length > safeCount) {
          currentPlayers.length = safeCount;
        }
        return {
          ...team,
          name: /^Equipo \d+$/i.test(team.name.trim()) ? '' : team.name,
          players: currentPlayers,
        };
      })
    );
  };

  const handleSelectTeamFormat = (format: TeamFormatType, customCount?: number) => {
    setNewTeamFormat(format);
    const targetCount =
      format === 'INDIVIDUAL'
        ? 1
        : format === 'PAREJAS'
        ? 2
        : format === 'TRIOS'
        ? 3
        : format === 'CUARTETOS'
        ? 4
        : Math.max(1, customCount ?? (newPlayersPerTeam || 2));

    setNewPlayersPerTeamInput(String(targetCount));
    applyPlayersCountToDraftTeams(targetCount);
  };

  const handleCustomPlayersInputChange = (rawVal: string) => {
    const digitsOnly = rawVal.replace(/\D/g, '');
    setNewPlayersPerTeamInput(digitsOnly);
    if (digitsOnly !== '') {
      const parsed = parseInt(digitsOnly, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        applyPlayersCountToDraftTeams(Math.min(20, parsed));
      }
    }
  };

  const handleAddDraftTeam = () => {
    setDraftTeams((prev) => {
      const next = [
        ...prev,
        {
          id: `draft-team-${Date.now()}-${prev.length + 1}`,
          name: '',
          players: Array.from({ length: newPlayersPerTeam }, () => ''),
          paidEntry: true,
        },
      ];
      setDraftTeamsCountInput(String(next.length));
      return next;
    });
  };

  const handleRemoveDraftTeam = (teamId: string) => {
    if (draftTeams.length <= 2) return;
    setDraftTeams((prev) => {
      const next = prev.filter((t) => t.id !== teamId);
      setDraftTeamsCountInput(String(next.length));
      return next;
    });
  };

  const handleSetDraftTeamsTotalCount = (rawCount: string) => {
    const digits = rawCount.replace(/\D/g, '');
    setDraftTeamsCountInput(digits);
    if (!digits) return;
    const targetTeams = Math.max(2, Math.min(64, parseInt(digits, 10) || 2));
    setDraftTeams((prev) => {
      const copy = [...prev];
      if (copy.length < targetTeams) {
        while (copy.length < targetTeams) {
          copy.push({
            id: `draft-team-${Date.now()}-${copy.length + 1}`,
            name: '',
            players: Array.from({ length: newPlayersPerTeam }, () => ''),
            paidEntry: true,
          });
        }
      } else if (copy.length > targetTeams) {
        copy.length = targetTeams;
      }
      return copy;
    });
  };

  const handleUpdateDraftTeamName = (teamId: string, newName: string) => {
    setDraftTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name: newName } : t))
    );
  };

  const handleUpdateDraftPlayerName = (
    teamId: string,
    playerIdx: number,
    playerName: string
  ) => {
    setDraftTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const nextPlayers = [...t.players];
        nextPlayers[playerIdx] = playerName;
        return { ...t, players: nextPlayers };
      })
    );
  };

  const handleAddPlayerToDraftTeam = (teamId: string) => {
    setDraftTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, players: [...t.players, ''] } : t
      )
    );
  };

  const handleRemovePlayerFromDraftTeam = (teamId: string, playerIdx: number) => {
    setDraftTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId || t.players.length <= 1) return t;
        return {
          ...t,
          players: t.players.filter((_, i) => i !== playerIdx),
        };
      })
    );
  };

  const handleToggleDraftTeamPaid = (teamId: string) => {
    setDraftTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, paidEntry: !t.paidEntry } : t))
    );
  };

  const handleShuffleDraftTeams = () => {
    setDraftTeams((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const getModeBadge = (mode: ChampionshipMode) => {
    switch (mode) {
      case 'TEJO_PUNTOS':
        return {
          label: 'Tejo por Puntos',
          unit: 'ptos',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
        };
      case 'TEJO_BALAZOS':
        return {
          label: 'Tejo A Balazos',
          unit: 'ptos',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
        };
      case 'BOLIRANA':
        return {
          label: 'Bolirana / Rana',
          unit: 'ptos',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
        };
    }
  };

  const handleUpdateTargetScore = (newTarget: number) => {
    if (!activeChamp || isNaN(newTarget) || newTarget <= 0) return;
    setEditingTargetScore(String(newTarget));
    setChampionships((prev) =>
      prev.map((c) =>
        c.id === activeChamp.id ? { ...c, targetScore: newTarget } : c
      )
    );
  };

  // Toggle whether a team member is currently active in the match rotation
  const handleTogglePlayerActiveStatus = (side: 'A' | 'B', playerName: string) => {
    if (!activeChamp || !activeMatch) return;
    const key = `${side}:${playerName}`;
    setChampionships((prev) =>
      prev.map((c) => {
        if (c.id !== activeChamp.id) return c;
        return {
          ...c,
          matches: c.matches.map((m) => {
            if (m.id !== activeMatch.id) return m;
            const currentInactive = m.inactivePlayers || [];
            const exists = currentInactive.includes(key);
            const nextInactive = exists
              ? currentInactive.filter((k) => k !== key)
              : [...currentInactive, key];
            return { ...m, inactivePlayers: nextInactive };
          }),
        };
      })
    );
  };

  // Manually select which side and player is throwing right now
  const handleSelectTurnManually = (side: 'A' | 'B', playerName: string) => {
    if (!activeChamp || !activeMatch) return;
    const targetList = side === 'A' ? effectivePlayersA : effectivePlayersB;
    const foundIdx = Math.max(0, targetList.indexOf(playerName));
    setChampionships((prev) =>
      prev.map((c) => {
        if (c.id !== activeChamp.id) return c;
        return {
          ...c,
          matches: c.matches.map((m) => {
            if (m.id !== activeMatch.id) return m;
            return {
              ...m,
              turnSide: side,
              turnIndexA: side === 'A' ? foundIdx : m.turnIndexA ?? 0,
              turnIndexB: side === 'B' ? foundIdx : m.turnIndexB ?? 0,
            };
          }),
        };
      })
    );
  };

  /**
   * Registers a throw (including 0-point "Cayó por fuera") for the active turn player
   * and automatically rotates the turn to the competing team's next player.
   */
  const handleRegisterTurnThrow = (
    points: number,
    label: string,
    options?: {
      isBalazoOrRana?: boolean;
      isMonona?: boolean;
      forcedSide?: 'A' | 'B';
      forcedPlayer?: string;
    }
  ) => {
    if (!activeChamp || !activeMatch || points < 0) return;

    const side: 'A' | 'B' = options?.forcedSide || currentTurnSide;
    const shooterName =
      options?.forcedPlayer ||
      (side === 'A' ? currentShooterA : currentShooterB);

    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setChampionships((prev) =>
      prev.map((champ) => {
        if (champ.id !== activeChamp.id) return champ;

        let updatedMatches = champ.matches.map((m) => {
          if (m.id !== activeMatch.id) return m;

          const nextScoreA = side === 'A' ? m.scoreA + points : m.scoreA;
          const nextScoreB = side === 'B' ? m.scoreB + points : m.scoreB;

          const nextRanasA =
            side === 'A' && options?.isBalazoOrRana
              ? m.ranasOrBalazosA + 1
              : m.ranasOrBalazosA;
          const nextRanasB =
            side === 'B' && options?.isBalazoOrRana
              ? m.ranasOrBalazosB + 1
              : m.ranasOrBalazosB;

          const nextMononasA =
            side === 'A' && options?.isMonona ? m.mononasA + 1 : m.mononasA;
          const nextMononasB =
            side === 'B' && options?.isMonona ? m.mononasB + 1 : m.mononasB;

          const newEvent: ChampionshipScoreEvent = {
            id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            team: side,
            teamName: side === 'A' ? m.teamA : m.teamB,
            playerName: shooterName || undefined,
            label,
            points,
            timestamp: nowStr,
          };

          let nextStatus: ChampionshipMatch['status'] = 'EN_JUEGO';
          let winner = m.winner;

          if (nextScoreA >= champ.targetScore) {
            nextStatus = 'FINALIZADO';
            winner = m.teamA;
          } else if (nextScoreB >= champ.targetScore) {
            nextStatus = 'FINALIZADO';
            winner = m.teamB;
          }

          // Advance turn index for the team that just threw, and switch side to the other team
          const curIdxA = m.turnIndexA ?? 0;
          const curIdxB = m.turnIndexB ?? 0;
          const nextIdxA =
            side === 'A'
              ? (curIdxA + 1) % Math.max(1, effectivePlayersA.length)
              : curIdxA;
          const nextIdxB =
            side === 'B'
              ? (curIdxB + 1) % Math.max(1, effectivePlayersB.length)
              : curIdxB;
          const nextSide: 'A' | 'B' = side === 'A' ? 'B' : 'A';

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
            turnSide: nextSide,
            turnIndexA: nextIdxA,
            turnIndexB: nextIdxB,
            events: [newEvent, ...m.events],
          };
        });

        const totalMatches = updatedMatches.length;
        let tournamentChampion = champ.champion;
        let tournamentStatus = champ.status;

        if (totalMatches === 3) {
          const semi1 = updatedMatches.find((m) => m.matchNumber === 1);
          const semi2 = updatedMatches.find((m) => m.matchNumber === 2);
          const finalMatch = updatedMatches.find((m) => m.matchNumber === 3);

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
          }
        } else if (totalMatches === 7) {
          const q1 = updatedMatches.find((m) => m.matchNumber === 1);
          const q2 = updatedMatches.find((m) => m.matchNumber === 2);
          const q3 = updatedMatches.find((m) => m.matchNumber === 3);
          const q4 = updatedMatches.find((m) => m.matchNumber === 4);
          const s1 = updatedMatches.find((m) => m.matchNumber === 5);
          const s2 = updatedMatches.find((m) => m.matchNumber === 6);

          updatedMatches = updatedMatches.map((m) => {
            if (m.matchNumber === 5) {
              return {
                ...m,
                teamA: q1?.winner || m.teamA,
                teamB: q2?.winner || m.teamB,
                status:
                  q1?.status === 'FINALIZADO' &&
                  q2?.status === 'FINALIZADO' &&
                  m.status === 'PENDIENTE'
                    ? 'EN_JUEGO'
                    : m.status,
              };
            }
            if (m.matchNumber === 6) {
              return {
                ...m,
                teamA: q3?.winner || m.teamA,
                teamB: q4?.winner || m.teamB,
                status:
                  q3?.status === 'FINALIZADO' &&
                  q4?.status === 'FINALIZADO' &&
                  m.status === 'PENDIENTE'
                    ? 'EN_JUEGO'
                    : m.status,
              };
            }
            if (m.matchNumber === 7) {
              return {
                ...m,
                teamA: s1?.winner || m.teamA,
                teamB: s2?.winner || m.teamB,
                status:
                  s1?.status === 'FINALIZADO' &&
                  s2?.status === 'FINALIZADO' &&
                  m.status === 'PENDIENTE'
                    ? 'EN_JUEGO'
                    : m.status,
              };
            }
            return m;
          });

          const refreshedFinal = updatedMatches.find((m) => m.matchNumber === 7);
          if (refreshedFinal?.status === 'FINALIZADO' && refreshedFinal.winner) {
            tournamentChampion = refreshedFinal.winner;
            tournamentStatus = 'FINALIZADO';
          }
        } else {
          const lastMatch = updatedMatches[updatedMatches.length - 1];
          if (lastMatch?.status === 'FINALIZADO' && lastMatch.winner) {
            tournamentChampion = lastMatch.winner;
            tournamentStatus = 'FINALIZADO';
          }
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

            // Revert turn back to the player who made the undone throw
            const prevSide = lastEvent.team;
            const curIdxA = m.turnIndexA ?? 0;
            const curIdxB = m.turnIndexB ?? 0;
            const revertedIdxA =
              prevSide === 'A'
                ? (curIdxA - 1 + Math.max(1, effectivePlayersA.length)) %
                  Math.max(1, effectivePlayersA.length)
                : curIdxA;
            const revertedIdxB =
              prevSide === 'B'
                ? (curIdxB - 1 + Math.max(1, effectivePlayersB.length)) %
                  Math.max(1, effectivePlayersB.length)
                : curIdxB;

            return {
              ...m,
              scoreA: nextScoreA,
              scoreB: nextScoreB,
              status: 'EN_JUEGO',
              winner: undefined,
              turnSide: prevSide,
              turnIndexA: revertedIdxA,
              turnIndexB: revertedIdxB,
              events: remainingEvents,
            };
          }),
        };
      })
    );
  };

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
                  turnSide: 'A',
                  turnIndexA: 0,
                  turnIndexB: 0,
                  events: [],
                }
              : m
          ),
        };
      })
    );
  };

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

    const isIndividual = newTeamFormat === 'INDIVIDUAL' || newPlayersPerTeam === 1;

    const sanitizedTeamDetails: ChampionshipTeam[] = draftTeams.map((t, idx) => {
      if (isIndividual) {
        const singlePlayerName =
          (t.players[0] || t.name || '').trim() || `Jugador ${idx + 1}`;
        return {
          id: t.id || `player-${Date.now()}-${idx}`,
          name: singlePlayerName,
          players: [singlePlayerName],
          paidEntry: t.paidEntry ?? true,
        };
      }

      const cleanedPlayers = t.players.map(
        (p, pIdx) => p.trim() || `Jugador ${pIdx + 1}`
      );
      const typedPlayersJoined = t.players
        .map((p) => p.trim())
        .filter(Boolean)
        .join(' & ');
      const fallbackGroupLabel =
        newTeamFormat === 'PAREJAS'
          ? `Pareja ${idx + 1}`
          : newTeamFormat === 'TRIOS'
          ? `Trío ${idx + 1}`
          : `Equipo ${idx + 1}`;

      return {
        id: t.id || `team-${Date.now()}-${idx}`,
        name: t.name.trim() || typedPlayersJoined || fallbackGroupLabel,
        players: cleanedPlayers,
        paidEntry: t.paidEntry ?? true,
      };
    });

    const teamNames = sanitizedTeamDetails.map((t) => t.name);
    const createdMatches = buildInitialMatches(teamNames);

    const parsedTarget = Math.max(
      1,
      parseInt(String(newChampTargetInput).replace(/\D/g, ''), 10) ||
        (newChampMode === 'TEJO_BALAZOS' ? 10 : newChampMode === 'BOLIRANA' ? 3000 : 27)
    );
    const parsedEntryFee = parseCopCurrencyInput(newChampEntryFeeInput);
    const parsedPrizePool = parseCopCurrencyInput(newChampPrizePoolInput);

    const created: Championship = {
      id: `champ-${Date.now()}`,
      name: cleanName,
      mode: newChampMode,
      teamFormat: newTeamFormat,
      playersPerTeam: newPlayersPerTeam,
      targetScore: parsedTarget,
      entryFee: parsedEntryFee,
      prizePool: parsedPrizePool,
      teams: teamNames,
      teamDetails: sanitizedTeamDetails,
      matches: createdMatches,
      status: 'ACTIVO',
      createdAt: 'Recién creado',
    };

    setChampionships((prev) => [created, ...prev]);
    setSelectedChampId(created.id);
    setSelectedMatchId(createdMatches[0].id);
    setActiveSubView('LIVE_BOARD');
    setShowCreateModal(false);
    setNewChampName('');
    setDraftTeams(createEmptyTeamDrafts(4, newPlayersPerTeam));
    setDraftTeamsCountInput('4');
  };

  const handleInlineAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChamp) return;
    const isIndividualChamp =
      activeChamp.teamFormat === 'INDIVIDUAL' || activeChamp.playersPerTeam === 1;

    if (isIndividualChamp) {
      const singlePlayer = (inlineNewTeamName || inlineNewTeamPlayers[0] || '').trim();
      if (!singlePlayer) return;
      const newPlayerObj: ChampionshipTeam = {
        id: `td-${Date.now()}`,
        name: singlePlayer,
        players: [singlePlayer],
        paidEntry: true,
      };
      setChampionships((prev) =>
        prev.map((c) => {
          if (c.id !== activeChamp.id) return c;
          const nextTeamDetails = [...(c.teamDetails || []), newPlayerObj];
          const nextTeams = nextTeamDetails.map((td) => td.name);
          return { ...c, teams: nextTeams, teamDetails: nextTeamDetails };
        })
      );
      setInlineNewTeamName('');
      setInlineNewTeamPlayers(['']);
      setShowInlineAddTeam(false);
      return;
    }

    if (!inlineNewTeamName.trim()) return;

    const newTeamObj: ChampionshipTeam = {
      id: `td-${Date.now()}`,
      name: inlineNewTeamName.trim(),
      players: inlineNewTeamPlayers
        .map((p, idx) => p.trim() || `Jugador ${idx + 1}`)
        .filter(Boolean),
      paidEntry: true,
    };

    setChampionships((prev) =>
      prev.map((c) => {
        if (c.id !== activeChamp.id) return c;
        const nextTeamDetails = [...(c.teamDetails || []), newTeamObj];
        const nextTeams = nextTeamDetails.map((td) => td.name);
        return {
          ...c,
          teams: nextTeams,
          teamDetails: nextTeamDetails,
        };
      })
    );

    setInlineNewTeamName('');
    setInlineNewTeamPlayers(
      Array.from({ length: activeChamp.playersPerTeam || 2 }, () => '')
    );
    setShowInlineAddTeam(false);
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
  const isActiveChampIndividual =
    activeChamp.teamFormat === 'INDIVIDUAL' || activeChamp.playersPerTeam === 1;

  // Helper to compute stats for a given player in the current match
  const getPlayerMatchStats = (side: 'A' | 'B', playerName: string) => {
    const playerEvents = activeMatch.events.filter(
      (ev) => ev.team === side && ev.playerName === playerName
    );
    const totalPoints = playerEvents.reduce((sum, ev) => sum + ev.points, 0);
    return {
      throws: playerEvents.length,
      points: totalPoints,
    };
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. EXECUTIVE HEADER & 4-TAB NAVIGATION */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700 text-[10px] font-bold">
                  {getFormatLabel(activeChamp.teamFormat || 'PAREJAS', activeChamp.playersPerTeam)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Premio: {formatCurrency(activeChamp.prizePool)}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-zinc-100 font-display mt-1">
                {activeChamp.name}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowRulesModal((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{showRulesModal ? 'Ocultar Reglas' : 'Reglamento'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Campeonato</span>
            </button>
          </div>
        </div>

        {/* Tournament Selector + 4 Clean Views */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 shrink-0">
              Torneos:
            </span>
            {championships.map((c) => {
              const isSelected = c.id === activeChamp.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedChampId(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{c.name}</span>
                  {championships.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChampionship(c.id);
                      }}
                      className="p-0.5 rounded hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400"
                      title="Eliminar torneo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubView('LIVE_BOARD')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                activeSubView === 'LIVE_BOARD'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>1. Tablero en Vivo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubView('BRACKET')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                activeSubView === 'BRACKET'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>2. Llaves ({activeChamp.matches.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubView('ROSTER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                activeSubView === 'ROSTER'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                3. {isActiveChampIndividual ? 'Jugadores' : 'Equipos'} (
                {activeChamp.teamDetails?.length || activeChamp.teams.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubView('PRIVATE_FINANCES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                activeSubView === 'PRIVATE_FINANCES'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>4. Historial & Ganancias</span>
            </button>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE RULES */}
      {showRulesModal && (
        <div className="rounded-3xl bg-zinc-900/95 border border-amber-500/35 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Reglamento por Turnos: Tejo Puntos, Tejo A Balazos y Bolirana</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-lg bg-zinc-800 cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-1">
              <div className="font-bold text-rose-400">🎯 1. Tejo por Puntos</div>
              <p className="text-zinc-400">
                Por turnos alternados entre equipos: Cayó por fuera <strong>0</strong>, Mano <strong>+1</strong>, Mecha <strong>+3</strong>, Bocín <strong>+6</strong> y Moñona <strong>+9</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-1">
              <div className="font-bold text-amber-400">💥 2. Tejo A Balazos</div>
              <p className="text-zinc-400">
                Por turnos alternados: Cayó por fuera <strong>0</strong>, Balazo/Mecha <strong>+1</strong>, Bocín/Embocinada <strong>+2</strong> y Moñona <strong>+3</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-1">
              <div className="font-bold text-emerald-400">🐸 3. Bolirana por Turnos</div>
              <p className="text-zinc-400">
                Cada jugador lanza en su turno: Blanqueada/Afuera <strong>0</strong>, Orificio <strong>+100</strong>, Ranita/Botella <strong>+250</strong>, Rana Mayor <strong>+500</strong> o suma directa del turno.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADO 1: TABLERO EN VIVO POR TURNOS (SENCILLO, DIRECTO Y AUTOMÁTICO)
         ===================================================================== */}
      {activeSubView === 'LIVE_BOARD' && (
        <div className="space-y-4">
          {/* Top Bar: Match Selector + Target Score + Undo/Reset */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
                Partido:
              </span>
              {activeChamp.matches.map((m) => {
                const isSelected = m.id === activeMatch.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-500/40'
                    }`}
                  >
                    <span>{m.roundName}:</span>
                    <span className="truncate max-w-[150px]">
                      {m.teamA} vs {m.teamB}
                    </span>
                    <span className="font-mono px-1.5 py-0.5 rounded bg-black/20">
                      {m.scoreA}-{m.scoreB}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-zinc-400 font-semibold">
                  Meta para ganar:
                </span>
                <input
                  type="number"
                  min={1}
                  value={editingTargetScore}
                  onChange={(e) => {
                    setEditingTargetScore(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) handleUpdateTargetScore(val);
                  }}
                  className="w-16 px-2 py-0.5 rounded-lg bg-zinc-900 border border-amber-500/40 text-amber-300 font-mono font-extrabold text-xs text-center focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleUndoLastEvent}
                disabled={activeMatch.events.length === 0}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                ↩ Deshacer Último Turno
              </button>

              <button
                type="button"
                onClick={handleResetMatch}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Winner Banner if Match Finished */}
          {activeMatch.status === 'FINALIZADO' && activeMatch.winner && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-amber-500/15 to-emerald-500/20 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-base font-extrabold text-emerald-300">
                    🏆 ¡Ganador del Partido: {activeMatch.winner}!
                  </div>
                  <div className="text-xs text-zinc-300">
                    Alcanzó la meta de {activeChamp.targetScore} {badge.unit} en {activeMatch.roundName}.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView('BRACKET')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold cursor-pointer"
              >
                Ver Llaves del Torneo →
              </button>
            </div>
          )}

          {/* ===============================================================
              CENTRAL TURN CONTROLLER: WHO THROWS NOW + 1-TAP RESULT BUTTONS
             =============================================================== */}
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border-2 border-amber-500/50 p-5 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/25 shrink-0">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider">
                      TURNO ACTUAL #{activeMatch.events.length + 1}
                    </span>
                    <span className="text-xs font-bold text-amber-300">
                      {isActiveChampIndividual
                        ? `Jugador ${currentTurnSide}`
                        : `Equipo ${currentTurnSide}: ${currentTurnTeamName}`}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    Lanza ahora: <span className="text-amber-400">{currentTurnPlayerName}</span>
                  </div>
                </div>
              </div>

              {/* Next player indicator */}
              <div className="px-3.5 py-2 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center gap-2.5 self-start md:self-center">
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">
                    Siguiente turno automático:
                  </span>
                  <span className="font-extrabold text-zinc-200">
                    {nextTurnPlayerName}{' '}
                    <span className="text-zinc-400 font-normal">
                      ({isActiveChampIndividual ? `Lado ${nextTurnSide}` : nextTurnTeamName})
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 1-CLICK THROW RESULT BUTTONS (Automatically records & switches turn) */}
            <div>
              <div className="text-xs font-bold text-zinc-300 mb-2.5">
                ¿Qué hizo <span className="text-amber-400">{currentTurnPlayerName}</span> en este turno?{' '}
                <span className="text-zinc-400 font-normal">
                  (Toca un botón para registrar y pasar el turno automáticamente)
                </span>
              </div>

              {/* MODE 1: TEJO POR PUNTOS */}
              {activeChamp.mode === 'TEJO_PUNTOS' && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(0, '❌ Cayó por fuera (Barro · 0 ptos)')
                    }
                    className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-left cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-300">❌ Cayó Afuera</span>
                      <span className="text-sm font-mono font-black text-zinc-400">0</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">
                      Sin puntos · Pasa turno
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRegisterTurnThrow(1, '✋ Mano (+1 pto)')}
                    className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-amber-500/30 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-100">✋ Mano</span>
                      <span className="text-base font-mono font-black text-amber-400">+1</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">
                      Más cercano · Pasa turno
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(3, '💥 Mecha / Balazo (+3 ptos)', {
                        isBalazoOrRana: true,
                      })
                    }
                    className="p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/45 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-300">💥 Balazo / Mecha</span>
                      <span className="text-base font-mono font-black text-amber-400">+3</span>
                    </div>
                    <div className="text-[10px] text-amber-200/80 mt-1">
                      Explota mecha · Pasa turno
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(6, '🎯 Bocín / Embocinada (+6 ptos)')
                    }
                    className="p-3.5 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/45 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-300">🎯 Bocín</span>
                      <span className="text-base font-mono font-black text-indigo-400">+6</span>
                    </div>
                    <div className="text-[10px] text-indigo-200/80 mt-1">
                      Embocinada · Pasa turno
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(9, '🔥 ¡Moñona! (+9 ptos)', {
                        isBalazoOrRana: true,
                        isMonona: true,
                      })
                    }
                    className="p-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-rose-300">🔥 ¡Moñona!</span>
                      <span className="text-base font-mono font-black text-rose-400">+9</span>
                    </div>
                    <div className="text-[10px] text-rose-200/80 mt-1">
                      Mecha + Bocín · Pasa turno
                    </div>
                  </button>
                </div>
              )}

              {/* MODE 2: TEJO A BALAZOS (Includes Cayó Afuera, Balazo, Bocín, Moñona) */}
              {activeChamp.mode === 'TEJO_BALAZOS' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(0, '❌ Cayó por fuera (0 ptos)')
                    }
                    className="p-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-zinc-200">❌ Cayó por fuera</span>
                      <span className="text-lg font-mono font-black text-zinc-400">0</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      No sumó · Pasa al siguiente turno
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(1, '💥 Balazo / Mecha (+1)', {
                        isBalazoOrRana: true,
                      })
                    }
                    className="p-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/45 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-amber-300">💥 Balazo / Mecha</span>
                      <span className="text-lg font-mono font-black text-amber-400">+1</span>
                    </div>
                    <div className="text-[11px] text-amber-200/80 mt-1">
                      Mecha limpia · Pasa turno
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(2, '🎯 Bocín / Embocinada (+2)')
                    }
                    className="p-4 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/45 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-indigo-300">🎯 Bocín</span>
                      <span className="text-lg font-mono font-black text-indigo-400">+2</span>
                    </div>
                    <div className="text-[11px] text-indigo-200/80 mt-1">
                      Embocinada al centro · Pasa turno
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRegisterTurnThrow(3, '🔥 ¡Moñona! (Mecha + Bocín +3)', {
                        isBalazoOrRana: true,
                        isMonona: true,
                      })
                    }
                    className="p-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-rose-300">🔥 ¡Moñona!</span>
                      <span className="text-lg font-mono font-black text-rose-400">+3</span>
                    </div>
                    <div className="text-[11px] text-rose-200/80 mt-1">
                      Mecha + Bocín · Pasa turno
                    </div>
                  </button>
                </div>
              )}

              {/* MODE 3: BOLIRANA POR TURNOS */}
              {activeChamp.mode === 'BOLIRANA' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleRegisterTurnThrow(0, '❌ Cayó por fuera / Blanqueada (0 ptos)')
                      }
                      className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-left cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-zinc-200">❌ Cayó Afuera</span>
                        <span className="text-sm font-mono font-black text-zinc-400">0</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        Sin puntos · Pasa turno
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRegisterTurnThrow(100, '🌉 Orificio / Puente (+100)')
                      }
                      className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-emerald-500/15 border border-zinc-800 hover:border-emerald-500/40 text-left cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-zinc-100">🌉 Puente / 100</span>
                        <span className="text-sm font-mono font-black text-emerald-400">+100</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        Suma +100 y pasa turno
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRegisterTurnThrow(150, '🎡 Molino (+150)')
                      }
                      className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-emerald-500/15 border border-zinc-800 hover:border-emerald-500/40 text-left cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-zinc-100">🎡 Molino</span>
                        <span className="text-sm font-mono font-black text-emerald-400">+150</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        Suma +150 y pasa turno
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRegisterTurnThrow(250, '🍾 Ranita / Botella (+250)', {
                          isBalazoOrRana: true,
                        })
                      }
                      className="p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-left cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-300">🍾 Ranita</span>
                        <span className="text-sm font-mono font-black text-emerald-400">+250</span>
                      </div>
                      <div className="text-[10px] text-emerald-200/80 mt-1">
                        Suma +250 y pasa turno
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRegisterTurnThrow(500, '🐸 ¡Rana Mayor! (+500)', {
                          isBalazoOrRana: true,
                        })
                      }
                      className="p-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-left cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-300">🐸 ¡Rana Mayor!</span>
                        <span className="text-sm font-mono font-black text-amber-400">+500</span>
                      </div>
                      <div className="text-[10px] text-amber-200/80 mt-1">
                        Suma +500 y pasa turno
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Custom Turn Points Input (Useful for Bolirana multi-sphere sum or custom Tejo play) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const pts = parseInt(customTurnPointsInput, 10);
                  if (!isNaN(pts) && pts >= 0) {
                    handleRegisterTurnThrow(
                      pts,
                      pts === 0
                        ? '❌ Cayó por fuera (0 ptos)'
                        : `⚡ Puntaje del turno (+${pts})`
                    );
                    setCustomTurnPointsInput('');
                  }
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 pt-3 border-t border-zinc-800/80"
              >
                <span className="text-xs font-bold text-zinc-300 shrink-0">
                  ¿Sumó otro puntaje en su turno?
                </span>
                <input
                  type="number"
                  min={0}
                  value={customTurnPointsInput}
                  onChange={(e) => setCustomTurnPointsInput(e.target.value)}
                  placeholder={`Escribe cuánto sumó ${currentTurnPlayerName} (ej: 350) y presiona Registrar...`}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!customTurnPointsInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 text-xs font-extrabold cursor-pointer shrink-0 transition-all"
                >
                  + Registrar Turno y Pasar →
                </button>
              </form>
            </div>
          </div>

          {/* ===============================================================
              TWO-SIDED SCOREBOARD + TEAM MEMBERS & ACTIVE STATUS
             =============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(['A', 'B'] as const).map((side) => {
              const isSideA = side === 'A';
              const teamName = isSideA ? activeMatch.teamA : activeMatch.teamB;
              const score = isSideA ? activeMatch.scoreA : activeMatch.scoreB;
              const isWinner = activeMatch.winner === teamName;
              const isSideInTurn = currentTurnSide === side;
              const playersList = isSideA ? allPlayersA : allPlayersB;
              const activeShooterOnThisSide = isSideA ? currentShooterA : currentShooterB;

              return (
                <div
                  key={side}
                  className={`rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                    isWinner
                      ? 'bg-emerald-950/25 border-emerald-500/60'
                      : isSideInTurn
                      ? 'bg-zinc-900 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-zinc-900/90 border-zinc-800'
                  }`}
                >
                  {/* Top Header: Team Name + Big Score */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isSideInTurn
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isSideInTurn ? '🎯 EN TURNO AHORA' : `LADO ${side}`}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Faltan {Math.max(0, activeChamp.targetScore - score)} {badge.unit}
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-extrabold text-zinc-100 mt-1 truncate">
                        {teamName}
                      </h4>
                    </div>

                    <div className="text-right shrink-0 bg-zinc-950 border border-zinc-800 px-5 py-2.5 rounded-2xl">
                      <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tabular-nums leading-none">
                        {score}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">
                        DE {activeChamp.targetScore}
                      </div>
                    </div>
                  </div>

                  {/* TEAM MEMBERS LIST & ACTIVE STATUS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-zinc-300 uppercase tracking-wider text-[11px]">
                        {isActiveChampIndividual
                          ? 'Jugador Participante:'
                          : `Miembros del Equipo (${playersList.length}):`}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Toca un jugador para darle el turno o pausarlo
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {playersList.map((pName, idx) => {
                        const isInactive = inactiveSet.has(`${side}:${pName}`);
                        const isCurrentThrower =
                          isSideInTurn && activeShooterOnThisSide === pName && !isInactive;
                        const isNextOnThisSide =
                          !isSideInTurn && activeShooterOnThisSide === pName && !isInactive;
                        const stats = getPlayerMatchStats(side, pName);

                        return (
                          <div
                            key={`${pName}-${idx}`}
                            className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                              isInactive
                                ? 'bg-zinc-950/50 border-zinc-800/50 opacity-55'
                                : isCurrentThrower
                                ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                                : 'bg-zinc-950 border-zinc-800/90 text-zinc-200'
                            }`}
                          >
                            <div
                              onClick={() => {
                                if (!isInactive) handleSelectTurnManually(side, pName);
                              }}
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                            >
                              <span
                                className={`w-6 h-6 rounded-lg text-[11px] font-mono font-extrabold flex items-center justify-center shrink-0 ${
                                  isCurrentThrower
                                    ? 'bg-amber-500 text-zinc-950'
                                    : 'bg-zinc-800 text-zinc-300'
                                }`}
                              >
                                #{idx + 1}
                              </span>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-xs sm:text-sm truncate">
                                    {pName}
                                  </span>
                                  {isCurrentThrower && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-black uppercase">
                                      🎯 Lanzando
                                    </span>
                                  )}
                                  {isNextOnThisSide && (
                                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 text-[9px] font-bold">
                                      Sigue por este equipo
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono">
                                  {stats.throws} {stats.throws === 1 ? 'turno' : 'turnos'} ·{' '}
                                  <strong className="text-emerald-400">+{stats.points} ptos</strong>
                                </div>
                              </div>
                            </div>

                            {/* Active / Sitting Out Toggle Button */}
                            {playersList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleTogglePlayerActiveStatus(side, pName)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer border shrink-0 ${
                                  isInactive
                                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                }`}
                                title="Cambiar si este integrante sigue jugando o descansa"
                              >
                                {isInactive ? (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    <span>Fuera</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Jugando</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Turn History Log */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Historial de Turnos del Partido ({activeMatch.events.length} lanzamientos)
              </span>
              <span className="text-[11px] text-zinc-500">{activeMatch.roundName}</span>
            </div>

            {activeMatch.events.length === 0 ? (
              <p className="text-xs text-zinc-500 py-1">
                Aún no se han registrado turnos en este partido.
              </p>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeMatch.events.slice(0, 10).map((ev, idx) => (
                  <div
                    key={ev.id}
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 flex items-center gap-2.5 text-xs"
                  >
                    <span className="text-[10px] font-mono text-zinc-500">
                      #{activeMatch.events.length - idx}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-100">
                        {ev.playerName || ev.teamName}
                        <span className="text-zinc-400 font-normal"> ({ev.teamName})</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">{ev.label}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg font-mono font-extrabold ${
                        ev.points > 0
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {ev.points > 0 ? `+${ev.points}` : '0'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADO 2: CUADRO DE LLAVES Y PARTIDOS DEL TORNEO
         ===================================================================== */}
      {activeSubView === 'BRACKET' && (
        <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Cuadro de Llaves · {activeChamp.name}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Toca cualquier partido para abrirlo en el Tablero en Vivo.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              Premio al Campeón: {formatCurrency(activeChamp.prizePool)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeChamp.matches.map((m) => {
              const isSelected = m.id === activeMatch.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMatchId(m.id);
                    setActiveSubView('LIVE_BOARD');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-lg'
                      : 'bg-zinc-950 border-zinc-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-amber-400">
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                      <span
                        className={`text-xs font-bold truncate ${
                          m.winner === m.teamA ? 'text-emerald-400' : 'text-zinc-100'
                        }`}
                      >
                        {m.teamA}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-amber-300">
                        {m.scoreA}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                      <span
                        className={`text-xs font-bold truncate ${
                          m.winner === m.teamB ? 'text-emerald-400' : 'text-zinc-100'
                        }`}
                      >
                        {m.teamB}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-amber-300">
                        {m.scoreB}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADO 3: JUGADORES / EQUIPOS INSCRITOS
         ===================================================================== */}
      {activeSubView === 'ROSTER' && (
        <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>
                  {isActiveChampIndividual
                    ? `Jugadores Inscritos (${activeChamp.teamDetails?.length || activeChamp.teams.length})`
                    : `Equipos e Integrantes (${activeChamp.teamDetails?.length || activeChamp.teams.length})`}
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Inscripción: {formatCurrency(activeChamp.entryFee)} c/u
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setInlineNewTeamName('');
                setInlineNewTeamPlayers(
                  Array.from({ length: activeChamp.playersPerTeam || 2 }, () => '')
                );
                setShowInlineAddTeam((prev) => !prev);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {isActiveChampIndividual ? '+ Inscribir Jugador' : '+ Inscribir Equipo'}
              </span>
            </button>
          </div>

          {showInlineAddTeam && (
            <form
              onSubmit={handleInlineAddTeamSubmit}
              className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-3"
            >
              {isActiveChampIndividual ? (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1 font-bold">
                    Nombre del Jugador *
                  </label>
                  <input
                    type="text"
                    required
                    value={inlineNewTeamName}
                    onChange={(e) => setInlineNewTeamName(e.target.value)}
                    placeholder="Escribe el nombre del jugador"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1 font-bold">
                      Nombre del Equipo *
                    </label>
                    <input
                      type="text"
                      required
                      value={inlineNewTeamName}
                      onChange={(e) => setInlineNewTeamName(e.target.value)}
                      placeholder="Nombre del equipo"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs text-zinc-400 font-bold">
                      Integrantes ({inlineNewTeamPlayers.length})
                    </label>
                    {inlineNewTeamPlayers.map((pVal, pIdx) => (
                      <input
                        key={pIdx}
                        type="text"
                        value={pVal}
                        onChange={(e) => {
                          const next = [...inlineNewTeamPlayers];
                          next[pIdx] = e.target.value;
                          setInlineNewTeamPlayers(next);
                        }}
                        placeholder={`Integrante #${pIdx + 1}`}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInlineAddTeam(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-extrabold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(activeChamp.teamDetails && activeChamp.teamDetails.length > 0
              ? activeChamp.teamDetails
              : activeChamp.teams.map((tName, idx) => ({
                  id: `fallback-${idx}`,
                  name: tName,
                  players: [tName],
                  paidEntry: true,
                }))
            ).map((td, idx) => (
              <div
                key={td.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-zinc-100 truncate">
                    #{idx + 1} · {td.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Inscrito
                  </span>
                </div>
                {!isActiveChampIndividual && (
                  <div className="flex flex-wrap gap-1">
                    {td.players.map((player, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300"
                      >
                        👤 {player}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADO 4: HISTORIAL & GANANCIAS PRIVADO (SOLO ADMINISTRADOR)
         ===================================================================== */}
      {activeSubView === 'PRIVATE_FINANCES' && (
        <div className="rounded-3xl bg-zinc-900/95 border border-emerald-500/40 p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-100">
                  Historial Privado de Campeonatos y Ganancia de la Casa
                </h3>
                <p className="text-xs text-zinc-400">
                  Información confidencial: quiénes jugaron, quién ganó, total recaudado (100%), premio y tu ganancia libre.
                </p>
              </div>
            </div>
          </div>

          {(() => {
            const totalRecaudadoAll = championships.reduce((sum, c) => {
              const count = c.teamDetails?.length || c.teams.length;
              return sum + count * (c.entryFee || 0);
            }, 0);
            const totalPremiosAll = championships.reduce(
              (sum, c) => sum + (c.prizePool || 0),
              0
            );
            const gananciaNetaAll = totalRecaudadoAll - totalPremiosAll;

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">
                      Total Recaudado Inscripciones (100%)
                    </span>
                    <div className="text-2xl font-black font-mono text-zinc-100 mt-1">
                      {formatCurrency(totalRecaudadoAll)}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30">
                    <span className="text-xs text-amber-300">(-) Premios al Campeón</span>
                    <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                      -{formatCurrency(totalPremiosAll)}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40">
                    <span className="text-xs font-bold text-emerald-300">
                      (=) Tu Ganancia Neta Libre
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                      +{formatCurrency(gananciaNetaAll)}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950">
                        <th className="py-3 px-4">Torneo / Juego</th>
                        <th className="py-3 px-3">Quiénes Jugaron</th>
                        <th className="py-3 px-3">Ganador</th>
                        <th className="py-3 px-3 text-right">Recaudado (100%)</th>
                        <th className="py-3 px-3 text-right">Premio</th>
                        <th className="py-3 px-4 text-right text-emerald-400">Tu Ganancia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60">
                      {championships.map((c) => {
                        const count = c.teamDetails?.length || c.teams.length;
                        const gross = count * (c.entryFee || 0);
                        const prize = c.prizePool || 0;
                        const net = gross - prize;
                        const modeInfo = getModeBadge(c.mode);
                        const allPlayersList =
                          c.teamDetails && c.teamDetails.length > 0
                            ? c.teamDetails.flatMap((td) =>
                                td.players.length > 1
                                  ? [`${td.name} (${td.players.join(', ')})`]
                                  : [td.name]
                              )
                            : c.teams;

                        return (
                          <tr key={c.id} className="hover:bg-zinc-900/50">
                            <td className="py-3 px-4 align-top">
                              <div className="font-bold text-zinc-100">{c.name}</div>
                              <div className="text-[11px] text-amber-400">{modeInfo.label}</div>
                            </td>
                            <td className="py-3 px-3 align-top max-w-sm">
                              <div className="text-[11px] text-zinc-400 mb-1">
                                {count} inscritos ({formatCurrency(c.entryFee)} c/u)
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {allPlayersList.map((p, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300"
                                  >
                                    👤 {p}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 align-top">
                              {c.champion ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                                  🏆 {c.champion}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold">
                                  En Curso
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 align-top text-right font-mono font-bold text-zinc-100">
                              {formatCurrency(gross)}
                            </td>
                            <td className="py-3 px-3 align-top text-right font-mono font-bold text-amber-400">
                              -{formatCurrency(prize)}
                            </td>
                            <td className="py-3 px-4 align-top text-right font-mono font-extrabold text-emerald-400">
                              +{formatCurrency(net)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* =====================================================================
          MODAL: CREAR NUEVO CAMPEONATO (ULTRA-SIMPLE, LIMPIO Y PASO A PASO)
         ===================================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
          <form
            onSubmit={handleCreateChampionship}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-100">
                    Nuevo Campeonato
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Rápido, limpio y con cálculo automático de tu ganancia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const isIndividualMode =
                newTeamFormat === 'INDIVIDUAL' || newPlayersPerTeam === 1;
              const unitSingular = isIndividualMode
                ? 'Jugador'
                : newTeamFormat === 'PAREJAS'
                ? 'Pareja'
                : newTeamFormat === 'TRIOS'
                ? 'Trío'
                : 'Equipo';
              const unitPlural = isIndividualMode
                ? 'Jugadores'
                : newTeamFormat === 'PAREJAS'
                ? 'Parejas'
                : newTeamFormat === 'TRIOS'
                ? 'Tríos'
                : 'Equipos';

              const entryFeeNum = parseCopCurrencyInput(newChampEntryFeeInput);
              const prizePoolNum = parseCopCurrencyInput(newChampPrizePoolInput);
              const participantsCount = draftTeams.length;
              const totalGrossPool = participantsCount * entryFeeNum;
              const netHouseProfit = totalGrossPool - prizePoolNum;

              return (
                <div className="space-y-4 text-xs">
                  {/* PASO 1: NOMBRE Y JUEGO */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                    <div>
                      <label className="block font-bold text-zinc-200 mb-1">
                        1. Nombre del Torneo *
                      </label>
                      <input
                        type="text"
                        required
                        value={newChampName}
                        onChange={(e) => setNewChampName(e.target.value)}
                        placeholder="Ej: Torneo Relámpago de Viernes"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-200 mb-1.5">
                        2. ¿Qué van a jugar? *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            id: 'TEJO_PUNTOS' as const,
                            title: '🎯 Tejo Puntos',
                            target: '27',
                          },
                          {
                            id: 'TEJO_BALAZOS' as const,
                            title: '💥 Tejo A Balazos',
                            target: '10',
                          },
                          {
                            id: 'BOLIRANA' as const,
                            title: '🐸 Bolirana',
                            target: '3000',
                          },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setNewChampMode(m.id);
                              setNewChampTargetInput(m.target);
                            }}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all font-bold ${
                              newChampMode === m.id
                                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            {m.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-200 mb-1.5">
                        3. ¿Cómo van a jugar? *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'INDIVIDUAL' as const, label: '👤 Individual (1 vs 1)' },
                          { id: 'PAREJAS' as const, label: '👥 Parejas (2 vs 2)' },
                          { id: 'TRIOS' as const, label: '🛡️ Tríos (3 vs 3)' },
                          { id: 'LIBRE' as const, label: '⚙️ Personalizado' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleSelectTeamFormat(fmt.id)}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all font-bold ${
                              newTeamFormat === fmt.id
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>

                      {newTeamFormat === 'LIBRE' && (
                        <div className="flex items-center justify-between gap-3 mt-3 p-3 rounded-xl bg-zinc-900 border border-amber-500/40">
                          <span className="text-zinc-200 font-bold">
                            ¿Cuántos integrantes tiene cada equipo?
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const next = Math.max(1, newPlayersPerTeam - 1);
                                setNewPlayersPerTeamInput(String(next));
                                applyPlayersCountToDraftTeams(next);
                              }}
                              className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={newPlayersPerTeamInput}
                              onChange={(e) => handleCustomPlayersInputChange(e.target.value)}
                              onBlur={() => {
                                if (!newPlayersPerTeamInput.trim()) {
                                  setNewPlayersPerTeamInput(String(newPlayersPerTeam));
                                }
                              }}
                              className="w-16 px-2 py-1.5 rounded-lg bg-zinc-950 border border-amber-500 text-amber-300 font-mono font-bold text-center focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = Math.min(20, newPlayersPerTeam + 1);
                                setNewPlayersPerTeamInput(String(next));
                                applyPlayersCountToDraftTeams(next);
                              }}
                              className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PASO 2: INSCRIPCIÓN, PREMIO Y TU GANANCIA */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block font-bold text-zinc-300 mb-1">
                          Cant. {unitPlural}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={draftTeamsCountInput}
                          onChange={(e) => handleSetDraftTeamsTotalCount(e.target.value)}
                          onBlur={() => {
                            if (!draftTeamsCountInput.trim()) {
                              setDraftTeamsCountInput(String(draftTeams.length));
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-amber-300 font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-300 mb-1">
                          Meta Puntos
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newChampTargetInput}
                          onChange={(e) =>
                            setNewChampTargetInput(e.target.value.replace(/\D/g, ''))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-300 mb-1">
                          Inscripción c/u
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newChampEntryFeeInput}
                          onChange={(e) =>
                            setNewChampEntryFeeInput(formatCopCurrencyInput(e.target.value))
                          }
                          placeholder="$ 0"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-300 mb-1">
                          Premio Campeón
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newChampPrizePoolInput}
                          onChange={(e) =>
                            setNewChampPrizePoolInput(formatCopCurrencyInput(e.target.value))
                          }
                          placeholder="$ 0"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Clean 1-Bar Financial Summary */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/35 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">
                          Recaudado ({participantsCount} × {formatCurrency(entryFeeNum)})
                        </span>
                        <span className="text-sm sm:text-base font-black font-mono text-zinc-100">
                          {formatCurrency(totalGrossPool)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block">
                          Premio al Campeón
                        </span>
                        <span className="text-sm sm:text-base font-black font-mono text-amber-400">
                          -{formatCurrency(prizePoolNum)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-300 block">
                          Tu Ganancia Libre (Privado)
                        </span>
                        <span
                          className={`text-sm sm:text-base font-black font-mono ${
                            netHouseProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {netHouseProfit >= 0 ? '+' : ''}
                          {formatCurrency(netHouseProfit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PASO 3: LISTA LIMPIA DE JUGADORES O EQUIPOS */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-zinc-200">
                        4. Nombres de los {unitPlural} ({draftTeams.length})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleShuffleDraftTeams}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Shuffle className="w-3 h-3 text-amber-400" />
                          <span>Sortear</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddDraftTeam}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar {unitSingular}</span>
                        </button>
                      </div>
                    </div>

                    {isIndividualMode ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                        {draftTeams.map((team, tIdx) => {
                          const currentPlayerName = team.players[0] ?? team.name ?? '';
                          return (
                            <div
                              key={team.id}
                              className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800"
                            >
                              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                                #{tIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={currentPlayerName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDraftTeams((prev) =>
                                    prev.map((t) =>
                                      t.id === team.id
                                        ? { ...t, name: val, players: [val] }
                                        : t
                                    )
                                  );
                                }}
                                placeholder={`Nombre del Jugador #${tIdx + 1}`}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-amber-500"
                              />
                              {draftTeams.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDraftTeam(team.id)}
                                  className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                        {draftTeams.map((team, tIdx) => (
                          <div
                            key={team.id}
                            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-extrabold text-amber-400">
                                {unitSingular} #{tIdx + 1}
                              </span>
                              {draftTeams.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDraftTeam(team.id)}
                                  className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={team.name}
                              onChange={(e) => handleUpdateDraftTeamName(team.id, e.target.value)}
                              placeholder={`Nombre del ${unitSingular} #${tIdx + 1} (opcional)`}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-amber-500"
                            />

                            <div className="space-y-1.5 pt-1">
                              {team.players.map((playerName, pIdx) => (
                                <div key={pIdx} className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-zinc-400 w-5 shrink-0">
                                    J{pIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) =>
                                      handleUpdateDraftPlayerName(team.id, pIdx, e.target.value)
                                    }
                                    placeholder={`Nombre integrante #${pIdx + 1}`}
                                    className="w-full px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

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
                Crear Campeonato Ahora
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
