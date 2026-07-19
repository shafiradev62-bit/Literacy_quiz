import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Newsreader", "Georgia", "serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        exam: {
          toolbar: "hsl(var(--exam-toolbar))",
          "toolbar-foreground": "hsl(var(--exam-toolbar-foreground))",
          divider: "hsl(var(--exam-divider))",
          panel: "hsl(var(--exam-panel-bg))",
          highlight: "hsl(var(--exam-highlight))",
          selected: "hsl(var(--exam-selected))",
          "selected-foreground": "hsl(var(--exam-selected-foreground))",
          flagged: "hsl(var(--exam-flagged))",
          answered: "hsl(var(--exam-answered))",
          unanswered: "hsl(var(--exam-unanswered))",
          current: "hsl(var(--exam-current))",
          "timer-warn": "hsl(var(--exam-timer-warn))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // indigo
    "bg-indigo-50", "bg-indigo-100", "bg-indigo-200", "bg-indigo-600", "bg-indigo-700", "bg-indigo-800",
    "text-indigo-200", "text-indigo-500", "text-indigo-600", "text-indigo-700",
    "border-indigo-100", "border-indigo-500",
    "hover:bg-indigo-200", "hover:bg-indigo-700",
    // emerald
    "bg-emerald-50", "bg-emerald-100", "bg-emerald-500", "bg-emerald-600", "bg-emerald-700",
    "text-emerald-600", "text-emerald-700",
    "hover:bg-emerald-600",
    // rose
    "bg-rose-50", "bg-rose-100", "bg-rose-500",
    "text-rose-500", "text-rose-600", "text-rose-700",
    // amber
    "bg-amber-50", "bg-amber-100", "bg-amber-500",
    "text-amber-500", "text-amber-600", "text-amber-700",
    // teal
    "bg-teal-50", "bg-teal-100",
    "text-teal-600", "text-teal-700",
    // green
    "bg-green-50", "bg-green-100",
    "text-green-700",
    // blue
    "bg-blue-50",
    // slate
    "from-slate-50",
    // gradient
    "from-slate-50", "via-blue-50/30", "to-indigo-50/20",
    "bg-gradient-to-br", "bg-gradient-to-r",
    "from-indigo-600", "to-indigo-700",
  ],
} satisfies Config;
