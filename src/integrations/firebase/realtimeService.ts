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
} from "firebase/database";
import type { LocalSession } from "@/hooks/useExamSession";

// ─── Write helpers ────────────────────────────────────────────────────────────

/** Push / update a full session (called on create, auto-save, and complete) */
export async function syncSessionToFirebase(session: LocalSession) {
  if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) return; // skip if not configured

  try {
    const sessionRef = ref(db, `sessions/${session.id}`);
    await set(sessionRef, {
      ...session,
      updated_at: new Date().toISOString(),
      _ts: serverTimestamp(),
    });
  } catch (err) {
    console.error("[Firebase] syncSession error:", err);
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
