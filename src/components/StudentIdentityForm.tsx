import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncStudentToFirebase } from "@/integrations/firebase/realtimeService";

interface StudentProfile {
  id: string;
  name: string;
  class: string;
  school: string;
  contact: string;
  instagram?: string;
}

interface Props {
  onDone: (profile: StudentProfile) => void;
}

export default function StudentIdentityForm({ onDone }: Props) {
  const { lang } = useLanguage();
  const isId = lang === "id";

  const [isLogin, setIsLogin] = useState(false);
  const [savedProfile, setSavedProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState({ name: "", class: "", school: "", contact: "", instagram: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const p = localStorage.getItem("studentProfile");
      if (p) {
        setSavedProfile(JSON.parse(p));
        setIsLogin(true);
      }
    } catch {}
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = isId ? "Nama wajib diisi" : "Name is required";
    if (!form.class.trim()) e.class = isId ? "Kelas wajib diisi" : "Class is required";
    if (!form.school.trim()) e.school = isId ? "Sekolah wajib diisi" : "School is required";
    if (!form.contact.trim()) e.contact = isId ? "Kontak wajib diisi" : "Contact is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const profile: StudentProfile = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      class: form.class.trim(),
      school: form.school.trim(),
      contact: form.contact.trim(),
      instagram: form.instagram.trim() || undefined,
    };

    // Always save to localStorage first
    localStorage.setItem("studentProfile", JSON.stringify(profile));

    // Try to save to Supabase
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from('student_profiles')
          .insert({
            id: profile.id,
            device_id: localStorage.getItem("exam_device_id") || crypto.randomUUID(),
            name: profile.name,
            class: profile.class,
            school: profile.school,
            contact: profile.contact,
            instagram: profile.instagram,
          });

        if (error) {
          console.error('Error saving student profile:', error);
          toast.error(isId ? "Data tersimpan lokal, akan disinkronkan saat online" : "Data saved locally, will sync when online");
          localStorage.setItem(`sync_pending_profile_${profile.id}`, 'true');
        } else {
          toast.success(isId ? "Data siswa berhasil disimpan" : "Student data saved successfully");
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(isId ? "Data tersimpan lokal, akan disinkronkan saat online" : "Data saved locally, will sync when online");
        localStorage.setItem(`sync_pending_profile_${profile.id}`, 'true');
      }
    } else {
      toast.warning(isId ? "Offline: Data tersimpan lokal" : "Offline: Data saved locally");
      localStorage.setItem(`sync_pending_profile_${profile.id}`, 'true');
    }

    // ALWAYS sync to Firebase (handles offline internally)
    syncStudentToFirebase({
      ...profile,
      email: null // contact is used instead in this app
    });

    onDone(profile);
  };

  const handleLogin = async () => {
    if (savedProfile) {
      if (navigator.onLine) {
        try {
          await supabase.from('login_sessions').insert({
            student_id: savedProfile.id,
            device_id: localStorage.getItem("exam_device_id") || "unknown",
            status: 'success'
          });
        } catch (error) {
          console.error("Failed to log login session", error);
        }
      } else {
        // queue for offline logic or ignore since it's just logging
        localStorage.setItem(`sync_pending_login_${crypto.randomUUID()}`, JSON.stringify({
          student_id: savedProfile.id,
          device_id: localStorage.getItem("exam_device_id") || "unknown",
          login_time: new Date().toISOString()
        }));
      }
      onDone(savedProfile);
    }
  };

  const field = (key: keyof typeof form, label: string, labelId: string, placeholder: string, placeholderId: string, type = "text") => (
    <div>
      <label className="block text-[11px] font-medium text-foreground mb-1">
        {isId ? labelId : label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: "" })); }}
        placeholder={isId ? placeholderId : placeholder}
        className={`w-full px-3 py-2 text-[12px] rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors[key] ? "border-red-400" : "border-border/60"}`}
      />
      {errors[key] && <p className="text-[10px] text-red-500 mt-0.5">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <h2 className="font-display text-lg text-foreground mb-1">
            {isLogin ? (isId ? "Selamat Datang Kembali (Welcome Back)" : "Welcome Back (Selamat Datang Kembali)") : (isId ? "Identitas Siswa (Student Identity)" : "Student Identity (Identitas Siswa)")}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {isLogin
              ? (isId ? "Lanjutkan dengan data yang sudah terdaftar" : "Continue with your registered data")
              : (isId ? "Isi data dirimu sebelum memulai quiz" : "Fill in your details before starting the quiz")}
          </p>
        </div>

        {isLogin && savedProfile ? (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
              <p className="text-[12px] font-semibold text-foreground">{savedProfile.name}</p>
              <p className="text-[11px] text-muted-foreground">{savedProfile.class} · {savedProfile.school}</p>
            </div>
            <button onClick={handleLogin} className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-all text-[13px]">
              {isId ? "Lanjutkan (Continue)" : "Continue (Lanjutkan)"}
            </button>
            <button onClick={() => setIsLogin(false)} className="w-full py-2.5 bg-white border border-border/60 text-foreground/70 font-medium rounded-lg hover:bg-muted/30 transition-all text-[13px]">
              {isId ? "Daftar Akun Baru (Register New Account)" : "Register New Account (Daftar Akun Baru)"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {field("name", "Full Name", "Nama Lengkap", "e.g. Budi Santoso", "cth. Budi Santoso")}
            {field("class", "Class", "Kelas", "e.g. 10A", "cth. 10A")}
            {field("school", "School", "Sekolah", "e.g. SMA Negeri 1 Cirebon", "cth. SMA Negeri 1 Cirebon")}
            {field("contact", "Contact (Phone/WA)", "Kontak (HP/WA)", "e.g. 08123456789", "cth. 08123456789", "tel")}
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Instagram <span className="text-muted-foreground font-normal">{isId ? "(opsional)" : "(optional)"}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[12px]">@</span>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value.replace(/^@/, "") }))}
                  placeholder={isId ? "cth. budi_santoso" : "e.g. budi_santoso"}
                  className="w-full pl-7 pr-3 py-2 text-[12px] rounded-lg border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
            <button type="submit" className="w-full mt-2 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-all text-[13px]">
              {isId ? "Daftar & Mulai" : "Register & Start"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
