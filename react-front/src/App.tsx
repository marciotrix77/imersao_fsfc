import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import './App.css';
import { Mapping } from './components/Mapping';
import theme from './themes';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline/>
        <Mapping/>
      </SnackbarProvider>
    </MuiThemeProvider>    
    
  );
}

export default App;
