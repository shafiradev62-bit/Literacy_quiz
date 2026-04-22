/**
 * Firebase Realtime Database service
 * Tracks: exam sessions, answers, scores, student profiles — all realtime
 *
 * Data structure:
 *   /sessions/{sessionId}   — full session data
 *   /students/{studentId}   — student profile + unit progress
 *   /live/{deviceId}        — live in-progress state (answers, current question)
 */

import { db } from "./config";
import {
  ref,
  set,
  update,
  onValue,
  off,
  serverTimestamp,
  DatabaseReference,
  push,
} from "firebase/database";
import type { LocalSession } from "@/hooks/useExamSession";

// ─── Write helpers ────────────────────────────────────────────────────────────

/** Push / update a full session (called on create, auto-save, and complete) */
export async function syncSessionToFirebase(session: LocalSession) {
  if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) return; // skip if not configured

  try {
    const timestamp = new Date().toISOString();
    const data = {
      ...session,
      updated_at: timestamp,
      _ts: serverTimestamp(),
    };

    // 1. All Sessions (Standard)
    await set(ref(db, `sessions/${session.id}`), data);

    // 2. Organized by Student (if student exists)
    if (session.student_id) {
      await update(ref(db, `students/${session.student_id}/sessions/${session.id}`), data);
      
      // 3. Organized by Category (Unit) per Student
      // This makes it easy to see all attempts of a specific unit for a specific student
      await update(ref(db, `categories/unit_${session.unit}/${session.student_id}/${session.id}`), {
        id: session.id,
        score: session.score,
        total: session.total,
        completed: session.completed,
        updated_at: timestamp
      });
    }

  } catch (err) {
    console.error("[Firebase] syncSession error:", err);
  }
}

/** Sync essay answers to a dedicated clean path */
export async function syncEssaysToFirebase(
  sessionId: string,
  studentId: string | null,
  unit: number,
  essays: Array<{ questionId: string; question: string; answer: string }>
) {
  if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) return;

  try {
    for (const essay of essays) {
      const cleanPath = `essays/unit_${unit}/${studentId || 'anonymous'}/${sessionId}/${essay.questionId}`;
      await set(ref(db, cleanPath), {
        question: essay.question,
        answer: essay.answer,
        studentId: studentId,
        timestamp: new Date().toISOString(),
        _ts: serverTimestamp()
      });
    }
  } catch (err) {
    console.error("[Firebase] syncEssays error:", err);
  }
}

/** Write live in-progress state (answers + current question index) */
export async function updateLiveState(
  deviceId: string,
  unit: number,
  answers: Record<string, unknown>,
  currentQuestion: number,
  studentName?: string | null
) {
  if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) return;

  try {
    const liveRef = ref(db, `live/${deviceId}`);
    await update(liveRef, {
      unit,
      answers,
      currentQuestion,
      studentName: studentName ?? null,
      lastSeen: new Date().toISOString(),
      _ts: serverTimestamp(),
    });
  } catch (err) {
    console.error("[Firebase] updateLiveState error:", err);
  }
}

/** Remove live state when exam ends */
export async function clearLiveState(deviceId: string) {
  if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) return;

  try {
    const liveRef = ref(db, `live/${deviceId}`);
    await set(liveRef, null);
  } catch (err) {
    console.error("[Firebase] clearLiveState error:", err);
  }
}

/** Upsert student profile */
export async function syncStudentToFirebase(student: {
  id: string;
  name: string;
  class: string;
  school: string;
  email?: string | null;
  contact?: string | null;
  instagram?: string | null;
}) {
  if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) return;

  try {
    const studentRef = ref(db, `students/${student.id}`);
    await update(studentRef, {
      ...student,
      updated_at: new Date().toISOString(),
      _ts: serverTimestamp(),
    });
  } catch (err) {
    console.error("[Firebase] syncStudent error:", err);
  }
}

// ─── Realtime listeners ───────────────────────────────────────────────────────

/** Listen to all sessions — returns unsubscribe fn */
export function listenToSessions(
  callback: (sessions: Record<string, LocalSession>) => void
): () => void {
  const sessionsRef = ref(db, "sessions");
  onValue(sessionsRef, (snapshot) => {
    callback((snapshot.val() as Record<string, LocalSession>) ?? {});
  });
  return () => off(sessionsRef);
}

/** Listen to live in-progress exams — returns unsubscribe fn */
export function listenToLive(
  callback: (live: Record<string, unknown>) => void
): () => void {
  const liveRef = ref(db, "live");
  onValue(liveRef, (snapshot) => {
    callback((snapshot.val() as Record<string, unknown>) ?? {});
  });
  return () => off(liveRef);
}

/** Listen to a single session — returns unsubscribe fn */
export function listenToSession(
  sessionId: string,
  callback: (session: LocalSession | null) => void
): () => void {
  const sessionRef: DatabaseReference = ref(db, `sessions/${sessionId}`);
  onValue(sessionRef, (snapshot) => {
    callback(snapshot.val() as LocalSession | null);
  });
  return () => off(sessionRef);
}
