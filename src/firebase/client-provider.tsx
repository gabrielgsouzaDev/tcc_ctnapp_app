
'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { seedDatabase } from '@/lib/seed'; // Import the seed function

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const seedData = async () => {
      if (firebaseServices.client.firestore) {
        try {
          console.log('Checking if database needs seeding...');
          await seedDatabase(firebaseServices.client.firestore);
        } catch (error) {
          console.error("Failed to seed database:", error);
        }
      }
    };
    seedData();
  }, [firebaseServices]);

  return (
    <FirebaseProvider
      clientApp={firebaseServices.client.firebaseApp}
      clientAuth={firebaseServices.client.auth}
      clientFirestore={firebaseServices.client.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
