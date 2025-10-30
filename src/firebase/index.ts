'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// Nomes para as instâncias do Firebase
const CLIENT_APP_NAME = 'DEFAULT';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const apps = getApps();
  
  // Inicializa a app cliente (padrão) se ainda não existir
  const clientApp = apps.find(app => app.name === CLIENT_APP_NAME)
    ? getApp(CLIENT_APP_NAME)
    : initializeApp(firebaseConfig, CLIENT_APP_NAME);

  return {
    client: getSdks(clientApp),
  };
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
