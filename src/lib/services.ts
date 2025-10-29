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
  Timestamp,
  collectionGroup,
  limit,
  Firestore,
} from 'firebase/firestore';
import { type School, type StudentProfile, type GuardianProfile, type UserProfile, Canteen, Product, Transaction, Order, OrderItem } from '@/lib/data';

// School Services
export const getSchools = async (db: Firestore): Promise<School[]> => {
  try {
    const schoolsCol = collection(db, 'schools');
    const schoolSnapshot = await getDocs(schoolsCol);
    const schoolList = schoolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
    return schoolList;
  } catch (error) {
    console.error("Error fetching schools:", error);
    return [];
  }
};


// Profile Services
const ensureUserDocument = async (db: Firestore, firebaseUid: string) => {
    const userRef = doc(db, 'users', firebaseUid);
    await setDoc(userRef, { lastLogin: Timestamp.now() }, { merge: true });
}

export const createStudentProfile = async (
  db: Firestore,
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
  db: Firestore,
  firebaseUid: string,
  data: Omit<GuardianProfile, 'id' | 'firebaseUid' | 'balance' | 'students'>
) => {
   await ensureUserDocument(db, firebaseUid);
   const profileCollectionRef = collection(db, `users/${firebaseUid}/guardianProfiles`);
   const profileData: Omit<GuardianProfile, 'id' | 'students' | 'balance'> = {
    ...data,
    firebaseUid,
    balance: 100, // Initial balance for guardian
  };
  await addDoc(profileCollectionRef, profileData);
};


export const createUserProfile = async (
  db: Firestore,
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

export const getStudentProfile = async (db: Firestore, firebaseUid: string): Promise<StudentProfile | null> => {
    const q = query(collection(db, `users/${firebaseUid}/studentProfiles`), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as StudentProfile;
}

export const getGuardianProfile = async (db: Firestore, firebaseUid: string): Promise<GuardianProfile | null> => {
    const q = query(collection(db, `users/${firebaseUid}/guardianProfiles`), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const profileDoc = snapshot.docs[0];
    const profileData = profileDoc.data() as Omit<GuardianProfile, 'id' | 'students'>;
    
    // Fetch linked students
    const studentsQuery = query(collectionGroup(db, 'studentProfiles'), where('ra', '==', profileData.studentRa));
    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map(sDoc => ({ id: sDoc.id, ...sDoc.data() } as StudentProfile));
    
    return { id: profileDoc.id, ...profileData, students } as GuardianProfile;
}

export const getEmployeeProfile = async (db: Firestore, firebaseUid: string): Promise<UserProfile | null> => {
    const q = query(collection(db, `users/${firebaseUid}/userProfiles`), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserProfile;
}


// Canteen / Product Services
export const getCanteensBySchool = async (db: Firestore, schoolId: string): Promise<Canteen[]> => {
    const q = query(collection(db, 'canteens'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Canteen));
}

export const getProductsByCanteen = (db: Firestore, canteenId: string) => {
    return query(collection(db, 'products'), where('canteenId', '==', canteenId));
}

// Transaction and Order Services
export const getOrdersByUser = (db: Firestore, userId: string) => {
    return query(collection(db, 'orders'), where('userId', '==', userId));
}

export const getTransactionsByUser = (db: Firestore, userId: string) => {
    return query(collection(db, 'transactions'), where('userId', '==', userId));
}

export const getOrdersByGuardian = (db: Firestore, studentIds: string[]) => {
    if (studentIds.length === 0) return null;
    return query(collection(db, 'orders'), where('studentId', 'in', studentIds));
}

export const getTransactionsByGuardian = (db: Firestore, userId: string, studentIds: string[]) => {
    // This query is complex and might not be efficient.
    // It requires fetching transactions for the guardian AND all their students.
    // Firestore does not support logical OR in a single query across different fields.
    // For now, we will fetch guardian transactions only. A better solution would be to duplicate data or use multiple queries.
    const userIds = [userId, ...studentIds];
    if (userIds.length === 0) {
      return null;
    }
    return query(collection(db, 'transactions'), where('userId', 'in', userIds));
}
