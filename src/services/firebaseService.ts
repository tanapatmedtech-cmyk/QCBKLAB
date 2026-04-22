import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocFromServer,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { QCResult, EQAResult, Instrument, QCConfig, User, QCEvent } from '../types';

export const handleFirestoreError = (error: any, operationType: string, path: string | null = null, shouldThrow = true) => {
  const errorInfo = {
    error: error.message || 'Unknown error',
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || 'guest',
      email: auth.currentUser?.email || 'N/A',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || true,
      providerInfo: auth.currentUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };
  console.error('Firestore Error:', errorInfo);
  if (shouldThrow) {
    throw new Error(JSON.stringify(errorInfo));
  }
};

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Connected');
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
        // This is expected if the document doesn't exist but confirms we reached the server
        return;
    }
    console.error("Please check your Firebase configuration.", error);
  }
}

// Syncing functions
export const syncResults = (callback: (data: QCResult[]) => void) => {
  const q = query(collection(db, 'qc_results'), orderBy('date', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as QCResult);
    callback(data);
  }, (err) => handleFirestoreError(err, 'list', 'qc_results', false));
};

export const syncEQAResults = (callback: (data: EQAResult[]) => void) => {
  const q = query(collection(db, 'eqa_results'), orderBy('date', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as EQAResult);
    callback(data);
  }, (err) => handleFirestoreError(err, 'list', 'eqa_results', false));
};

export const syncEvents = (callback: (data: QCEvent[]) => void) => {
  const q = query(collection(db, 'qc_events'), orderBy('date', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as QCEvent);
    callback(data);
  }, (err) => handleFirestoreError(err, 'list', 'qc_events', false));
};

export const syncUsers = (callback: (data: User[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as User);
    callback(data);
  }, (err) => handleFirestoreError(err, 'list', 'users', false));
};

export const syncInstruments = (callback: (data: Instrument[]) => void) => {
  return onSnapshot(collection(db, 'instruments'), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as Instrument);
    callback(data);
  }, (err) => handleFirestoreError(err, 'list', 'instruments', false));
};

export const syncConfigs = (callback: (data: QCConfig[]) => void) => {
  return onSnapshot(collection(db, 'qc_configs'), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as QCConfig);
    callback(data);
  }, (err) => handleFirestoreError(err, 'list', 'qc_configs', false));
};

// Write functions
export const addQCResult = async (res: QCResult) => {
  try {
    await setDoc(doc(db, 'qc_results', res.id), res);
  } catch (err) {
    handleFirestoreError(err, 'create', `qc_results/${res.id}`);
  }
};

export const updateQCResults = async (results: QCResult[]) => {
    // Note: For bulk updates we usually use batches, but here we just update individual docs
    for (const res of results) {
        await setDoc(doc(db, 'qc_results', res.id), res);
    }
};

export const addEQAResult = async (res: EQAResult) => {
  try {
    await setDoc(doc(db, 'eqa_results', res.id), res);
  } catch (err) {
    handleFirestoreError(err, 'create', `eqa_results/${res.id}`);
  }
};

export const addQCEvent = async (event: QCEvent) => {
  try {
    await setDoc(doc(db, 'qc_events', event.id), event);
  } catch (err) {
    handleFirestoreError(err, 'create', `qc_events/${event.id}`);
  }
};

export const saveUser = async (user: User) => {
  try {
    console.log('[FIREBASE] Saving user profile:', user.id, user.status);
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    handleFirestoreError(err, 'create', `users/${user.id}`);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    console.log('[FIREBASE] Deleting user profile:', userId);
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    handleFirestoreError(err, 'delete', `users/${userId}`);
  }
};

export const saveInstruments = async (insts: Instrument[]) => {
    for (const inst of insts) {
        await setDoc(doc(db, 'instruments', inst.id), inst);
    }
};

export const saveConfigs = async (configs: QCConfig[]) => {
    for (const conf of configs) {
        await setDoc(doc(db, 'qc_configs', conf.id), conf);
    }
};
