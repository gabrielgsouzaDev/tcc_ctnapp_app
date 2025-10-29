import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { type School, type StudentProfile, type GuardianProfile, type UserProfile } from '@/lib/data';

// School Services
export const getSchools = async (db: ReturnType<typeof getFirestore>): Promise<School[]> => {
  try {
    const schoolsCol = collection(db, 'schools');
    const schoolSnapshot = await getDocs(schoolsCol);
    const schoolList = schoolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
    return schoolList;
  } catch (error) {
    console.error("Error fetching schools:", error);
    // Return an empty array or handle the error as appropriate
    return [];
  }
};

// Profile Creation Services

const ensureUserDocument = async (db: ReturnType<typeof getFirestore>, firebaseUid: string) => {
    const userRef = doc(db, 'users', firebaseUid);
    // Use set with merge to create the document if it doesn't exist, or do nothing if it does.
    // This can be used to store top-level user info later if needed.
    await setDoc(userRef, {}, { merge: true });
}

export const createStudentProfile = async (
  db: ReturnType<typeof getFirestore>,
  firebaseUid: string,
  data: Omit<StudentProfile, 'id' | 'firebaseUid' | 'balance'>
) => {
  await ensureUserDocument(db, firebaseUid);
  const profileCollectionRef = collection(db, `users/${firebaseUid}/studentProfiles`);
  const profileData: Omit<StudentProfile, 'id'> = {
    ...data,
    firebaseUid,
    balance: 0, // Initial balance
  };
  await addDoc(profileCollectionRef, profileData);
};


export const createGuardianProfile = async (
  db: ReturnType<typeof getFirestore>,
  firebaseUid: string,
  data: Omit<GuardianProfile, 'id' | 'firebaseUid' | 'balance' | 'students'>
) => {
   await ensureUserDocument(db, firebaseUid);
   const profileCollectionRef = collection(db, `users/${firebaseUid}/guardianProfiles`);
   const profileData: Omit<GuardianProfile, 'id' | 'students'> = {
    ...data,
    firebaseUid,
    balance: 0, // Initial balance
  };
  await addDoc(profileCollectionRef, profileData);
};


export const createUserProfile = async (
  db: ReturnType<typeof getFirestore>,
  firebaseUid: string,
  data: Omit<UserProfile, 'id' | 'firebaseUid' | 'balance'>
) => {
  await ensureUserDocument(db, firebaseUid);
  const profileCollectionRef = collection(db, `users/${firebaseUid}/userProfiles`);
  const profileData: Omit<UserProfile, 'id'> = {
    ...data,
    firebaseUid,
    balance: 0, // Initial balance
  };
   await addDoc(profileCollectionRef, profileData);
};
