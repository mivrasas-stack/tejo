import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Award,
  Users,
  BookOpen,
  Sliders,
  X,
  Zap,
  UserPlus,
  Shuffle,
  Lock,
  ChevronRight,
  CircleDollarSign,
  Play,
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
        scoreA: 18,
        scoreB: 15,
        ranasOrBalazosA: 3,
        ranasOrBalazosB: 2,
        mononasA: 1,
        mononasB: 1,
        status: 'EN_JUEGO',
        canchaAsignada: 'Cancha de Tejo #1 (Arcilla)',
        events: [
          {
            id: 'ev-1',
            team: 'A',
            teamName: 'Los Caciques del Bocín',
            playerName: 'Carlos Alvarado',
            label: '🔥 ¡Moñona! (Mecha + Embocinada)',
            points: 9,
            timestamp: '08:25 PM',
          },
          {
            id: 'ev-2',
            team: 'B',
            teamName: 'Furia Boyacense',
            playerName: 'Wilmar Vargas',
            label: '🎯 Embocinada (Centro del Bocín)',
            points: 6,
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
        events: [],
      },
    ],
  },
  {
    id: 'champ-tejo-balazos',
    name: 'Relámpago "A Balazos" (Mecha Limpia)',
    mode: 'TEJO_BALAZOS',
    teamFormat: 'PAREJAS',
    playersPerTeam: 2,
    targetScore: 5,
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
        events: [
          {
            id: 'ev-b1',
            team: 'A',
            teamName: 'Pólvora Pura',
            playerName: 'Diego Rodríguez',
            label: '💥 ¡Balazo / Mecha Explotada! (+1)',
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
        events: [
          {
            id: 'ev-r1',
            team: 'A',
            teamName: 'Rana Maestra',
            playerName: 'Fernando Gómez',
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

  // Clean 4-Tab Navigation inside ChampionshipsView
  const [activeSubView, setActiveSubView] = useState<ChampSubView>('LIVE_BOARD');

  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalStep, setCreateModalStep] = useState<'CONFIG' | 'PARTICIPANTS'>('CONFIG');

  // Active Shooter / Player selector per side in the live scoreboard
  const [selectedPlayerA, setSelectedPlayerA] = useState<string>('');
  const [selectedPlayerB, setSelectedPlayerB] = useState<string>('');

  // Custom Score / Target Editor inline
  const [editingTargetScore, setEditingTargetScore] = useState<string>('');
  const [customPointsInputA, setCustomPointsInputA] = useState<string>('');
  const [customPointsInputB, setCustomPointsInputB] = useState<string>('');

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

  useEffect(() => {
    setSelectedPlayerA(teamADetails?.players?.[0] || '');
    setSelectedPlayerB(teamBDetails?.players?.[0] || '');
  }, [activeMatch?.id, activeMatch?.teamA, activeMatch?.teamB]);

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
          unit: 'balazos',
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

    const shooterName = team === 'A' ? selectedPlayerA : selectedPlayerB;

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
        (newChampMode === 'TEJO_BALAZOS' ? 5 : newChampMode === 'BOLIRANA' ? 3000 : 27)
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
    setCreateModalStep('CONFIG');
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
  const progressA = Math.min(
    100,
    Math.round((activeMatch.scoreA / Math.max(1, activeChamp.targetScore)) * 100)
  );
  const progressB = Math.min(
    100,
    Math.round((activeMatch.scoreB / Math.max(1, activeChamp.targetScore)) * 100)
  );

  const isActiveChampIndividual =
    activeChamp.teamFormat === 'INDIVIDUAL' || activeChamp.playersPerTeam === 1;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. CLEAN EXECUTIVE HEADER & TOURNAMENT BAR */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-5 sm:p-6 shadow-2xl space-y-5">
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
                  Premio Campeón: {formatCurrency(activeChamp.prizePool)}
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
              onClick={() => {
                setCreateModalStep('CONFIG');
                setShowCreateModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Campeonato</span>
            </button>
          </div>
        </div>

        {/* TOURNAMENT SELECTOR PILLS + CLEAN 4-SECTION NAVIGATION TABS */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Active Tournaments Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 shrink-0">
              Torneo:
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

          {/* 4 Clean Sub-Tabs (Apartados Organizados) */}
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
                3. {isActiveChampIndividual ? 'Jugadores' : 'Equipos'} ({activeChamp.teamDetails?.length || activeChamp.teams.length})
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

      {/* COLLAPSIBLE OFFICIAL RULES */}
      {showRulesModal && (
        <div className="rounded-3xl bg-zinc-900/95 border border-amber-500/35 p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Reglamento Oficial: Tejo por Puntos, Tejo A Balazos y Bolirana</span>
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
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-1.5">
              <div className="font-bold text-rose-400">🎯 1. Tejo por Puntos (FEDETEJO)</div>
              <p className="text-zinc-400">
                Meta estándar <strong>27 puntos</strong> (configurable). Mano <strong>+1</strong>, Mecha <strong>+3</strong>, Embocinada <strong>+6</strong> y Moñona <strong>+9</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-1.5">
              <div className="font-bold text-amber-400">💥 2. Tejo "A Balazos" (Mecha Limpia)</div>
              <p className="text-zinc-400">
                Solo cuentan las mechas explotadas (no se suma mano). Cada mecha vale <strong>+1 Balazo</strong> y la Moñona <strong>+2 Balazos</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-1.5">
              <div className="font-bold text-emerald-400">🐸 3. Bolirana / Rana</div>
              <p className="text-zinc-400">
                6 balines por turno. Rana Mayor <strong>+500</strong>, Ranita/Botella <strong>+250</strong>, Molino <strong>+150</strong>, Puentes <strong>+100</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADO 1: TABLERO EN VIVO (CLEAN, FOCUSED ARENA SCOREBOARD)
         ===================================================================== */}
      {activeSubView === 'LIVE_BOARD' && (
        <div className="space-y-4">
          {/* Quick Match Selector Bar + Target Config */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Match Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
                Partido en Cancha:
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
                    <span className="truncate max-w-[140px]">{m.teamA} vs {m.teamB}</span>
                    <span className="font-mono px-1.5 py-0.2 rounded bg-black/20">
                      {m.scoreA}-{m.scoreB}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Target Score & Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-zinc-400 font-semibold">
                  Meta ({badge.unit}):
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
                Deshacer Jugada
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
                  <div className="text-sm font-extrabold text-emerald-300">
                    ¡Victoria de {activeMatch.winner}!
                  </div>
                  <div className="text-xs text-zinc-300">
                    Alcanzó la meta de {activeChamp.targetScore} {badge.unit} en {activeMatch.roundName}.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView('BRACKET')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold cursor-pointer"
              >
                Ver Cuadro de Llaves →
              </button>
            </div>
          )}

          {/* TWO-SIDED ARENA SCOREBOARD (SIDE A vs SIDE B) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(['A', 'B'] as const).map((side) => {
              const isSideA = side === 'A';
              const teamName = isSideA ? activeMatch.teamA : activeMatch.teamB;
              const score = isSideA ? activeMatch.scoreA : activeMatch.scoreB;
              const progress = isSideA ? progressA : progressB;
              const ranasOrBalazos = isSideA
                ? activeMatch.ranasOrBalazosA
                : activeMatch.ranasOrBalazosB;
              const mononas = isSideA ? activeMatch.mononasA : activeMatch.mononasB;
              const isWinner = activeMatch.winner === teamName;
              const customInput = isSideA ? customPointsInputA : customPointsInputB;
              const setCustomInput = isSideA
                ? setCustomPointsInputA
                : setCustomPointsInputB;
              const teamRoster = isSideA ? teamADetails : teamBDetails;
              const activePlayer = isSideA ? selectedPlayerA : selectedPlayerB;
              const setActivePlayer = isSideA ? setSelectedPlayerA : setSelectedPlayerB;

              return (
                <div
                  key={side}
                  className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between space-y-5 shadow-2xl ${
                    isWinner
                      ? 'bg-emerald-950/25 border-emerald-500/60'
                      : 'bg-zinc-900/95 border-zinc-800'
                  }`}
                >
                  {/* Top Competitor Header + Digital Score */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          {isActiveChampIndividual
                            ? `Jugador ${side}`
                            : `Lado ${side} · ${activeMatch.canchaAsignada || 'Cancha Principal'}`}
                        </span>
                        <h4 className="text-xl sm:text-2xl font-extrabold text-zinc-100 mt-1 truncate">
                          {teamName}
                        </h4>
                      </div>

                      <div className="text-right shrink-0 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-2xl">
                        <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tabular-nums leading-none">
                          {score}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          META: {activeChamp.targetScore} {badge.unit.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isWinner
                              ? 'bg-emerald-400'
                              : isSideA
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                        <span>
                          {activeChamp.mode === 'BOLIRANA'
                            ? `🐸 Ranas: ${ranasOrBalazos}`
                            : `💥 Mechas/Balazos: ${ranasOrBalazos} · 🔥 Moñonas: ${mononas}`}
                        </span>
                        <span>
                          Faltan {Math.max(0, activeChamp.targetScore - score)} {badge.unit}
                        </span>
                      </div>
                    </div>

                    {/* Player Selector Pills (Only when Team has >1 player) */}
                    {teamRoster && teamRoster.players.length > 1 && (
                      <div className="p-2.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          ¿Quién lanza en este turno?
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {teamRoster.players.map((pName, idx) => {
                            const isSelectedPlayer = activePlayer === pName;
                            return (
                              <button
                                key={`${pName}-${idx}`}
                                type="button"
                                onClick={() => setActivePlayer(pName)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                  isSelectedPlayer
                                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-amber-500/40'
                                }`}
                              >
                                👤 {pName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick One-Tap Scoring Buttons */}
                  <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                    {activeChamp.mode === 'TEJO_PUNTOS' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 1, '✋ Mano (Tejo más cercano)')
                          }
                          className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left cursor-pointer transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200">✋ Mano</span>
                            <span className="text-sm font-mono font-extrabold text-amber-400">+1</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">Más cercano al bocín</div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 3, '💥 Mecha / Balazo', {
                              isBalazoOrRana: true,
                            })
                          }
                          className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-left cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300">💥 Mecha</span>
                            <span className="text-sm font-mono font-extrabold text-amber-400">+3</span>
                          </div>
                          <div className="text-[10px] text-amber-200/70 mt-0.5">Explosión de pólvora</div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 6, '🎯 Embocinada (Centro)')
                          }
                          className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/35 text-left cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-300">🎯 Embocinada</span>
                            <span className="text-sm font-mono font-extrabold text-indigo-400">+6</span>
                          </div>
                          <div className="text-[10px] text-indigo-200/70 mt-0.5">Cae dentro del bocín</div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 9, '🔥 ¡MOÑONA! (Mecha + Bocín)', {
                              isBalazoOrRana: true,
                              isMonona: true,
                            })
                          }
                          className="p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-left cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-rose-300">🔥 ¡Moñona!</span>
                            <span className="text-sm font-mono font-extrabold text-rose-400">+9</span>
                          </div>
                          <div className="text-[10px] text-rose-200/70 mt-0.5">Mecha + Embocinada</div>
                        </button>
                      </div>
                    )}

                    {activeChamp.mode === 'TEJO_BALAZOS' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 1, '💥 ¡Balazo Limpio! (Mecha)', {
                              isBalazoOrRana: true,
                            })
                          }
                          className="p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/45 text-left cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-amber-300">💥 ¡Balazo!</span>
                            <span className="text-base font-mono font-black text-amber-400">+1</span>
                          </div>
                          <div className="text-[10px] text-amber-200/75 mt-0.5">Mecha explotada</div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddScore(side, 2, '🔥 ¡Moñona A Balazos! (Doble)', {
                              isBalazoOrRana: true,
                              isMonona: true,
                            })
                          }
                          className="p-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/45 text-left cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-rose-300">🔥 Moñona</span>
                            <span className="text-base font-mono font-black text-rose-400">+2</span>
                          </div>
                          <div className="text-[10px] text-rose-200/75 mt-0.5">Mecha + Embocinada</div>
                        </button>
                      </div>
                    )}

                    {activeChamp.mode === 'BOLIRANA' && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { pts: 500, name: '🐸 Rana Mayor', rana: true },
                          { pts: 250, name: '🍾 Ranita/Botella', rana: true },
                          { pts: 150, name: '🎡 Molino', rana: false },
                          { pts: 100, name: '🌉 Puente', rana: false },
                          { pts: 50, name: '⭕ Lateral', rana: false },
                          { pts: 20, name: '🔹 Base', rana: false },
                        ].map((btn) => (
                          <button
                            key={btn.pts}
                            type="button"
                            onClick={() =>
                              handleAddScore(side, btn.pts, `${btn.name} (+${btn.pts})`, {
                                isBalazoOrRana: btn.rana,
                              })
                            }
                            className="p-2.5 rounded-xl bg-zinc-950 hover:bg-emerald-500/15 border border-zinc-800 hover:border-emerald-500/40 text-left cursor-pointer transition-all"
                          >
                            <div className="text-[11px] font-bold text-zinc-200 truncate">
                              {btn.name}
                            </div>
                            <div className="text-xs font-mono font-extrabold text-emerald-400">
                              +{btn.pts}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Manual Custom Score Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const pts = parseInt(customInput, 10);
                        if (!isNaN(pts) && pts > 0) {
                          handleAddScore(side, pts, `⚡ Puntaje Manual (+${pts})`);
                          setCustomInput('');
                        }
                      }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="number"
                        min={1}
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder={`Sumar ${badge.unit} manuales...`}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={!customInput.trim()}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-40 text-zinc-200 text-xs font-bold cursor-pointer shrink-0 transition-colors"
                      >
                        + Sumar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Recent Plays Log at the Bottom of the Live Board */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Últimas Jugadas Registradas ({activeMatch.events.length})
              </span>
              <span className="text-[11px] text-zinc-500">{activeMatch.roundName}</span>
            </div>

            {activeMatch.events.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">
                Aún no hay jugadas en este partido. Toca cualquier botón de jugada arriba para anotar.
              </p>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeMatch.events.slice(0, 8).map((ev) => (
                  <div
                    key={ev.id}
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 flex items-center gap-2.5 text-xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-100">
                        {ev.teamName}
                        {ev.playerName && ev.playerName !== ev.teamName && (
                          <span className="text-amber-400"> · {ev.playerName}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">{ev.label}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-extrabold">
                      +{ev.points}
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
                <span>Cuadro de Llaves y Partidos · {activeChamp.name}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Haz clic en cualquier partido para abrirlo inmediatamente en el Tablero en Vivo.
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

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span>{m.canchaAsignada || 'Cancha Principal'}</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Play className="w-3 h-3" /> Ir al Tablero
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADO 3: JUGADORES / EQUIPOS INSCRITOS EN EL TORNEO
         ===================================================================== */}
      {activeSubView === 'ROSTER' && (
        <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-extrabold text-zinc-100">
                  {isActiveChampIndividual
                    ? `Jugadores Inscritos (${activeChamp.teamDetails?.length || activeChamp.teams.length})`
                    : `Equipos y Jugadores Inscritos (${activeChamp.teamDetails?.length || activeChamp.teams.length})`}
                </h3>
                <p className="text-xs text-zinc-400">
                  {getFormatLabel(activeChamp.teamFormat || 'PAREJAS', activeChamp.playersPerTeam)} · Inscripción: {formatCurrency(activeChamp.entryFee)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setInlineNewTeamPlayers(
                  Array.from({ length: activeChamp.playersPerTeam || 2 }, () => '')
                );
                setShowInlineAddTeam((prev) => !prev);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
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
              className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">
                  {isActiveChampIndividual
                    ? `Inscribir Nuevo Jugador en ${activeChamp.name}`
                    : `Inscribir Nuevo Equipo en ${activeChamp.name}`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlineAddTeam(false)}
                  className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isActiveChampIndividual ? (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-zinc-400 font-semibold mb-1">
                      Nombre del Jugador *
                    </label>
                    <input
                      type="text"
                      required
                      value={inlineNewTeamName}
                      onChange={(e) => setInlineNewTeamName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs cursor-pointer shrink-0"
                  >
                    Guardar Jugador
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">
                      Nombre del Equipo *
                    </label>
                    <input
                      type="text"
                      required
                      value={inlineNewTeamName}
                      onChange={(e) => setInlineNewTeamName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inlineNewTeamPlayers.map((pVal, idx) => (
                      <div key={idx}>
                        <label className="block text-zinc-400 font-semibold mb-1">
                          Integrante #{idx + 1} *
                        </label>
                        <input
                          type="text"
                          required
                          value={pVal}
                          onChange={(e) => {
                            const next = [...inlineNewTeamPlayers];
                            next[idx] = e.target.value;
                            setInlineNewTeamPlayers(next);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setInlineNewTeamPlayers((prev) => [...prev, ''])}
                      className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      + Agregar otro jugador
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs cursor-pointer"
                    >
                      Guardar Equipo
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(activeChamp.teamDetails ||
              activeChamp.teams.map((tName, i) => ({
                id: `fallback-${i}`,
                name: tName,
                players: [],
                paidEntry: true,
              }))
            ).map((team, idx) => (
              <div
                key={team.id || idx}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-zinc-100 truncate">
                    #{idx + 1} · {team.name}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      team.paidEntry !== false
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {team.paidEntry !== false ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
                {!isActiveChampIndividual && team.players && team.players.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {team.players.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
                      >
                        👤 {p}
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
          APARTADO 4: HISTORIAL PRIVADO Y GANANCIAS DEL NEGOCIO
         ===================================================================== */}
      {activeSubView === 'PRIVATE_FINANCES' && (
        <div className="rounded-3xl bg-zinc-900/95 border border-emerald-500/35 p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Historial Privado de Campeonatos y Ganancias del Negocio</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Apartado exclusivo para ti: personas que jugaron, modalidad, campeón, valor total recaudado (100%), premio y tu ganancia libre.
              </p>
            </div>
          </div>

          {(() => {
            const summary = championships.reduce(
              (acc, c) => {
                const count = c.teamDetails?.length || c.teams.length || 0;
                const gross = count * (c.entryFee || 0);
                const prize = c.prizePool || 0;
                const net = gross - prize;
                return {
                  totalGross: acc.totalGross + gross,
                  totalPrizes: acc.totalPrizes + prize,
                  totalNetProfit: acc.totalNetProfit + net,
                };
              },
              { totalGross: 0, totalPrizes: 0, totalNetProfit: 0 }
            );

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400 block">
                      Valor Total Jugado / Recaudado (100%):
                    </span>
                    <span className="text-xl font-extrabold font-mono text-zinc-100 mt-1 block">
                      {formatCurrency(summary.totalGross)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400 block">
                      Total Sacado en Premios:
                    </span>
                    <span className="text-xl font-extrabold font-mono text-amber-400 mt-1 block">
                      -{formatCurrency(summary.totalPrizes)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35">
                    <span className="text-xs text-emerald-300 font-bold block">
                      Tu Ganancia Neta Total (Casa):
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">
                      +{formatCurrency(summary.totalNetProfit)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                      <tr>
                        <th className="py-3 px-4">Campeonato & Qué Jugaron</th>
                        <th className="py-3 px-3">Personas / Equipos que Jugaron</th>
                        <th className="py-3 px-3">Quién Ganó</th>
                        <th className="py-3 px-3 text-right">Valor Jugado (100%)</th>
                        <th className="py-3 px-3 text-right">Premio</th>
                        <th className="py-3 px-4 text-right text-emerald-400">Tu Ganancia Neta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                      {championships.map((c) => {
                        const modeInfo = getModeBadge(c.mode);
                        const roster = c.teamDetails || [];
                        const count = roster.length || c.teams.length;
                        const gross = count * (c.entryFee || 0);
                        const prize = c.prizePool || 0;
                        const net = gross - prize;
                        const allPlayersList =
                          roster.length > 0
                            ? roster.map((td) =>
                                td.players &&
                                td.players.length > 0 &&
                                td.players.join(', ') !== td.name
                                  ? `${td.name} (${td.players.join(', ')})`
                                  : td.name
                              )
                            : c.teams;

                        return (
                          <tr key={c.id} className="hover:bg-zinc-900/50">
                            <td className="py-3.5 px-4 align-top">
                              <div className="font-bold text-zinc-100">{c.name}</div>
                              <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                                {modeInfo.label} · {getFormatLabel(c.teamFormat || 'PAREJAS', c.playersPerTeam)}
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                Meta: {c.targetScore} {modeInfo.unit} · {c.createdAt}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 align-top max-w-sm">
                              <div className="text-[11px] font-bold text-zinc-300 mb-1">
                                {count} inscritos ({formatCurrency(c.entryFee)} c/u):
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {allPlayersList.map((p, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300"
                                  >
                                    👤 {p}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 align-top">
                              {c.champion ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 font-extrabold text-[11px] inline-flex items-center gap-1">
                                  🏆 {c.champion}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                  En Curso
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 align-top text-right font-mono font-bold text-zinc-100">
                              {formatCurrency(gross)}
                            </td>
                            <td className="py-3.5 px-3 align-top text-right font-mono font-bold text-amber-400">
                              -{formatCurrency(prize)}
                            </td>
                            <td
                              className={`py-3.5 px-4 align-top text-right font-mono font-extrabold text-sm ${
                                net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {net >= 0 ? '+' : ''}
                              {formatCurrency(net)}
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
          MODAL: CONFIGURAR NUEVO CAMPEONATO PERSONALIZADO (CLEAN & ORGANIZED)
         ===================================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
          <form
            onSubmit={handleCreateChampionship}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Sticky Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-100">
                    Configurar Nuevo Campeonato Personalizado
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Configura modalidad, formato, cálculo automático de tu ganancia y participantes
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
              const houseMarginPct =
                totalGrossPool > 0
                  ? Math.round((netHouseProfit / totalGrossPool) * 100)
                  : 0;
              const prizePct =
                totalGrossPool > 0
                  ? Math.round((prizePoolNum / totalGrossPool) * 100)
                  : 0;

              return (
                <div className="space-y-5 text-xs">
                  {/* TOP FINANCIAL SUMMARY STRIP (ALWAYS VISIBLE AT A GLANCE) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-zinc-950 to-zinc-950 border border-emerald-500/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <CircleDollarSign className="w-4 h-4" />
                        <span>Resumen Financiero del Torneo (Privado para Ti)</span>
                      </span>
                      <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                        {participantsCount} {unitPlural.toLowerCase()} × {formatCurrency(entryFeeNum)} ={' '}
                        <strong className="text-white">{formatCurrency(totalGrossPool)}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-zinc-900/95 border border-zinc-800">
                        <span className="text-[11px] text-zinc-400 block">
                          1. Valor Total Jugado (100% Recaudo):
                        </span>
                        <span className="text-lg sm:text-xl font-black font-mono text-zinc-100 mt-0.5 block">
                          {formatCurrency(totalGrossPool)}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {participantsCount} {unitPlural.toLowerCase()} inscritos
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-900/95 border border-zinc-800">
                        <span className="text-[11px] text-zinc-400 block">
                          2. (-) Premio al Campeón ({prizePct}%):
                        </span>
                        <span className="text-lg sm:text-xl font-black font-mono text-amber-400 mt-0.5 block">
                          -{formatCurrency(prizePoolNum)}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Se entrega al ganador
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-xl border ${
                          netHouseProfit >= 0
                            ? 'bg-emerald-500/20 border-emerald-500/50'
                            : 'bg-rose-500/20 border-rose-500/50'
                        }`}
                      >
                        <span className="text-[11px] text-zinc-100 font-extrabold block">
                          3. (=) Tu Ganancia Neta ({houseMarginPct}%):
                        </span>
                        <span
                          className={`text-xl sm:text-2xl font-black font-mono mt-0.5 block ${
                            netHouseProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {netHouseProfit >= 0 ? '+' : ''}
                          {formatCurrency(netHouseProfit)}
                        </span>
                        <span className="text-[10px] text-zinc-200">
                          Te queda libre (oculto del tablero público)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* STEP 1 & 2: NAME, DISCIPLINE & FORMAT */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Column: Name, Mode & Format */}
                    <div className="lg:col-span-7 space-y-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                      <div>
                        <label className="block font-bold text-zinc-200 mb-1">
                          1. Nombre del Campeonato *
                        </label>
                        <input
                          type="text"
                          required
                          value={newChampName}
                          onChange={(e) => setNewChampName(e.target.value)}
                          placeholder="Ej. Gran Torneo Relámpago de Viernes"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-200 mb-1.5">
                          2. Modalidad de Juego *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNewChampMode('TEJO_PUNTOS');
                              setNewChampTargetInput('27');
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              newChampMode === 'TEJO_PUNTOS'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <div>🎯 Tejo Puntos</div>
                            <div className="text-[10px] opacity-80 mt-0.5">Meta 27 ptos</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewChampMode('TEJO_BALAZOS');
                              setNewChampTargetInput('5');
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              newChampMode === 'TEJO_BALAZOS'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <div>💥 A Balazos</div>
                            <div className="text-[10px] opacity-80 mt-0.5">Solo Mechas</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewChampMode('BOLIRANA');
                              setNewChampTargetInput('3000');
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              newChampMode === 'BOLIRANA'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <div>🐸 Bolirana</div>
                            <div className="text-[10px] opacity-80 mt-0.5">Rana / Puntos</div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-amber-400 mb-1.5">
                          3. Formato de Participación *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {[
                            { id: 'INDIVIDUAL' as const, label: 'Individual', sub: '1 vs 1' },
                            { id: 'PAREJAS' as const, label: 'En Parejas', sub: '2 vs 2' },
                            { id: 'TRIOS' as const, label: 'En Tríos', sub: '3 vs 3' },
                            { id: 'CUARTETOS' as const, label: 'Equipos 4', sub: '4 vs 4' },
                            { id: 'LIBRE' as const, label: 'Personalizado', sub: 'Libre' },
                          ].map((fmt) => (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() => handleSelectTeamFormat(fmt.id)}
                              className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                newTeamFormat === fmt.id
                                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-extrabold'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/40'
                              }`}
                            >
                              <div className="text-xs">{fmt.label}</div>
                              <div
                                className={`text-[10px] ${
                                  newTeamFormat === fmt.id ? 'text-zinc-900' : 'text-zinc-500'
                                }`}
                              >
                                {fmt.sub}
                              </div>
                            </button>
                          ))}
                        </div>

                        {newTeamFormat === 'LIBRE' && (
                          <div className="flex items-center gap-3 pt-2.5">
                            <span className="text-zinc-300 font-semibold">
                              Jugadores por equipo:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = Math.max(1, newPlayersPerTeam - 1);
                                  setNewPlayersPerTeamInput(String(next));
                                  applyPlayersCountToDraftTeams(next);
                                }}
                                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold cursor-pointer"
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
                                className="w-20 px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/50 text-amber-300 font-mono font-bold text-center focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = Math.min(20, newPlayersPerTeam + 1);
                                  setNewPlayersPerTeamInput(String(next));
                                  applyPlayersCountToDraftTeams(next);
                                }}
                                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Numbers, Entry Fee, Prize & Meta */}
                    <div className="lg:col-span-5 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                      <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                        4. Meta, Inscritos, Inscripción y Premio
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-zinc-300 mb-1">
                            Meta ({newChampMode === 'TEJO_BALAZOS' ? 'Balazos' : 'Puntos'}) *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={newChampTargetInput}
                            onChange={(e) =>
                              setNewChampTargetInput(e.target.value.replace(/\D/g, ''))
                            }
                            onBlur={() => {
                              if (!newChampTargetInput.trim()) {
                                setNewChampTargetInput(
                                  newChampMode === 'TEJO_BALAZOS'
                                    ? '5'
                                    : newChampMode === 'BOLIRANA'
                                    ? '3000'
                                    : '27'
                                );
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-300 font-mono font-bold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-zinc-300 mb-1">
                            Total {unitPlural} *
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleSetDraftTeamsTotalCount(
                                  String(Math.max(2, draftTeams.length - 1))
                                )
                              }
                              className="w-8 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold cursor-pointer shrink-0"
                            >
                              -
                            </button>
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
                              className="w-full px-2 py-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-300 font-mono font-bold text-center focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleSetDraftTeamsTotalCount(
                                  String(Math.min(64, draftTeams.length + 1))
                                )
                              }
                              className="w-8 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold cursor-pointer shrink-0"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-300 mb-1">
                          Inscripción por {unitSingular} ($ COP)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newChampEntryFeeInput}
                          onChange={(e) =>
                            setNewChampEntryFeeInput(formatCopCurrencyInput(e.target.value))
                          }
                          placeholder="$ 0"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-300 mb-1">
                          Premio al Campeón ($ COP)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newChampPrizePoolInput}
                          onChange={(e) =>
                            setNewChampPrizePoolInput(formatCopCurrencyInput(e.target.value))
                          }
                          placeholder="$ 0"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 5: CLEAN PARTICIPANTS / TEAMS LIST */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100">
                          {isIndividualMode
                            ? `5. Lista de Jugadores Inscritos (${draftTeams.length} jugadores)`
                            : `5. Registro de ${unitPlural} y Nombres de Jugadores (${draftTeams.length} ${unitPlural.toLowerCase()})`}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          {isIndividualMode
                            ? 'Escribe directamente el nombre de cada jugador (campos limpios sin texto por defecto)'
                            : `Escribe el nombre de cada ${unitSingular.toLowerCase()} y sus integrantes`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleShuffleDraftTeams}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sortear Orden</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddDraftTeam}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar {unitSingular}</span>
                        </button>
                      </div>
                    </div>

                    {isIndividualMode ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                        {draftTeams.map((team, tIdx) => {
                          const currentPlayerName = team.players[0] ?? team.name ?? '';
                          return (
                            <div
                              key={team.id}
                              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                                  👤 Jugador #{tIdx + 1}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDraftTeamPaid(team.id)}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer border ${
                                      team.paidEntry
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                                        : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                                    }`}
                                  >
                                    {team.paidEntry ? '✓ Pagado' : 'Pendiente'}
                                  </button>
                                  {draftTeams.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDraftTeam(team.id)}
                                      className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                                  Nombre del Jugador #{tIdx + 1}
                                </label>
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
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {draftTeams.map((team, tIdx) => (
                          <div
                            key={team.id}
                            className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                                {unitSingular} #{tIdx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleDraftTeamPaid(team.id)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border ${
                                    team.paidEntry
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                                      : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                                  }`}
                                >
                                  {team.paidEntry ? '✓ Pagado' : 'Pendiente'}
                                </button>
                                {draftTeams.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDraftTeam(team.id)}
                                    className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                                Nombre de {unitSingular === 'Pareja' ? 'la Pareja' : `el ${unitSingular}`} #{tIdx + 1}
                              </label>
                              <input
                                type="text"
                                value={team.name}
                                onChange={(e) => handleUpdateDraftTeamName(team.id, e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-zinc-800">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-amber-400/90">
                                  Integrantes ({team.players.length}):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddPlayerToDraftTeam(team.id)}
                                  className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                                >
                                  + Jugador
                                </button>
                              </div>

                              {team.players.map((playerName, pIdx) => (
                                <div key={pIdx} className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold text-zinc-400 w-6 shrink-0">
                                    #{pIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) =>
                                      handleUpdateDraftPlayerName(team.id, pIdx, e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                                  />
                                  {team.players.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePlayerFromDraftTeam(team.id, pIdx)}
                                      className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
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
                {newTeamFormat === 'INDIVIDUAL' || newPlayersPerTeam === 1
                  ? `Crear Campeonato con ${draftTeams.length} Jugadores`
                  : newTeamFormat === 'PAREJAS'
                  ? `Crear Campeonato con ${draftTeams.length} Parejas`
                  : newTeamFormat === 'TRIOS'
                  ? `Crear Campeonato con ${draftTeams.length} Tríos`
                  : `Crear Campeonato con ${draftTeams.length} Equipos`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
