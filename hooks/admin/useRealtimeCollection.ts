"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
  DocumentData,
  FirestoreError,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface UseRealtimeCollectionOptions {
  collectionName: string;
  constraints?: QueryConstraint[];
  enabled?: boolean;
}

interface UseRealtimeCollectionResult<T> {
  data: T[];
  isLoading: boolean;
  error: FirestoreError | null;
}

export function useRealtimeCollection<T extends { id: string } = DocumentData & { id: string }>({
  collectionName,
  constraints = [],
  enabled = true,
}: UseRealtimeCollectionOptions): UseRealtimeCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Keep constraints stable to prevent infinite loops when arrays are passed inline
  const constraintsRef = useRef(constraints);
  constraintsRef.current = constraints;

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(collection(db, collectionName), ...constraintsRef.current);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(docs);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, enabled]);

  return { data, isLoading, error };
}
