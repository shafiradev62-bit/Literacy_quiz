import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { detectSupabaseTables } from "./integrations/supabase/setupTables";

// Auto-detect Supabase tables on startup (with safety)
try {
  detectSupabaseTables();
} catch (e) {
  console.error("Supabase detection failed on startup", e);
}

createRoot(document.getElementById("root")!).render(<App />);
