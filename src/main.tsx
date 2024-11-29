import React from 'react';
import App from './App.tsx';
import './index.css';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN ?? ''}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID ?? ''}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE ?? '',
                scope: 'read:snippets write:snippets', // Adjust scopes as needed
            }}
        >
            <App />
        </Auth0Provider>

    </React.StrictMode>,
);
