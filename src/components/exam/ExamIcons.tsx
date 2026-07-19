import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

export const LeafIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="#22c55e"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MoneyIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="2" fill="#f59e0b"/>
    <circle cx="12" cy="12" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/>
    <path d="M12 8v8M9.5 10.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 1.5-2.5 1.5-2.5 3M14.5 13.5c0 1.1-.9 2-2.5 2s-2.5-.9-2.5-2c0-1.5 2.5-1.5 2.5-3" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const GlobeIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" fill="#22c55e"/>
    <path d="M2 12h20" stroke="white" strokeWidth="1.5"/>
    <path d="M12 2a10 10 0 0 1 4 8 10 10 0 0 1-4 8" fill="#86efac" opacity="0.5"/>
    <ellipse cx="12" cy="12" rx="4" ry="10" stroke="white" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const ChartUpIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="14" width="20" height="8" rx="2" fill="#dcfce7"/>
    <rect x="4" y="18" width="4" height="4" rx="1" fill="#22c55e"/>
    <rect x="10" y="15" width="4" height="7" rx="1" fill="#22c55e"/>
    <rect x="16" y="11" width="4" height="11" rx="1" fill="#22c55e"/>
    <path d="M5 12l4-4 4 2 6-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16,4 20,4 20,8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChainIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const FactoryIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="10" width="8" height="12" rx="1" fill="#94a3b8"/>
    <rect x="10" y="6" width="12" height="16" rx="1" fill="#64748b"/>
    <rect x="4" y="2" width="4" height="8" fill="#94a3b8"/>
    <rect x="14" y="2" width="4" height="4" fill="#94a3b8"/>
    <rect x="5" y="14" width="2" height="3" fill="#cbd5e1"/>
    <rect x="9" y="12" width="2" height="3" fill="#cbd5e1"/>
    <rect x="13" y="10" width="2" height="3" fill="#cbd5e1"/>
    <rect x="17" y="10" width="2" height="3" fill="#cbd5e1"/>
    <rect x="4" y="2" width="4" height="2" fill="#d1d5db"/>
    <rect x="14" y="2" width="4" height="2" fill="#d1d5db"/>
  </svg>
);

export const SofaIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="10" width="20" height="8" rx="3" fill="#a78bfa"/>
    <rect x="4" y="8" width="16" height="6" rx="2" fill="#c4b5fd"/>
    <rect x="2" y="12" width="3" height="6" rx="1.5" fill="#8b5cf6"/>
    <rect x="19" y="12" width="3" height="6" rx="1.5" fill="#8b5cf6"/>
  </svg>
);

export const RecycleIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3l-1.5 4.5L7 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3z" fill="#22c55e"/>
    <path d="M5.6 11.5L2 15l3.5 1.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.4 11.5L22 15l-3.5 1.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 17l-3 3.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 17l3 3.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 9L12 6.5 14.5 9" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WarningIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#f59e0b"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill="white"/>
  </svg>
);

export const CheckIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#22c55e"/>
    <polyline points="8,12 11,15 16,9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MeatIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="10" cy="14" rx="8" ry="6" fill="#ef4444"/>
    <ellipse cx="10" cy="13" rx="6" ry="4" fill="#fca5a5"/>
    <circle cx="6" cy="8" r="4" fill="#f5f5f4"/>
    <circle cx="6" cy="8" r="2" fill="#fca5a5"/>
    <ellipse cx="10" cy="13" rx="8" ry="6" stroke="#dc2626" strokeWidth="1" fill="none"/>
  </svg>
);

export const PaperIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f1f5f9"/>
    <polyline points="14,2 14,8 20,8" fill="#e2e8f0"/>
    <line x1="8" y1="13" x2="16" y2="13" stroke="#cbd5e1" strokeWidth="1.5"/>
    <line x1="8" y1="17" x2="13" y2="17" stroke="#cbd5e1" strokeWidth="1.5"/>
  </svg>
);

export const ShoppingBagIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#3b82f6"/>
    <line x1="3" y1="6" x2="21" y2="6" stroke="#1d4ed8" strokeWidth="2"/>
    <path d="M16 10a4 4 0 0 1-8 0" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const BeachIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="5" r="3" fill="#fbbf24"/>
    <path d="M12 8v13" stroke="#f59e0b" strokeWidth="1.5"/>
    <path d="M5 21h14" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 21 Q12,17 21,21" fill="#fbbf24"/>
    <path d="M8 21 Q12,18 16 21" fill="#f59e0b"/>
    <path d="M5 21 Q7 19 8 21" fill="#fcd34d"/>
    <path d="M17 21 Q19 19 21 21" fill="#fcd34d"/>
  </svg>
);

export const OilBarrelIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="4" width="14" height="16" rx="3" fill="#78716c"/>
    <rect x="5" y="4" width="14" height="4" rx="2" fill="#57534e"/>
    <rect x="5" y="16" width="14" height="4" rx="2" fill="#57534e"/>
    <ellipse cx="12" cy="8" rx="5" ry="1.5" fill="#a8a29e"/>
    <line x1="8" y1="4" x2="8" y2="20" stroke="#44403c" strokeWidth="0.5"/>
    <line x1="12" y1="4" x2="12" y2="20" stroke="#44403c" strokeWidth="0.5"/>
    <line x1="16" y1="4" x2="16" y2="20" stroke="#44403c" strokeWidth="0.5"/>
  </svg>
);

export const BananaIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 20 Q3 14 6 9 Q9 5 15 4 Q19 3.5 20 5 Q20 7 17 8 Q12 9 8 14 Q6 17 6 20 Z" fill="#fde047"/>
    <path d="M6 19 Q4 14 7 10 Q10 6 15 5 Q18 4.5 19 5.5" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const HouseIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" fill="#a8a29e"/>
    <path d="M3 9.5L12 3l9 6.5" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="9" y="13" width="6" height="7" fill="#f5f5f4"/>
    <rect x="10" y="14" width="4" height="3" fill="#a8a29e"/>
    <rect x="11" y="17" width="2" height="3" fill="#78716c"/>
  </svg>
);

export const FishIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="11" cy="12" rx="8" ry="5" fill="#38bdf8"/>
    <polygon points="19,12 23,8 23,16" fill="#38bdf8"/>
    <circle cx="7" cy="11" r="1.5" fill="#1e3a5f"/>
    <path d="M11 9.5 Q13 10 13 12 Q13 14 11 14.5" stroke="#0ea5e9" strokeWidth="1" fill="none"/>
    <path d="M5 10 Q4 12 5 14" stroke="#0ea5e9" strokeWidth="1" fill="none"/>
  </svg>
);

export const WaveIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 12c1.5-2 3-3 5-3s3.5 2 5 2 3.5-2 5-2 3.5 1 5 2" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M2 17c1.5-2 3-3 5-3s3.5 2 5 2 3.5-2 5-2 3.5 1 5 2" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M2 7c1.5-2 3-3 5-3s3.5 2 5 2 3.5-2 5-2 3.5 1 5 2" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const EyeIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="#b45309"/>
    <circle cx="12" cy="12" r="4" fill="#fde68a"/>
    <circle cx="12" cy="12" r="2" fill="#1c1917"/>
  </svg>
);

export const CloudIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="14" cy="14" rx="7" ry="5" fill="white"/>
    <ellipse cx="9" cy="13" rx="5" ry="4" fill="white"/>
    <ellipse cx="17" cy="15" rx="4" ry="3" fill="white"/>
    <ellipse cx="12" cy="10" rx="5" ry="4" fill="white"/>
  </svg>
);

export const CrabIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="14" rx="6" ry="4" fill="#ea580c"/>
    <ellipse cx="12" cy="11" rx="4" ry="3" fill="#f97316"/>
    <circle cx="9" cy="9" r="1.5" fill="#1c1917"/>
    <circle cx="15" cy="9" r="1.5" fill="#1c1917"/>
    <path d="M6 13 Q2 11 3 15" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M18 13 Q22 11 21 15" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M8 14 Q6 16 7 17" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M16 14 Q18 16 17 17" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const TrashIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 11v6M14 11v6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const ArrowRightIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LightbulbIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 18h6M10 22h4" stroke="#a16207" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 2a7 7 0 0 1 5 11.9V16a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z" fill="#fbbf24"/>
    <path d="M9 22h6" stroke="#a16207" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 18h6" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
