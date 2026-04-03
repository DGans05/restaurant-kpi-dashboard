"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getLocal, setLocal } from "@/lib/localStorage";
import PageShell from "@/components/PageShell";
import Checklist from "@/components/Checklist";
import SyncBadge from "@/components/SyncBadge";
import CountdownBadge from "@/components/CountdownBadge";
import type { SyncStatus } from "@/lib/types";

type TabId = "prep" | "cats" | "timeline" | "supplies" | "tips";

interface ChecklistSection {
  id: string;
  title: string;
  items: { id: string; label: string }[];
}

interface TimelineItem {
  title: string;
  items: string[];
}

interface TipsSection {
  title: string;
  items: string[];
  intro?: string;
  warning?: string;
}

const ARRIVAL_DATE = "2026-05-11";
const STORAGE_KEY = "bernerPuppyProgress";

const prepSections: ChecklistSection[] = [
  {
    id: "puppy-proof",
    title: "Puppybestendig Maken (Nu Voltooien)",
    items: [
      { id: "pp1", label: "Verwijder alle elektrische snoeren of beveilig ze met snoerbeschermers (puppy's kauwen graag!)." },
      { id: "pp2", label: "Berg alle schoonmaakmiddelen, medicijnen en chemicaliën op in hoge kasten met sloten." },
      { id: "pp3", label: "Verwijder giftige kamerplanten (lelies, philodendron, pothos, sagopalmvaren, etc.)." },
      { id: "pp4", label: "Beveilig prullenbakken met sluitende deksels of plaats ze in kasten." },
      { id: "pp5", label: "Blokkeer toegang tot kleine ruimtes waar puppy vast kan komen (onder bedden, achter meubels)." },
      { id: "pp6", label: "Verwijder of beveilig losse kleden en matten die kunnen schuiven." },
      { id: "pp7", label: "Installeer traphekjes om veilige puppyzones te creëren en trappen te beschermen." },
      { id: "pp8", label: "Berg schoenen, sokken, kinderspeelgoed en kleine voorwerpen op (verstikkingsgevaar)." }
    ]
  },
  {
    id: "cat-zones",
    title: "Kat-Veilige Zones (Essentieel!)",
    items: [
      { id: "cs1", label: "Installeer kattenplanken of wandrekken in elke kamer als verticale vluchtroutes." },
      { id: "cs2", label: "Verplaats voer- en waterbakken van katten naar verhoogde oppervlakken." },
      { id: "cs3", label: "Richt een katten-only kamer in met traphekje." },
      { id: "cs4", label: "Maak kattenbak alleen toegankelijk voor katten via kast, badkamer of kattendeur." },
      { id: "cs5", label: "Creëer meerdere schuilplekken met kattenbomen, dozen of tunnels." }
    ]
  },
  {
    id: "stairs",
    title: "Trap Beheersysteem",
    items: [
      { id: "st1", label: "Koop een stevig traphekje voor bovenaan de trap (vloerbevestiging, niet drukbevestiging)." },
      { id: "st2", label: "Koop een puppy draagtas of draagband voor transport op en neer." },
      { id: "st3", label: "Stel een buitenplasrooster op, rekening houdend met 5-10 trips per dag." },
      { id: "st4", label: "Overweeg een hondentoilet op balkon of terras voor noodgebruik." },
      { id: "st5", label: "Plan krachttraining: een 5 maanden oude Berner weegt al 25-35kg." }
    ]
  }
];

const catSections: ChecklistSection[] = [
  {
    id: "cat-prep",
    title: "Voor Puppy Aankomt (Start NU)",
    items: [
      { id: "cp1", label: "Begin met een traphekje om katten tot bepaalde zones te beperken." },
      { id: "cp2", label: "Speel puppygeluiden of blafvideo's op laag volume om katten te desensibiliseren." },
      { id: "cp3", label: "Neem een dekentje of speeltje met puppygeur mee naar huis vóór aankomst." },
      { id: "cp4", label: "Zorg dat alle katten up-to-date zijn met vaccinaties en vlo/teek preventie." },
      { id: "cp5", label: "Voeg extra kattenbakken toe volgens de regel aantal katten + 1." },
      { id: "cp6", label: "Sla kattensnacks in voor positieve bekrachtiging tijdens introducties." }
    ]
  },
  {
    id: "cat-week1",
    title: "Eerste Week: Scheidingsfase",
    items: [
      { id: "cw1", label: "Dag 1-2: Houd puppy in een aangewezen kamer met gesloten deur." },
      { id: "cw2", label: "Voer katten bij de deur waar puppy is zodat puppygeur met eten wordt geassocieerd." },
      { id: "cw3", label: "Wissel dagelijks beddengoed tussen katten en puppy voor geuruitwisseling." },
      { id: "cw4", label: "Dag 3-4: Installeer een hekje en laat ze elkaar op afstand zien." },
      { id: "cw5", label: "Beloon rustig gedrag aan beide kanten met snacks en lof." },
      { id: "cw6", label: "Dag 5-7: Begeleid visueel contact door hekje, 5-10 minuten per sessie." }
    ]
  },
  {
    id: "cat-intro",
    title: "Week 2-4: Gecontroleerde Introducties",
    items: [
      { id: "ci1", label: "Eerste face-to-face: puppy aan lijn, katten vrij om weg te gaan, 5 minuten." },
      { id: "ci2", label: "Onderbreek achtervolgingen onmiddellijk en leid puppy af." },
      { id: "ci3", label: "Verhoog geleidelijk begeleide tijd samen als iedereen rustig blijft." },
      { id: "ci4", label: "Leer het commando 'laat' zo snel mogelijk." },
      { id: "ci5", label: "Laat ze nooit onbegeleid samen tot puppy 6+ maanden is en volledig vertrouwd." }
    ]
  }
];

const timeline: TimelineItem[] = [
  {
    title: "📦 2 Weken Van Tevoren (27 april)",
    items: [
      "Koop alle benodigdheden van checklist.",
      "Voltooi huis puppybestendig maken.",
      "Richt puppyzone in met bench, bed en speeltjes.",
      "Bereid kat-veilige zones en verhoogde vluchtplekken voor.",
      "Plan eerste dierenartsafspraak binnen 3 dagen na aankomst.",
      "Vind lokale spoeddierenarts en bewaar contactinfo.",
      "Onderzoek puppytrainingsklassen in je omgeving."
    ]
  },
  {
    title: "🏡 1 Week Van Tevoren (4 mei)",
    items: [
      "Haal geuritem van fokker op indien mogelijk.",
      "Begin puppygeluiden af te spelen voor katten.",
      "Zet voerstation en plasgebied op.",
      "Sla schoonmaakspullen in, zoals enzymreiniger.",
      "Bereid slaapschema voor: puppy's hebben 18-20 uur slaap per dag nodig.",
      "Plan de eerste week maaltijden met hetzelfde voer als de fokker gebruikt."
    ]
  },
  {
    title: "🐕 Aankomstdag (11 mei)",
    items: [
      "Draag puppy naar boven: geen trappen klimmen.",
      "Laat puppy eerst alleen de aangewezen kamer verkennen.",
      "Bied direct water aan en voer na 1-2 uur.",
      "Ga elk 1-2 uur naar buiten voor een plasje.",
      "Houd katten volledig gescheiden.",
      "Start direct benchtraining door maaltijden in de bench te geven.",
      "Documenteer de eerste dag met foto's en video's.",
      "Verwacht veel huilen in de eerste nacht."
    ]
  },
  {
    title: "🏥 Eerste Week (11-18 mei)",
    items: [
      "Dierenartscheck binnen 72 uur en papierwerk van fokker meenemen.",
      "Stel plasroutine vast na wakker worden, eten, spelen en slapen.",
      "Start basis naamherkenningstraining.",
      "Begin dagelijks met zacht aanraken van poten, oren en bek.",
      "Houd katten gescheiden en doe geuruitwisseling.",
      "Monitor eten, drinken en ontlasting.",
      "Stel nachtroutine op met bench naast je bed.",
      "Maak foto's en video's om groei bij te houden."
    ]
  },
  {
    title: "📚 Week 2-4 (19 mei - 8 juni)",
    items: [
      "Start gecontroleerde kat-introducties, eerst alleen visueel door hekje.",
      "Begin puppy socialisatie met nieuwe geluiden, oppervlakken en aanrakingen.",
      "Introduceer basiscommando's: zit, kom, laat.",
      "Ga door met zindelijkheidstraining: ongelukjes zijn normaal.",
      "Start puppytrainingsles indien beschikbaar.",
      "Bouw rustig alleen-tijd op om separatieangst te voorkomen."
    ]
  },
  {
    title: "🌱 Maand 2-6",
    items: [
      "Voltooi kernvaccinaties op 8, 12 en 16 weken.",
      "Werk naar begeleid kat-samenleven toe.",
      "Beheers basiscommando's en zindelijkheidstraining.",
      "Begin lijnttraining voor korte wandelingen.",
      "Socialiseer met andere gevaccineerde puppy's.",
      "Blijf trappen vermijden tot de dierenarts het goedkeurt.",
      "Monitor op heup- en elleboogproblemen."
    ]
  }
];

const supplySections: ChecklistSection[] = [
  {
    id: "sup-voer",
    title: "🍽️ Voer Essentials",
    items: [
      { id: "sup-voer-1", label: "RVS bakken (2 grote, eventueel met verhoogde standaard)" },
      { id: "sup-voer-2", label: "Waterbak die zwaar en kantelvrij is" },
      { id: "sup-voer-3", label: "Puppyvoer voor grote rassen" },
      { id: "sup-voer-4", label: "Luchtdichte voedselopslag container" },
      { id: "sup-voer-5", label: "Slow-feeder bak" }
    ]
  },
  {
    id: "sup-huis",
    title: "🏠 Huisvesting & Comfort",
    items: [
      { id: "sup-huis-1", label: "Extra-grote bench" },
      { id: "sup-huis-2", label: "Benchverdeler" },
      { id: "sup-huis-3", label: "Orthopedisch hondenbed" },
      { id: "sup-huis-4", label: "Bench mat of kussen" },
      { id: "sup-huis-5", label: "3-4 wasbare dekens" },
      { id: "sup-huis-6", label: "Puppyren of 2-3 traphekjes" }
    ]
  },
  {
    id: "sup-speel",
    title: "🦴 Speeltjes & Verrijking",
    items: [
      { id: "sup-speel-1", label: "Puppy Kong" },
      { id: "sup-speel-2", label: "Kauwtoys" },
      { id: "sup-speel-3", label: "Touwspeeltjes alleen onder toezicht" },
      { id: "sup-speel-4", label: "Puzzeltoys of snackdispensers" },
      { id: "sup-speel-5", label: "Zacht pluche speeltje" },
      { id: "sup-speel-6", label: "Grote ballen zonder verstikkingsgevaar" }
    ]
  },
  {
    id: "sup-wandel",
    title: "🚶 Wandel Uitrusting",
    items: [
      { id: "sup-wandel-1", label: "Front-clip tuigje" },
      { id: "sup-wandel-2", label: "Platte halsband met ID-tag" },
      { id: "sup-wandel-3", label: "Trainingslijn" },
      { id: "sup-wandel-4", label: "Lange lijn voor training" },
      { id: "sup-wandel-5", label: "Poepzakjes en dispenser" },
      { id: "sup-wandel-6", label: "Reflecterende uitrusting" }
    ]
  },
  {
    id: "sup-verzorg",
    title: "🧼 Verzorgingsartikelen",
    items: [
      { id: "sup-verzorg-1", label: "Slicker borstel" },
      { id: "sup-verzorg-2", label: "Metalen kam voor de ondervacht" },
      { id: "sup-verzorg-3", label: "Nagelknipper of slijper" },
      { id: "sup-verzorg-4", label: "Zachte hondenshampoo" },
      { id: "sup-verzorg-5", label: "Oorreinigingsoplossing" },
      { id: "sup-verzorg-6", label: "Hondentandenborstel en pasta" },
      { id: "sup-verzorg-7", label: "Verzorgingsmat" }
    ]
  },
  {
    id: "sup-schoon",
    title: "🧽 Schoonmaakartikelen",
    items: [
      { id: "sup-schoon-1", label: "Enzymreiniger" },
      { id: "sup-schoon-2", label: "Keukenpapier" },
      { id: "sup-schoon-3", label: "Wegwerphandschoenen" },
      { id: "sup-schoon-4", label: "Tapijtspotverwijderaar" },
      { id: "sup-schoon-5", label: "Pluizenroller" },
      { id: "sup-schoon-6", label: "Luchtverfrisser" }
    ]
  },
  {
    id: "sup-gezond",
    title: "💊 Gezondheid & Veiligheid",
    items: [
      { id: "sup-gezond-1", label: "EHBO-kit voor huisdieren" },
      { id: "sup-gezond-2", label: "Thermometer" },
      { id: "sup-gezond-3", label: "Styptisch poeder" },
      { id: "sup-gezond-4", label: "Vlo- en teekpreventie" },
      { id: "sup-gezond-5", label: "Microchipregistratie" },
      { id: "sup-gezond-6", label: "Informatie over huisdierverzekering" }
    ]
  },
  {
    id: "sup-train",
    title: "📚 Trainingstools",
    items: [
      { id: "sup-train-1", label: "Kleine trainingssnacks" },
      { id: "sup-train-2", label: "Snacktasje" },
      { id: "sup-train-3", label: "Clicker (optioneel)" },
      { id: "sup-train-4", label: "Trainingsboeken of bronnen" },
      { id: "sup-train-5", label: "Bittere appel spray" }
    ]
  }
];

const tipsSections: TipsSection[] = [
  {
    title: "⚕️ Gezondheidsoverwegingen (Cruciaal!)",
    intro: "Berners hebben een kortere gemiddelde levensduur en zijn gevoelig voor specifieke gezondheidsproblemen. Preventie en vroege detectie zijn sleutelzaken.",
    items: [
      "Heup- en elleboogdysplasie: vermijd trappen, springen en hard rennen tot 5-6 maanden.",
      "Maagdraaiing/GDV: gebruik een slow-feeder, voer kleine maaltijden en vermijd beweging rond eten.",
      "Kankerrisico: doe maandelijkse thuischecks en jaarlijkse dierenartscontroles.",
      "Warmtegevoeligheid: plan beweging in de vroege ochtend of late avond.",
      "Groeisnelheid: houd puppy slank en volg groot-ras puppyvoedingsrichtlijnen."
    ]
  },
  {
    title: "🐾 Beweging & Training",
    items: [
      "Houd beweging low-impact tot 12-18 maanden.",
      "Voorzie mentale stimulatie met puzzels, training en snuffelwerk.",
      "Gebruik het socialisatievenster van 8-16 weken bewust.",
      "Train uitsluitend met positieve bekrachtiging.",
      "Bouw vroeg alleen-tijd op om separatieangst te voorkomen."
    ]
  },
  {
    title: "🧼 Verzorgingsbehoeften",
    items: [
      "Dagelijks borstelen voorkomt klitten en houdt de ondervacht bij.",
      "Bad elke 6-8 weken of wanneer nodig.",
      "Nagels elke 2-3 weken.",
      "Tanden liefst dagelijks, minimaal 3 keer per week.",
      "Controleer wekelijks de oren op roodheid of geur."
    ]
  },
  {
    title: "🏠 Wonen in Appartement (1 Hoog)",
    warning: "Volwassen Berners wegen 40-55kg. Je zult maandenlang een grote puppy op en neer de trap dragen, vaak meerdere keren per dag.",
    items: [
      "Plasbreaks elke 1-2 uur kunnen veel traptrips opleveren.",
      "Berners passen zich vaak goed aan appartementen aan als ze goed worden begeleid.",
      "Train vroeg op rustig gedrag bij geluiden en de deurbel.",
      "Voorzie koele plekken binnenshuis.",
      "Informeer buren vooraf over de nieuwe puppy."
    ]
  },
  {
    title: "🍖 Voer Richtlijnen",
    items: [
      "Gebruik groot-ras puppyformule.",
      "8-12 weken: 4 maaltijden per dag, 3-6 maanden: 3 maaltijden, daarna 2.",
      "Pas porties aan op lichaamsconditie.",
      "Snacks maximaal 10% van dagelijkse calorieën.",
      "Vermijd chocolade, druiven, uien, knoflook, xylitol en gekookte botten."
    ]
  },
  {
    title: "❄️ Temperatuur Management",
    items: [
      "Vanaf ongeveer 18°C extra opletten en wandelingen naar koele uren verplaatsen.",
      "In de winter voelen Berners zich vaak prettig, maar let op ijs en zout aan poten.",
      "Binnenshuis gedijen ze meestal goed bij 15-20°C."
    ]
  }
];

const emergencyContacts = [
  ["Huisdierenarts", "___________________"],
  ["Spoeddierenarts (24/7)", "___________________"],
  ["Fokker", "___________________"],
  ["Vergiftigingslijn Huisdieren", "NL: 030-2 747 888"],
  ["Hondentrainer", "___________________"]
];

const tabs: { id: TabId; label: string }[] = [
  { id: "prep", label: "🏠 Voorbereiding" },
  { id: "cats", label: "🐱 Kat Integratie" },
  { id: "timeline", label: "📋 Tijdlijn" },
  { id: "supplies", label: "🛒 Benodigdheden" },
  { id: "tips", label: "💡 Berner Tips" }
];

export default function ChecklistPage() {
  const [activeTab, setActiveTab] = useState<TabId>("prep");
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMergedRemote = useRef(false);

  const prepIds = useMemo(() => prepSections.flatMap((s) => s.items.map((i) => i.id)), []);
  const catIds = useMemo(() => catSections.flatMap((s) => s.items.map((i) => i.id)), []);
  const supplyIds = useMemo(() => supplySections.flatMap((s) => s.items.map((i) => i.id)), []);
  const allIds = useMemo(() => [...prepIds, ...catIds, ...supplyIds], [prepIds, catIds, supplyIds]);

  const completedPrep = prepIds.filter((id) => checkedState[id]).length;
  const prepProgress = prepIds.length === 0 ? 0 : Math.round((completedPrep / prepIds.length) * 100);
  const completedSupplies = supplyIds.filter((id) => checkedState[id]).length;
  const supplyProgress = supplyIds.length === 0 ? 0 : Math.round((completedSupplies / supplyIds.length) * 100);
  const totalCompleted = allIds.filter((id) => checkedState[id]).length;
  const overallProgress = allIds.length === 0 ? 0 : Math.round((totalCompleted / allIds.length) * 100);

  useEffect(() => {
    try {
      const saved = getLocal<Record<string, boolean>>(STORAGE_KEY);
      if (saved) setCheckedState(saved);
    } finally {
      setHasLoadedProgress(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedProgress) return;
    setSyncStatus("syncing");
    getSupabase()
      .from("puppy_state")
      .select("value")
      .eq("key", "progress")
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setSyncStatus("offline"); return; }
        const remoteValue = data.value as Record<string, boolean>;
        setCheckedState((current) => ({ ...current, ...remoteValue }));
        hasMergedRemote.current = true;
        setSyncStatus("synced");
      });
  }, [hasLoadedProgress]);

  useEffect(() => {
    if (!hasLoadedProgress || !hasMergedRemote.current) return;
    setLocal(STORAGE_KEY, checkedState);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSyncStatus("syncing");
    debounceRef.current = setTimeout(() => {
      getSupabase()
        .from("puppy_state")
        .upsert({ key: "progress", value: checkedState, updated_at: new Date().toISOString() })
        .then(({ error }) => setSyncStatus(error ? "offline" : "synced"));
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [checkedState, hasLoadedProgress]);

  const toggleCheck = (id: string) => {
    setCheckedState((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <PageShell>
      <div className="checklist-hero">
        <p className="page-subtitle" style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.75rem", opacity: 0.72, marginBottom: "0.5rem" }}>
          Voorbereiding
        </p>
        <h1 className="checklist-hero-title">🐕 Berner Senner Puppy Gids</h1>
        <p className="checklist-hero-subtitle">Volledige voorbereidingschecklist voor je nieuwe gezinslid</p>

        <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap" }}>
          <CountdownBadge arrivalDate={ARRIVAL_DATE} />

          <div>
            <div className="overall-progress">
              <div className="overall-progress-bar">
                <div
                  className="overall-progress-fill"
                  style={{ width: `${overallProgress}%` }}
                  role="progressbar"
                  aria-valuenow={overallProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="overall-progress-text">
                {totalCompleted} van {allIds.length} taken voltooid
              </p>
            </div>
            <SyncBadge status={syncStatus} />
          </div>
        </div>
      </div>

      <div className="tab-bar" role="tablist" aria-label="Puppy gids secties">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "prep" && (
        <div className="card">
          <h2><span className="icon">🏠</span> Huis Voorbereidingschecklist</h2>
          <div className="alert alert-warning">
            <strong>⚠️ Trap Veiligheid Prioriteit</strong>
            1 hoog wonen zonder lift betekent dat je je puppy de eerste 4-5 maanden op en neer moet dragen.
            Berners zijn gevoelig voor heup- en elleboogdysplasie, dus geen trappen klimmen tot de groeiplaten voldoende ontwikkeld zijn.
          </div>
          {prepSections.map((section) => (
            <Checklist checkedState={checkedState} key={section.id} onToggle={toggleCheck} section={section} />
          ))}
          <div className="progress-bar" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${prepProgress}%` }} />
          </div>
          <p className="progress-text">{completedPrep} van {prepIds.length} voltooid ({prepProgress}%)</p>
        </div>
      )}

      {activeTab === "cats" && (
        <div className="card">
          <h2><span className="icon">🐱</span> Kat Introductie Protocol</h2>
          <div className="alert alert-info">
            <strong>🐾 Goed Nieuws</strong>
            Berner Senners zijn doorgaans zachte reuzen. Met een gecontroleerde, geleidelijke kennismaking kunnen ze vaak uitstekend samenleven met katten.
          </div>
          {catSections.map((section, index) => (
            <div key={section.id}>
              {index === 1 && (
                <div className="tip-box">
                  <strong>De Gouden Regel:</strong> Houd ze de eerste 3-7 dagen volledig gescheiden. Ze mogen elkaar ruiken en horen, maar nog niet direct ontmoeten.
                </div>
              )}
              <Checklist checkedState={checkedState} onToggle={toggleCheck} section={section} />
            </div>
          ))}
          <div className="alert alert-warning">
            <strong>⚠️ Rode Vlaggen Om Op Te Letten</strong>
            <ul className="plain-list">
              <li>Puppy is gefixeerd op katten met een intense starende blik.</li>
              <li>Katten verstoppen zich constant, eten niet of worden agressief.</li>
              <li>Puppy reageert niet op commando&apos;s rond katten.</li>
              <li>Er is agressief grommen, happen of uitvallen van beide kanten.</li>
            </ul>
            Vertraag het proces of schakel een professionele trainer in als je dit ziet.
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="card">
          <h2><span className="icon">📋</span> Eerste Maand Tijdlijn</h2>
          <div className="timeline">
            {timeline.map((entry) => (
              <div className="timeline-item" key={entry.title}>
                <div className="timeline-title">{entry.title}</div>
                <ul className="plain-list">
                  {entry.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "supplies" && (
        <div className="card">
          <h2><span className="icon">🛒</span> Volledige Benodigdheden Checklist</h2>
          <div className="alert alert-success">
            <strong>💰 Budget Gids</strong>
            Verwacht ongeveer €300-500 uit te geven aan initiële benodigdheden. Kies liever voor duurzame kwaliteitsartikelen dan voor tijdelijke oplossingen.
          </div>
          {supplySections.map((section) => (
            <Checklist checkedState={checkedState} key={section.id} onToggle={toggleCheck} section={section} />
          ))}
          <div className="progress-bar" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${supplyProgress}%` }} />
          </div>
          <p className="progress-text">{completedSupplies} van {supplyIds.length} voltooid ({supplyProgress}%)</p>
          <div className="emergency-contacts">
            <h4>🚨 Belangrijke Contacten</h4>
            {emergencyContacts.map(([label, value]) => (
              <div className="contact-item" key={label}>
                <span className="contact-label">{label}</span>
                <span className="contact-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "tips" && (
        <div className="card">
          <h2><span className="icon">💡</span> Berner Senner Specifieke Tips</h2>
          <div className="alert alert-info">
            <strong>🏔️ Over Je Ras</strong>
            Berner Senners zijn loyaal, kalm en sterk gezinsgericht, maar hebben door hun grootte en bouw wel specifieke aandachtspunten.
          </div>
          {tipsSections.map((section) => (
            <div key={section.title}>
              <h3>{section.title}</h3>
              {section.intro && <div className="tip-box">{section.intro}</div>}
              {section.warning && (
                <div className="alert alert-warning">
                  <strong>⚠️ Realiteitscheck</strong>
                  {section.warning}
                </div>
              )}
              <ul className="plain-list spacious">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
          <div className="tip-box">
            <strong>💰 Kosten Realiteitscheck</strong><br />
            Reken in het eerste jaar op grofweg €3000-5000 aan voer, verzekering, dierenartszorg, verzorging en vervanging van spullen terwijl je puppy groeit.
          </div>
        </div>
      )}
    </PageShell>
  );
}
