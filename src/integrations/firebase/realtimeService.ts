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
} from "firebase/database";
import type { LocalSession } from "@/hooks/useExamSession";

// Guard — skip all Firebase ops if db not initialized
const isReady = () => !!db;

// ─── Write helpers ────────────────────────────────────────────────────────────

export async function syncSessionToFirebase(session: LocalSession) {
  if (!isReady()) return;
  try {
    await set(ref(db!, `sessions/${session.id}`), {
      ...session,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Firebase] syncSession error:", err);
  }
}

export async function updateLiveState(
  deviceId: string,
  unit: number,
  answers: Record<string, unknown>,
  currentQuestion: number,
  studentName?: string | null
) {
  if (!isReady()) return;
  try {
    await update(ref(db!, `live/${deviceId}`), {
      unit,
      answers,
      currentQuestion,
      studentName: studentName ?? null,
      lastSeen: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Firebase] updateLiveState error:", err);
  }
}

export async function clearLiveState(deviceId: string) {
  if (!isReady()) return;
  try {
    await set(ref(db!, `live/${deviceId}`), null);
  } catch (err) {
    console.error("[Firebase] clearLiveState error:", err);
  }
}

export async function syncStudentToFirebase(student: {
  id: string;
  name: string;
  class: string;
  school: string;
  email?: string | null;
  contact?: string | null;
  instagram?: string | null;
}) {
  if (!isReady()) return;
  try {
    await update(ref(db!, `students/${student.id}`), {
      ...student,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Firebase] syncStudent error:", err);
  }
}

export async function syncEssaysToFirebase(
  sessionId: string,
  studentId: string,
  unit: number,
  essays: Record<string, string>
) {
  if (!isReady()) return;
  try {
    for (const [questionId, answerText] of Object.entries(essays)) {
      if (answerText.trim()) {
        await set(ref(db!, `essays/${sessionId}/${questionId}`), {
          sessionId,
          studentId,
          unit,
          questionId,
          answerText,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("[Firebase] syncEssays error:", err);
  }
}

// ─── Realtime listeners ───────────────────────────────────────────────────────

export function listenToSessions(
  callback: (sessions: Record<string, LocalSession>) => void
): () => void {
  if (!isReady()) return () => {};
  const sessionsRef = ref(db!, "sessions");
  onValue(sessionsRef, (snapshot) => {
    callback((snapshot.val() as Record<string, LocalSession>) ?? {});
  });
  return () => off(sessionsRef);
}

export function listenToLive(
  callback: (live: Record<string, unknown>) => void
): () => void {
  if (!isReady()) return () => {};
  const liveRef = ref(db!, "live");
  onValue(liveRef, (snapshot) => {
    callback((snapshot.val() as Record<string, unknown>) ?? {});
  });
  return () => off(liveRef);
}
