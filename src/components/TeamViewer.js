// src/components/TeamViewer.js

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery // <-- Added useMediaQuery
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

function TeamViewer({ team, onRemovePokemon, maxTeamSize }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Detect small screens

  return (
    <Box sx={{
      mt: 4,
      p: { xs: 2, sm: 3 }, // Responsive padding
      border: `2px solid ${theme.palette.secondary.light}`,
      borderRadius: 4,
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0px 6px 15px rgba(0,0,0,0.1)',
    }}>
      <Typography
        variant="h5"
        align="center"
        sx={{
          mb: 2,
          color: 'primary.main',
          fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } // Responsive font size
        }}
      >
        Your Pokemon Team ({team.length} / {maxTeamSize})
      </Typography>
      {team.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{
            p: 2,
            fontSize: { xs: '0.9rem', sm: '1rem' } // Responsive font size
          }}
        >
          No Pokemon in your team yet. Add some from the Pokedex!
        </Typography>
      ) : (
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 3 }} // Responsive spacing between cards
          justifyContent="center"
        >
          {team.map(pokemon => (
            <Grid item key={pokemon.id} xs={6} sm={4} md={3} lg={2}> {/* Responsive grid items */}
              <Card sx={{
                width: { xs: '100%', sm: 130 }, // Full width on xs, fixed width on sm+
                height: { xs: 150, sm: 170 }, // Responsive height
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: { xs: 0.5, sm: 1 }, // Responsive padding
                position: 'relative',
                border: `1px solid ${theme.palette.background.darker}`,
                boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                '&:hover .remove-button': {
                  opacity: 1,
                }
              }}>
                <Tooltip title={`Remove ${pokemon.name}`} arrow>
                  <IconButton
                    size="small"
                    onClick={() => onRemovePokemon(pokemon.id)}
                    sx={{
                      position: 'absolute',
                      top: { xs: 2, sm: 5 }, // Responsive top position
                      right: { xs: 2, sm: 5 }, // Responsive right position
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'error.light',
                      },
                      opacity: 0,
                      transition: 'opacity 0.2s ease-in-out',
                      p: { xs: '2px', sm: '4px' }, // Smaller padding for button
                    }}
                    className="remove-button"
                  >
                    <ClearIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} color="error" /> {/* Responsive icon size */}
                  </IconButton>
                </Tooltip>
                <CardMedia
                  component="img"
                  image={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  sx={{
                    width: { xs: 80, sm: 90 }, // Responsive image width
                    height: { xs: 80, sm: 90 }, // Responsive image height
                    objectFit: 'contain',
                    mb: 0.5,
                  }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 0.25, sm: 0.5 }, width: '100%' }}> {/* Responsive padding */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }, // Responsive font size
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {/* Placeholder slots for empty team slots */}
          {Array(maxTeamSize - team.length).fill(0).map((_, index) => (
            <Grid item key={`empty-${index}`} xs={6} sm={4} md={3} lg={2}> {/* Responsive grid items */}
              <Card sx={{
                width: { xs: '100%', sm: 130 }, // Full width on xs, fixed width on sm+
                height: { xs: 150, sm: 170 }, // Responsive height
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                border: '1px dashed #B0B0B0',
                backgroundColor: theme.palette.background.darker,
                opacity: 0.7,
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Empty Slot
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default TeamViewer;