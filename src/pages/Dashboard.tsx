import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllLocalSessions, LocalSession } from "@/hooks/useExamSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { listenToSessions, listenToLive } from "@/integrations/firebase/realtimeService";

const unitNames: Record<number, string> = {
  1: "Unit 1 — Nasi Jamblang",
  2: "Unit 2 — Terasi Cirebon",
  3: "Unit 3 — Empal Gentong",
  4: "Unit 4 — Kerupuk Melarat",
  5: "Unit 5 — Tape Ketan Bakung",
  6: "Unit 6 — Mangrove Ecosystem",
  7: "Unit 7 — Nadran (Sea Ritual)",
  8: "Unit 8 — Rattan Craft Industry",
  9: "Unit 9 — Batik Trusmi",
  10: "Unit 10 — Tahu Gejrot",
};

interface SupabaseSession {
  id: string;
  device_id: string;
  unit: number;
  answers: any;
  score: number | null;
  total: number | null;
  completed: boolean;
  student_id: string | null;
  started_at: string;
  updated_at: string;
  student_profiles?: {
    id: string;
    name: string;
    class: string;
    school: string;
    email: string | null;
    contact: string | null;
    instagram: string | null;
  } | null;
}

const Dashboard = () => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [supabaseSessions, setSupabaseSessions] = useState<SupabaseSession[]>([]);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalSessions: 0,
    completedSessions: 0,
    averageScore: 0,
    averageTimeSpent: 0,
    totalAttempts: 0,
    unitStats: {} as Record<number, { count: number; avgScore: number; avgTime: number }>,
  });
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [viewMode, setViewMode] = useState<"overview" | "students" | "sessions" | "live">("overview");
  const [loading, setLoading] = useState(true);
  // Firebase realtime state
  const [firebaseSessions, setFirebaseSessions] = useState<Record<string, LocalSession>>({});
  const [liveSessions, setLiveSessions] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load local sessions first
        setSessions(getAllLocalSessions());

        // Try to load Supabase data
        if (navigator.onLine) {
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('exam_sessions')
            .select(`
              *,
              student_profiles (
                id,
                name,
                class,
                school,
                email,
                contact,
                instagram
              )
            `)
            .order('started_at', { ascending: false });

          if (sessionsError) {
            console.error('Error loading sessions:', sessionsError);
            toast.error(isId ? 'Gagal memuat data sesi' : 'Failed to load session data');
          } else {
            setSupabaseSessions(sessionsData || []);
          }

          // Load student count
          const { count: studentCount, error: studentError } = await supabase
            .from('student_profiles')
            .select('*', { count: 'exact', head: true });

          if (!studentError) {
            setAnalytics(prev => ({ ...prev, totalStudents: studentCount || 0 }));
          }

          // Calculate analytics
          if (sessionsData) {
            const completed = sessionsData.filter(s => s.completed);
            const totalScore = completed.reduce((sum, s) => sum + (s.score || 0), 0);
            const totalTime = completed.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0);
            const totalAttempts = completed.reduce((sum, s) => {
              const attempts = s.question_attempts as Record<string, number> || {};
              return sum + Object.values(attempts).reduce((a, b) => a + b, 0);
            }, 0);

            const avgScore = completed.length > 0 ? totalScore / completed.length : 0;
            const avgTime = completed.length > 0 ? totalTime / completed.length : 0;

            const unitStats: Record<number, { count: number; avgScore: number; avgTime: number }> = {};
            completed.forEach(s => {
              if (!unitStats[s.unit]) {
                unitStats[s.unit] = { count: 0, avgScore: 0, avgTime: 0 };
              }
              unitStats[s.unit].count++;
              unitStats[s.unit].avgScore += s.score || 0;
              unitStats[s.unit].avgTime += s.time_spent_seconds || 0;
            });

            Object.keys(unitStats).forEach(unit => {
              const u = parseInt(unit);
              unitStats[u].avgScore = unitStats[u].avgScore / unitStats[u].count;
              unitStats[u].avgTime = unitStats[u].avgTime / unitStats[u].count;
            });

            setAnalytics(prev => ({
              ...prev,
              totalSessions: sessionsData.length,
              completedSessions: completed.length,
              averageScore: avgScore,
              averageTimeSpent: avgTime,
              totalAttempts,
              unitStats,
            }));
          }
        } else {
          toast.warning(isId ? 'Offline: Menampilkan data lokal' : 'Offline: Showing local data');
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error(isId ? 'Gagal memuat data dashboard' : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for online/offline events to refresh data
    const handleOnline = () => {
      toast.success(isId ? 'Koneksi kembali, memuat data terbaru' : 'Connection restored, loading latest data');
      loadData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isId]);

  // Firebase realtime listeners
  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) return;
    const unsubSessions = listenToSessions((data) => {
      setFirebaseSessions(data);
    });
    const unsubLive = listenToLive((data) => {
      setLiveSessions(data as Record<string, any>);
    });
    return () => {
      unsubSessions();
      unsubLive();
    };
  }, []);

  // Combine local and Supabase sessions, preferring Supabase for display
  const allSessions = [
    ...supabaseSessions.map(s => ({
      ...s,
      student_name: s.student_profiles?.name,
      student_class: s.student_profiles?.class,
      student_school: s.student_profiles?.school,
      student_email: s.student_profiles?.email,
      student_contact: s.student_profiles?.contact,
      student_instagram: s.student_profiles?.instagram,
    })),
    ...sessions.filter(local => !supabaseSessions.some(remote => remote.id === local.id))
  ];

  const filtered = allSessions.filter(s =>
    filter === "all" ? true : filter === "completed" ? s.completed : !s.completed
  );

  const completedSessions = allSessions.filter(s => s.completed);

  const downloadCSV = () => {
    if (completedSessions.length === 0) return;
    const headers = ["No", "Device ID", "Nama", "Kelas", "Sekolah", "Email", "Kontak", "Instagram", "Unit", "Skor", "Total", "%", "Waktu Mulai", "Waktu Selesai", "Waktu Habis (detik)", "Percobaan"];
    const rows = completedSessions.map((s, i) => [
      i + 1,
      s.device_id,
      s.student_name ?? "",
      s.student_class ?? "",
      s.student_school ?? "",
      s.student_email ?? "",
      s.student_contact ?? "",
      s.student_instagram ? `@${s.student_instagram}` : "",
      unitNames[s.unit] ?? `Unit ${s.unit}`,
      s.score ?? 0,
      s.total ?? 0,
      s.total ? Math.round(((s.score ?? 0) / s.total) * 100) + "%" : "0%",
      new Date(s.started_at).toLocaleString("id-ID"),
      new Date(s.updated_at).toLocaleString("id-ID"),
      s.time_spent_seconds ?? 0,
      Object.values((s as any).question_attempts || {}).reduce((a: number, b: number) => a + b, 0),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil-ujian-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (completedSessions.length === 0) return;
    const blob = new Blob([JSON.stringify(completedSessions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil-ujian-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAnalyticsReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_students: analytics.totalStudents,
        total_sessions: analytics.totalSessions,
        completed_sessions: analytics.completedSessions,
        completion_rate: `${(analytics.completedSessions / Math.max(analytics.totalSessions, 1) * 100).toFixed(1)}%`,
        average_score: `${analytics.averageScore.toFixed(1)}%`,
        average_time_spent_minutes: (analytics.averageTimeSpent / 60).toFixed(1),
        total_question_attempts: analytics.totalAttempts,
      },
      unit_performance: Object.entries(analytics.unitStats).map(([unit, stats]) => ({
        unit: parseInt(unit),
        students_count: stats.count,
        average_score: `${stats.avgScore.toFixed(1)}%`,
        average_time_minutes: (stats.avgTime / 60).toFixed(1),
      })),
      export_timestamp: new Date().toLocaleString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-analitik-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (confirm(isId ? "Hapus semua data sesi? Tindakan ini tidak bisa dibatalkan." : "Delete all session data? This cannot be undone.")) {
      localStorage.removeItem("exam_sessions_local");
      setSessions([]);
    }
  };

  // Group sessions by student for student view
  const studentsData = allSessions.reduce((acc, session) => {
    const studentId = session.student_id || session.device_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        id: studentId,
        name: session.student_name || 'Unknown',
        class: session.student_class || '',
        school: session.student_school || '',
        sessions: [],
        totalScore: 0,
        completedCount: 0,
      };
    }
    acc[studentId].sessions.push(session);
    if (session.completed && session.score) {
      acc[studentId].totalScore += session.score;
      acc[studentId].completedCount++;
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <main className="pt-16 min-h-screen bg-muted/20">
      <div className="max-w-6xl mx-auto px-5 py-10 fade-in-up">

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{analytics.totalStudents}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Siswa" : "Students"}</div>
          </div>
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{analytics.totalSessions}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Total Sesi" : "Total Sessions"}</div>
          </div>
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{analytics.completedSessions}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Selesai" : "Completed"}</div>
          </div>
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{analytics.averageScore.toFixed(1)}%</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Rata-rata Skor" : "Avg Score"}</div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{Math.floor(analytics.averageTimeSpent / 60)}m {Math.floor(analytics.averageTimeSpent % 60)}s</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Waktu Rata-rata" : "Avg Time"}</div>
          </div>
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{analytics.totalAttempts}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Total Percobaan" : "Total Attempts"}</div>
          </div>
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{(analytics.completedSessions / Math.max(analytics.totalSessions, 1) * 100).toFixed(1)}%</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Tingkat Penyelesaian" : "Completion Rate"}</div>
          </div>
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{Object.keys(analytics.unitStats).length}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{isId ? "Unit Aktif" : "Active Units"}</div>
          </div>
        </div>

        {/* Unit Performance */}
        {Object.keys(analytics.unitStats).length > 0 && (
          <div className="bg-white rounded-xl border border-border/50 p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">{isId ? "Performa per Unit" : "Unit Performance"}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(analytics.unitStats).map(([unit, stats]) => (
                <div key={unit} className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-primary mb-1">Unit {unit}</div>
                  <div className="text-[11px] text-muted-foreground mb-1">{stats.count} {isId ? "siswa" : "students"}</div>
                  <div className="text-[12px] font-semibold text-green-600 mb-1">{stats.avgScore.toFixed(1)}%</div>
                  <div className="text-[10px] text-muted-foreground">{Math.floor(stats.avgTime / 60)}m {Math.floor(stats.avgTime % 60)}s</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode Selector */}
        <div className="flex gap-1 mb-4 bg-muted/40 p-1 rounded-lg w-fit">
          {[
            { key: "overview", label: isId ? "Ringkasan" : "Overview" },
            { key: "students", label: isId ? "Siswa" : "Students" },
            { key: "sessions", label: isId ? "Sesi" : "Sessions" },
            { key: "live", label: isId ? "🔴 Live" : "🔴 Live" },
          ].map(mode => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key as any)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${viewMode === mode.key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-foreground mb-1">
              {isId ? "Dashboard Admin" : "Admin Dashboard"}
            </h1>
            <p className="text-xs text-muted-foreground mb-1">
              {analytics.completedSessions} {isId ? "sesi selesai dari" : "completed sessions from"} {analytics.totalStudents} {isId ? "siswa" : "students"}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {navigator.onLine ? (isId ? "Online" : "Online") : (isId ? "Offline" : "Offline")}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {completedSessions.length > 0 && (
              <>
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-800 hover:bg-green-700 text-white text-[12px] font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  CSV
                </button>
                <button
                  onClick={() => downloadJSON()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  JSON
                </button>
                <button
                  onClick={() => downloadAnalyticsReport()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-800 hover:bg-purple-700 text-white text-[12px] font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Report
                </button>
              </>
            )}
            {allSessions.length > 0 && (
              <button onClick={clearAll} className="px-3 py-2 text-[12px] text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg transition-colors">
                {isId ? "Hapus Semua" : "Clear All"}
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {allSessions.length > 0 && (
          <div className="flex gap-1 mb-4 bg-muted/40 p-1 rounded-lg w-fit">
            {(["all", "completed", "incomplete"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${filter === f ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f === "all" ? (isId ? "Semua" : "All") : f === "completed" ? (isId ? "Selesai" : "Completed") : (isId ? "Belum Selesai" : "Incomplete")}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-border/50 p-8 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              {isId ? "Memuat data..." : "Loading data..."}
            </p>
          </div>
        ) : allSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-border/50 p-8 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              {isId ? "Belum ada riwayat pengerjaan." : "No exam history yet."}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border/50 p-6 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">{isId ? "Tidak ada data." : "No data."}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
            {filtered.map((s, i) => (
              <div key={s.id} className={`px-5 py-4 ${i > 0 ? "border-t border-border/40" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-foreground">{unitNames[s.unit] ?? `Unit ${s.unit}`}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.completed ? (isId ? "Selesai" : "Done") : (isId ? "Belum Selesai" : "Incomplete")}
                      </span>
                    </div>
                    {s.student_name && (
                      <p className="text-[12px] font-medium text-primary">{s.student_name} · {s.student_class} · {s.student_school}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {s.student_email && <span className="text-[10px] text-muted-foreground">{s.student_email}</span>}
                      {s.student_contact && <span className="text-[10px] text-muted-foreground">{s.student_contact}</span>}
                      {s.student_instagram && <span className="text-[10px] text-muted-foreground">@{s.student_instagram}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(s.started_at).toLocaleString(isId ? "id-ID" : "en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {s.completed && s.score !== null && s.total !== null && (
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-foreground">
                        {s.score}<span className="text-sm font-normal text-muted-foreground">/{s.total}</span>
                      </div>
                      <div className={`text-[11px] font-bold mt-0.5 ${
                        (s.score / s.total) >= 0.8 ? "text-green-600" : (s.score / s.total) >= 0.5 ? "text-amber-600" : "text-red-500"
                      }`}>
                        {Math.round((s.score / s.total) * 100)}%
                      </div>
                    </div>
                  )}
                  {!s.completed && (
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-muted-foreground">
                        {Object.keys(s.answers || {}).length} {isId ? "dijawab" : "answered"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Student Progress View */}
        {viewMode === "students" && (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40">
              <h3 className="font-semibold text-sm">{isId ? "Progress Siswa" : "Student Progress"}</h3>
            </div>
            {Object.values(studentsData).map((student: any) => (
              <div key={student.id} className="px-5 py-4 border-b border-border/40 last:border-b-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-foreground">{student.name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {student.completedCount} {isId ? "selesai" : "completed"}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">{student.class} · {student.school}</p>
                    <div className="mt-2 flex gap-2">
                      {student.sessions.map((session: any) => (
                        <div key={session.id} className="text-center">
                          <div className="text-[11px] font-medium">Unit {session.unit}</div>
                          <div className={`text-[10px] ${session.completed ? 'text-green-600' : 'text-amber-600'}`}>
                            {session.completed ? `${session.score}/${session.total}` : 'Incomplete'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {student.completedCount > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {(student.totalScore / student.completedCount).toFixed(1)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {isId ? "Rata-rata" : "Average"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Monitoring View — Firebase Realtime */}
        {viewMode === "live" && (
          <div className="space-y-4">
            {/* Live active exams */}
            <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-red-700">
                  {isId ? "Ujian Berlangsung" : "Active Exams"} ({Object.keys(liveSessions).length})
                </p>
              </div>
              {Object.keys(liveSessions).length === 0 ? (
                <div className="px-5 py-6 text-center text-[12px] text-muted-foreground">
                  {isId ? "Tidak ada ujian yang sedang berlangsung." : "No active exams right now."}
                </div>
              ) : (
                Object.entries(liveSessions).map(([deviceId, live]: [string, any]) => (
                  <div key={deviceId} className="px-5 py-4 border-b border-border/40 last:border-b-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">
                          {live.studentName ?? (isId ? "Siswa tidak dikenal" : "Unknown student")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Unit {live.unit} · {Object.keys(live.answers ?? {}).length} {isId ? "soal dijawab" : "answered"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {isId ? "Terakhir aktif:" : "Last seen:"} {live.lastSeen ? new Date(live.lastSeen).toLocaleTimeString() : "—"}
                        </p>
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        {isId ? "Sedang ujian" : "In progress"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Firebase completed sessions */}
            <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border/40">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
                  {isId ? "Sesi Selesai (Firebase Realtime)" : "Completed Sessions (Firebase Realtime)"} ({Object.values(firebaseSessions).filter(s => s.completed).length})
                </p>
              </div>
              {Object.values(firebaseSessions).filter(s => s.completed).length === 0 ? (
                <div className="px-5 py-6 text-center text-[12px] text-muted-foreground">
                  {isId ? "Belum ada data dari Firebase." : "No Firebase data yet."}
                </div>
              ) : (
                Object.values(firebaseSessions)
                  .filter(s => s.completed)
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((s) => (
                    <div key={s.id} className="px-5 py-4 border-b border-border/40 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">
                            {s.student_name ?? "—"} · {s.student_class ?? "—"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {unitNames[s.unit] ?? `Unit ${s.unit}`} · {s.student_school ?? "—"}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(s.updated_at).toLocaleString(isId ? "id-ID" : "en-US")}
                          </p>
                        </div>
                        {s.score !== null && s.total !== null && (
                          <div className="text-right shrink-0">
                            <div className="text-xl font-bold text-foreground">
                              {s.score}<span className="text-sm font-normal text-muted-foreground">/{s.total}</span>
                            </div>
                            <div className={`text-[11px] font-bold mt-0.5 ${
                              (s.score / s.total!) >= 0.8 ? "text-green-600" : (s.score / s.total!) >= 0.5 ? "text-amber-600" : "text-red-500"
                            }`}>
                              {Math.round((s.score / s.total!) * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Detailed Sessions View */}
        {viewMode === "sessions" && (
          <>
            {/* Filter tabs */}
            <div className="flex gap-1 mb-4 bg-muted/40 p-1 rounded-lg w-fit">
              {(["all", "completed", "incomplete"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${filter === f ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {f === "all" ? (isId ? "Semua" : "All") : f === "completed" ? (isId ? "Selesai" : "Completed") : (isId ? "Belum Selesai" : "Incomplete")}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40">
                <h3 className="font-semibold text-sm">{isId ? "Detail Sesi" : "Session Details"}</h3>
              </div>
              {filtered.map((s, i) => (
                <div key={s.id} className={`px-5 py-4 ${i > 0 ? "border-t border-border/40" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold text-foreground">{unitNames[s.unit] ?? `Unit ${s.unit}`}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {s.completed ? (isId ? "Selesai" : "Done") : (isId ? "Belum Selesai" : "Incomplete")}
                        </span>
                      </div>
                      {s.student_name && (
                        <p className="text-[12px] font-medium text-primary">{s.student_name} · {s.student_class} · {s.student_school}</p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        <span className="text-[10px] text-muted-foreground">ID: {s.device_id.slice(0, 8)}...</span>
                        {s.student_email && <span className="text-[10px] text-muted-foreground">{s.student_email}</span>}
                        {s.student_contact && <span className="text-[10px] text-muted-foreground">{s.student_contact}</span>}
                        {s.time_spent_seconds && (
                          <span className="text-[10px] text-muted-foreground">
                            {Math.floor((s.time_spent_seconds) / 60)}m {Math.floor((s.time_spent_seconds) % 60)}s
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(s.started_at).toLocaleString(isId ? "id-ID" : "en-US", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    {s.completed && s.score !== null && s.total !== null && (
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-foreground">
                          {s.score}<span className="text-sm font-normal text-muted-foreground">/{s.total}</span>
                        </div>
                        <div className={`text-[11px] font-bold mt-0.5 ${
                          (s.score / s.total) >= 0.8 ? "text-green-600" : (s.score / s.total) >= 0.5 ? "text-amber-600" : "text-red-500"
                        }`}>
                          {Math.round((s.score / s.total) * 100)}%
                        </div>
                        {((s as any).question_attempts) && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {Object.values((s as any).question_attempts).reduce((a: number, b: number) => a + b, 0)} attempts
                          </div>
                        )}
                      </div>
                    )}
                    {!s.completed && (
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-muted-foreground">
                          {Object.keys(s.answers || {}).length} {isId ? "dijawab" : "answered"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
