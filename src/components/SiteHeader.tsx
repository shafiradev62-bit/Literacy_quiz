import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSiteConfig } from "@/data/appContent";

const SiteHeader = () => {
  const { lang, toggle, t } = useLanguage();
  const location = useLocation();
  const isExamLocked = location.pathname === "/quiz" && localStorage.getItem("exam_active") === "1";

  const links = [
    { to: "/learn", label: t("Learn", "Belajar") },
    { to: "/quiz", label: "Quiz" },
    { to: "/dashboard", label: t("Results", "Hasil") },
  ];

  const handleNavClick = (e: React.MouseEvent, to: string) => {
    if (isExamLocked && to !== "/quiz") {
      e.preventDefault();
      alert(lang === "id"
        ? "Kamu tidak bisa keluar saat ujian berlangsung. Selesaikan soal terlebih dahulu."
        : "You cannot leave during the exam. Please finish your questions first.");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
      <nav className="w-full px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, "/")}
          className="font-display text-sm font-bold text-foreground tracking-tight"
        >
          {getSiteConfig().appTitle}
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className={`text-xs font-medium transition-opacity duration-200 ${
                  location.pathname === link.to
                    ? "text-foreground opacity-100"
                    : isExamLocked && link.to !== "/quiz"
                    ? "text-muted-foreground opacity-30 cursor-not-allowed"
                    : "text-muted-foreground opacity-70 hover:opacity-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={toggle}
            className="text-[10px] font-medium tracking-wider uppercase px-2 py-1 rounded-sm bg-secondary text-secondary-foreground transition-colors duration-200 hover:bg-accent"
          >
            {lang === "en" ? "ID" : "EN"}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
