import { db } from "../util/firebase-client";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

export const addComment = async (
  ticketId: string, 
  text: string,
  user: any,
  role: 'user' | 'it',
  visibility: 'public' | 'internal',
) => {
  if(!text.trim()) return

  return await addDoc(
    collection(db, 'tickets', ticketId, 'comments'),
    {
      text: text.trim(),
      createdAt: serverTimestamp(),
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      role,
      visibility,
    }
  );
};

export const listenToComments = (
  ticketId: string,
  callback: (comments: any[]) => void
) => {
  const q = query(
    collection(db, 'tickets', ticketId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(data);
  });
};

