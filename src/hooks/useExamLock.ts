import { useEffect } from "react";

/**
 * Locks the user in the exam:
 * 1. Blocks browser back/forward via history manipulation
 * 2. Shows beforeunload warning on refresh/close
 * 3. Call unlock() when exam is done to release
 */
export function useExamLock(active: boolean) {
  // Block refresh / tab close with strong warning
  useEffect(() => {
    if (!active) return;
    
    const handler = (e: BeforeUnloadEvent) => {
      // Modern browsers show default warning, but we set returnValue for compatibility
      const message = "⚠️ You are in the middle of an exam! If you leave, your progress may not be saved. Are you sure you want to leave?";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener("beforeunload", handler);
    
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [active]);

  // Block browser back button by pushing a dummy state and re-pushing on popstate
  useEffect(() => {
    if (!active) return;

    // Push a sentinel state so there's always something to pop back to
    window.history.pushState({ examLock: true }, "");

    const handler = (e: PopStateEvent) => {
      // If they hit back, immediately push forward again
      window.history.pushState({ examLock: true }, "");
    };

    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
    };
  }, [active]);

  // Block keyboard shortcuts for closing tab (Ctrl+W, Ctrl+F4, Alt+F4)
  useEffect(() => {
    if (!active) return;

    const handler = (e: KeyboardEvent) => {
      // Block Ctrl+W, Ctrl+F4, Alt+F4, Ctrl+Shift+W
      if (
        (e.ctrlKey && e.key === 'w') ||
        (e.ctrlKey && e.key === 'F4') ||
        (e.altKey && e.key === 'F4') ||
        (e.ctrlKey && e.shiftKey && e.key === 'W')
      ) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show warning
        alert("⚠️ You cannot close the tab during an exam!\n\nPlease complete your exam first.");
        return false;
      }
    };

    window.addEventListener("keydown", handler, true); // Use capture phase
    return () => {
      window.removeEventListener("keydown", handler, true);
    };
  }, [active]);
}
