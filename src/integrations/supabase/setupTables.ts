import { supabase } from "./client";

/**
 * Auto-detects Supabase table availability on app startup.
 * Logs status to console. App works even if tables are missing (graceful fallback).
 */
export async function detectSupabaseTables(): Promise<{ studentProfiles: boolean; examSessions: boolean }> {
  const [profilesCheck, sessionsCheck] = await Promise.all([
    supabase.from("student_profiles").select("id").limit(1),
    supabase.from("exam_sessions").select("id").limit(1),
  ]);

  const studentProfiles = !profilesCheck.error || profilesCheck.error.code !== "42P01";
  const examSessions = !sessionsCheck.error || sessionsCheck.error.code !== "42P01";

  if (!studentProfiles || !examSessions) {
    console.warn(
      "[Supabase] Some tables are missing. Run supabase/migrations/20260404150000_complete_setup.sql in your Supabase SQL Editor.",
      { studentProfiles, examSessions }
    );
  } else {
    console.log("[Supabase] All tables detected OK.", { studentProfiles, examSessions });
  }

  return { studentProfiles, examSessions };
}
