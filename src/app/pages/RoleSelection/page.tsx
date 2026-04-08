'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/app/util/firebase-client'
import { doc, getDoc } from 'firebase/firestore'

const RoleSelection = () => {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;

      if (!user) {
        router.push('/login'); // not logged in
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists()) {
          console.error("No user document found");
          return;
        }

        const role = snap.data().role;

        if (role === 'it') {
          router.push('/pages/ItDashboard');
        } else {
          router.push('/pages/UserDashboard');
        }

      } catch (err) {
        console.error("ERROR FETCHING ROLE:", err);
      }
    };

    checkRole();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Checking role...
    </div>
  );
};

export default RoleSelection;