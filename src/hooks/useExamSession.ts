import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getQuestionsForUnit } from "@/data/examQuestions";
import {
  syncSessionToFirebase,
  updateLiveState,
  clearLiveState,
  syncStudentToFirebase,
  syncEssaysToFirebase,
} from "@/integrations/firebase/realtimeService";

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  let id = localStorage.getItem("exam_device_id");
  if (!id) {
    id = generateUUID();
    localStorage.setItem("exam_device_id", id);
  }
  return id;
}

export interface LocalSession {
  id: string;
  device_id: string;
  unit: number;
  answers: Record<string, unknown>;
  completed: boolean;
  score: number | null;
  total: number | null;
  started_at: string;
  updated_at: string;
  student_id: string | null;
  student_name: string | null;
  student_class: string | null;
  student_school: string | null;
  student_email: string | null;
  student_contact: string | null;
  student_instagram: string | null;
  time_spent_seconds?: number;
  question_attempts?: Record<string, number>; // Track how many times each question was attempted
}

const SESSIONS_KEY = "exam_sessions_local";

function getAllSessions(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: LocalSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// Sync session to both Supabase and Firebase
async function syncSession(session: LocalSession) {
  // Firebase — always attempt (handles offline gracefully internally)
  syncSessionToFirebase(session);
  
  // Sync Essays specifically for Firebase to the dedicated path
  try {
    const questions = getQuestionsForUnit(session.unit);
    if (questions && questions.length > 0) {
      const essayQs = questions.filter((q: any) => q.type === "open");
      const essaysToSync = essayQs
        .map(q => ({
          questionId: q.id.toString(),
          question: q.questionIdn || q.question,
          answer: session.answers[q.id.toString()] as string
        }))
        .filter(e => typeof e.answer === "string" && e.answer.trim().length > 0);
      
      if (essaysToSync.length > 0) {
        syncEssaysToFirebase(session.id, session.student_id, session.unit, essaysToSync);
      }
    }
  } catch (err) {
    console.error("[Firebase] sync essays error:", err);
  }

  // Supabase — existing logic below
  return syncSessionToSupabase(session);
}

// Sync session to Supabase with offline handling
async function syncSessionToSupabase(session: LocalSession) {
  // Check if we're online
  if (!navigator.onLine) {
    console.log('Offline: Session will sync when online');
    // Mark for retry when back online
    localStorage.setItem(`sync_pending_${session.id}`, 'true');
    return;
  }

  try {
    const { error } = await supabase
      .from('exam_sessions')
      .upsert({
        id: session.id,
        device_id: session.device_id,
        unit: session.unit,
        answers: session.answers,
        score: session.score,
        total: session.total,
        completed: session.completed,
        student_id: session.student_id,
        started_at: session.started_at,
        updated_at: session.updated_at,
        time_spent_seconds: session.time_spent_seconds,
        question_attempts: session.question_attempts,
      });

    if (error) {
      console.error('Error syncing session to Supabase:', error);
      // Mark for retry
      localStorage.setItem(`sync_pending_${session.id}`, 'true');
    } else {
      // Clear pending sync flag
      localStorage.removeItem(`sync_pending_${session.id}`);

      // SYNC ESSAYS TO `essay_answers` TABLE
      try {
        const questions = getQuestionsForUnit(session.unit);
        if (questions && questions.length > 0 && session.student_id) {
          const essayQs = questions.filter((q: any) => q.type === "open");
          for (const eq of essayQs) {
            const answerText = session.answers[eq.id];
            if (typeof answerText === "string" && answerText.trim().length > 0) {
              await supabase.from('essay_answers').upsert({
                session_id: session.id,
                student_id: session.student_id,
                unit: session.unit,
                question_id: eq.id.toString(),
                answer_text: answerText,
              }, { onConflict: 'session_id, question_id' });
            }
          }
        }
      } catch (err) {
        console.error("Error syncing essays to separate table:", err);
      }
    }
  } catch (error) {
    console.error('Error syncing session:', error);
    localStorage.setItem(`sync_pending_${session.id}`, 'true');
  }
}

// Retry pending syncs when back online
function retryPendingSyncs() {
  const keys = Object.keys(localStorage);
  
  // Pending Exam Sessions
  const pendingSessionKeys = keys.filter(key => key.startsWith('sync_pending_') && !key.startsWith('sync_pending_login_') && !key.startsWith('sync_pending_profile_'));
  pendingSessionKeys.forEach(key => {
    const sessionId = key.replace('sync_pending_', '');
    const sessions = getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      console.log('Retrying sync for session:', sessionId);
      syncSessionToSupabase(session);
    } else {
      localStorage.removeItem(key);
    }
  });

  // Pending Logins
  const pendingLoginKeys = keys.filter(key => key.startsWith('sync_pending_login_'));
  pendingLoginKeys.forEach(async key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const { error } = await supabase.from('login_sessions').insert(data);
      if (!error) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Pending Profiles
  const pendingProfileKeys = keys.filter(key => key.startsWith('sync_pending_profile_'));
  pendingProfileKeys.forEach(async key => {
    try {
      const p = JSON.parse(localStorage.getItem('studentProfile') || '{}');
      if (p.id) {
        const { error } = await supabase.from('student_profiles').upsert({
          id: p.id,
          device_id: localStorage.getItem("exam_device_id") || p.id,
          name: p.name,
          class: p.class,
          school: p.school,
          contact: p.contact,
          instagram: p.instagram,
        });
        if (!error) {
          localStorage.removeItem(key);
        }
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error(e);
    }
  });
}

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, retrying pending syncs');
    retryPendingSyncs();
  });
}

interface UseExamSessionProps {
  unit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  answers: Record<number, string | string[]>;
  enabled: boolean;
  studentId?: string;
}

export function useExamSession({ unit, answers, enabled, studentId }: UseExamSessionProps) {
  const sessionIdRef = useRef<string | null>(null);
  const deviceId = getDeviceId();
  const startTimeRef = useRef<number>(Date.now());
  const questionAttemptsRef = useRef<Record<string, number>>({});

  // Get student profile for denormalized storage
  const getStudentProfile = () => {
    try {
      const p = JSON.parse(localStorage.getItem("studentProfile") || "{}");
      return p;
    } catch {
      return {};
    }
  };

  // Create session on mount
  useEffect(() => {
    if (!enabled) return;
    const profile = getStudentProfile();
    const sessionId = generateUUID();
    sessionIdRef.current = sessionId;

    const session: LocalSession = {
      id: sessionId,
      device_id: deviceId,
      unit,
      answers: {},
      completed: false,
      score: null,
      total: null,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student_id: studentId ?? null,
      student_name: profile.name ?? null,
      student_class: profile.class ?? null,
      student_school: profile.school ?? null,
      student_email: profile.email ?? null,
      student_contact: profile.contact ?? null,
      student_instagram: profile.instagram ?? null,
      time_spent_seconds: 0,
      question_attempts: {},
    };

    const all = getAllSessions();
    all.unshift(session);
    saveSessions(all);

    // Sync to Supabase + Firebase
    syncSession(session);

    // Sync student profile to Firebase
    if (profile.id) {
      syncStudentToFirebase({
        id: profile.id,
        name: profile.name,
        class: profile.class,
        school: profile.school,
        email: profile.email,
        contact: profile.contact,
        instagram: profile.instagram,
      });
    }

    return () => {
      // Clear live state when exam unmounts
      clearLiveState(deviceId);
    };
  }, [unit, enabled]);

  // Auto-save answers
  useEffect(() => {
    if (!enabled || !sessionIdRef.current) return;
    const timer = setTimeout(() => {
      const all = getAllSessions();
      const idx = all.findIndex(s => s.id === sessionIdRef.current);
      if (idx !== -1) {
        all[idx].answers = answers as Record<string, unknown>;
        all[idx].time_spent_seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        all[idx].question_attempts = questionAttemptsRef.current;
        all[idx].updated_at = new Date().toISOString();
        saveSessions(all);

        // Sync to Supabase + Firebase
        syncSession(all[idx]);

        // Update live state in Firebase
        const profile = getStudentProfile();
        updateLiveState(deviceId, unit, answers as Record<string, unknown>, 0, profile.name);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [answers, enabled]);

  const completeSession = async (score: number, total: number) => {
    if (!sessionIdRef.current) return;
    const all = getAllSessions();
    const idx = all.findIndex(s => s.id === sessionIdRef.current);
    if (idx !== -1) {
      all[idx].completed = true;
      all[idx].score = score;
      all[idx].total = total;
      all[idx].time_spent_seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      all[idx].question_attempts = questionAttemptsRef.current;
      all[idx].updated_at = new Date().toISOString();
      saveSessions(all);

      // Sync completed session to Supabase + Firebase
      await syncSession(all[idx]);

      // Clear live state — exam done
      clearLiveState(deviceId);

      toast.success("Session completed and synced!");
    }
  };

  const trackQuestionAttempt = (questionId: string) => {
    questionAttemptsRef.current[questionId] = (questionAttemptsRef.current[questionId] || 0) + 1;
  };

  return { completeSession, deviceId, trackQuestionAttempt };
}

export async function saveCompletedSession(unit: number, answers: Record<string, unknown>, score: number, total: number) {
  const deviceId = getDeviceId();
  const profile = (() => { try { return JSON.parse(localStorage.getItem("studentProfile") || "{}"); } catch { return {}; } })();
  const session: LocalSession = {
    id: generateUUID(),
    device_id: deviceId,
    unit,
    answers,
    completed: true,
    score,
    total,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student_id: profile.id ?? null,
    student_name: profile.name ?? null,
    student_class: profile.class ?? null,
    student_school: profile.school ?? null,
    student_email: profile.email ?? null,
    student_contact: profile.contact ?? null,
    student_instagram: profile.instagram ?? null,
  };
  const all = getAllSessions();
  all.unshift(session);
  saveSessions(all);

  // Sync to Supabase + Firebase
  await syncSession(session);

  return session.id;
}

export function getAllLocalSessions(): LocalSession[] {
  return getAllSessions();
}
