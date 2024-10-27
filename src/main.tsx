import React from 'react';
import App from './App.tsx'
import './index.css'
import {createRoot} from "react-dom/client";
import {PaginationProvider} from "./contexts/paginationProvider.tsx";
import {SnackbarProvider} from "./contexts/snackbarProvider.tsx";
import {Auth0Provider} from "@auth0/auth0-react";

const domain = import.meta.env.VITE_AUTH0_DOMAIN; // application in auth0
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID; // application in auth0
const audience = import.meta.env.VITE_AUTH0_AUDIENCE; // API in auth0

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <PaginationProvider>
        <SnackbarProvider>
          <Auth0Provider
              domain={domain}
              clientId={clientId}
              authorizationParams={{
                  audience: audience,
                  redirect_uri: window.location.origin,
              }}>
              <App/>
          </Auth0Provider>
        </SnackbarProvider>
      </PaginationProvider>
    </React.StrictMode>,
)
