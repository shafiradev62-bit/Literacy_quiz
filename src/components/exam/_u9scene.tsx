              {/* RIVER SCENE SVG */}
              <svg viewBox="0 0 400 160" className="w-full rounded-xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="u9sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={outputs.waterQuality==="Good"?"#0ea5e9":outputs.waterQuality==="Poor"?"#64748b":"#38bdf8"}/>
                    <stop offset="100%" stopColor={outputs.waterQuality==="Good"?"#7dd3fc":outputs.waterQuality==="Poor"?"#e2e8f0":"#bfdbfe"}/>
                  </linearGradient>
                  <linearGradient id="u9river" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={outputs.waterQuality==="Good"?"#38bdf8":outputs.waterQuality==="Poor"?"#334155":"#64748b"}/>
                    <stop offset="50%" stopColor={outputs.waterQuality==="Good"?"#0284c7":outputs.waterQuality==="Poor"?"#1e293b":"#475569"}/>
                    <stop offset="100%" stopColor={outputs.waterQuality==="Good"?"#0369a1":outputs.waterQuality==="Poor"?"#0f172a":"#334155"}/>
                  </linearGradient>
                  <linearGradient id="u9wall" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0"/>
                    <stop offset="100%" stopColor="#64748b"/>
                  </linearGradient>
                  <linearGradient id="u9roof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#475569"/>
                    <stop offset="100%" stopColor="#1e293b"/>
                  </linearGradient>
                  <linearGradient id="u9ground" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={outputs.ecosystemRisk==="High"?"#d97706":"#4ade80"}/>
                    <stop offset="100%" stopColor={outputs.ecosystemRisk==="High"?"#92400e":"#16a34a"}/>
                  </linearGradient>
                  <linearGradient id="u9ipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bbf7d0"/>
                    <stop offset="100%" stopColor="#4ade80"/>
                  </linearGradient>
                  <radialGradient id="u9sun" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="1"/>
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="u9shimmer" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0"/>
                    <stop offset="45%" stopColor="white" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="white" stopOpacity="0"/>
                  </linearGradient>
                  <filter id="u9blur"><feGaussianBlur stdDeviation="3"/></filter>
                  <filter id="u9shadow"><feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.2"/></filter>
                  <filter id="u9haze"><feGaussianBlur stdDeviation="1"/></filter>
                </defs>

                {/* SKY - gradient with organic horizon */}
                <rect width="400" height="108" fill="url(#u9sky)"/>
                <rect width="400" height="108" fill="white" opacity="0.03"/>
                {/* Subtle cloud wisps */}
                <path d="M20,30 Q40,25 60,30 Q80,35 100,30" stroke="white" strokeWidth="8" opacity="0.05" fill="none"/>
                <path d="M280,45 Q300,40 320,45 Q340,50 360,45" stroke="white" strokeWidth="6" opacity="0.04" fill="none"/>
                {/* Sun */}
                {outputs.waterQuality==="Good" && <g transform="translate(358,24)">
                  <circle r="24" fill="url(#u9sun)" opacity="0.7"/>
                  <circle r="12" fill="#fde68a" opacity="0.95"/>
                  <circle r="9" fill="#fbbf24"/>
                  <g style={{animation:"u9-sun-spin 12s linear infinite", transformOrigin:"358px 24px"}}>
                    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
                      <line key={i} x1={13*Math.cos(a*Math.PI/180)} y1={13*Math.sin(a*Math.PI/180)} x2={19*Math.cos(a*Math.PI/180)} y2={19*Math.sin(a*Math.PI/180)} stroke="#fde68a" strokeWidth={i%2===0?"2":"1.2"} strokeLinecap="round" opacity="0.85"/>
                    ))}
                  </g>
                </g>}
                {/* Storm clouds */}
                {outputs.waterQuality==="Poor" && <g filter="url(#u9haze)">
                  <ellipse cx="68" cy="20" rx="34" ry="13" fill="#64748b" opacity="0.72"/>
                  <ellipse cx="92" cy="14" rx="24" ry="11" fill="#64748b" opacity="0.62"/>
                  <ellipse cx="46" cy="18" rx="19" ry="10" fill="#64748b" opacity="0.52"/>
                  <ellipse cx="218" cy="22" rx="27" ry="11" fill="#64748b" opacity="0.58"/>
                  <ellipse cx="242" cy="15" rx="19" ry="9" fill="#64748b" opacity="0.48"/>
                  <ellipse cx="338" cy="18" rx="21" ry="9" fill="#64748b" opacity="0.44"/>
                </g>}
                {/* Medium clouds */}
                {outputs.waterQuality==="Medium" && <g filter="url(#u9haze)" opacity="0.45">
                  <ellipse cx="158" cy="18" rx="21" ry="8" fill="#94a3b8"/>
                  <ellipse cx="176" cy="12" rx="15" ry="7" fill="#94a3b8"/>
                </g>}
                {/* Ground - organic uneven surface */}
                <path d="M0,100 Q50,98 100,100 Q150,102 200,100 Q250,98 300,100 Q350,102 400,100 L400,114 Q350,116 300,114 Q250,112 200,114 Q150,116 100,114 Q50,112 0,114 Z" fill="url(#u9ground)" opacity="0.88"/>
                <path d="M0,100 Q50,98 100,100 Q150,102 200,100 Q250,98 300,100 Q350,102 400,100" fill="none" stroke="#0f172a" strokeWidth="0.5" opacity="0.07"/>
                {/* Grass tufts */}
                {outputs.ecosystemRisk!=="High" && [252,270,282,297,314,330,347,362,380].map((x,i)=>(
                  <g key={x} transform={`translate(${x},100)`}>
                    <path d={`M0,0 Q-3,-${5+i%3},-1,-${8+i%4}`} stroke="#4ade80" strokeWidth="1.2" fill="none" opacity="0.8"/>
                    <path d={`M0,0 Q2,-${6+i%2},1,-${9+i%3}`} stroke="#22c55e" strokeWidth="1.2" fill="none" opacity="0.7"/>
                    <path d={`M0,0 Q4,-${4+i%3},3,-${7+i%2}`} stroke="#4ade80" strokeWidth="1" fill="none" opacity="0.6"/>
                  </g>
                ))}

                {/* BG trees (hazy) - organic shapes */}
                <g opacity="0.3" filter="url(#u9haze)">
                  {[312,332,352,372,392].map((x,i)=>{
                    const h=[18,22,16,20,15][i];
                    const lf=outputs.ecosystemRisk==="High"?"#78350f":"#166534";
                    return <g key={x}>
                      <path d={`M${x+2},${100-h} Q${x},${100-h/2} ${x+4},${100} Q${x+8},${100-h/2} ${x+6},${100-h} Z`} fill="#4b5563"/>
                      <ellipse cx={x+4} cy={100-h-8} rx={[9,11,8,10,8][i]} ry={[11,13,9,12,10][i]} fill={lf}/>
                    </g>;
                  })}
                </g>
                {/* Foreground trees - organic shapes */}
                {([
                  {x:266,h:40,r1:16,r2:11},
                  {x:290,h:32,r1:13,r2:9},
                  {x:314,h:38,r1:15,r2:10},
                  {x:338,h:28,r1:12,r2:8},
                ] as {x:number,h:number,r1:number,r2:number}[]).map((t,i)=>{
                  const ok=outputs.ecosystemRisk!=="High";
                  const c1=ok?["#15803d","#16a34a","#22c55e","#4ade80"][i]:["#b45309","#d97706","#b45309","#d97706"][i];
                  const c2=ok?["#166534","#15803d","#16a34a","#22c55e"][i]:["#92400e","#b45309","#92400e","#b45309"][i];
                  return <g key={i} filter="url(#u9shadow)">
                    {/* Trunk - organic tapered shape */}
                    <path d={`M${t.x+2},${100-t.h} Q${t.x},${100-t.h/2} ${t.x+4},${100} Q${t.x+8},${100-t.h/2} ${t.x+6},${100-t.h} Z`} fill={ok?"#92400e":"#78350f"}/>
                    <path d={`M${t.x+4},${100-t.h} Q${t.x+5},${100-t.h/2} ${t.x+5},${100}`} fill="#0f172a" opacity="0.12"/>
                    {/* Foliage - organic layered circles */}
                    <ellipse cx={t.x+4} cy={100-t.h-6} rx={t.r1} ry={t.r1*0.9} fill={c1} opacity={ok?0.92:0.55}/>
                    <ellipse cx={t.x+5} cy={100-t.h-15} rx={t.r2} ry={t.r2*1.1} fill={c2} opacity={ok?0.85:0.45}/>
                    <ellipse cx={t.x+7} cy={100-t.h-17} rx={t.r2*0.5} ry={t.r2*0.4} fill="white" opacity={ok?0.12:0.04}/>
                    {/* Dead branches if not healthy */}
                    {!ok && <>
                      <path d={`M${t.x+4},${100-t.h+5} Q${t.x-2},${100-t.h} ${t.x-6},${100-t.h-4}`} stroke="#78350f" strokeWidth="1.5" fill="none" opacity="0.7"/>
                      <path d={`M${t.x+4},${100-t.h+8} Q${t.x+10},${100-t.h+2} ${t.x+14},${100-t.h}`} stroke="#78350f" strokeWidth="1.2" fill="none" opacity="0.6"/>
                    </>}
                  </g>;
                })}

                {/* Factory */}
                <g transform="translate(14,38)" filter="url(#u9shadow)">
                  <ellipse cx="32" cy="62" rx="36" ry="5" fill="#0f172a" opacity="0.15"/>
                  {/* Chimney 1 - organic tapered shape */}
                  <path d="M12,-18 Q10,0 11,14 L18,14 Q19,0 17,-18 Z" fill="#475569"/>
                  <path d="M12,-18 Q10,0 11,14 L14,14 L14,-18 Z" fill="#64748b" opacity="0.6"/>
                  <ellipse cx="14.5" cy="-18" rx="3" ry="1.5" fill="#334155"/>
                  {/* Chimney 2 - organic tapered shape */}
                  <path d="M30,-12 Q28,5 29,14 L35,14 Q36,5 34,-12 Z" fill="#475569"/>
                  <path d="M30,-12 Q28,5 29,14 L31,14 L31,-12 Z" fill="#64748b" opacity="0.6"/>
                  <ellipse cx="32.5" cy="-12" rx="2.5" ry="1.2" fill="#334155"/>
                  {/* Main building - organic shape */}
                  <path d="M0,14 Q-2,30 2,62 L62,62 Q66,30 64,14 Z" fill="url(#u9wall)"/>
                  <path d="M48,14 Q50,30 48,62 L62,62 Q64,30 64,14 Z" fill="#0f172a" opacity="0.08"/>
                  {/* Roof - curved organic shape */}
                  <path d="M-5,14 Q31,-5 67,14 Q31,8 -5,14" fill="url(#u9roof)"/>
                  <path d="M48,14 Q31,-5 67,14" fill="#0f172a" opacity="0.1"/>
                  {/* Windows - rounded organic shapes */}
                  <ellipse cx="12" cy="26" rx="6" ry="4.5" fill="#bae6fd" opacity="0.85"/>
                  <ellipse cx="9" cy="26" rx="2.5" ry="4.5" fill="white" opacity="0.2"/>
                  <ellipse cx="28" cy="26" rx="6" ry="4.5" fill="#bae6fd" opacity="0.85"/>
                  <ellipse cx="25" cy="26" rx="2.5" ry="4.5" fill="white" opacity="0.2"/>
                  <ellipse cx="44" cy="26" rx="6" ry="4.5" fill="#bae6fd" opacity="0.85"/>
                  <ellipse cx="41" cy="26" rx="2.5" ry="4.5" fill="white" opacity="0.2"/>
                  {/* Door - arched organic shape */}
                  <path d="M24,38 Q24,32 31,32 Q38,32 38,38 L38,62 L24,62 Z" fill="#1e293b"/>
                  <path d="M24,38 Q24,32 27.5,32 L27.5,62 L24,62 Z" fill="#0f172a" opacity="0.15"/>
                  <circle cx="36" cy="50" r="1.5" fill="#94a3b8"/>
                  {/* Sign - organic banner */}
                  <path d="M8,34 Q15,32 22,34 L22,38 Q15,36 8,38 Z" fill="#1e293b" opacity="0.7"/>
                  <text x="15" y="38" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#94a3b8">BATIK</text>
                  {/* Base - organic ground connection */}
                  <ellipse cx="32" cy="64" rx="8" ry="2" fill="#475569"/>
                </g>
                {/* Smoke */}
                <g filter="url(#u9blur)">
                  {dyeType==="Synthetic" && <>
                    <ellipse cx="28" cy="28" rx="10" ry="8" fill="#475569" opacity="0.52" style={{animation:"u9-smoke-rise 2.5s ease-out infinite"}}/>
                    <ellipse cx="32" cy="18" rx="13" ry="10" fill="#64748b" opacity="0.4" style={{animation:"u9-smoke-rise 2.5s ease-out infinite 0.4s"}}/>
                    <ellipse cx="27" cy="8" rx="15" ry="11" fill="#64748b" opacity="0.28" style={{animation:"u9-smoke-rise 2.5s ease-out infinite 0.8s"}}/>
                    <ellipse cx="33" cy="0" rx="17" ry="12" fill="#94a3b8" opacity="0.16" style={{animation:"u9-smoke-rise 2.5s ease-out infinite 1.2s"}}/>
                    <ellipse cx="46" cy="32" rx="8" ry="6" fill="#475569" opacity="0.42" style={{animation:"u9-smoke2-rise 3s ease-out infinite 0.2s"}}/>
                    <ellipse cx="50" cy="22" rx="10" ry="8" fill="#64748b" opacity="0.3" style={{animation:"u9-smoke2-rise 3s ease-out infinite 0.7s"}}/>
                    <ellipse cx="48" cy="13" rx="12" ry="9" fill="#94a3b8" opacity="0.2" style={{animation:"u9-smoke2-rise 3s ease-out infinite 1.1s"}}/>
                  </>}
                  {dyeType==="Natural" && <>
                    <ellipse cx="28" cy="28" rx="6" ry="5" fill="#94a3b8" opacity="0.2" style={{animation:"u9-smoke-rise 4s ease-out infinite"}}/>
                    <ellipse cx="30" cy="20" rx="8" ry="6" fill="#94a3b8" opacity="0.13" style={{animation:"u9-smoke-rise 4s ease-out infinite 1s"}}/>
                    <ellipse cx="46" cy="30" rx="5" ry="4" fill="#94a3b8" opacity="0.16" style={{animation:"u9-smoke2-rise 4.5s ease-out infinite 0.5s"}}/>
                  </>}
                </g>
                {/* Pipe */}
                <line x1="50" y1="100" x2="50" y2="114" stroke={treatment==="None"?"#ef4444":"#22c55e"} strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="50" y1="114" x2={treatment!=="None"?96:148} y2="114" stroke={treatment==="None"?"#ef4444":"#22c55e"} strokeWidth="3.5" strokeLinecap="round"/>
                {treatment==="None" && <line x1="148" y1="114" x2="148" y2="120" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round"/>}
                {/* IPAL - organic tank design */}
                {treatment!=="None" && <g transform="translate(96,88)" filter="url(#u9shadow)">
                  <ellipse cx="24" cy="26" rx="26" ry="4" fill="#0f172a" opacity="0.13"/>
                  {/* Main tank - rounded organic shape */}
                  <path d="M2,4 Q0,14 4,26 L44,26 Q48,14 46,4 Q24,0 2,4" fill="url(#u9ipal)" stroke="#22c55e" strokeWidth="1.5"/>
                  <path d="M2,4 Q0,14 4,26 L24,26 L24,4 Q13,2 2,4" fill="white" opacity="0.07"/>
                  {/* Treatment chamber 1 - circular */}
                  <circle cx="13" cy="13" r="8" fill="#dcfce7" stroke="#4ade80" strokeWidth="1"/>
                  <circle cx="13" cy="13" r="4" fill="#4ade80" opacity="0.55"/>
                  <circle cx="13" cy="13" r="2" fill="#16a34a" opacity="0.8"/>
                  {/* Treatment chamber 2 - circular */}
                  <circle cx="35" cy="13" r="8" fill="#dcfce7" stroke="#4ade80" strokeWidth="1"/>
                  <circle cx="35" cy="13" r="4" fill="#4ade80" opacity="0.55"/>
                  <circle cx="35" cy="13" r="2" fill="#16a34a" opacity="0.8"/>
                  <text x="24" y="36" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#166534">IPAL</text>
                  {/* Pipes - curved organic */}
                  <path d="M48,14 Q54,14 58,14 L60,14" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M60,14 Q60,20 60,28" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </g>}

                {/* River - organic flowing shape */}
                <path d="M0,118 Q100,115 200,120 Q300,125 400,118 L400,160 Q300,165 200,160 Q100,155 0,160 Z" fill="url(#u9river)"/>
                <path d="M0,118 Q100,115 200,120 Q300,125 400,118 L400,160 Q300,165 200,160 Q100,155 0,160 Z" fill="url(#u9shimmer)"/>
                {/* Wave patterns - more organic curves */}
                <path d="M0,125 Q50,118 100,125 Q150,132 200,125 Q250,118 300,125 Q350,132 400,125" fill="none" stroke="white" strokeWidth="1.8" opacity="0.25" style={{animation:"u9-wave-shift 3s linear infinite"}}/>
                <path d="M0,138 Q50,132 100,138 Q150,144 200,138 Q250,132 300,138 Q350,144 400,138" fill="none" stroke="white" strokeWidth="1.1" opacity="0.15" style={{animation:"u9-wave-shift 4s linear infinite 0.5s"}}/>
                <path d="M0,150 Q60,145 120,150 Q180,155 240,150 Q300,145 360,150 Q380,152 400,150" fill="none" stroke="white" strokeWidth="0.7" opacity="0.09" style={{animation:"u9-wave-shift 5s linear infinite 1s"}}/>
                <ellipse cx="320" cy="135" rx="45" ry="6" fill="white" opacity="0.06" style={{animation:"u9-shimmer-move 4s ease-in-out infinite"}}/>
                {/* Discharge plume - organic flowing shape */}
                {treatment==="None" && <g filter="url(#u9blur)" opacity="0.75">
                  <path d="M126,122 Q132,115 148,115 Q164,115 170,122 Q164,129 148,129 Q132,129 126,122" fill={dyeType==="Synthetic"?"#3b82f6":"#92400e"} opacity="0.55"/>
                  <path d="M152,127 Q158,122 168,122 Q178,122 184,127 Q178,132 168,132 Q158,132 152,127" fill={dyeType==="Synthetic"?"#1d4ed8":"#78350f"} opacity="0.4"/>
                  <path d="M176,132 Q182,128 188,128 Q194,128 200,132 Q194,136 188,136 Q182,136 176,132" fill={dyeType==="Synthetic"?"#1e40af":"#451a03"} opacity="0.25"/>
                </g>}
                {/* Fish 1 - more realistic organic shape */}
                {outputs.waterQuality!=="Poor" && <g style={{animation:"u9-fish-swim 4s ease-in-out infinite", transformOrigin:"158px 131px"}}>
                  <g transform="translate(158,131)">
                    <path d="M-8,0 Q-4,-5.5 4,-4.5 Q10,-3 11,0 Q10,3 4,4.5 Q-4,5.5 -8,0 Z" fill="#fbbf24"/>
                    <ellipse cx="-3" cy="-0.5" rx="4" ry="2.5" fill="#fde68a" opacity="0.45"/>
                    <path d="M10,0 Q15,-4 18,-2 L18,2 Q15,4 10,0 Z" fill="#f59e0b"/>
                    <circle cx="-6" cy="-1" r="1.8" fill="#1e293b"/>
                    <circle cx="-6.3" cy="-1.2" r="0.6" fill="white"/>
                    <path d="M-2,-4 Q2,-6 6,-4" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.5"/>
                    <path d="M0,3 Q3,5 6,3" stroke="#f59e0b" strokeWidth="0.8" fill="none" opacity="0.4"/>
                    <path d="M-5,0 L-3,0" stroke="#d97706" strokeWidth="0.8" opacity="0.6"/>
                  </g>
                </g>}
                {/* Fish 2 - more realistic organic shape */}
                {outputs.waterQuality==="Good" && <g style={{animation:"u9-fish2-swim 6s ease-in-out infinite", transformOrigin:"222px 143px"}}>
                  <g transform="translate(222,143)">
                    <path d="M-6,0 Q-3,-4 3,-3.5 Q7,-2 8,0 Q7,2 3,3.5 Q-3,4 -6,0 Z" fill="#34d399"/>
                    <ellipse cx="-2" cy="-0.3" rx="3" ry="1.8" fill="#6ee7b7" opacity="0.45"/>
                    <path d="M7,0 Q11,-3 13,-1.5 L13,1.5 Q11,3 7,0 Z" fill="#10b981"/>
                    <circle cx="-4" cy="-0.5" r="1.4" fill="#1e293b"/>
                    <circle cx="-4.3" cy="-0.7" r="0.5" fill="white"/>
                    <path d="M-4,0 L-2.5,0" stroke="#059669" strokeWidth="0.6" opacity="0.6"/>
                  </g>
                </g>}
                {/* Pollution - organic irregular shapes */}
                {outputs.waterQuality==="Poor" && <g filter="url(#u9blur)" opacity="0.8">
                  <path d="M114,126 Q120,119 132,119 Q144,119 150,126 Q144,133 132,133 Q120,133 114,126" fill="#1e293b" opacity="0.58" style={{animation:"u9-pollution-pulse 2s ease-in-out infinite"}}/>
                  <path d="M198,134 Q204,128 212,128 Q220,128 226,134 Q220,140 212,140 Q204,140 198,134" fill="#0f172a" opacity="0.52" style={{animation:"u9-pollution-pulse 2.5s ease-in-out infinite 0.4s"}}/>
                  <path d="M276,128 Q284,122 292,122 Q300,122 308,128 Q300,134 292,134 Q284,134 276,128" fill="#1e293b" opacity="0.48" style={{animation:"u9-pollution-pulse 3s ease-in-out infinite 0.8s"}}/>
                  <circle cx="172" cy="132" r="5" fill="#0f172a" opacity="0.42" style={{animation:"u9-bubble 2s ease-out infinite 0.3s"}}/>
                  <circle cx="252" cy="138" r="4" fill="#0f172a" opacity="0.38" style={{animation:"u9-bubble 2.5s ease-out infinite 1s"}}/>
                </g>}
                <text x="378" y="154" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" opacity="0.45" letterSpacing="1.5">{isId?"SUNGAI":"RIVER"}</text>
              </svg>
