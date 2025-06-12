// src/components/BattleArena.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  LinearProgress,
  useTheme,
  Slide,
} from '@mui/material';
import HealthBar from './HealthBar';
import PokemonCard from './PokemonCard'; // <--- **บรรทัดนี้ต้องมีและถูกต้อง!**
import { getPokemonByName, getMoveDetail, getTypeEffectiveness } from '../api/pokemonApi';

// Cache for type effectiveness data
const typeEffectivenessCache = {};

// Helper to get color for damage log messages
const getLogColor = (effectiveness, theme) => {
  switch (effectiveness) {
    case 'super_effective': return theme.palette.success.light;
    case 'not_very_effective': return theme.palette.warning.main;
    case 'no_effect': return theme.palette.error.main;
    case 'miss': return theme.palette.info.main;
    default: return theme.palette.text.primary;
  }
};

// Simplified damage formula (can be improved with STAB, type effectiveness, critical hit etc.)
const calculateDamage = (attacker, defender, move, typeEffectivenessData) => {
  if (!move || move.power === null) return { damage: 0, hit: true, effectiveness: 'neutral' }; // Moves without power (status moves)

  const attackerAttack = attacker.stats.find(s => s.stat.name === 'attack')?.base_stat || 1;
  const defenderDefense = defender.stats.find(s => s.stat.name === 'defense')?.base_stat || 1;

  let damage = ((((2 * attacker.level / 5 + 2) * move.power * (attackerAttack / defenderDefense)) / 50) + 2);

  let effectivenessMultiplier = 1;
  let effectivenessMessage = 'neutral';

  const attackType = move.type.name;
  const defenderTypes = defender.types.map(t => t.type.name);

  const attackerDamageRelations = typeEffectivenessData[attackType];

  if (attackerDamageRelations) {
    let tempMultiplier = 1;
    for (const defenderType of defenderTypes) {
      if (attackerDamageRelations.double_damage_to.some(rel => rel.name === defenderType)) {
        tempMultiplier *= 2;
      } else if (attackerDamageRelations.half_damage_to.some(rel => rel.name === defenderType)) {
        tempMultiplier *= 0.5;
      } else if (attackerDamageRelations.no_damage_to.some(rel => rel.name === defenderType)) {
        tempMultiplier *= 0;
      }
    }
    effectivenessMultiplier = tempMultiplier;

    if (effectivenessMultiplier === 0) {
      effectivenessMessage = 'no_effect';
    } else if (effectivenessMultiplier >= 2) {
      effectivenessMessage = 'super_effective';
    } else if (effectivenessMultiplier <= 0.5 && effectivenessMultiplier > 0) {
      effectivenessMessage = 'not_very_effective';
    }
  }

  damage *= effectivenessMultiplier;

  if (move.accuracy && Math.random() * 100 > move.accuracy) {
    return { damage: 0, hit: false, effectiveness: 'miss' };
  }

  damage = Math.floor(damage * (0.85 + Math.random() * 0.15));

  return { damage: Math.max(1, damage), hit: true, effectiveness: effectivenessMessage };
};


function BattleArena({ playerTeam }) {
  const theme = useTheme();
  const [playerPokemon, setPlayerPokemon] = useState(null);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [loadingBattle, setLoadingBattle] = useState(true);
  const [errorBattle, setErrorBattle] = useState(null);
  const [selectedPlayerPokemonId, setSelectedPlayerPokemonId] = useState('');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleOver, setBattleOver] = useState(false);
  const [showArena, setShowArena] = useState(false);

  const typeEffectivenessRef = useRef({});

  // 1. Fetch all type effectiveness data once
  useEffect(() => {
    const fetchAllTypeData = async () => {
      const allTypes = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
        'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel',
        'fairy', 'dark',
      ];
      const promises = allTypes.map(async (type) => {
        if (!typeEffectivenessCache[type]) {
          typeEffectivenessCache[type] = await getTypeEffectiveness(type);
        }
        return { typeName: type, relations: typeEffectivenessCache[type] };
      });
      const results = await Promise.all(promises);
      results.forEach(res => {
        if (res.relations) {
          typeEffectivenessRef.current[res.typeName] = res.relations;
        }
      });
      // console.log("All type effectiveness loaded:", typeEffectivenessRef.current);
    };
    fetchAllTypeData();
  }, []);

  // 2. Fetch initial battle pokemons when playerTeam changes or component mounts
  useEffect(() => {
    const fetchBattlePokemons = async () => {
      setLoadingBattle(true);
      setErrorBattle(null);
      setBattleLog([]);
      setBattleOver(false);
      setIsPlayerTurn(true);
      setShowArena(false); // Reset animation state

      if (!playerTeam || playerTeam.length === 0) {
        setPlayerPokemon(null);
        setSelectedPlayerPokemonId('');
        setLoadingBattle(false);
        return;
      }

      // Load initial player pokemon
      const firstPokemon = playerTeam[0];
      const playerMovesPromises = firstPokemon.moves
        .slice(0, 4)
        .map(moveInfo => getMoveDetail(moveInfo.move.url));
      const playerDetailedMoves = (await Promise.all(playerMovesPromises)).filter(Boolean);
      setPlayerPokemon({
        ...firstPokemon,
        currentHp: firstPokemon.stats.find(s => s.stat.name === 'hp').base_stat,
        moves: playerDetailedMoves,
        level: 50,
      });
      setSelectedPlayerPokemonId(firstPokemon.id);

      // Load random opponent pokemon
      const opponentNames = ['charizard', 'blastoise', 'venusaur', 'pikachu', 'snorlax', 'gengar', 'machamp', 'onix', 'gyarados', 'alakazam'];
      const randomOpponentName = opponentNames[Math.floor(Math.random() * opponentNames.length)];

      try {
        const opponentData = await getPokemonByName(randomOpponentName);
        const opponentMovesPromises = opponentData.moves
          .filter(moveInfo => moveInfo.version_group_details.some(d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0))
          .sort(() => 0.5 - Math.random())
          .slice(0, 4)
          .map(moveInfo => getMoveDetail(moveInfo.move.url));
        const opponentDetailedMoves = (await Promise.all(opponentMovesPromises)).filter(Boolean);

        setOpponentPokemon({
          ...opponentData,
          currentHp: opponentData.stats.find(s => s.stat.name === 'hp').base_stat,
          moves: opponentDetailedMoves,
          level: 50,
        });
        setLoadingBattle(false);
        // Delay showing arena for a brief intro animation
        setTimeout(() => setShowArena(true), 100);
      } catch (err) {
        setErrorBattle(err);
        setLoadingBattle(false);
      }
    };
    fetchBattlePokemons();
  }, [playerTeam]);


  const performAttack = useCallback((attacker, defender, setDefender, move, isOpponent = false) => {
    const attackerName = attacker.name.charAt(0).toUpperCase() + attacker.name.slice(1);
    const defenderName = defender.name.charAt(0).toUpperCase() + defender.name.slice(1);
    const moveName = move.name.charAt(0).toUpperCase() + move.name.slice(1);

    const { damage, hit, effectiveness } = calculateDamage(attacker, defender, move, typeEffectivenessRef.current);
    const newDefenderHp = Math.max(0, defender.currentHp - damage);

    let logMessage = '';
    if (isOpponent) {
      logMessage += `Opponent's ${attackerName} used ${moveName}! `;
    } else {
      logMessage += `${attackerName} used ${moveName}! `;
    }

    if (hit === false) {
      logMessage += `But it missed!`;
    } else if (effectiveness === 'no_effect') {
      logMessage += `It had no effect on ${defenderName}...`;
    } else {
      logMessage += `It dealt ${damage} damage to ${defenderName}.`;
      if (effectiveness === 'super_effective') {
        logMessage += ` It's super effective!`;
      } else if (effectiveness === 'not_very_effective') {
        logMessage += ` It's not very effective...`;
      }
    }

    setBattleLog(prevLog => [...prevLog, { message: logMessage, type: effectiveness === 'miss' ? 'miss' : (effectiveness === 'no_effect' ? 'no_effect' : (effectiveness === 'super_effective' ? 'super_effective' : (effectiveness === 'not_very_effective' ? 'not_very_effective' : 'neutral')))}]);
    setDefender(prev => ({ ...prev, currentHp: newDefenderHp }));

    if (newDefenderHp <= 0) {
      setBattleLog(prevLog => [...prevLog, { message: `${defenderName} fainted!`, type: 'fainted' }]);
      setBattleOver(true);
      setIsPlayerTurn(false);
    }
  }, []);

  const handlePlayerAttack = useCallback(async (move) => {
    if (!playerPokemon || !opponentPokemon || battleOver || !isPlayerTurn) return;

    performAttack(playerPokemon, opponentPokemon, setOpponentPokemon, move, false);

    setTimeout(() => {
      // Check for fainted status again before opponent attacks
      if (opponentPokemon && opponentPokemon.currentHp > 0 && playerPokemon && playerPokemon.currentHp > 0) {
        setIsPlayerTurn(false);
        handleOpponentAttack();
      } else {
        setBattleOver(true);
      }
    }, 1500);
  }, [playerPokemon, opponentPokemon, battleOver, isPlayerTurn, performAttack]);

  const handleOpponentAttack = useCallback(() => {
    if (!opponentPokemon || !playerPokemon || battleOver) return;

    const usableMoves = opponentPokemon.moves.filter(move => move.power !== null);
    const randomMove = usableMoves.length > 0 ? usableMoves[Math.floor(Math.random() * usableMoves.length)] : null;

    if (!randomMove) {
      setBattleLog(prevLog => [...prevLog, { message: `Opponent's ${opponentPokemon.name.charAt(0).toUpperCase() + opponentPokemon.name.slice(1)} couldn't find a usable attack move!`, type: 'info' }]);
      setIsPlayerTurn(true);
      return;
    }

    performAttack(opponentPokemon, playerPokemon, setPlayerPokemon, randomMove, true);

    setTimeout(() => {
      // Check for fainted status again before player's turn
      if (playerPokemon && playerPokemon.currentHp > 0 && opponentPokemon && opponentPokemon.currentHp > 0) {
        setIsPlayerTurn(true);
      } else {
        setBattleOver(true);
      }
    }, 1500);
  }, [opponentPokemon, playerPokemon, battleOver, performAttack]);

  const resetBattle = useCallback(async () => {
    setLoadingBattle(true);
    setErrorBattle(null);
    setBattleLog([]);
    setBattleOver(false);
    setIsPlayerTurn(true);
    setShowArena(false);

    if (playerTeam && playerTeam.length > 0) {
      const currentSelectedPokemon = playerTeam.find(p => p.id === selectedPlayerPokemonId);
      if (currentSelectedPokemon) {
        const playerMovesPromises = currentSelectedPokemon.moves
          .slice(0, 4)
          .map(moveInfo => getMoveDetail(moveInfo.move.url));
        const playerDetailedMoves = (await Promise.all(playerMovesPromises)).filter(Boolean);
        setPlayerPokemon({
          ...currentSelectedPokemon,
          currentHp: currentSelectedPokemon.stats.find(s => s.stat.name === 'hp').base_stat,
          moves: playerDetailedMoves,
          level: 50,
        });
      }
    }

    const opponentNames = ['charizard', 'blastoise', 'venusaur', 'pikachu', 'snorlax', 'gengar', 'machamp', 'onix', 'gyarados', 'alakazam'];
    const randomOpponentName = opponentNames[Math.floor(Math.random() * opponentNames.length)];
    try {
      const opponentData = await getPokemonByName(randomOpponentName);
      const opponentMovesPromises = opponentData.moves
        .filter(moveInfo => moveInfo.version_group_details.some(d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(moveInfo => getMoveDetail(moveInfo.move.url));
      const opponentDetailedMoves = (await Promise.all(opponentMovesPromises)).filter(Boolean);
      setOpponentPokemon({
        ...opponentData,
        currentHp: opponentData.stats.find(s => s.stat.name === 'hp').base_stat,
        moves: opponentDetailedMoves,
        level: 50,
      });
      setLoadingBattle(false);
      setTimeout(() => setShowArena(true), 100);
    } catch (err) {
      setErrorBattle(err);
      setLoadingBattle(false);
    }
  }, [playerTeam, selectedPlayerPokemonId]);

  const handlePlayerPokemonChange = useCallback(async (event) => {
    const selectedId = event.target.value;
    setSelectedPlayerPokemonId(selectedId);
    const pokemon = playerTeam.find(p => p.id === selectedId);
    if (pokemon) {
      setLoadingBattle(true);
      setBattleOver(false);
      setIsPlayerTurn(true);
      setBattleLog([]);
      setShowArena(false);

      const playerMovesPromises = pokemon.moves
        .slice(0, 4)
        .map(moveInfo => getMoveDetail(moveInfo.move.url));
      const playerDetailedMoves = (await Promise.all(playerMovesPromises)).filter(Boolean);
      setPlayerPokemon({
        ...pokemon,
        currentHp: pokemon.stats.find(s => s.stat.name === 'hp').base_stat,
        moves: playerDetailedMoves,
        level: 50,
      });
      setLoadingBattle(false);
      setTimeout(() => setShowArena(true), 100);
    }
  }, [playerTeam]);


  if (!playerTeam || playerTeam.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 128px)" sx={{ backgroundColor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" color="text.secondary" sx={{ textAlign: 'center', fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }}>
          Please select Pokemon for your team in the Pokedex first!
        </Typography>
      </Box>
    );
  }

  if (loadingBattle || Object.keys(typeEffectivenessRef.current).length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="calc(100vh - 128px)" sx={{ backgroundColor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
        <CircularProgress size={80} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.primary', textAlign: 'center', fontSize: { xs: '1rem', sm: '1.2rem' } }}>Preparing Battle... Loading Type Data...</Typography>
      </Box>
    );
  }

  if (errorBattle) {
    return <Typography color="error" align="center" variant="h5" sx={{ mt: 4, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Error preparing battle: {errorBattle.message}</Typography>;
  }

  const getWinnerMessage = () => {
    if (battleOver) {
      if (playerPokemon && playerPokemon.currentHp <= 0) {
        return `You lost! ${opponentPokemon.name.charAt(0).toUpperCase() + opponentPokemon.name.slice(1)} wins!`;
      } else if (opponentPokemon && opponentPokemon.currentHp <= 0) {
        return `Congratulations! Your ${playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1)} wins!`;
      }
    }
    return '';
  };


  return (
    <Slide direction="up" in={showArena} mountOnEnter unmountOnExit timeout={500}>
      <Box sx={{
        p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.darker} 100%)`,
        borderRadius: 4,
        boxShadow: '0px 8px 24px rgba(0,0,0,0.5)',
        minHeight: '60vh', // Minimum height, can be adjusted
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'url(/battle-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        animation: 'bg-pan 20s infinite alternate linear',
        '@keyframes bg-pan': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      }}>
        {/* Battle Over Overlay */}
        {battleOver && (
          <Box sx={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)',
            color: theme.palette.text.light,
            textAlign: 'center',
            p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
          }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: { xs: 1, sm: 2 }, textShadow: '2px 2px 4px #000', fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}> {/* Responsive Font Size */}
              {getWinnerMessage()}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={resetBattle}
              sx={{
                mt: { xs: 2, sm: 3 }, // Responsive margin-top
                minWidth: { xs: 150, sm: 200 }, // Responsive min-width
                fontSize: { xs: '1rem', sm: '1.2rem' }, // Responsive font size
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              Play Again!
            </Button>
          </Box>
        )}

        <Typography variant="h4" align="center" gutterBottom sx={{ color: theme.palette.primary.main, mb: { xs: 2, sm: 3 }, textShadow: '2px 2px 4px #000', zIndex: 5, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}> {/* Responsive Font Size */}
          Pokemon Battle!
        </Typography>

        <Grid
          container
          spacing={{ xs: 2, sm: 3, md: 4 }} // Responsive spacing
          justifyContent="center"
          alignItems="stretch"
          sx={{ flexGrow: 1, zIndex: 5, flexDirection: { xs: 'column', sm: 'row' } }} // Stack on xs, row on sm+
        >
          {/* Opponent's Pokemon Area */}
          <Grid item
            xs={12} // Full width on extra-small
            sm={6} // Half width on small+
            md={4} // One-third width on medium+
            sx={{
              order: { xs: 1, sm: 1 }, // Order on small screens, remains same on larger
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Paper elevation={6} sx={{
              p: { xs: 1.5, sm: 2 }, // Responsive padding
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              textAlign: 'center',
              width: '100%',
              maxWidth: 350, // Max width for cards
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Typography variant="h6" sx={{ mb: { xs: 0.5, sm: 1 }, color: theme.palette.primary.main, textShadow: '1px 1px 2px #000', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Opponent's Pokemon</Typography>
              <PokemonCard pokemonData={opponentPokemon} />
              {opponentPokemon && (
                <Box sx={{ width: '90%', mx: 'auto', mt: { xs: 1.5, sm: 2 } }}> {/* Responsive margin-top */}
                  <HealthBar currentHp={opponentPokemon.currentHp} maxHp={opponentPokemon.stats.find(s => s.stat.name === 'hp')?.base_stat} />
                </Box>
              )}
              {/* Turn indicator */}
              {!battleOver && !isPlayerTurn && (
                <Box sx={{
                  position: 'absolute',
                  top: { xs: -5, sm: -10 }, right: { xs: -5, sm: -10 }, // Responsive position
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  borderRadius: '50%',
                  width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 }, // Responsive size
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  animation: 'bounce 1s infinite alternate',
                  '@keyframes bounce': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-5px)' },
                  },
                }}>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Turn</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Battle Controls / Center Area */}
          <Grid item
            xs={12} // Full width on extra-small
            sm={12} // Full width on small to push player pokemon down
            md={4} // One-third width on medium+
            sx={{
              order: { xs: 3, sm: 2 }, // Order changes: below opponent on xs, center on sm+
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1.5, sm: 2 }, // Responsive gap
            }}
          >
            <Paper elevation={6} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, backgroundColor: theme.palette.background.paper, minHeight: { xs: 80, sm: 120 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                {isPlayerTurn && !battleOver ? 'Your Turn!' : !battleOver ? "Opponent's Turn..." : 'Battle Ended!'}
              </Typography>
              {!battleOver && isPlayerTurn && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Select an attack!</Typography>
              )}
            </Paper>

            {!battleOver && isPlayerTurn && (
              <Paper elevation={6} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, backgroundColor: theme.palette.background.paper, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ mb: { xs: 1, sm: 1.5 }, color: theme.palette.text.primary, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.1rem' } }}>Choose Your Move:</Typography>
                <Grid container spacing={1} justifyContent="center">
                  {playerPokemon && playerPokemon.moves && playerPokemon.moves.length > 0 ? (
                    playerPokemon.moves.map((move) => (
                      <Grid item xs={6} key={move.id}> {/* 2 buttons per row */}
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handlePlayerAttack(move)}
                          disabled={playerPokemon.currentHp <= 0 || opponentPokemon.currentHp <= 0 || move.power === null}
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' }, // Smaller font on xs
                            textTransform: 'none',
                            p: { xs: '6px 8px', sm: '8px 12px' }, // Smaller padding on xs
                            width: '100%',
                            backgroundColor: theme.palette.pokemonType[move.type.name]?.main || theme.palette.primary.main,
                            color: theme.palette.pokemonType[move.type.name]?.text || theme.palette.primary.contrastText,
                            '&:hover': {
                              backgroundColor: theme.palette.pokemonType[move.type.name]?.dark || theme.palette.primary.dark,
                            }
                          }}
                        >
                          {move.name.charAt(0).toUpperCase() + move.name.slice(1)}
                          <Typography variant="caption" sx={{ ml: 1, fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 'normal' }}>
                            (Pwr: {move.power || 'N/A'})
                          </Typography>
                        </Button>
                      </Grid>
                    ))
                  ) : (
                    <CircularProgress size={30} sx={{ mx: 'auto', my: 2, color: theme.palette.secondary.main }} />
                  )}
                </Grid>
              </Paper>
            )}
            {battleOver && (
              <Button
                variant="outlined"
                color="warning"
                onClick={resetBattle}
                sx={{ mt: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1.1rem' }, minWidth: { xs: '80%', sm: 'auto' } }}
              >
                Reset Battle
              </Button>
            )}
          </Grid>

          {/* Player's Pokemon Area */}
          <Grid item
            xs={12} // Full width on extra-small
            sm={6} // Half width on small+
            md={4} // One-third width on medium+
            sx={{
              order: { xs: 2, sm: 3 }, // Order changes: below controls on xs, right of controls on sm+
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Paper elevation={6} sx={{
              p: { xs: 1.5, sm: 2 }, // Responsive padding
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              textAlign: 'center',
              width: '100%',
              maxWidth: 350, // Max width for cards
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Typography variant="h6" sx={{ mb: { xs: 0.5, sm: 1 }, color: theme.palette.secondary.main, textShadow: '1px 1px 2px #000', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Your Pokemon</Typography>
              <PokemonCard pokemonData={playerPokemon} />
              {playerPokemon && (
                <Box sx={{ width: '90%', mx: 'auto', mt: { xs: 1.5, sm: 2 } }}> {/* Responsive margin-top */}
                  <HealthBar currentHp={playerPokemon.currentHp} maxHp={playerPokemon.stats.find(s => s.stat.name === 'hp')?.base_stat} />
                </Box>
              )}
              {/* Turn indicator */}
              {!battleOver && isPlayerTurn && (
                <Box sx={{
                  position: 'absolute',
                  top: { xs: -5, sm: -10 }, right: { xs: -5, sm: -10 }, // Responsive position
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderRadius: '50%',
                  width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 }, // Responsive size
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  animation: 'bounce 1s infinite alternate',
                  '@keyframes bounce': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-5px)' },
                  },
                }}>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Turn</Typography>
                </Box>
              )}
            </Paper>
            <FormControl fullWidth sx={{
              mt: { xs: 2, sm: 3 }, // Responsive margin-top
              maxWidth: 350,
              '.MuiInputBase-root': {
                borderRadius: '8px',
                backgroundColor: theme.palette.background.paper,
                fontSize: { xs: '0.9rem', sm: '1rem' } // Responsive font size
              },
              '.MuiInputLabel-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' } // Responsive font size
              }
            }}>
              <InputLabel id="select-pokemon-label" sx={{ color: theme.palette.text.secondary }}>Switch Pokemon</InputLabel>
              <Select
                labelId="select-pokemon-label"
                value={selectedPlayerPokemonId}
                label="Switch Pokemon"
                onChange={handlePlayerPokemonChange}
                disabled={!isPlayerTurn || battleOver}
                sx={{ color: theme.palette.text.primary }}
              >
                {playerTeam.map((p) => (
                  <MenuItem key={p.id} value={p.id} disabled={p.currentHp <= 0}>
                    {p.name.charAt(0).toUpperCase() + p.name.slice(1)} ({p.currentHp <= 0 ? 'Fainted' : `HP: ${p.currentHp}`})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Battle Log */}
        <Paper elevation={6} sx={{
          mt: { xs: 3, sm: 4 }, // Responsive margin-top
          p: { xs: 1.5, sm: 2 }, // Responsive padding
          maxHeight: { xs: 150, sm: 180 }, // Responsive max-height
          overflowY: 'auto',
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.grey[700]}`
        }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: { xs: 0.5, sm: 1 }, textShadow: '1px 1px 2px #000', fontSize: { xs: '1rem', sm: '1.1rem' } }}>Battle Log:</Typography>
          {battleLog.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Awaiting first move...</Typography>
          ) : (
            battleLog.map((log, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ mb: { xs: 0.25, sm: 0.5 }, color: getLogColor(log.type, theme), fontWeight: log.type !== 'neutral' ? 'bold' : 'normal', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
              >
                {log.message}
              </Typography>
            ))
          )}
        </Paper>
      </Box>
    </Slide>
  );
}

export default BattleArena;