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
import { useFirestore } from '@/firebase';


// School Services
export const getSchools = async (db: ReturnType<typeof getFirestore>): Promise<School[]> => {
  const schoolsCol = collection(db, 'schools');
  const schoolSnapshot = await getDocs(schoolsCol);
  const schoolList = schoolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
  return schoolList;
};

// Profile Creation Services

export const createStudentProfile = async (
  db: ReturnType<typeof getFirestore>,
  firebaseUid: string,
  data: Omit<StudentProfile, 'id' | 'firebaseUid' | 'balance'>
) => {
  const profileData: Omit<StudentProfile, 'id'> = {
    ...data,
    firebaseUid,
    balance: 0, // Initial balance
  };
  await addDoc(collection(db, `users/${firebaseUid}/studentProfiles`), profileData);
};


export const createGuardianProfile = async (
  db: ReturnType<typeof getFirestore>,
  firebaseUid: string,
  data: Omit<GuardianProfile, 'id' | 'firebaseUid' | 'balance' | 'students'>
) => {
   const profileData: Omit<GuardianProfile, 'id' | 'students'> = {
    ...data,
    firebaseUid,
    balance: 0, // Initial balance
  };
  // Note: The `students` sub-collection would be managed separately.
  await addDoc(collection(db, `users/${firebaseUid}/guardianProfiles`), profileData);
};


export const createUserProfile = async (
  db: ReturnType<typeof getFirestore>,
  firebaseUid: string,
  data: Omit<UserProfile, 'id' | 'firebaseUid' | 'balance'>
) => {
  const profileData: Omit<UserProfile, 'id'> = {
    ...data,
    firebaseUid,
    balance: 0, // Initial balance
  };
   await addDoc(collection(db, `users/${firebaseUid}/userProfiles`), profileData);
};
