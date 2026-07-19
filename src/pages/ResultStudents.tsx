import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { listenToSessions } from "@/integrations/firebase/realtimeService";
import type { LocalSession } from "@/hooks/useExamSession";

const unitNames: Record<number, string> = {
  1: "Unit 1 — Nasi Jamblang",
  2: "Unit 2 — Terasi Cirebon",
  3: "Unit 3 — Empal Gentong",
  4: "Unit 4 — Kerupuk Melarat",
  5: "Unit 5 — Tape Ketan Bakung",
  6: "Unit 6 — Mangrove Ecosystem",
  7: "Unit 7 — Nadran",
  8: "Unit 8 — Rattan Craft",
  9: "Unit 9 — Batik Trusmi",
  10: "Unit 10 — Tahu Gejrot",
};

const ResultStudents = () => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyCompleted, setOnlyCompleted] = useState(true);

  useEffect(() => {
    const unsub = listenToSessions((rec) => {
      setSessions(Object.values(rec));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let list = [...sessions];
    if (onlyCompleted) list = list.filter((s) => s.completed);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((s) =>
        (s.student_name ?? "").toLowerCase().includes(q) ||
        (s.student_class ?? "").toLowerCase().includes(q) ||
        (s.student_school ?? "").toLowerCase().includes(q) ||
        String(s.unit).includes(q)
      );
    }
    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return list;
  }, [sessions, query, onlyCompleted]);

  const stats = useMemo(() => {
    const done = sessions.filter((s) => s.completed && typeof s.score === "number");
    const avg = done.length ? Math.round(done.reduce((a, s) => a + (s.score ?? 0), 0) / done.length) : 0;
    return { total: sessions.length, completed: done.length, avg };
  }, [sessions]);

  const statusOf = (s: LocalSession) => {
    if (s.completed) return isId ? "Selesai" : "Done";
    if (s.answers && Object.keys(s.answers).length) return isId ? "Proses" : "In progress";
    return "—";
  };

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["No", "Nama", "Kelas", "Sekolah", "Kontak", "Instagram", "Unit", "Skor", "Total", "%", "Waktu Mulai", "Waktu Selesai"];
    const rows = filtered.map((s, i) => [
      i + 1,
      s.student_name ?? "",
      s.student_class ?? "",
      s.student_school ?? "",
      s.student_contact ?? "",
      s.student_instagram ? `@${s.student_instagram}` : "",
      unitNames[s.unit] ?? `Unit ${s.unit}`,
      s.score ?? 0,
      s.total ?? 0,
      s.total ? Math.round(((s.score ?? 0) / s.total) * 100) + "%" : "0%",
      new Date(s.started_at).toLocaleString("id-ID"),
      new Date(s.updated_at).toLocaleString("id-ID"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil-siswa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-medium text-foreground">
                {isId ? "Hasil Siswa" : "Student Results"}
              </h1>
              <p className="text-[12px] text-muted-foreground mt-1">
                {isId ? "Tampilan hasil ujian yang tersimpan di Firebase (akses langsung via URL)." : "Stored exam results from Firebase (direct URL access)."}
              </p>
            </div>
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="px-4 py-2 text-[12px] font-semibold rounded-full border-2 border-border bg-white text-foreground hover:bg-muted/40 transition-all disabled:opacity-40 btn-3d"
            >
              {isId ? "Ekspor CSV" : "Export CSV"}
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: isId ? "Total Sesi" : "Total Sessions", value: stats.total },
              { label: isId ? "Selesai" : "Completed", value: stats.completed },
              { label: isId ? "Rata-rata Skor" : "Avg Score", value: stats.avg },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-border/40 shadow-sm p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{c.label}</p>
                <p className="font-display text-3xl font-bold text-primary mt-1">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isId ? "Cari nama, kelas, sekolah, unit…" : "Search name, class, school, unit…"}
            className="flex-1 min-w-[200px] h-10 px-4 rounded-full border border-border/60 bg-white text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <button
            onClick={() => setOnlyCompleted((v) => !v)}
            className={`px-4 py-2 text-[12px] font-semibold rounded-full border-2 transition-all btn-3d ${
              onlyCompleted ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground"
            }`}
          >
            {isId ? "Hanya Selesai" : "Completed only"}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-muted/40 border-b border-border/40">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {isId ? `Daftar Hasil (${filtered.length})` : `Results List (${filtered.length})`}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">{isId ? "Memuat…" : "Loading…"}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {isId ? "Belum ada hasil yang tersimpan." : "No stored results yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border/40 bg-muted/20">
                    <th className="px-4 py-2.5 font-semibold">#</th>
                    <th className="px-4 py-2.5 font-semibold">{isId ? "Nama" : "Name"}</th>
                    <th className="px-4 py-2.5 font-semibold">{isId ? "Kelas" : "Class"}</th>
                    <th className="px-4 py-2.5 font-semibold">{isId ? "Sekolah" : "School"}</th>
                    <th className="px-4 py-2.5 font-semibold">{isId ? "Unit" : "Unit"}</th>
                    <th className="px-4 py-2.5 font-semibold text-center">{isId ? "Skor" : "Score"}</th>
                    <th className="px-4 py-2.5 font-semibold text-center">%</th>
                    <th className="px-4 py-2.5 font-semibold">{isId ? "Waktu" : "Time"}</th>
                    <th className="px-4 py-2.5 font-semibold">{isId ? "Status" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((s, i) => {
                    const pct = s.total ? Math.round(((s.score ?? 0) / s.total) * 100) : 0;
                    return (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{s.student_name ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.student_class ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.student_school ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{unitNames[s.unit] ?? `Unit ${s.unit}`}</td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {typeof s.score === "number" ? `${s.score}/${s.total ?? "?"}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                            {typeof s.score === "number" ? `${pct}%` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(s.updated_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            s.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {statusOf(s)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultStudents;
