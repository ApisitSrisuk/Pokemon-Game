// src/App.js

import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Button,
  useTheme,
  useMediaQuery // <-- Import useMediaQuery
} from '@mui/material';
import Pokedex from './components/Pokedex';
import TeamViewer from './components/TeamViewer';
import BattleArena from './components/BattleArena';

function App() {
  const theme = useTheme();
  // Detect if it's a small screen (e.g., mobile)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentView, setCurrentView] = useState('pokedex'); // 'pokedex', 'battle'
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const MAX_TEAM_SIZE = 6; // กำหนดขนาดทีมสูงสุด

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
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      display: 'flex', // Use flexbox for overall layout
      flexDirection: 'column', // Stack children vertically
    }}>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[3] }}>
        <Toolbar sx={{
          minHeight: { xs: 56, sm: 64 }, // Responsive minimum height for toolbar
          justifyContent: { xs: 'space-between', sm: 'flex-start' }, // Adjust alignment
          flexWrap: 'wrap', // Allow items to wrap on smaller screens
          gap: { xs: 1, sm: 2 }, // Spacing between buttons
          py: { xs: 1, sm: 0 }, // Vertical padding for toolbar
        }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              mr: { xs: 0, sm: 2 }, // Remove margin on xs, add on sm+
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' }, // Responsive font size
              whiteSpace: 'nowrap', // Prevent wrapping for title
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: theme.palette.primary.main,
            }}
          >
            Pokemon Adventure
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, // Stack buttons on xs, row on sm+
            gap: { xs: 1, sm: 2 }, // Spacing between buttons
            width: { xs: '100%', sm: 'auto' }, // Full width buttons on xs
            justifyContent: 'center', // Center buttons when stacked
          }}>
            <Button
              color="inherit"
              onClick={() => setCurrentView('pokedex')}
              sx={{
                color: theme.palette.text.primary,
                fontSize: { xs: '0.8rem', sm: '0.9rem' }, // Responsive font size
                py: { xs: 0.5, sm: 0.75 }, // Responsive vertical padding
                px: { xs: 1, sm: 2 }, // Responsive horizontal padding
                minWidth: { xs: 'auto', sm: 100 }, // Auto width on xs, min 100px on sm+
              }}
            >
              Pokedex
            </Button>
            <Button
              color="inherit"
              onClick={() => setCurrentView('battle')}
              disabled={pokemonTeam.length === 0}
              sx={{
                color: theme.palette.text.primary,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                py: { xs: 0.5, sm: 0.75 },
                px: { xs: 1, sm: 2 },
                minWidth: { xs: 'auto', sm: 150 },
                flexShrink: 0, // Prevent button from shrinking
              }}
            >
              Start Battle ({pokemonTeam.length} / {MAX_TEAM_SIZE})
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{
        flexGrow: 1, // Allow container to take available space
        mt: { xs: 2, sm: 4 }, // Responsive margin-top
        mb: { xs: 2, sm: 4 }, // Responsive margin-bottom
        p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
        // Add minHeight or adjust height to ensure content is always visible
        minHeight: 'calc(100vh - 120px)', // Example: 100vh minus header/footer approximate height
      }}>
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