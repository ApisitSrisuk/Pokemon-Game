// src/components/PokemonDetailDialog.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  useMediaQuery,
  Grid // <-- Add Grid here to resolve the error!
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { getMoveDetail } from '../api/pokemonApi';

function PokemonDetailDialog({ open, onClose, pokemon }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Detect small screens

  const [movesDetail, setMovesDetail] = useState([]);
  const [loadingMoves, setLoadingMoves] = useState(true);
  const [errorMoves, setErrorMoves] = useState(null);

  const getTypeChipStyles = useCallback((type) => { // Memoize with useCallback
    const typeKey = type.toLowerCase();
    const typeColors = theme.palette.pokemonType[typeKey];
    if (typeColors) {
      return {
        backgroundColor: typeColors.main,
        color: typeColors.text,
        fontWeight: 'bold',
        fontSize: { xs: '0.65rem', sm: '0.75rem' }, // Responsive font size
        padding: { xs: '1px 6px', sm: '2px 8px' }, // Responsive padding
        height: { xs: '20px', sm: '24px' }, // Responsive height
        borderRadius: '12px',
      };
    }
    return {
      backgroundColor: theme.palette.grey[600],
      color: theme.palette.text.primary,
      fontWeight: 'bold',
      fontSize: { xs: '0.65rem', sm: '0.75rem' },
      padding: { xs: '1px 6px', sm: '2px 8px' },
      height: { xs: '20px', sm: '24px' },
      borderRadius: '12px',
    };
  }, [theme.palette.pokemonType]);


  useEffect(() => {
    const fetchMoves = async () => {
      if (pokemon && pokemon.moves && open) {
        setLoadingMoves(true);
        setErrorMoves(null);
        try {
          // Fetch only the first 4 moves for performance and concise display
          const selectedMoves = pokemon.moves.slice(0, 4);
          const movePromises = selectedMoves.map(moveInfo => getMoveDetail(moveInfo.move.url));
          const details = await Promise.all(movePromises);
          setMovesDetail(details);
        } catch (err) {
          setErrorMoves(err);
          console.error("Failed to fetch move details:", err);
        } finally {
          setLoadingMoves(false);
        }
      } else {
        setMovesDetail([]);
      }
    };
    fetchMoves();
  }, [pokemon, open]); // Dependencies

  if (!pokemon) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isSmallScreen ? "xs" : "sm"} // Use 'xs' for very small screens
      fullWidth
      PaperProps={{ // Apply styles directly to the Paper component within Dialog
        sx: {
          borderRadius: { xs: '12px', sm: '16px' }, // Responsive border radius
          p: { xs: 1, sm: 2 }, // Responsive padding for the dialog content
          backgroundColor: theme.palette.background.default, // Set a background color
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: { xs: 1, sm: 2 }, // Responsive padding bottom
        borderBottom: `1px solid ${theme.palette.divider}`, // Add a subtle divider
        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.8rem' }, // Responsive font size
      }}>
        <Typography
          variant={isSmallScreen ? "h6" : "h5"} // Smaller variant for small screens
          component="div" // To avoid font warnings when using variant="h6" with h5 fontSize
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            overflow: 'hidden', // Handle long names
            textOverflow: 'ellipsis', // Add ellipsis for long names
            whiteSpace: 'nowrap', // Prevent wrapping
            fontSize: { xs: '1.2rem', sm: '1.5rem' }, // Responsive font size for title
          }}
        >
          #{String(pokemon.id).padStart(3, '0')} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}
        >
          <CloseIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} /> {/* Responsive icon size */}
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 } }}> {/* Responsive padding for content */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: { xs: 1.5, sm: 2 }, // Responsive margin bottom
        }}>
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            style={{
              width: isSmallScreen ? 120 : 150, // Smaller image on small screens
              height: isSmallScreen ? 120 : 150,
              objectFit: 'contain',
              imageRendering: 'pixelated', // For pixel art look
            }}
          />
        </Box>

        <Typography variant="body1" sx={{ mb: { xs: 0.5, sm: 1 }, fontWeight: 'bold' }}>
          Types:{' '}
          <Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: { xs: '0.25rem', sm: '0.5rem' } }}>
            {pokemon.types.map(typeInfo => (
              <Chip
                key={typeInfo.type.name}
                label={typeInfo.type.name.toUpperCase()}
                size="small"
                sx={getTypeChipStyles(typeInfo.type.name)}
              />
            ))}
          </Box>
        </Typography>

        <Typography variant="body1" sx={{ mb: { xs: 0.5, sm: 1 } }}>
          **Height:** {pokemon.height / 10} m
        </Typography>
        <Typography variant="body1" sx={{ mb: { xs: 0.5, sm: 1 } }}>
          **Weight:** {pokemon.weight / 10} kg
        </Typography>

        <Typography
          variant={isSmallScreen ? "h6" : "h5"} // Responsive heading size
          sx={{ mt: { xs: 2, sm: 3 }, mb: { xs: 1, sm: 1.5 }, color: theme.palette.secondary.main }}
        >
          Base Stats:
        </Typography>
        {pokemon.stats.map(statInfo => (
          <Typography
            key={statInfo.stat.name}
            variant="body2"
            color="text.secondary"
            sx={{ mb: { xs: 0.25, sm: 0.5 }, fontSize: { xs: '0.85rem', sm: '0.95rem' } }} // Responsive font size
          >
            <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              {statInfo.stat.name.charAt(0).toUpperCase() + statInfo.stat.name.slice(1)}:
            </Box>{' '}
            {statInfo.base_stat}
          </Typography>
        ))}

        <Typography
          variant={isSmallScreen ? "h6" : "h5"} // Responsive heading size
          sx={{ mt: { xs: 2.5, sm: 4 }, mb: { xs: 1, sm: 1.5 }, color: theme.palette.secondary.main }}
        >
          Selected Moves:
        </Typography>
        {loadingMoves ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50px">
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1, color: theme.palette.text.secondary }}>Loading moves...</Typography>
          </Box>
        ) : errorMoves ? (
          <Typography color="error" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
            Error loading moves: {errorMoves.message}
          </Typography>
        ) : movesDetail.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
            No moves found for this Pokemon.
          </Typography>
        ) : (
          <Grid container spacing={{ xs: 1, sm: 2 }}> {/* Use Grid for moves */}
            {movesDetail.map(move => (
              <Grid item xs={12} sm={6} key={move.id}> {/* 1 column on xs, 2 columns on sm+ */}
                <Box sx={{
                  mb: { xs: 0.5, sm: 1 },
                  p: { xs: 1, sm: 1.5 },
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.text.primary,
                      fontSize: { xs: '0.9rem', sm: '1rem' }, // Responsive font size for move name
                      mb: { xs: 0.25, sm: 0.5 }
                    }}
                  >
                    {move.name.charAt(0).toUpperCase() + move.name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Type:</Box>{' '}
                    {move.type.name.charAt(0).toUpperCase() + move.type.name.slice(1)}
                  </Typography>
                  {move.power !== null && move.power !== undefined && ( // Check for null/undefined
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                      <Box component="span" sx={{ fontWeight: 'bold' }}>Power:</Box>{' '}
                      {move.power}
                    </Typography>
                  )}
                  {move.accuracy !== null && move.accuracy !== undefined && ( // Check for null/undefined
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                      <Box component="span" sx={{ fontWeight: 'bold' }}>Accuracy:</Box>{' '}
                      {move.accuracy}%
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Category:</Box>{' '}
                    {move.damage_class.name.charAt(0).toUpperCase() + move.damage_class.name.slice(1)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PokemonDetailDialog;