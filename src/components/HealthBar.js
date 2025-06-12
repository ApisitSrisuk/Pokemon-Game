// src/components/HealthBar.js

import React from 'react';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';

function HealthBar({ currentHp, maxHp }) {
  const theme = useTheme();
  const hpPercentage = (currentHp / maxHp) * 100;

  let barColor;
  if (hpPercentage <= 20) {
    barColor = theme.palette.error.main; // Low HP: Red
  } else if (hpPercentage <= 50) {
    barColor = theme.palette.warning.main; // Medium HP: Orange
  } else {
    barColor = theme.palette.success.main; // High HP: Green
  }

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 'bold',
          fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }, // Responsive font size
          mb: 0.5, // Add a small margin-bottom for spacing before the bar
        }}
      >
        HP: {currentHp} / {maxHp}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={hpPercentage}
        sx={{
          height: { xs: 8, sm: 10, md: 12 }, // Responsive height
          borderRadius: 5,
          backgroundColor: theme.palette.grey[800],
          border: `1px solid ${theme.palette.grey[700]}`,
          boxShadow: '0 0 5px rgba(0,0,0,0.3) inset',
          '& .MuiLinearProgress-bar': {
            backgroundColor: barColor,
            transition: 'background-color 0.5s ease-in-out, width 0.5s ease-in-out',
            borderRadius: 5,
          },
        }}
      />
    </Box>
  );
}

export default HealthBar;