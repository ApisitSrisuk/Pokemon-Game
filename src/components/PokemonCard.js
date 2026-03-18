// src/components/PokemonCard.js

import React, { useRef } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, useTheme, LinearProgress } from '@mui/material';
import gsap from 'gsap';

function PokemonCard({ pokemonData, loading, error, onClick, isShiny }) {
  const theme = useTheme();
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -10,
      scale: 1.02,
      boxShadow: isShiny 
        ? '0 20px 40px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.3)'
        : '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255, 203, 5, 0.2)',
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      boxShadow: isShiny ? '0 0 20px rgba(255, 215, 0, 0.3)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      duration: 0.4,
      ease: 'power2.out'
    });
  };

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
        fontWeight: 'bold',
        fontSize: { xs: '0.65rem', sm: '0.75rem' },
        padding: { xs: '1px 6px', sm: '2px 8px' },
        height: { xs: '20px', sm: '24px' },
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
  };

  const currentHp = pokemonData.currentHp !== undefined ? pokemonData.currentHp : pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat;
  const maxHp = pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat || 1;

  let hpBarColor;
  const hpPercentage = (currentHp / maxHp) * 100;
  if (hpPercentage <= 20) {
    hpBarColor = theme.palette.error.main;
  } else if (hpPercentage <= 50) {
    hpBarColor = theme.palette.warning.main;
  } else {
    hpBarColor = theme.palette.success.main;
  }

  return (
    <Card
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      sx={{
        width: '100%',
        maxWidth: { xs: 240, sm: 280, md: 300 },
        mx: 'auto',
        background: isShiny ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        border: isShiny ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isShiny ? '0 0 20px rgba(255, 215, 0, 0.2)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: 2,
        position: 'relative',
        cursor: 'pointer',
        animation: isShiny ? 'shinyGlow 3s infinite alternate' : 'none',
        '@keyframes shinyGlow': {
          '0%': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }
        }
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: { xs: 150, sm: 170, md: 180 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: isShiny ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        {isShiny && (
           <Typography sx={{ 
             position: 'absolute', top: 5, right: 10, fontSize: '0.7rem', 
             color: '#FFD700', fontWeight: 'bold', textShadow: '0 0 5px #000'
           }}>
             SHINY ✨
           </Typography>
        )}
        <CardMedia
          component="img"
          image={pokemonData.sprites?.other?.['official-artwork']?.front_default || pokemonData.sprites?.front_default || 'https://via.placeholder.com/120'}
          alt={pokemonData.name}
          sx={{
            width: 'auto',
            height: '100%',
            maxHeight: { xs: 120, sm: 140, md: 160 },
            maxWidth: '100%',
            objectFit: 'contain',
            filter: currentHp <= 0 
              ? 'grayscale(100%) brightness(50%)' 
              : (isShiny ? 'hue-rotate(180deg) brightness(1.2) contrast(1.1)' : 'none'),
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