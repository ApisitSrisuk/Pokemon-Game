// src/components/PokemonCard.js

import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, useTheme, LinearProgress } from '@mui/material';

function PokemonCard({ pokemonData, loading, error }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
        <Typography variant="h6" color="text.secondary">Loading Pokemon...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
        <Typography color="error" variant="h6">Error: {error.message}</Typography>
      </Box>
    );
  }
  if (!pokemonData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
        <Typography variant="h6" color="text.secondary">No Pokemon Selected</Typography>
      </Box>
    );
  }

  const getTypeChipStyles = (type) => {
    const typeKey = type.toLowerCase();
    const typeColors = theme.palette.pokemonType[typeKey];
    if (typeColors) {
      return {
        backgroundColor: typeColors.main,
        color: typeColors.text,
        // Responsive margin/spacing for chips is handled by the parent Box gap
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
      // Responsive margin/spacing for chips is handled by the parent Box gap
      fontWeight: 'bold',
      fontSize: { xs: '0.65rem', sm: '0.75rem' },
      padding: { xs: '1px 6px', sm: '2px 8px' },
      height: { xs: '20px', sm: '24px' },
      borderRadius: '12px',
    };
  };

  const currentHp = pokemonData.currentHp !== undefined ? pokemonData.currentHp : pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat;
  const maxHp = pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat || 1;

  let hpBarColor;
  const hpPercentage = (currentHp / maxHp) * 100;
  if (hpPercentage <= 20) {
    hpBarColor = theme.palette.error.main; // Low HP: Red
  } else if (hpPercentage <= 50) {
    hpBarColor = theme.palette.warning.main; // Medium HP: Orange
  } else {
    hpBarColor = theme.palette.success.main; // High HP: Green
  }


  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: { xs: 240, sm: 280, md: 300 }, // Responsive max width
        mx: 'auto',
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.secondary.main}`,
        boxShadow: `0 0 15px ${theme.palette.secondary.dark}, 0 0 5px ${theme.palette.primary.main}`,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: 2,
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: `0 0 20px ${theme.palette.secondary.main}, 0 0 8px ${theme.palette.primary.main}`,
        }
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: { xs: 150, sm: 170, md: 180 }, // Responsive height for image area
          backgroundColor: theme.palette.background.darker,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.grey[700]}`,
        }}
      >
        <CardMedia
          component="img"
          image={pokemonData.sprites?.other?.['official-artwork']?.front_default || pokemonData.sprites?.front_default || 'https://via.placeholder.com/120'}
          alt={pokemonData.name}
          sx={{
            width: 'auto', // Let image scale naturally within height/width constraints
            height: '100%', // Ensure image fills container height
            maxHeight: { xs: 120, sm: 140, md: 160 }, // Max height for the image itself
            maxWidth: '100%', // Ensure image does not overflow
            objectFit: 'contain',
            filter: currentHp <= 0 ? 'grayscale(100%) brightness(50%)' : 'none',
            transition: 'filter 0.5s ease-in-out',
          }}
        />
      </Box>
      <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 }, width: '100%' }}> {/* Responsive padding */}
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.primary.main,
            mb: 0.5,
            textShadow: '1px 1px 2px #000',
            fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }, // Responsive font size
          }}
        >
          #{String(pokemonData.id).padStart(3, '0')} {pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mb: 1, gap: { xs: '0.25rem', sm: '0.5rem' } }}> {/* Responsive chip spacing */}
          {pokemonData.types && pokemonData.types.map(typeInfo => (
            <Chip
              key={typeInfo.type.name}
              label={typeInfo.type.name.toUpperCase()}
              size="small"
              sx={getTypeChipStyles(typeInfo.type.name)}
            />
          ))}
        </Box>
        {/* HP Bar and text for Battle Arena */}
        {pokemonData.currentHp !== undefined && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.85rem' }, // Responsive font size
                mb: 0.5, // Add a small margin-bottom for spacing before the bar
              }}
            >
              HP: {currentHp} / {maxHp}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={hpPercentage}
              sx={{
                height: { xs: 8, sm: 10 }, // Responsive height
                borderRadius: 5,
                backgroundColor: theme.palette.grey[800],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: hpBarColor,
                  transition: 'background-color 0.5s ease-in-out',
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PokemonCard;