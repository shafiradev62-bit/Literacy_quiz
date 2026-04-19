import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard, BookOpen, PenTool, Settings,
  Save, Plus, Trash2, Edit3, ChevronRight,
  Globe, CheckCircle, X, Table2
} from "lucide-react";
import {
  ExamQuestion,
  getQuestionsForUnit
} from "@/data/examQuestions";
import {
  UnitMeta,
  UnitStimulus,
  getUnitMeta,
  getUnitStimulus,
  SiteConfig,
  getSiteConfig
} from "@/data/appContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type AdminPage = "units" | "stimulus" | "questions" | "config";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="space-y-1 mb-6">
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
  </div>
);

const FieldInput = ({ label, value, onChange, placeholder, multiline = false, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; rows?: number;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
    {multiline ? (
      <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="bg-white border-border/60 focus-visible:ring-primary shadow-sm text-[13px]" />
    ) : (
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="h-11 bg-white border-border/60 focus-visible:ring-primary shadow-sm text-[13px]" />
    )}
  </div>
);

const LangTabs = ({ children }: { children: [React.ReactNode, React.ReactNode] }) => {
  const [tab, setTab] = useState<"en" | "id">("en");
  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border border-border/40 w-fit">
        <button onClick={() => setTab("en")}
          className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${tab === "en" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          English
        </button>
        <button onClick={() => setTab("id")}
          className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${tab === "id" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Bahasa Indonesia
        </button>
      </div>
      {tab === "en" ? children[0] : children[1]}
    </div>
  );
};

const AdminPortal = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const { lang } = useLanguage();
  const isId = lang === "id";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthorized(true);
      toast.success("Welcome back, teacher!");
    } else {
      toast.error(isId ? "Password salah!" : "Incorrect password!");
    }
  };

  const [activePage, setActivePage] = useState<AdminPage>("units");
  const [selectedUnit, setSelectedUnit] = useState(1);

  const [unitMeta, setUnitMeta] = useState<UnitMeta>(() => getUnitMeta(1));
  const [unitStimulus, setUnitStimulus] = useState<UnitStimulus>(() => getUnitStimulus(1));
  const [questions, setQuestions] = useState<ExamQuestion[]>(() => getQuestionsForUnit(1));
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => getSiteConfig());

  useEffect(() => {
    setUnitMeta(getUnitMeta(selectedUnit));
    setUnitStimulus(getUnitStimulus(selectedUnit));
    setQuestions(getQuestionsForUnit(selectedUnit));
    setEditingQuestion(null);
  }, [selectedUnit]);

  const saveUnitMeta = () => {
    localStorage.setItem(`admin_unit_meta_${selectedUnit}`, JSON.stringify(unitMeta));
    toast.success(`Unit ${selectedUnit} saved!`);
  };
  const saveUnitStimulus = () => {
    localStorage.setItem(`admin_unit_stimulus_${selectedUnit}`, JSON.stringify(unitStimulus));
    toast.success(`Unit ${selectedUnit} stimulus saved!`);
  };
  const saveSiteConfig = () => {
    localStorage.setItem('admin_site_config', JSON.stringify(siteConfig));
    toast.success("Site config saved!");
  };
  const saveQuestions = (newQuestions: ExamQuestion[]) => {
    localStorage.setItem(`admin_questions_unit_${selectedUnit}`, JSON.stringify(newQuestions));
    setQuestions(newQuestions);
  };
  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;
    const updated = questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
    saveQuestions(updated);
    setEditingQuestion(null);
    toast.success("Question updated!");
  };

  const NavBtn = ({ id, label }: { id: AdminPage; label: string }) => {
    const icons: Record<string, React.ReactNode> = {
      units: <BookOpen className="w-4 h-4" />,
      stimulus: <PenTool className="w-4 h-4" />,
      questions: <LayoutDashboard className="w-4 h-4" />,
      config: <Settings className="w-4 h-4" />,
    };
    return (
      <button onClick={() => setActivePage(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
          activePage === id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted"
        }`}>
        {icons[id]}{label}
      </button>
    );
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA] p-6">
        <Card className="w-full max-w-md shadow-xl border-border/40">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-display">{isId ? "Akses Terbatas" : "Restricted Access"}</CardTitle>
            <CardDescription className="text-xs">
              {isId ? "Silakan masukkan kata sandi guru untuk melanjutkan." : "Please enter the teacher's password to continue."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isId ? "Masukkan kata sandi..." : "Enter password..."}
                  className="h-12 bg-muted/50 border-border/60 text-center text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-11 text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                {isId ? "Masuk Panel Admin" : "Enter Admin Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-60 bg-white border-r border-border/40 p-5 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-tight">Master Admin</h2>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Control Panel</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-2">Select Unit</p>
          <div className="grid grid-cols-5 gap-1.5 p-2 bg-muted/40 rounded-xl border border-border/40">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
              <button key={val} onClick={() => setSelectedUnit(val)}
                className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  selectedUnit === val ? "bg-primary text-white shadow-sm" : "hover:bg-white/60 text-muted-foreground"
                }`}>
                {val}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavBtn id="units" label="Unit Identity" />
          <NavBtn id="stimulus" label="Reading Stimulus" />
          <NavBtn id="questions" label="Question Bank" />
          <div className="my-3 border-t border-border/40" />
          <NavBtn id="config" label="Site Settings" />
        </nav>

        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
          <p className="text-[9px] font-bold text-green-700 uppercase tracking-widest mb-1.5">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-medium text-green-700">All settings saved locally</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-border/40 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-lg font-display font-medium capitalize">{activePage.replace("_", " ")}</h1>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="font-bold text-primary">Unit {selectedUnit}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Customizable Content</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('/quiz', '_blank')}>
              <Globe className="w-4 h-4" /> View Quiz
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-8">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* ═══ UNITS PAGE ═══ */}
            {activePage === "units" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-medium">Unit {selectedUnit} Identity</h2>
                    <p className="text-[11px] text-muted-foreground mt-1">Customize unit title, subtitle, theme, and media assets</p>
                  </div>
                  <Button onClick={saveUnitMeta} className="gap-2 rounded-xl shadow-lg">
                    <Save className="w-4 h-4" /> Save Unit
                  </Button>
                </div>

                {/* Title & Subtitle */}
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                      Title & Subtitle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <FieldInput label="Unit Title (shared across languages)" value={unitMeta.title}
                      onChange={v => setUnitMeta({ ...unitMeta, title: v })} placeholder="e.g. Unit 1" />
                    <FieldInput label="Subtitle (EN)" value={unitMeta.subtitle}
                      onChange={v => setUnitMeta({ ...unitMeta, subtitle: v })} placeholder="e.g. Nasi Jamblang (Teak Leaf Food Packaging)" />
                  </CardContent>
                </Card>

                {/* Theme */}
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                      Theme Description
                    </CardTitle>
                    <CardDescription className="text-[11px]">The theme appears on the unit card and intro screen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <LangTabs>
                      <FieldInput label="Theme Description (English)" value={unitMeta.themeEn}
                        onChange={v => setUnitMeta({ ...unitMeta, themeEn: v })} multiline rows={4}
                        placeholder="Describe the sustainability theme in English..." />
                      <FieldInput label="Deskripsi Tema (Bahasa Indonesia)" value={unitMeta.themeId}
                        onChange={v => setUnitMeta({ ...unitMeta, themeId: v })} multiline rows={4}
                        placeholder="Jelaskan tema keberlanjutan dalam Bahasa Indonesia..." />
                    </LangTabs>
                  </CardContent>
                </Card>

                {/* Media */}
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                      Media Assets
                    </CardTitle>
                    <CardDescription className="text-[11px]">Image and video shown on the unit card and intro</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-5">
                    <FieldInput label="Image URL" value={unitMeta.imageUrl || ""}
                      onChange={v => setUnitMeta({ ...unitMeta, imageUrl: v })} placeholder="/images/unit1.png" />
                    <FieldInput label="Video URL" value={unitMeta.videoUrl || ""}
                      onChange={v => setUnitMeta({ ...unitMeta, videoUrl: v })} placeholder="/videos/unit1-nasi-jamblang.mp4" />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ STIMULUS PAGE ═══ */}
            {activePage === "stimulus" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-medium">Reading Stimulus — Unit {selectedUnit}</h2>
                    <p className="text-[11px] text-muted-foreground mt-1">Customize the stimulus text shown to students before questions</p>
                  </div>
                  <Button onClick={saveUnitStimulus} className="gap-2 rounded-xl shadow-lg">
                    <Save className="w-4 h-4" /> Save Stimulus
                  </Button>
                </div>

                {/* Title & Introduction */}
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                      Title & Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <LangTabs>
                      <FieldInput label="Article Title (English)" value={unitStimulus?.titleEn || ""}
                        onChange={v => setUnitStimulus({ ...unitStimulus!, titleEn: v })}
                        placeholder="e.g. Nasi Jamblang: Tradition or Sustainable Solution?" />
                      <FieldInput label="Judul Artikel (Bahasa Indonesia)" value={unitStimulus?.titleId || ""}
                        onChange={v => setUnitStimulus({ ...unitStimulus!, titleId: v })}
                        placeholder="e.g. Nasi Jamblang: Tradisi atau Solusi Berkelanjutan?" />
                    </LangTabs>
                  </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                      Introduction / Article Body
                    </CardTitle>
                    <CardDescription className="text-[11px]">Full stimulus text shown in the reading panel (supports HTML/line breaks)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <LangTabs>
                      <FieldInput label="Introduction (English)" value={unitStimulus?.introductionEn || ""}
                        onChange={v => setUnitStimulus({ ...unitStimulus!, introductionEn: v })}
                        multiline rows={10} placeholder="Paste full English stimulus text here..." />
                      <FieldInput label="Pendahuluan / Isi Artikel (Indonesia)" value={unitStimulus?.introductionId || ""}
                        onChange={v => setUnitStimulus({ ...unitStimulus!, introductionId: v })}
                        multiline rows={10} placeholder="Tempelkan teks stimulus Bahasa Indonesia di sini..." />
                    </LangTabs>
                  </CardContent>
                </Card>

                {/* Table Data */}
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-primary" />
                      Table Data (Optional)
                    </CardTitle>
                    <CardDescription className="text-[11px]">Add structured data for student analysis. Source: current source code — edit via developer tools or update StimulusPanel.tsx directly.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-[12px] text-amber-700">
                      <p className="font-semibold mb-1">Table data is currently managed via source code for Units 1–7.</p>
                      <p className="text-[11px]">To update tables, edit the <code className="bg-amber-100 px-1 rounded">StimulusPanel.tsx</code> component directly. Future versions will support full table editing here.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ QUESTIONS PAGE ═══ */}
            {activePage === "questions" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-medium">Question Bank — Unit {selectedUnit}</h2>
                    <p className="text-[11px] text-muted-foreground mt-1">{questions.length} question(s) configured</p>
                  </div>
                  <Button
                    className="gap-2 rounded-xl shadow-lg"
                    onClick={() => {
                      const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
                      const newQ: ExamQuestion = {
                        id: newId, type: "mcq",
                        question: "New question text (EN)",
                        questionIdn: "Teks pertanyaan baru (ID)",
                        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                        optionsIdn: ["Opsi 1", "Opsi 2", "Opsi 3", "Opsi 4"],
                        correct: "Option 1",
                      };
                      saveQuestions([...questions, newQ]);
                      toast.success("New question added!");
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <Card key={q.id} className="border-border/40 shadow-sm overflow-hidden hover:border-primary/20 transition-all">
                      <div className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                          Q{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="uppercase text-[9px] tracking-widest font-bold">{q.type}</Badge>
                            {q.questionIdn && (
                              <span className="text-[12px] font-medium text-foreground line-clamp-1">{q.questionIdn}</span>
                            )}
                            {!q.questionIdn && (
                              <span className="text-[12px] font-medium text-foreground line-clamp-1">{q.question}</span>
                            )}
                          </div>
                          {q.options && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {q.options.join(" • ")}
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-[10px] text-primary/70 italic line-clamp-1">
                              💬 {q.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            #{q.id}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingQuestion(q)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500"
                            onClick={() => {
                              if (confirm(`Delete question ${q.id}?`)) {
                                saveQuestions(questions.filter(x => x.id !== q.id));
                                toast.error("Question deleted");
                              }
                            }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {questions.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <p className="text-sm font-medium">No questions for Unit {selectedUnit}</p>
                      <p className="text-[11px] mt-1">Click "Add Question" to create the first one</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ CONFIG PAGE ═══ */}
            {activePage === "config" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-medium">Site Settings</h2>
                    <p className="text-[11px] text-muted-foreground mt-1">Global branding and site configuration</p>
                  </div>
                  <Button onClick={saveSiteConfig} className="gap-2 rounded-xl shadow-lg">
                    <Save className="w-4 h-4" /> Save Settings
                  </Button>
                </div>

                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold">Site Branding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <FieldInput label="Application Title" value={siteConfig.appTitle}
                      onChange={v => setSiteConfig({ ...siteConfig, appTitle: v })} placeholder="Assessing Science Literacy..." />
                    <FieldInput label="Application Subtitle" value={siteConfig.appSubtitle}
                      onChange={v => setSiteConfig({ ...siteConfig, appSubtitle: v })} placeholder="Cirebon Heritage Assessment" />
                    <FieldInput label="Footer Text" value={siteConfig.footerText}
                      onChange={v => setSiteConfig({ ...siteConfig, footerText: v })} multiline rows={2
                      } placeholder="© 2026 ..." />
                  </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Data Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      `Unit Questions: Stored in localStorage as admin_questions_unit_[1-10]`,
                      `Unit Meta: Stored in localStorage as admin_unit_meta_[1-10]`,
                      `Unit Stimulus: Stored in localStorage as admin_unit_stimulus_[1-10]`,
                      `Site Config: Stored in localStorage as admin_site_config`,
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-green-700">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* ── FULL QUESTION EDITOR DRAWER ── */}
      {editingQuestion && (
        <div className="fixed inset-0 z-[200] flex items-stretch justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingQuestion(null)} />
          <div className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">

            {/* Header */}
            <header className="px-7 py-5 border-b border-border/40 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-lg font-display font-semibold">Edit Question #{editingQuestion.id}</h3>
                <p className="text-[11px] text-muted-foreground">Unit {selectedUnit} • All fields customizable</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(null)} className="rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </Button>
            </header>

            <ScrollArea className="flex-1">
              <div className="px-7 py-6 space-y-8">

                {/* Question Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Question Type</label>
                  <Select value={editingQuestion.type} onValueChange={v => setEditingQuestion({ ...editingQuestion, type: v as "mcq" | "checkbox" | "open" })}>
                    <SelectTrigger className="h-11 bg-white border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="checkbox">Checkbox (multi-select)</SelectItem>
                      <SelectItem value="open">Open-Ended / Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Question Text */}
                <LangTabs>
                  <FieldInput label="Question Text (English)" value={editingQuestion.question}
                    onChange={v => setEditingQuestion({ ...editingQuestion, question: v })}
                    multiline rows={5} placeholder="Enter full question text in English..." />
                  <FieldInput label="Teks Pertanyaan (Bahasa Indonesia)" value={editingQuestion.questionIdn || ""}
                    onChange={v => setEditingQuestion({ ...editingQuestion, questionIdn: v })}
                    multiline rows={5} placeholder="Masukkan teks pertanyaan lengkap dalam Bahasa Indonesia..." />
                </LangTabs>

                {/* Options (for MCQ / Checkbox) */}
                {editingQuestion.type !== "open" && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Answer Options</label>
                        <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1"
                          onClick={() => setEditingQuestion({
                            ...editingQuestion,
                            options: [...(editingQuestion.options || []), ""],
                            optionsIdn: [...(editingQuestion.optionsIdn || []), ""],
                          })}>
                          <Plus className="w-3 h-3" /> Add Option
                        </Button>
                      </div>

                      {/* English options */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1 text-primary">English</p>
                        {(editingQuestion.options || []).map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="w-6 h-6 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground flex items-center justify-center shrink-0">{String.fromCharCode(65 + i)}</span>
                            <Input value={opt} onChange={e => {
                              const next = [...(editingQuestion.options || [])];
                              next[i] = e.target.value;
                              setEditingQuestion({ ...editingQuestion, options: next });
                            }} className="flex-1 h-9 text-xs bg-white" placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 shrink-0"
                              onClick={() => {
                                const opts = (editingQuestion.options || []).filter((_, idx) => idx !== i);
                                const optsId = (editingQuestion.optionsIdn || []).filter((_, idx) => idx !== i);
                                setEditingQuestion({ ...editingQuestion, options: opts, optionsIdn: optsId });
                              }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Indonesian options */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Bahasa Indonesia</p>
                        {(editingQuestion.optionsIdn || editingQuestion.options || []).map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="w-6 h-6 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground flex items-center justify-center shrink-0">{String.fromCharCode(65 + i)}</span>
                            <Input
                              value={(editingQuestion.optionsIdn || [])[i] || (editingQuestion.options || [])[i] || ""}
                              onChange={e => {
                                const optsId = [...(editingQuestion.optionsIdn || Array((editingQuestion.options || []).length).fill(""))];
                                optsId[i] = e.target.value;
                                setEditingQuestion({ ...editingQuestion, optionsIdn: optsId });
                              }}
                              className="flex-1 h-9 text-xs bg-white" placeholder={`Opsi ${String.fromCharCode(65 + i)}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        {editingQuestion.type === "checkbox" ? "Correct Answers (comma-separated)" : "Correct Answer Key"}
                      </label>
                      {editingQuestion.type === "checkbox" ? (
                        <FieldInput
                          label="Correct Answers (comma-separated list)"
                          value={Array.isArray(editingQuestion.correct) ? (editingQuestion.correct as string[]).join(", ") : String(editingQuestion.correct || "")}
                          onChange={v => setEditingQuestion({ ...editingQuestion, correct: v.split(",").map(s => s.trim()) })}
                          placeholder="Option 1, Option 2" />
                      ) : (
                        <FieldInput
                          label="Answer Key (exact text match)"
                          value={String(editingQuestion.correct || "")}
                          onChange={v => setEditingQuestion({ ...editingQuestion, correct: v })}
                          placeholder="Type the exact correct option text..." />
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {/* Explanation */}
                <LangTabs>
                  <FieldInput label="Explanation / Feedback (English)" value={editingQuestion.explanation || ""}
                    onChange={v => setEditingQuestion({ ...editingQuestion, explanation: v })}
                    multiline rows={3} placeholder="Optional: explain why this is correct..." />
                  <FieldInput label="Penjelasan / Umpan Balik (Indonesia)" value={editingQuestion.explanationIdn || ""}
                    onChange={v => setEditingQuestion({ ...editingQuestion, explanationIdn: v })}
                    multiline rows={3} placeholder="Opsional: jelaskan mengapa ini benar..." />
                </LangTabs>

                {/* Media */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Media Attachment (Optional)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldInput label="Media URL" value={editingQuestion.mediaUrl || ""}
                      onChange={v => setEditingQuestion({ ...editingQuestion, mediaUrl: v })} placeholder="/images/..." />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Media Type</label>
                      <Select value={editingQuestion.mediaType || "image"} onValueChange={v => setEditingQuestion({ ...editingQuestion, mediaType: v as "image" | "video" })}>
                        <SelectTrigger className="h-11 bg-white border-border/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Danger Zone</p>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50 p-0 h-auto font-medium text-xs"
                    onClick={() => {
                      if (confirm(`Permanently delete question ${editingQuestion.id}?`)) {
                        saveQuestions(questions.filter(q => q.id !== editingQuestion!.id));
                        setEditingQuestion(null);
                        toast.error("Question permanently deleted");
                      }
                    }}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Permanently delete this question
                  </Button>
                </div>

              </div>
            </ScrollArea>

            {/* Footer */}
            <footer className="px-7 py-5 border-t border-border/40 flex justify-end gap-3 shrink-0 bg-white">
              <Button variant="outline" className="rounded-xl" onClick={() => setEditingQuestion(null)}>Cancel</Button>
              <Button className="rounded-xl gap-2 font-semibold shadow-lg" onClick={handleUpdateQuestion}>
                <Save className="w-4 h-4" /> Save Question
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
