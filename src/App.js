import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
} from '@mui/material';
import { SportsEsports, CatchingPokemon, Menu as MenuIcon } from '@mui/icons-material';
import Pokedex from './components/Pokedex';
import TeamViewer from './components/TeamViewer';
import BattleArena from './components/BattleArena';
import gsap from 'gsap';

function App() {
  const theme = useTheme();
  // Detect if it's a small screen (e.g., mobile)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentView, setCurrentView] = useState('pokedex'); // 'pokedex', 'battle'
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const MAX_TEAM_SIZE = 6;
  const contentRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(contentRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, [currentView]);

  // Custom alert/message box function (replacing native alert)
  const showMessage = (message) => {
    // In a real application, you'd use a Material-UI Dialog or Snackbar here
    // For now, we'll log to console or a simple UI element if not in Canvas preview
    console.log(message);
    // If you want a basic in-app message, you could add a state and display it
    // For example, using a useState for a temporary message display:
    // setAppMessage(message);
    // setTimeout(() => setAppMessage(''), 3000);
  };

  const handleSelectPokemon = (pokemon) => {
    if (pokemonTeam.length < MAX_TEAM_SIZE) {
      if (!pokemonTeam.some(p => p.id === pokemon.id)) {
        setPokemonTeam(prevTeam => [...prevTeam, pokemon]);
      } else {
        showMessage(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} is already in your team!`);
      }
    } else {
      showMessage(`Your team is full! Max ${MAX_TEAM_SIZE} Pokemon.`);
    }
  };

  const handleRemovePokemon = (pokemonId) => {
    setPokemonTeam(prevTeam => prevTeam.filter(p => p.id !== pokemonId));
  };

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <CssBaseline />
      
      {/* Floating Capsule Navbar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '90%', sm: 'auto' },
          borderRadius: '50px',
          background: 'rgba(26, 26, 28, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ 
          px: { xs: 2, sm: 3 },
          py: 0.5,
          minHeight: { xs: 60, sm: 70 },
          justifyContent: 'center',
          gap: { xs: 1, sm: 3 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 0, sm: 2 } }}>
            <Avatar 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              sx={{ width: 32, height: 32, mr: 1, filter: 'drop-shadow(0 0 5px #FFCB05)' }} 
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(to right, #FFCB05, #ff4d4d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PokeQuest
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<CatchingPokemon />}
              variant={currentView === 'pokedex' ? 'contained' : 'text'}
              onClick={() => setCurrentView('pokedex')}
              sx={{
                borderRadius: '30px',
                px: 3,
                bgcolor: currentView === 'pokedex' ? 'primary.main' : 'transparent',
                color: currentView === 'pokedex' ? 'black' : 'white',
                '&:hover': {
                  bgcolor: currentView === 'pokedex' ? 'primary.light' : 'rgba(255,255,255,0.05)',
                }
              }}
            >
              Pokedex
            </Button>
            <Button
              startIcon={<SportsEsports />}
              variant={currentView === 'battle' ? 'contained' : 'text'}
              disabled={pokemonTeam.length === 0}
              onClick={() => setCurrentView('battle')}
              sx={{
                borderRadius: '30px',
                px: 3,
                bgcolor: currentView === 'battle' ? 'secondary.main' : 'transparent',
                color: 'white',
                '&:hover': {
                  bgcolor: currentView === 'battle' ? 'secondary.light' : 'rgba(255,255,255,0.05)',
                }
              }}
            >
              Battle {pokemonTeam.length > 0 && `(${pokemonTeam.length})`}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="lg" 
        ref={contentRef}
        sx={{
          flexGrow: 1,
          mt: { xs: 12, sm: 16 },
          mb: 4,
          p: { xs: 1, sm: 2 },
        }}
      >
        {currentView === 'pokedex' && (
          <>
            <TeamViewer team={pokemonTeam} onRemovePokemon={handleRemovePokemon} maxTeamSize={MAX_TEAM_SIZE} />
            <Pokedex onSelectPokemon={handleSelectPokemon} />
          </>
        )}
        {currentView === 'battle' && (
          <BattleArena playerTeam={pokemonTeam} />
        )}
      </Container>
    </Box>
  );
}

export default App;