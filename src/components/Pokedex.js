// src/components/Pokedex.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  CircularProgress,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Container,
  Card,
  CardMedia,
  CardContent,
  Button,
  useTheme,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery, // Import useMediaQuery for responsive adjustments
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getPokemonList, getPokemonByName } from '../api/pokemonApi';
import PokemonDetailDialog from './PokemonDetailDialog';

// --- Generation ID Ranges ---
const GENERATION_RANGES = {
  'all': { offset: 0, limit: 1025 },
  'gen1': { offset: 0, limit: 151 },
  'gen2': { offset: 151, limit: 100 },
  'gen3': { offset: 251, limit: 135 },
  'gen4': { offset: 386, limit: 107 },
  'gen5': { offset: 493, limit: 156 },
  'gen6': { offset: 649, limit: 72 },
  'gen7': { offset: 721, limit: 88 },
  'gen8': { offset: 809, limit: 96 },
  'gen9': { offset: 905, limit: 120 },
};

function Pokedex({ onSelectPokemon }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen is small

  const [allPokemonNamesCache, setAllPokemonNamesCache] = useState([]);
  const [filteredPokemonNames, setFilteredPokemonNames] = useState([]);
  const [displayedPokemonDetails, setDisplayedPokemonDetails] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGen, setSelectedGen] = useState('all');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const getTypeChipStyles = useCallback((type) => {
    const typeKey = type.toLowerCase();
    const typeColors = theme.palette.pokemonType?.[typeKey]; // Use optional chaining for safety
    if (typeColors) {
      return {
        backgroundColor: typeColors.main,
        color: typeColors.text,
        marginRight: '0.5rem',
        fontWeight: 'bold',
        textShadow: '0px 1px 2px rgba(0,0,0,0.2)', // Subtle text shadow for readability
      };
    }
    return {
      backgroundColor: theme.palette.grey[400], // Slightly darker grey for default
      color: theme.palette.grey[900], // Darker text for contrast
      marginRight: '0.5rem',
      fontWeight: 'bold',
      textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
    };
  }, [theme.palette.pokemonType]);

  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        const data = await getPokemonList(GENERATION_RANGES['all'].limit, GENERATION_RANGES['all'].offset);
        setAllPokemonNamesCache(data);
        setLoadingInitial(false);
      } catch (err) {
        setError(err);
        setLoadingInitial(false);
      }
    };
    fetchAllPokemonNames();
  }, []);

  const loadDetailedPokemon = useCallback(async (pokemonNamesUrls, currentOffset, currentLimit, shouldReset = false) => {
    if (!pokemonNamesUrls || pokemonNamesUrls.length === 0) {
      setLoadingMore(false);
      if (shouldReset) setDisplayedPokemonDetails([]);
      return;
    }

    setLoadingMore(true);
    const namesToFetch = pokemonNamesUrls
      .slice(currentOffset, currentOffset + currentLimit)
      .map(p => p.name);

    try {
      const detailedPokemonPromises = namesToFetch.map(name => getPokemonByName(name));
      const newPokemonDetails = await Promise.all(detailedPokemonPromises);

      setDisplayedPokemonDetails(prev => {
        if (shouldReset) return newPokemonDetails;
        const newIds = new Set(prev.map(p => p.id));
        const filteredNewDetails = newPokemonDetails.filter(p => !newIds.has(p.id));
        return [...prev, ...filteredNewDetails];
      });
      setOffset(currentOffset + currentLimit);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (loadingInitial) return;

    let namesToProcess = allPokemonNamesCache;

    if (selectedGen !== 'all' && GENERATION_RANGES[selectedGen]) {
      const { offset: genOffset, limit: genLimit } = GENERATION_RANGES[selectedGen];
      namesToProcess = namesToProcess.filter(pokemon => {
        const pokemonId = parseInt(pokemon.url.split('/').slice(-2, -1)[0]);
        // Filter based on generation range
        return pokemonId > genOffset && pokemonId <= (genOffset + genLimit);
      });
    }

    if (searchTerm) {
      namesToProcess = namesToProcess.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPokemonNames(namesToProcess);
    setOffset(0);
    setDisplayedPokemonDetails([]);
    loadDetailedPokemon(namesToProcess, 0, LIMIT, true);
  }, [selectedGen, searchTerm, allPokemonNamesCache, loadingInitial, loadDetailedPokemon]);

  const handleScroll = useCallback((e) => {
    // Only trigger infinite scroll if there's no search term, not loading more, and there are more pokemon to load
    if (searchTerm !== '' || loadingMore || offset >= filteredPokemonNames.length) return;

    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Trigger when user scrolls near the bottom (e.g., 300px from bottom)
    if (scrollHeight - scrollTop < clientHeight + 300) {
      loadDetailedPokemon(filteredPokemonNames, offset, LIMIT);
    }
  }, [loadingMore, offset, filteredPokemonNames, searchTerm, loadDetailedPokemon]);

  useEffect(() => {
    const container = document.getElementById('pokedex-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleOpenDialog = (pokemon) => {
    setSelectedPokemon(pokemon);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPokemon(null);
  };

  const handleGenChange = (event) => {
    setSelectedGen(event.target.value);
  };

  if (loadingInitial) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="calc(100vh - 64px)"
        sx={{ backgroundColor: theme.palette.background.default }} // Ensure background matches theme
      >
        <CircularProgress size={isSmallScreen ? 60 : 80} sx={{ color: 'primary.main' }} />
        <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ mt: 2, color: 'text.primary', textAlign: 'center' }}>
          Loading Pokedex Data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography
        color="error"
        align="center"
        variant={isSmallScreen ? "h6" : "h5"}
        sx={{ mt: 4, px: 2 }}
      >
        Error loading Pokedex: {error.message}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
          fontWeight: 'bold',
          color: theme.palette.primary.dark, // A good, strong color for the title
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)', // Subtle shadow for title
        }}
      >
        Explore the Pokedex!
      </Typography>

      {/* Search and Generation Filter Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 3 },
          mb: 4,
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 1, sm: 0 },
        }}
      >
        <TextField
          label="Search Pokemon by name..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.secondary.main }} />
              </InputAdornment>
            ),
            style: { color: theme.palette.text.primary }
          }}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            flexGrow: { sm: 1 },
            maxWidth: { sm: 350, md: 450 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px', // Slightly more rounded input field
              transition: 'all 0.3s ease-in-out', // Smooth transition
              backgroundColor: theme.palette.background.paper, // Ensure input background stands out
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.light,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`, // Subtle focus ring
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
          }}
        />
        <FormControl
          sx={{
            minWidth: { xs: '100%', sm: 180 },
            maxWidth: { xs: '100%', sm: 200 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px', // Slightly more rounded select field
              transition: 'all 0.3s ease-in-out',
              backgroundColor: theme.palette.background.paper,
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.light,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
            '& .MuiSelect-select': {
              color: theme.palette.text.primary,
            },
            '& .MuiSvgIcon-root': {
              color: theme.palette.text.secondary,
            }
          }}
        >
          <InputLabel id="gen-select-label">Generation</InputLabel>
          <Select
            labelId="gen-select-label"
            value={selectedGen}
            label="Generation"
            onChange={handleGenChange}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '10px', // Rounded menu corners
                  boxShadow: theme.shadows[4],
                  border: `1px solid ${theme.palette.divider}`, // Subtle border
                },
              },
              MenuListProps: {
                sx: {
                  '& .MuiMenuItem-root': {
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      color: theme.palette.primary.main,
                      fontWeight: 'bold', // Selected item stands out
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="all">All Generations</MenuItem>
            {Object.keys(GENERATION_RANGES).filter(key => key !== 'all').map(genKey => (
              <MenuItem key={genKey} value={genKey}>
                Generation {genKey.replace('gen', '')}
                {genKey === 'gen1' && ' (Kanto)'}
                {genKey === 'gen2' && ' (Johto)'}
                {genKey === 'gen3' && ' (Hoenn)'}
                {genKey === 'gen4' && ' (Sinnoh)'}
                {genKey === 'gen5' && ' (Unova)'}
                {genKey === 'gen6' && ' (Kalos)'}
                {genKey === 'gen7' && ' (Alola)'}
                {genKey === 'gen8' && ' (Galar)'}
                {genKey === 'gen9' && ' (Paldea)'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Scrollable container for infinite scroll */}
      <Box
        id="pokedex-scroll-container"
        sx={{
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
          p: { xs: 0, sm: 1, md: 2 },
          '&::-webkit-scrollbar': {
            width: '10px', // Slightly wider scrollbar
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.background.darker,
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.secondary.main,
            borderRadius: '10px',
            border: `2px solid ${theme.palette.background.darker}`, // Border to make thumb "float"
            '&:hover': {
              background: theme.palette.secondary.dark,
            }
          }
        }}
      >
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} justifyContent="center">
          {displayedPokemonDetails.map(pokemon => (
            <Grid item
              key={pokemon.id}
              xs={12} // Full width on extra small
              sm={6} // 2 per row on small
              md={4} // 3 per row on medium
              lg={3} // 4 per row on large
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: { xs: 1.5, sm: 2 },
                  height: '100%',
                  borderRadius: theme.shape.borderRadius * 2,
                  boxShadow: theme.shadows[3],
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', // Smooth transitions
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`, // Subtle border for definition
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)', // More pronounced lift and slight scale
                    boxShadow: theme.shadows[8], // Stronger shadow on hover
                  }
                }}
                onClick={() => handleOpenDialog(pokemon)}
              >
                <CardMedia
                  component="img"
                  image={pokemon.sprites?.front_default || 'https://via.placeholder.com/120'}
                  alt={pokemon.name}
                  sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, objectFit: 'contain', mb: 1 }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 1, width: '100%' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      mb: 0.5,
                      fontWeight: 'bold',
                      color: theme.palette.text.primary,
                      textTransform: 'capitalize', // Capitalize first letter
                    }}
                  >
                    #{String(pokemon.id).padStart(3, '0')} {pokemon.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mb: 1, gap: { xs: '0.25rem', sm: '0.5rem' } }}>
                    {pokemon.types && pokemon.types.map(typeInfo => (
                      <Chip
                        key={typeInfo.type.name}
                        label={typeInfo.type.name.toUpperCase()}
                        size="small"
                        sx={{ ...getTypeChipStyles(typeInfo.type.name), fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      />
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPokemon(pokemon);
                    }}
                    sx={{
                      mt: 1,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 'bold',
                      minWidth: { xs: '80%', sm: 'auto' }, // Make button wider on small screens
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)', // Slight lift on button hover
                      }
                    }}
                  >
                    Add to Team
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {displayedPokemonDetails.length === 0 && (searchTerm !== '' || selectedGen !== 'all') && !loadingMore && (
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4, width: '100%', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              No Pokemon found matching your criteria.
            </Typography>
          )}
        </Grid>
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, gap: 2, alignItems: 'center' }}>
            <CircularProgress size={isSmallScreen ? 30 : 40} />
            <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Loading more...</Typography>
          </Box>
        )}
        {displayedPokemonDetails.length > 0 && offset >= filteredPokemonNames.length && !loadingMore && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, width: '100%', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            You've reached the end of the list!
          </Typography>
        )}
      </Box>
      <PokemonDetailDialog
        open={openDialog}
        onClose={handleCloseDialog}
        pokemon={selectedPokemon}
      />
    </Container>
  );
}

export default Pokedex;