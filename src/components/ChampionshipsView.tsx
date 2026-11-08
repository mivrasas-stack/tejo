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
  UserCheck,
  Shuffle,
} from 'lucide-react';
import { formatCurrency } from '../services/storage';

export type ChampionshipMode = 'TEJO_PUNTOS' | 'TEJO_BALAZOS' | 'BOLIRANA';

export type TeamFormatType = 'INDIVIDUAL' | 'PAREJAS' | 'TRIOS' | 'CUARTETOS' | 'LIBRE';

export interface ChampionshipTeam {
  id: string;
  name: string;
  players: string[]; // Nombres individuales de cada jugador (ej. ['Carlos Pérez', 'Andrés Gómez'])
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

const STORAGE_KEY_CHAMPIONSHIPS = 'aura_pos_championships_v2';

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
      return `Personalizado (${count || 2} por equipo)`;
  }
}

function buildInitialMatches(teamNames: string[]): ChampionshipMatch[] {
  const clean = teamNames.filter(Boolean);
  const matches: ChampionshipMatch[] = [];
  const ts = Date.now();

  if (clean.length >= 8) {
    // Cuartos de Final (4 partidos) + Semifinales (2) + Gran Final (1)
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: `m-${ts}-q${i + 1}`,
        roundName: `Cuartos de Final ${i + 1}`,
        matchNumber: i + 1,
        teamA: clean[i * 2] || `Equipo ${i * 2 + 1}`,
        teamB: clean[i * 2 + 1] || `Equipo ${i * 2 + 2}`,
        scoreA: 0,
        scoreB: 0,
        ranasOrBalazosA: 0,
        ranasOrBalazosB: 0,
        mononasA: 0,
        mononasB: 0,
        status: i === 0 ? 'EN_JUEGO' : 'PENDIENTE',
        canchaAsignada: `Cancha #${(i % 2) + 1}`,
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
      canchaAsignada: 'Cancha Principal #1',
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
      canchaAsignada: 'Cancha Principal #2',
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
      canchaAsignada: 'Cancha VIP / Final',
      events: [],
    });
  } else if (clean.length >= 4) {
    matches.push({
      id: `m-${ts}-1`,
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
      id: `m-${ts}-2`,
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
    teamFormat: 'TRIOS',
    playersPerTeam: 3,
    targetScore: 27,
    entryFee: 60000,
    prizePool: 350000,
    teams: ['Los Caciques', 'Mecha Brava', 'Bocín de Oro', 'Combo del Sur'],
    teamDetails: [
      {
        id: 'td-1',
        name: 'Los Caciques',
        players: ['Jairo Quintero', 'Camilo Pardo', 'Hernán Ríos'],
        paidEntry: true,
      },
      {
        id: 'td-2',
        name: 'Mecha Brava',
        players: ['Mauricio Vargas', 'Diego Mora', 'Fabián Soto'],
        paidEntry: true,
      },
      {
        id: 'td-3',
        name: 'Bocín de Oro',
        players: ['Óscar Gómez', 'Julián Peña', 'Édgar Cruz'],
        paidEntry: true,
      },
      {
        id: 'td-4',
        name: 'Combo del Sur',
        players: ['Nelson Rojas', 'Wilmer Díaz', 'Héctor Castro'],
        paidEntry: false,
      },
    ],
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
            playerName: 'Jairo Quintero',
            label: '🔥 Moñona (Embocinada + Mecha)',
            points: 9,
            timestamp: '08:15 PM',
          },
          {
            id: 'ev-2',
            team: 'B',
            teamName: 'Mecha Brava',
            playerName: 'Mauricio Vargas',
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
    name: 'Relámpago de Tejo "A Balazos" (Parejas)',
    mode: 'TEJO_BALAZOS',
    teamFormat: 'PAREJAS',
    playersPerTeam: 2,
    targetScore: 5,
    entryFee: 30000,
    prizePool: 150000,
    teams: ['Pólvora Pura', 'Los Francotiradores', 'Trueno del Norte', 'Reyes del Bocín'],
    teamDetails: [
      {
        id: 'td-b1',
        name: 'Pólvora Pura',
        players: ['Andrés Morales', 'Sebastián Gil'],
        paidEntry: true,
      },
      {
        id: 'td-b2',
        name: 'Los Francotiradores',
        players: ['Felipe Mejía', 'Cristian León'],
        paidEntry: true,
      },
      {
        id: 'td-b3',
        name: 'Trueno del Norte',
        players: ['Gustavo Arias', 'Ricardo Ruiz'],
        paidEntry: true,
      },
      {
        id: 'td-b4',
        name: 'Reyes del Bocín',
        players: ['Álvaro Ochoa', 'Darío Vélez'],
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
        canchaAsignada: 'Cancha de Tejo #2',
        events: [
          {
            id: 'ev-b1',
            team: 'A',
            teamName: 'Pólvora Pura',
            playerName: 'Andrés Morales',
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
    teamFormat: 'PAREJAS',
    playersPerTeam: 2,
    targetScore: 3000,
    entryFee: 40000,
    prizePool: 200000,
    teams: ['Rana Maestra', 'Tiro Fijo VIP', 'Los Compadres', 'Combo Bolirana'],
    teamDetails: [
      {
        id: 'td-r1',
        name: 'Rana Maestra',
        players: ['Fernando Gómez', 'Luis Eduardo'],
        paidEntry: true,
      },
      {
        id: 'td-r2',
        name: 'Tiro Fijo VIP',
        players: ['Mateo Barrientos', 'Juan Pablo'],
        paidEntry: true,
      },
      {
        id: 'td-r3',
        name: 'Los Compadres',
        players: ['Ramiro Cano', 'Jorge Iván'],
        paidEntry: true,
      },
      {
        id: 'td-r4',
        name: 'Combo Bolirana',
        players: ['Santiago Villa', 'Daniel Ospina'],
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
    name: `Equipo ${idx + 1}`,
    players: Array.from({ length: playersPerTeam }, (__, pIdx) => `Jugador ${pIdx + 1}`),
    paidEntry: true,
  }));
}

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

  // Active Shooter / Player selector per side in the live scoreboard
  const [selectedPlayerA, setSelectedPlayerA] = useState<string>('');
  const [selectedPlayerB, setSelectedPlayerB] = useState<string>('');

  // Custom Score / Target Editor inline
  const [editingTargetScore, setEditingTargetScore] = useState<string>('');
  const [customPointsInputA, setCustomPointsInputA] = useState<string>('');
  const [customPointsInputB, setCustomPointsInputB] = useState<string>('');

  // Create Championship Form State (100% Customizable Teams & Players)
  const [newChampName, setNewChampName] = useState('');
  const [newChampMode, setNewChampMode] = useState<ChampionshipMode>('TEJO_PUNTOS');
  const [newTeamFormat, setNewTeamFormat] = useState<TeamFormatType>('PAREJAS');
  const [newPlayersPerTeam, setNewPlayersPerTeam] = useState<number>(2);
  const [newChampTarget, setNewChampTarget] = useState<number>(27);
  const [newChampEntryFee, setNewChampEntryFee] = useState<number>(40000);
  const [newChampPrizePool, setNewChampPrizePool] = useState<number>(200000);
  const [draftTeams, setDraftTeams] = useState<ChampionshipTeam[]>(() =>
    createEmptyTeamDrafts(4, 2)
  );

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

  // Sync active player selection when match changes
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

  // Handle changing team format in Create Modal (Individual 1, Parejas 2, Tríos 3, Cuartetos 4, Libre N)
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
        : Math.max(1, customCount || newPlayersPerTeam || 2);

    setNewPlayersPerTeam(targetCount);
    setDraftTeams((prev) =>
      prev.map((team) => {
        const currentPlayers = [...team.players];
        if (currentPlayers.length < targetCount) {
          while (currentPlayers.length < targetCount) {
            currentPlayers.push(`Jugador ${currentPlayers.length + 1}`);
          }
        } else if (currentPlayers.length > targetCount) {
          currentPlayers.length = targetCount;
        }
        return { ...team, players: currentPlayers };
      })
    );
  };

  const handleAddDraftTeam = () => {
    setDraftTeams((prev) => [
      ...prev,
      {
        id: `draft-team-${Date.now()}-${prev.length + 1}`,
        name: `Equipo ${prev.length + 1}`,
        players: Array.from(
          { length: newPlayersPerTeam },
          (_, idx) => `Jugador ${idx + 1}`
        ),
        paidEntry: true,
      },
    ]);
  };

  const handleRemoveDraftTeam = (teamId: string) => {
    if (draftTeams.length <= 2) return;
    setDraftTeams((prev) => prev.filter((t) => t.id !== teamId));
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
        t.id === teamId
          ? { ...t, players: [...t.players, `Jugador ${t.players.length + 1}`] }
          : t
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

        // Propagate winners in 4-team or 8-team bracket
        const totalMatches = updatedMatches.length;
        let tournamentChampion = champ.champion;
        let tournamentStatus = champ.status;

        if (totalMatches === 3) {
          // 4-team bracket (Semis 1 & 2 -> Final 3)
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
          // 8-team bracket (Quarters 1..4 -> Semis 5..6 -> Final 7)
          const q1 = updatedMatches.find((m) => m.matchNumber === 1);
          const q2 = updatedMatches.find((m) => m.matchNumber === 2);
          const q3 = updatedMatches.find((m) => m.matchNumber === 3);
          const q4 = updatedMatches.find((m) => m.matchNumber === 4);
          const s1 = updatedMatches.find((m) => m.matchNumber === 5);
          const s2 = updatedMatches.find((m) => m.matchNumber === 6);
          const fin = updatedMatches.find((m) => m.matchNumber === 7);

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

  // Create a new championship with full team & player roster
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

    const sanitizedTeamDetails: ChampionshipTeam[] = draftTeams.map((t, idx) => ({
      id: t.id || `team-${Date.now()}-${idx}`,
      name: t.name.trim() || `Equipo ${idx + 1}`,
      players: t.players.map((p, pIdx) => p.trim() || `Jugador ${pIdx + 1}`),
      paidEntry: t.paidEntry ?? true,
    }));

    const teamNames = sanitizedTeamDetails.map((t) => t.name);
    const createdMatches = buildInitialMatches(teamNames);

    const created: Championship = {
      id: `champ-${Date.now()}`,
      name: cleanName,
      mode: newChampMode,
      teamFormat: newTeamFormat,
      playersPerTeam: newPlayersPerTeam,
      targetScore: Math.max(1, Number(newChampTarget) || 27),
      entryFee: Math.max(0, Number(newChampEntryFee) || 0),
      prizePool: Math.max(0, Number(newChampPrizePool) || 0),
      teams: teamNames,
      teamDetails: sanitizedTeamDetails,
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

  // Add a new team to the currently active championship
  const handleInlineAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChamp || !inlineNewTeamName.trim()) return;

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
                  {getFormatLabel(activeChamp.teamFormat || 'PAREJAS', activeChamp.playersPerTeam)}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 font-display mt-1">
                Campeonatos de Tejo, A Balazos & Bolirana
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5 max-w-2xl">
                Configura torneos individuales, por parejas, tríos o equipos completos con registro detallado de cada jugador, puntaje meta libre y tablero en vivo.
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

      {/* MAIN GRID: LEFT LIVE MATCH SCOREBOARD (Col 7) + RIGHT BRACKET, TEAMS & LOG (Col 5) */}
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
                const teamInfo = isA ? teamADetails : teamBDetails;
                const playersList = teamInfo?.players || [];
                const activeShooter = isA ? selectedPlayerA : selectedPlayerB;
                const setActiveShooter = isA ? setSelectedPlayerA : setSelectedPlayerB;
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
                    className={`rounded-2xl p-4 border transition-all space-y-3.5 ${
                      isWinner
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-zinc-950/90 border-zinc-800'
                    }`}
                  >
                    {/* Team Name & Big Digital Score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Equipo {side}
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

                    {/* Players Roster Chips (Select who is throwing to log their name!) */}
                    {playersList.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-zinc-900">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Jugadores del equipo (toca quién lanza):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {playersList.map((pName, idx) => {
                            const isSelectedShooter = activeShooter === pName;
                            return (
                              <button
                                key={`${pName}-${idx}`}
                                type="button"
                                onClick={() => setActiveShooter(pName)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all flex items-center gap-1 ${
                                  isSelectedShooter
                                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>{pName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

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

          {/* REGISTERED TEAMS & INDIVIDUAL PLAYERS ROSTER CARD */}
          <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">
                  Equipos y Jugadores Inscritos ({activeChamp.teamDetails?.length || activeChamp.teams.length})
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  {getFormatLabel(activeChamp.teamFormat || 'PAREJAS', activeChamp.playersPerTeam)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInlineNewTeamPlayers(
                    Array.from({ length: activeChamp.playersPerTeam || 2 }, () => '')
                  );
                  setShowInlineAddTeam((prev) => !prev);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Inscribir Equipo / Jugadores</span>
              </button>
            </div>

            {showInlineAddTeam && (
              <form
                onSubmit={handleInlineAddTeamSubmit}
                className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-3 text-xs animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">
                    Inscribir Nuevo Equipo en {activeChamp.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowInlineAddTeam(false)}
                    className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    required
                    value={inlineNewTeamName}
                    onChange={(e) => setInlineNewTeamName(e.target.value)}
                    placeholder="Ej. Los Compadres del Norte"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inlineNewTeamPlayers.map((pVal, idx) => (
                    <div key={idx}>
                      <label className="block text-zinc-400 font-semibold mb-1">
                        Nombre Jugador {idx + 1} *
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
                        placeholder={`Nombre completo Jugador ${idx + 1}`}
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
                    + Agregar otro jugador a este equipo
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs cursor-pointer"
                  >
                    Guardar Equipo
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-zinc-100 truncate">
                      {idx + 1}. {team.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        team.paidEntry !== false
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {team.paidEntry !== false ? 'Inscrito' : 'Pendiente Pago'}
                    </span>
                  </div>
                  {team.players && team.players.length > 0 && (
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

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
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
                      <div className="font-bold text-zinc-100 truncate">
                        {ev.teamName}
                        {ev.playerName && (
                          <span className="text-amber-400 font-semibold">
                            {' '}
                            · 👤 {ev.playerName}
                          </span>
                        )}
                      </div>
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

      {/* MODAL TO CREATE A NEW CHAMPIONSHIP (SUPER CUSTOMIZABLE: INDIVIDUAL, PAREJAS, TRIOS, CUARTETOS, PLAYERS) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-5">
          <form
            onSubmit={handleCreateChampionship}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-100">
                    Configurar Nuevo Campeonato Personalizado
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Define modalidad, formato (Individual, Parejas, Tríos, Equipos), meta para ganar y nombres de cada jugador
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

            <div className="space-y-4 text-xs">
              {/* Step 1: Name & Game Discipline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-zinc-200 mb-1">
                    1. Nombre del Campeonato *
                  </label>
                  <input
                    type="text"
                    required
                    value={newChampName}
                    onChange={(e) => setNewChampName(e.target.value)}
                    placeholder="Ej. Gran Torneo Relámpago de Viernes · Parejas / Tríos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-zinc-200 mb-1.5">
                    2. Juego y Sistema de Puntaje *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewChampMode('TEJO_PUNTOS');
                        setNewChampTarget(27);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        newChampMode === 'TEJO_PUNTOS'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div>🎯 Tejo por Puntos</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        Mano 1, Mecha 3, Embocinada 6, Moñona 9
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewChampMode('TEJO_BALAZOS');
                        setNewChampTarget(5);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        newChampMode === 'TEJO_BALAZOS'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div>💥 Tejo A Balazos</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        Solo Mechas Explotadas (+1 / Moñona +2)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewChampMode('BOLIRANA');
                        setNewChampTarget(3000);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        newChampMode === 'BOLIRANA'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div>🐸 Bolirana / Rana</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        Rana 500, Botella 250, Molino 150, Puentes
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Team Size Format (Individual, Parejas, Tríos, Cuartetos, Libre) */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <label className="block font-bold text-amber-400">
                  3. ¿Cómo se va a jugar? (Cantidad de Jugadores por Equipo) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'INDIVIDUAL' as const, label: 'Individual', sub: '1 vs 1 (1 jugador)' },
                    { id: 'PAREJAS' as const, label: 'En Parejas', sub: '2 vs 2 (Duplas)' },
                    { id: 'TRIOS' as const, label: 'En Tríos', sub: '3 vs 3 (Ternas)' },
                    { id: 'CUARTETOS' as const, label: 'Equipos de 4', sub: '4 vs 4 jugadores' },
                    { id: 'LIBRE' as const, label: 'Personalizado', sub: 'Tú eliges cuántos' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleSelectTeamFormat(fmt.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        newTeamFormat === fmt.id
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-extrabold shadow-md'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="text-xs">{fmt.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          newTeamFormat === fmt.id ? 'text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        {fmt.sub}
                      </div>
                    </button>
                  ))}
                </div>

                {newTeamFormat === 'LIBRE' && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-zinc-300 font-semibold">
                      Jugadores por equipo:
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newPlayersPerTeam}
                      onChange={(e) =>
                        handleSelectTeamFormat('LIBRE', parseInt(e.target.value, 10) || 1)
                      }
                      className="w-20 px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/50 text-amber-300 font-mono font-bold text-center"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Target Score, Entry Fee & Prize Pool */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-amber-400 mb-1">
                    4. Meta para Ganar ({newChampMode === 'TEJO_BALAZOS' ? 'Balazos' : 'Puntos'}) *
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
                    Inscripción por Equipo ($)
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
                    Premio al Campeón ($)
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

              {/* Step 4: Detailed Team & Individual Players Registration */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100">
                      5. Registro Detallado de Equipos y Nombres de Jugadores ({draftTeams.length} equipos)
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Escribe el nombre de cada equipo y el nombre de cada jugador que lo integra
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShuffleDraftTeams}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Sortear orden de llaves al azar"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sortear Llaves</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddDraftTeam}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Equipo</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {draftTeams.map((team, tIdx) => (
                    <div
                      key={team.id}
                      className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                          Equipo #{tIdx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleDraftTeamPaid(team.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border ${
                              team.paidEntry
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {team.paidEntry ? '✓ Inscripción Pagada' : 'Pago Pendiente'}
                          </button>
                          {draftTeams.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftTeam(team.id)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer"
                              title="Quitar equipo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Nombre del Equipo / Pareja / Trío *
                        </label>
                        <input
                          type="text"
                          required
                          value={team.name}
                          onChange={(e) => handleUpdateDraftTeamName(team.id, e.target.value)}
                          placeholder={`Ej. Equipo ${tIdx + 1}`}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Individual Players inside this Team */}
                      <div className="space-y-1.5 pt-1 border-t border-zinc-900">
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
                            <input
                              type="text"
                              required
                              value={playerName}
                              onChange={(e) =>
                                handleUpdateDraftPlayerName(team.id, pIdx, e.target.value)
                              }
                              placeholder={`Nombre del Jugador ${pIdx + 1}`}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800/90 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                            />
                            {team.players.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePlayerFromDraftTeam(team.id, pIdx)}
                                className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                                title="Quitar jugador"
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
                Crear Campeonato con {draftTeams.length} Equipos
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
