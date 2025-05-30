import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  setLogLevel, // For debugging Firestore
} from "firebase/firestore";

// Tailwind CSS is assumed to be available globally.

// --- Firebase Configuration ---
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "YOUR_FALLBACK_API_KEY", // Fallback if __firebase_config is not available
        authDomain: "YOUR_FALLBACK_AUTH_DOMAIN",
        projectId: "YOUR_FALLBACK_PROJECT_ID",
        storageBucket: "YOUR_FALLBACK_STORAGE_BUCKET",
        messagingSenderId: "YOUR_FALLBACK_MESSAGING_SENDER_ID",
        appId: "YOUR_FALLBACK_APP_ID",
      };

const appId = typeof __app_id !== "undefined" ? __app_id : "default-ielts-app";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
// setLogLevel('debug'); // Uncomment for Firestore debugging logs

const ieltsWords = {
  "UNIT 1: GROWING UP": [
    "adolescence",
    "adulthood",
    "bond",
    "brotherhood",
    "character",
    "childhood",
    "conflict",
    "connection",
    "fatherhood",
    "friendship",
    "instinct",
    "interaction",
    "motherhood",
    "nature",
    "parent",
    "relation",
    "relationship",
    "relative",
    "resemblance",
    "rivalry",
    "sibling",
    "teenager",
    "temperament",
    "ties",
    "upbringing",
    "active role",
    "extended family",
    "family gathering",
    "immediate family",
    "maternal instinct",
    "sibling rivalry",
    "stable upbringing",
    "striking resemblance",
    "close",
    "close-knit",
    "maternal",
    "parental",
    "rewarding",
    "stable",
    "accommodate",
    "adopt",
    "break down",
    "develop",
    "endure",
    "establish",
    "have sth in common",
    "inherit",
    "interact",
    "nurture",
    "play a role",
    "relate (to)",
  ],
  "UNIT 2: MENTAL AND PHYSICAL DEVELOPMENT": [
    "ability",
    "adolescent",
    "behaviour",
    "childhood",
    "concept",
    "consequence",
    "gesture",
    "growth",
    "height",
    "imagination",
    "infancy",
    "infant",
    "knowledge",
    "maturity",
    "memory",
    "milestone",
    "mind",
    "peers",
    "period",
    "phase",
    "rate",
    "reminder",
    "social skills",
    "skill",
    "stage",
    "toddler",
    "transition",
    "abstract",
    "cognitive",
    "clumsy",
    "fond",
    "fully grown",
    "immature",
    "independent",
    "irresponsible",
    "mature",
    "patient",
    "rebellious",
    "significant",
    "tolerant",
    "acquire",
    "develop",
    "gesture",
    "grow",
    "imitate",
    "look back",
    "master",
    "mature",
    "remember",
    "remind",
    "reminisce",
    "throw a tantrum",
    "visualise",
    "typically",
    "bear in mind",
    "broaden the mind",
    "have something in mind",
    "have something on your mind",
    "it slipped my mind",
    "keep an open mind",
    "my mind went blank",
    "put your mind at ease",
  ],
  "UNIT 3: KEEPING FIT": [
    "allergy",
    "anxiety",
    "appetite",
    "artery",
    "asset",
    "benefit",
    "cravings",
    "depression",
    "diagnosis",
    "diet",
    "dietician",
    "disease",
    "(eating) disorder",
    "exercise",
    "factor",
    "fast food",
    "fat",
    "harm",
    "health",
    "heart attack",
    "infection",
    "ingredients",
    "insomnia",
    "intake",
    "junk food",
    "muscle",
    "nutrient",
    "nutrition",
    "obesity",
    "onset",
    "portion",
    "risk",
    "serving",
    "stress",
    "stroke",
    "treatment",
    "therapy",
    "variety",
    "weight",
    "acute",
    "allergic",
    "alternate",
    "brisk",
    "chronic",
    "harmful",
    "healthy",
    "infectious",
    "moderate",
    "obese",
    "overweight",
    "persistent",
    "regular",
    "vital",
    "avoid",
    "counteract",
    "curb",
    "cure",
    "diminish",
    "disrupt",
    "eliminate",
    "maintain",
    "overdo",
    "prevent",
    "recommend",
    "recover",
    "reduce",
    "skip",
    "stimulate",
    "trigger",
  ],
  "UNIT 4: LIFESTYLES": [
    "make a choice",
    "make a decision",
    "make a living",
    "meet a need",
    "miss (an opportunity)",
    "play a role",
    "put pressure on",
    "set a goal",
    "take part (in)",
    "work hard for a living",
    "all walks of life",
    "cost of living",
    "lifelong ambition",
    "living expenses",
    "once-in-a-lifetime opportunity",
    "standard of living",
    "way of life",
  ],
  "UNIT 5: STUDENT LIFE": [
    "assignment",
    "college",
    "controversy",
    "curriculum",
    "dissertation",
    "education",
    "exam",
    "field",
    "findings",
    "funding",
    "grade",
    "graduation",
    "grant",
    "high school",
    "homework",
    "junior school",
    "kindergarten",
    "knowledge",
    "lecture",
    "library",
    "limits",
    "Masters",
    "nursery",
    "PhD",
    "primary school",
    "programme",
    "project",
    "research",
    "resources",
    "results",
    "scholarship",
    "scope",
    "secondary school",
    "source",
    "syllabus",
    "task",
    "thesis",
    "tutor",
    "topic",
    "university",
    "academic",
    "eligible",
    "mixed",
    "postgraduate",
    "relevant",
    "senior",
    "single-sex",
    "studious",
    "work-related",
    "adopt (an approach)",
    "analyse",
    "conduct",
    "concentrate",
    "consider",
    "find out",
    "graduate",
    "learn",
    "organise",
    "overcome",
    "review",
    "revise",
    "struggle",
    "take (a course)",
    "relatively",
  ],
  "UNIT 6: EFFECTIVE COMMUNICATION": [
    "accent",
    "communication",
    "conclusion",
    "conjecture",
    "dialect",
    "fluency",
    "gesture",
    "hesitation",
    "language",
    "linguist",
    "meaning",
    "mispronunciation",
    "mother tongue",
    "native speaker",
    "pronunciation",
    "sign language",
    "vocabulary",
    "coherent",
    "incoherent",
    "inherent",
    "sophisticated",
    "spontaneous",
    "clarify",
    "communicate",
    "comprehend",
    "conclude",
    "confirm",
    "converse",
    "define",
    "demonstrate",
    "distinguish",
    "emerge",
    "evolve",
    "explain",
    "express",
    "gesture",
    "illustrate",
    "imply",
    "indicate",
    "pronounce",
    "recall",
    "refer (to)",
    "signify",
    "state",
    "stutter",
    "suggest",
    "translate",
    "there is something to be said for",
    "needless to say",
    "have a say",
    "when all is said and done",
    "having said that",
    "to say the least",
    "you can say that again!",
    "that is to say",
  ],
  "UNIT 7: ON THE MOVE": [
    "accommodation",
    "attraction",
    "community",
    "countryside",
    "destination",
    "district",
    "effect",
    "facilities",
    "identification",
    "immigrant",
    "inhabitant",
    "immigration",
    "impact",
    "landscape",
    "luggage",
    "migration",
    "motion",
    "tourism",
    "transport",
    "travel",
    "travelling",
    "trend",
    "trip",
    "village",
    "adventurous",
    "budget",
    "breathtaking",
    "coastal",
    "cosmopolitan",
    "diverse",
    "flexible",
    "foreign",
    "local",
    "luxurious",
    "mountainous",
    "peaceful",
    "picturesque",
    "polluted",
    "quaint",
    "remote",
    "rough",
    "rural",
    "scenic",
    "stunning",
    "tough",
    "traditional",
    "unspoilt",
    "urban",
    "affect",
    "fluctuate",
  ],
  "UNIT 8: THROUGH THE AGES": [
    "age",
    "ancestor",
    "centenary",
    "century",
    "decade",
    "era",
    "evidence",
    "excavation",
    "generation",
    "the Middle Ages",
    "millennia",
    "period",
    "phase",
    "pioneer",
    "timeline",
    "ancient",
    "chronological",
    "consecutive",
    "historical",
    "imminent",
    "middle-aged",
    "nostalgic",
    "prehistoric",
    "prior (to)",
    "punctual",
    "time-consuming",
    "erode",
    "infer",
    "predate",
    "span",
    "in chronological order",
    "lose track of time",
    "on time",
    "save time",
    "spend time",
    "take so long",
    "the right time",
  ],
  "UNIT 9: THE NATURAL WORLD": [
    "agriculture",
    "animal kingdom",
    "biodiversity",
    "climate",
    "climate change",
    "condition",
    "disaster",
    "ecological balance",
    "ecology",
    "environment",
    "erosion",
    "evolution",
    "fauna",
    "flora",
    "fossil",
    "fossil fuels",
    "habitat",
    "human",
    "impact",
    "Mother Nature",
    "pesticide",
    "pollution",
    "predator",
    "prey",
    "repercussions",
    "scent",
    "soil",
    "vegetation",
    "waste",
    "arid",
    "catastrophic",
    "disastrous",
    "domesticated",
    "endangered",
    "extinct",
    "genetically-modified",
    "native",
    "natural",
    "resistant",
    "rural",
    "tame",
    "tropical",
    "vulnerable",
    "wild",
    "adapt",
    "combat",
    "cultivate",
    "conserve",
    "eradicate",
    "evolve",
    "hibernate",
    "tolerate",
  ],
  "UNIT 10: REACHING FOR THE SKIES": [
    "astronaut",
    "atmosphere",
    "commercial",
    "cosmos",
    "crater",
    "debris",
    "Earth",
    "exploration",
    "exterior",
    "galaxy",
    "gas",
    "gravity",
    "horizon",
    "launch",
    "meteor",
    "moon",
    "ocean",
    "orbit",
    "outer space",
    "planet",
    "radiation",
    "rocket",
    "satellite",
    "simulator",
    "solar system",
    "space",
    "spacecraft",
    "space shuttle",
    "space station",
    "surface",
    "universe",
    "weightlessness",
    "cosmic",
    "extreme",
    "gravitational",
    "horizontal",
    "inevitable",
    "lunar",
    "meteorite",
    "outer",
    "solar",
    "terrestrial",
    "toxic",
    "uninhabitable",
    "universal",
    "unmanned",
    "acclimatise",
    "colonise",
    "explore",
    "float",
    "propel",
    "rotate",
    "sustain",
    "simulate",
    "undergo",
  ],
  "UNIT 11: DESIGN AND INNOVATION": [
    "alarm",
    "brick",
    "building",
    "ceiling",
    "concrete",
    "construction",
    "cottage",
    "design",
    "device",
    "discovery",
    "elevator",
    "engineering",
    "frame",
    "gadget",
    "housing",
    "innovation",
    "invention",
    "landmark",
    "lift shaft",
    "occupant",
    "patent",
    "platform",
    "pillar",
    "quarry",
    "residence",
    "skyscraper",
    "staircase",
    "steel",
    "storage",
    "structure",
    "tension",
    "timber",
    "airy",
    "conventional",
    "cosy",
    "cramped",
    "curved",
    "disposable",
    "domestic",
    "exterior",
    "futuristic",
    "high-rise",
    "innovative",
    "internal",
    "mass-produced",
    "modern",
    "multi-storey",
    "old-fashioned",
    "ornate",
    "prefabricated",
    "single-storey",
    "spacious",
    "state-of-the-art",
    "traditional",
    "ultra-modern",
    "activate",
    "automate",
    "build",
    "condemn",
    "construct",
    "decorate",
    "demolish",
    "design",
    "develop",
    "devise",
    "haul",
    "hoist",
    "invent",
    "maintain",
    "occupy",
    "reconstruct",
    "renovate",
    "support",
    "trigger",
  ],
  "UNIT 12: INFORMATION TECHNOLOGY": [
    "automatic pilot",
    "computerisation",
    "connection",
    "data",
    "device",
    "function",
    "gadget",
    "the Internet",
    "keyboard",
    "keypad",
    "laptop (computer)",
    "link",
    "memory",
    "monitor",
    "patent",
    "program",
    "prototype",
    "remote control",
    "silicon chip",
    "technology",
    "telecommunications",
    "vision",
    "wireless connection",
    "compact",
    "computerised",
    "cutting-edge",
    "cyber",
    "dated",
    "digital",
    "labour-saving",
    "portable",
    "state-of-the-art",
    "up-to-date",
    "user-friendly",
    "virtual",
    "access",
    "connect",
    "download",
    "display",
    "envisage",
    "operate",
    "revolutionise",
    "scroll",
    "speculate",
    "store",
    "surpass",
    "automatically",
  ],
  "UNIT 13: THE MODERN WORLD": [
    "attitude",
    "brand",
    "culture",
    "cycle",
    "demographics",
    "development",
    "diversity",
    "globalisation",
    "hindsight",
    "icon",
    "identity",
    "implication",
    "impact",
    "increase",
    "influence",
    "industry",
    "isolation",
    "joint venture",
    "(have a) monopoly",
    "modernisation",
    "multiculturalism",
    "percentage",
    "population",
    "prediction",
    "projection",
    "proportion",
    "rate",
    "statistics",
    "trend",
    "ageing",
    "ancient",
    "contemporary",
    "current",
    "demographic",
    "elderly",
    "ethnic",
    "exotic",
    "global",
    "local",
    "long-term",
    "mid-term",
    "multicultural",
    "primitive",
    "sceptical",
    "short-term",
    "subsequent",
    "wealthy",
    "worldwide",
    "contribute",
    "decline",
    "diminish",
    "dominate",
    "dwindle",
    "factor",
    "indicate",
    "merge",
    "migrate",
  ],
  "UNIT 14: URBANISATION": [
    "benefit",
    "challenge",
    "compromise",
    "difficulty",
    "dilemma",
    "inhabitant",
    "infrastructure",
    "isolation",
    "issue",
    "megacity",
    "migrant",
    "obstacle",
    "overpopulation",
    "population",
    "poverty",
    "resolution",
    "setback",
    "slum",
    "solution",
    "tolerance",
    "traffic",
    "urbanisation",
    "adequate",
    "basic",
    "booming",
    "catastrophic",
    "crowded",
    "decent",
    "developing",
    "double-edged",
    "isolated",
    "one-sided",
    "long-sighted",
    "long-term",
    "overcrowded",
    "overworked",
    "pressing",
    "rural",
    "short-sighted",
    "short-term",
    "staggering",
    "tolerant",
    "address",
    "adjust",
    "aggravate",
    "cause",
    "compete",
    "deal with",
    "deteriorate",
    "enhance",
    "exacerbate",
    "exclude",
    "face",
    "flourish",
    "identify",
    "improve",
    "include",
    "linger",
    "modify",
    "overcome",
    "present",
    "raise",
    "reform",
    "regulate",
    "remedy",
    "resolve",
    "tackle",
    "tolerate",
    "transform",
    "worsen",
    "find a solution",
    "overcome a difficulty",
    "reach",
    "remedy a situation",
    "resolve an issue",
  ],
  "UNIT 15: THE GREEN REVOLUTION": [
    "acid rain",
    "biodiversity",
    "climate change",
    "contamination",
    "deforestation",
    "disposal",
    "drought",
    "ecosystem",
    "emission",
    "environment",
    "erosion",
    "exhaust fumes",
    "fertiliser",
    "flood",
    "food chain",
    "fumes",
    "greenhouse gases",
    "pollutant",
    "pollution",
    "process",
    "refuse",
    "strain",
    "threat",
    "waste",
    "achievable",
    "advantageous",
    "at risk",
    "beneficial",
    "chronic",
    "conceivable",
    "contaminated",
    "devastating",
    "doubtful",
    "environmental",
    "environmentally friendly",
    "feasible",
    "fruitless",
    "futile",
    "immune",
    "impracticable",
    "improbable",
    "in danger (of)",
    "insoluble",
    "irreparable",
    "irreplaceable",
    "irreversible",
    "liable",
    "life-threatening",
    "pervasive",
    "pointless",
    "pristine",
    "questionable",
    "recycling",
    "sustainable",
    "taxing",
    "unattainable",
    "unlikely",
    "unprecedented",
    "urgent",
    "viable",
    "vital",
    "worthwhile",
    "confront",
    "contaminate",
    "dispose of",
    "dump",
    "threaten",
    "verb",
    "inexorably",
    "inevitably",
  ],
  "UNIT 16: THE ENERGY CRISIS": [
    "atmosphere",
    "balance",
    "biofuel",
    "carbon",
    "carbon dioxide",
    "crisis",
    "electricity",
    "emission",
    "fossil fuel",
    "fuel",
    "fumes",
    "gas",
    "greenhouse gas",
    "hybrid",
    "hydrogen",
    "petrol",
    "resource",
    "turbine",
    "vehicle",
    "alternative",
    "critical",
    "disposable",
    "drastic",
    "eco-friendly",
    "efficient",
    "effective",
    "environmentally friendly",
    "nuclear",
    "rechargeable",
    "renewable",
    "solar",
    "unleaded (petrol)",
    "absorb",
    "combust",
    "consume",
    "convert",
    "counter",
    "deplete",
    "diminish",
    "discharge",
    "dwindle",
    "emit",
    "expend",
    "limit",
    "maintain",
    "preserve",
    "retain",
    "waste",
  ],
  "UNIT 17: TALKING BUSINESS": [
    "advertisement",
    "advertising",
    "boss",
    "campaign",
    "candidate",
    "career",
    "client",
    "colleague",
    "company",
    "consumer",
    "credibility",
    "customer",
    "earnings",
    "employee",
    "employer",
    "employment",
    "experience",
    "goods",
    "income",
    "industry",
    "interview",
    "job",
    "job satisfaction",
    "labourer",
    "management",
    "manual work",
    "market",
    "marketing",
    "meeting",
    "money",
    "niche",
    "occupation",
    "office",
    "overheads",
    "overtime",
    "packaging",
    "pay",
    "perk",
    "product",
    "profession",
    "promotion",
    "prospects",
    "qualifications",
    "retirement",
    "salary",
    "sales",
    "shift work",
    "skills",
    "staff",
    "strike",
    "supervisor",
    "takeover",
    "target",
    "trade",
    "trend",
    "unemployment",
    "wages",
    "workforce",
    "workplace",
    "casual",
    "demanding",
    "economic",
    "economical",
    "exhausting",
    "hospitality",
    "monotonous",
    "part-time",
    "redundant",
    "rewarding",
    "unemployed",
    "unskilled",
    "apply",
    "compete",
    "earn",
    "employ",
    "invest",
    "persuade",
    "promote",
    "recruit",
    "retire",
  ],
  "UNIT 18: THE LAW": [
    "abolition",
    "action",
    "arson",
    "authority",
    "burglary",
    "consequences",
    "convict",
    "conviction",
    "crime",
    "crime rate",
    "criminal",
    "deterrent",
    "evidence",
    "fine",
    "fraud",
    "imprisonment",
    "inequality",
    "intent",
    "judge",
    "jury",
    "kidnapping",
    "lawyer",
    "motive",
    "murder",
    "offence",
    "pickpocketing",
    "prevention",
    "prison",
    "prisoner",
    "property",
    "prosecution",
    "protection",
    "punishment",
    "regulation",
    "smuggling",
    "social system",
    "suspect",
    "the accused",
    "trial",
    "vandalism",
    "victim",
    "violation",
    "criminal",
    "drug-related",
    "evil",
    "guilty",
    "harsh",
    "innocent",
    "intentional",
    "law-abiding",
    "non-violent",
    "offensive",
    "on trial",
    "petty",
    "punishable",
    "random",
    "strict",
    "unintentional",
    "victimless",
    "abolish",
    "abide (by)",
    "commit",
    "deter",
    "enforce",
    "imprison",
    "monitor",
    "obey",
    "offend",
    "perpetrate",
    "prevent",
    "protect",
    "prove",
    "punish",
    "resent",
    "respect",
    "violate",
    "accept the consequences",
    "commit a crime",
    "convict a criminal",
    "impose a fine",
    "pass a law",
    "solve a crime",
  ],
  "UNIT 19: THE MEDIA": [
    "accuracy",
    "attitude",
    "bias",
    "censorship",
    "circulation",
    "credibility",
    "current affairs",
    "editor",
    "expose",
    "exposure",
    "facts",
    "free press",
    "ideology",
    "influence",
    "intrusion",
    "investigation",
    "issue",
    "journal",
    "journalism",
    "mass media",
    "media",
    "network",
    "the news",
    "newspaper",
    "newsstand",
    "opinion",
    "paparazzi",
    "press",
    "privacy",
    "publication",
    "publicity",
    "publisher",
    "relevant",
    "safeguard",
    "source",
    "speculation",
    "tabloid",
    "the Web",
    "alternative",
    "artificial",
    "biased",
    "celebrity",
    "censored",
    "controversial",
    "distorted",
    "entertaining",
    "factual",
    "informative",
    "intrusive",
    "investigative",
    "mainstream",
    "pervasive",
    "realistic",
    "sensational",
    "superficial",
    "unbiased",
    "well-informed",
    "affect",
    "broadcast",
    "censor",
    "control",
    "exploit",
    "expose",
    "inform",
    "intrude",
    "invade",
    "investigate",
    "publicise",
    "publish",
    "report",
    "review",
    "verify",
  ],
  "UNIT 20: THE ARTS": [
    "actor",
    "actress",
    "aesthetics",
    "appreciation",
    "artefact",
    "artist",
    "atmosphere",
    "audience",
    "audition",
    "ballet",
    "carving",
    "conception",
    "concert",
    "craft",
    "creation",
    "culture",
    "drama",
    "drawing",
    "exhibition",
    "expression",
    "festival",
    "gallery",
    "image",
    "imagination",
    "influence",
    "inspiration",
    "installation",
    "literature",
    "mood",
    "mural",
    "museum",
    "orchestra",
    "painting",
    "performance",
    "performing arts",
    "play",
    "portrait",
    "proportion",
    "reflection",
    "response",
    "sculptor",
    "sculpture",
    "stimulus",
    "style",
    "taste",
    "theatre",
    "theme",
    "venue",
    "visual arts",
    "writer",
    "abstract",
    "accomplished",
    "aesthetic",
    "burgeoning",
    "classical",
    "creative",
    "cultural",
    "dramatic",
    "eclectic",
    "electric",
    "emotional",
    "fundamental",
    "imaginative",
    "influential",
    "inspirational",
    "interactive",
    "literary",
    "live",
    "musical",
    "monotonous",
    "mundane",
    "passionate",
    "popular",
    "prominent",
    "relaxing",
    "stimulating",
    "visual",
    "vivid",
    "choreograph",
    "create",
    "depict",
    "enrich",
    "escape",
    "imagine",
    "influence",
    "inspire",
    "interpret",
    "perform",
    "provoke",
    "transcend",
  ],
};

const wordDefinitions = {
  adolescence:
    "The period following the onset of puberty during which a young person develops from a child into an adult.",
  adulthood: "The state or condition of being fully grown or mature.",
  bond: "A relationship between people or groups based on shared feelings, interests, or experiences.",
  default: "Please refer to a dictionary for a detailed definition.",
};

const App = () => {
  const [selectedUnitName, setSelectedUnitName] = useState("");
  const [unitWords, setUnitWords] = useState([]);
  const [currentBatchStartIndex, setCurrentBatchStartIndex] = useState(0);
  const [selectedStartWord, setSelectedStartWord] = useState("");

  const [feedback, setFeedback] = useState("");
  const [appStage, setAppStage] = useState("unit_selection");
  const [currentBatchWords, setCurrentBatchWords] = useState([]);

  // MCQ State
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqUserAnswers, setMcqUserAnswers] = useState({});
  const [mcqScore, setMcqScore] = useState(null);
  const [incorrectMcqWordsToRetry, setIncorrectMcqWordsToRetry] = useState([]);
  const [synonymsAntonyms, setSynonymsAntonyms] = useState({});
  const [simpleExplanations, setSimpleExplanations] = useState({});
  const [miniStories, setMiniStories] = useState({});
  const [mcqOptionExplanations, setMcqOptionExplanations] = useState({});
  const [isMcqGenerating, setIsMcqGenerating] = useState(false);

  // Spelling Practice State
  const [wordsForCurrentSpellingRound, setWordsForCurrentSpellingRound] =
    useState([]);
  const [spellingUserAnswers, setSpellingUserAnswers] = useState({});
  const [incorrectlySpelledWords, setIncorrectlySpelledWords] = useState([]);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(true);
  const [spellingHints, setSpellingHints] = useState({});
  const [revealedSpellingWords, setRevealedSpellingWords] = useState({}); // New state for revealed words
  const [voices, setVoices] = useState([]);

  // Passage Assessment State
  const [assessmentPassage, setAssessmentPassage] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentUserAnswers, setAssessmentUserAnswers] = useState({});
  const [assessmentScore, setAssessmentScore] = useState(null);
  const [generatedExamples, setGeneratedExamples] = useState({});

  // Firestore state (UserId for potential future use, but not for progress saving)
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isLoading, setIsLoading] = useState(false); // General loading for passage generation
  const [error, setError] = useState("");

  const geminiApiKey = ""; // For Gemini API calls

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          ) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            const userCredential = await signInAnonymously(auth);
            setUserId(userCredential.user.uid);
          }
        } catch (e) {
          console.error("Error signing in:", e);
          setError("Could not initialize user session.");
          setUserId(crypto.randomUUID());
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSpeechSynthesisSupported(false);
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      const voiceInterval = setInterval(() => {
        const availableVoices = speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          clearInterval(voiceInterval);
        }
      }, 1000);
      setTimeout(() => clearInterval(voiceInterval), 5000);
    }
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const getDefinition = useCallback((word) => {
    if (!word) return wordDefinitions.default;
    const lowerWord = word.toLowerCase();
    if (wordDefinitions[lowerWord]) return wordDefinitions[lowerWord];
    const specificDefEntry = Object.entries(wordDefinitions).find(([key]) =>
      lowerWord.includes(key.toLowerCase())
    );
    if (specificDefEntry) return specificDefEntry[1];
    const mainWord = lowerWord.split(" ")[0];
    return wordDefinitions[mainWord] || wordDefinitions.default;
  }, []);

  const generateMcqSet = useCallback(
    async (wordsForQuiz) => {
      if (!wordsForQuiz || wordsForQuiz.length === 0) {
        setMcqQuestions([]);
        return;
      }
      setIsMcqGenerating(true);
      setError("");
      const generatedMcqs = [];

      for (const word of wordsForQuiz) {
        // Updated prompt to ask for brief definitions for all options, and updated example
        const prompt = `For the IELTS vocabulary word "${word}", provide one *brief* and accurate definition for it. Also, provide three distractor options. Each distractor option must be a *brief definition of a different but plausible, related word* that could be confused with "${word}". The goal is to test understanding of "${word}" against definitions of similar words.
Return the response strictly as a JSON object string with the keys "word", "correct_definition" (which is the brief, correct definition of "${word}"), and "distractors" (an array of 3 strings, where each string is a brief definition of a *different, related* word).

Example for the word "ephemeral":
{
  "word": "ephemeral",
  "correct_definition": "Lasting for a very short time.",
  "distractors": [
    "Present or found everywhere.",
    "Happening by chance rather than intention.",
    "Excessively talkative."
  ]
}`;

        try {
          let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
          const payload = {
            contents: chatHistory,
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  word: { type: "STRING" },
                  correct_definition: { type: "STRING" },
                  distractors: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["word", "correct_definition", "distractors"],
              },
            },
          };
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error(
              `API error for ${word}: ${response.status}`,
              errorBody
            );
            throw new Error(`API error: ${response.status}. ${errorBody}`);
          }

          const result = await response.json();
          if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonText = result.candidates[0].content.parts[0].text;
            let parsedData;
            try {
              parsedData = JSON.parse(jsonText);
            } catch (parseError) {
              console.error(
                `Failed to parse JSON response for "${word}":`,
                jsonText,
                parseError
              );
              throw new Error("Invalid JSON response from API.");
            }

            if (
              parsedData.correct_definition &&
              parsedData.distractors &&
              parsedData.distractors.length === 3
            ) {
              const options = shuffleArray([
                parsedData.correct_definition,
                ...parsedData.distractors,
              ]);
              generatedMcqs.push({
                word: parsedData.word || word,
                question: `Which is the brief definition of "${
                  parsedData.word || word
                }"?`,
                options: options,
                correctAnswer: parsedData.correct_definition,
                error: false,
              });
            } else {
              console.error(
                "API response for MCQ options was not in the expected format:",
                parsedData
              );
              throw new Error(
                "API response for MCQ options was not in the expected format."
              );
            }
          } else {
            console.error(
              "Unexpected API response structure for MCQ options:",
              result
            );
            throw new Error(
              "Unexpected API response structure for MCQ options."
            );
          }
        } catch (err) {
          console.error(`Failed to generate MCQ for "${word}":`, err);
          const localDef = getDefinition(word);
          generatedMcqs.push({
            word: word,
            question: `Which is the brief definition of "${word}"? (Error generating options)`,
            options: shuffleArray([
              localDef,
              "Brief definition of related word A",
              "Brief definition of related word B",
              "Brief definition of related word C",
            ]),
            correctAnswer: localDef,
            error: true,
          });
        }
      }

      setMcqQuestions(generatedMcqs);
      setCurrentMcqIndex(0);
      setMcqUserAnswers({});
      setMcqScore(null);
      setIsMcqGenerating(false);
    },
    [geminiApiKey, getDefinition]
  );

  const prepareNextWordBatchAndStartMcq = useCallback(
    async (batchStartIndex) => {
      if (!unitWords || unitWords.length === 0) return;
      const endIndex = Math.min(batchStartIndex + 10, unitWords.length);
      const batch = unitWords.slice(batchStartIndex, endIndex);
      if (batch.length === 0) {
        setAppStage("unit_completed");
        return;
      }
      setCurrentBatchWords(batch);

      setIncorrectMcqWordsToRetry([]);
      setAppStage("mcq_practice");
      setFeedback("");
      setSynonymsAntonyms({});
      setGeneratedExamples({});
      setSimpleExplanations({});
      setMiniStories({});
      setMcqOptionExplanations({});
      setSpellingHints({});
      setWordsForCurrentSpellingRound([]);
      setSpellingUserAnswers({});
      setIncorrectlySpelledWords([]);
      setRevealedSpellingWords({}); // Reset revealed words for new batch

      await generateMcqSet(batch);
    },
    [unitWords, generateMcqSet]
  );

  const handleUnitNameChange = (e) => {
    const newUnitName = e.target.value;
    setSelectedUnitName(newUnitName);
    if (newUnitName && ieltsWords[newUnitName]) {
      const wordsInUnit = ieltsWords[newUnitName];
      setUnitWords(wordsInUnit);
      setSelectedStartWord(wordsInUnit[0] || "");
      setAppStage("start_word_prompt");
      setCurrentBatchStartIndex(0);
      setFeedback("");
      setError("");
    } else {
      setUnitWords([]);
      setSelectedStartWord("");
    }
  };

  const handleStartWordChange = (e) => {
    setSelectedStartWord(e.target.value);
  };

  const handleStartUnitPractice = () => {
    const startIndex = unitWords.indexOf(selectedStartWord);
    if (startIndex !== -1) {
      setCurrentBatchStartIndex(startIndex);
      prepareNextWordBatchAndStartMcq(startIndex);
      setError("");
    } else {
      setError(`Selected start word not found. Please select a valid word.`);
    }
  };

  const handleMcqAnswerSelect = (questionIndex, answer) => {
    setMcqUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitMcqAssessment = () => {
    let score = 0;
    let incorrectAnswersThisRound = [];
    mcqQuestions.forEach((q, index) => {
      if (mcqUserAnswers[index] === q.correctAnswer) {
        score++;
      } else {
        incorrectAnswersThisRound.push(q.word);
      }
    });
    setMcqScore({ score, total: mcqQuestions.length });
    setIncorrectMcqWordsToRetry(incorrectAnswersThisRound);
    setAppStage("mcq_results");
  };

  const handleRetryIncorrectMcqs = async () => {
    if (incorrectMcqWordsToRetry.length > 0) {
      setAppStage("mcq_practice");
      await generateMcqSet(incorrectMcqWordsToRetry);
    }
  };

  const handleStartSpellingPractice = () => {
    setWordsForCurrentSpellingRound(currentBatchWords);
    setSpellingUserAnswers({});
    setIncorrectlySpelledWords([]);
    setSpellingHints({});
    setRevealedSpellingWords({}); // Reset for new spelling round
    setAppStage("spelling_practice");
  };

  const speakWord = (word) => {
    if (!speechSynthesisSupported || !word) {
      setError(
        speechSynthesisSupported
          ? "No word to speak."
          : "Speech synthesis not supported."
      );
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      let selectedVoice = null;
      if (voices.length > 0) {
        const preferredVoiceNames = [
          "Google US English",
          "Microsoft David Desktop - English (United States)",
          "Microsoft Zira Desktop - English (United States)",
          "Samantha",
          "Alex",
          "Google UK English Female",
          "Google UK English Male",
          "Daniel",
          "Microsoft Hazel Desktop - English (Great Britain)",
          "Karen",
        ];
        selectedVoice = voices.find(
          (voice) =>
            preferredVoiceNames.includes(voice.name) &&
            voice.lang.startsWith("en")
        );
        if (!selectedVoice)
          selectedVoice = voices.find((voice) => voice.lang === "en-US");
        if (!selectedVoice)
          selectedVoice = voices.find((voice) => voice.lang === "en-GB");
        if (!selectedVoice)
          selectedVoice = voices.find((voice) => voice.lang.startsWith("en"));
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Error in speakWord:", e);
      setError("Could not play audio for the word.");
    }
  };

  const handleSpellingInputChange = (word, value) => {
    setSpellingUserAnswers((prev) => ({ ...prev, [word]: value }));
  };

  const handleSubmitSpellings = () => {
    let newlyIncorrectWords = [];
    wordsForCurrentSpellingRound.forEach((word) => {
      const userAnswer = spellingUserAnswers[word] || "";
      if (userAnswer.trim().toLowerCase() !== word.toLowerCase()) {
        newlyIncorrectWords.push(word);
      }
    });
    setIncorrectlySpelledWords(newlyIncorrectWords);
    setAppStage("spelling_results");
  };

  const handleRetryIncorrectSpellings = () => {
    setWordsForCurrentSpellingRound(incorrectlySpelledWords);
    setSpellingUserAnswers({});
    setSpellingHints({});
    setRevealedSpellingWords({}); // Reset for retry round
    setAppStage("spelling_practice");
  };

  const handleShowSpellingWord = (word) => {
    // New handler
    setRevealedSpellingWords((prev) => ({ ...prev, [word]: true }));
  };

  const fetchGenericGeminiData = async (
    key,
    prompt,
    stateSetter,
    fieldName,
    loadingSubState = {}
  ) => {
    stateSetter((prev) => ({
      ...prev,
      [key]: { ...loadingSubState, loading: true, error: "", [fieldName]: "" },
    }));
    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `API request failed with status ${response.status}. ${errorBody}`
        );
      }
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        stateSetter((prev) => ({
          ...prev,
          [key]: {
            ...loadingSubState,
            loading: false,
            [fieldName]: result.candidates[0].content.parts[0].text,
            error: "",
          },
        }));
      } else {
        throw new Error(`Unexpected API response structure for ${fieldName}.`);
      }
    } catch (err) {
      console.error(`Error fetching ${fieldName} for ${key}:`, err);
      stateSetter((prev) => ({
        ...prev,
        [key]: {
          ...loadingSubState,
          loading: false,
          error: err.message,
          [fieldName]: "",
        },
      }));
    }
  };

  const fetchSynonymsAntonyms = async (word) => {
    setSynonymsAntonyms((prev) => ({
      ...prev,
      [word]: { loading: true, error: "", syn: [], ant: [] },
    }));
    const prompt = `For the IELTS vocabulary word "${word}", provide a list of 2-3 common synonyms and 2-3 common antonyms. Format the response strictly as a JSON object string with keys "synonyms" and "antonyms", each holding an array of strings. If no common synonyms or antonyms are found for either category, provide an empty array for that key. Example: {"synonyms": ["example syn 1", "example syn 2"], "antonyms": ["example ant 1", "example ant 2"]}`;
    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              synonyms: { type: "ARRAY", items: { type: "STRING" } },
              antonyms: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["synonyms", "antonyms"],
          },
        },
      };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `API request failed with status ${response.status}. ${errorBody}`
        );
      }
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const jsonText = result.candidates[0].content.parts[0].text;
        let parsedData;
        try {
          parsedData = JSON.parse(jsonText);
        } catch (parseError) {
          console.error(
            `Failed to parse JSON for synonyms/antonyms of "${word}":`,
            jsonText,
            parseError
          );
          throw new Error(
            "Invalid JSON response from API for synonyms/antonyms."
          );
        }
        setSynonymsAntonyms((prev) => ({
          ...prev,
          [word]: {
            loading: false,
            syn: parsedData.synonyms || [],
            ant: parsedData.antonyms || [],
            error: "",
          },
        }));
      } else {
        throw new Error(
          "Unexpected API response structure for synonyms/antonyms."
        );
      }
    } catch (err) {
      console.error("Error fetching synonyms/antonyms:", err);
      setSynonymsAntonyms((prev) => ({
        ...prev,
        [word]: { loading: false, error: err.message, syn: [], ant: [] },
      }));
    }
  };

  const fetchNewExampleSentence = (word) => {
    const prompt = `Provide a new, clear, and contextually relevant example sentence for the IELTS vocabulary word: "${word}". The sentence should be suitable for an IELTS learner.`;
    fetchGenericGeminiData(word, prompt, setGeneratedExamples, "example");
  };

  const fetchSimpleExplanation = (word) => {
    const prompt = `Explain the IELTS vocabulary word "${word}" in simple terms, suitable for an English language learner. Make it concise and easy to understand, different from a formal dictionary definition.`;
    fetchGenericGeminiData(word, prompt, setSimpleExplanations, "explanation");
  };

  const fetchSpellingHint = (word) => {
    const prompt = `Provide a short, helpful spelling hint for the IELTS vocabulary word "${word}". The hint should not reveal the word directly but might suggest its first letter, number of syllables, a related concept, or a tricky part of its spelling. For example, for 'accommodation', a hint could be 'It has double c and double m'.`;
    fetchGenericGeminiData(word, prompt, setSpellingHints, "hint");
  };

  const fetchMiniStory = (word) => {
    const prompt = `Create a very short story (2-3 sentences) or a brief scenario that naturally uses the IELTS vocabulary word: "${word}". This should help an IELTS learner understand its context.`;
    fetchGenericGeminiData(word, prompt, setMiniStories, "story");
  };

  const fetchMcqOptionExplanation = (
    questionWord,
    chosenOption,
    correctDefinition
  ) => {
    const key = `${questionWord}-${chosenOption}`;
    const prompt = `The student was asked for the definition of the word "${questionWord}". The correct definition is "${correctDefinition}". The student incorrectly chose "${chosenOption}" as the definition. Briefly explain in one or two sentences why "${chosenOption}" is not the correct definition for "${questionWord}". Focus on the difference in meaning.`;
    fetchGenericGeminiData(
      key,
      prompt,
      setMcqOptionExplanations,
      "explanation"
    );
  };

  const startPassageAssessment = useCallback(async () => {
    if (currentBatchWords.length === 0) {
      setError("No words in the current batch for passage assessment.");
      setAppStage("start_word_prompt");
      return;
    }
    setIsLoading(true);
    setError("");
    setAppStage("assessment");
    setAssessmentPassage("");
    setAssessmentAnswers({});
    setAssessmentUserAnswers({});
    const numWordsInBatch = currentBatchWords.length;
    const passageWordCount = Math.max(50, numWordsInBatch * 15);
    const prompt = `You are an assistant helping an IELTS student learn vocabulary. The student has just been tested on the following ${numWordsInBatch} words/phrases: ${currentBatchWords.join(
      ", "
    )}.
Create a fill-in-the-blank passage of at least ${passageWordCount} words. The passage must contain exactly ${numWordsInBatch} blanks, represented as __BLANK_N__ (e.g., __BLANK_1__, __BLANK_2__, ..., __BLANK_${numWordsInBatch}__).
Each of the ${numWordsInBatch} provided words/phrases must be the correct answer for exactly one of the blanks. Ensure each word is used only once. The passage should be coherent and make sense.
Provide the passage first.
Then, on a new line, provide a JSON object string mapping each blank placeholder (e.g., "__BLANK_1__") to its correct word from the list. The JSON string must start with '{' and end with '}'.
Example for 2 words ["example", "test"]:
The first __BLANK_1__ was easy. Then came the __BLANK_2__.
{"__BLANK_1__": "example", "__BLANK_2__": "test"}

Ensure the JSON is valid and correctly maps all blanks to the provided words. The number of blanks must exactly match the number of words.
`;
    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API request failed: ${errorData?.error?.message || response.status}`
        );
      }
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const textResponse = result.candidates[0].content.parts[0].text;
        const jsonStartIndex = textResponse.lastIndexOf("\n{");
        let passageText = "";
        let jsonString = "";

        if (jsonStartIndex !== -1) {
          passageText = textResponse.substring(0, jsonStartIndex).trim();
          jsonString = textResponse.substring(jsonStartIndex).trim();
        } else {
          const altJsonStartIndex = textResponse.lastIndexOf("{");
          if (altJsonStartIndex !== -1) {
            passageText = textResponse.substring(0, altJsonStartIndex).trim();
            jsonString = textResponse.substring(altJsonStartIndex).trim();
          } else {
            setError(
              "Failed to find JSON answers in API response for passage. The format might be incorrect."
            );
            setAppStage("assessment_prompt");
            setIsLoading(false);
            return;
          }
        }

        if (!jsonString.endsWith("}")) {
          const lastBraceIndex = jsonString.lastIndexOf("}");
          if (lastBraceIndex !== -1) {
            jsonString = jsonString.substring(0, lastBraceIndex + 1);
          } else {
            setError(
              "JSON answers in API response for passage seem incomplete."
            );
            setAppStage("assessment_prompt");
            setIsLoading(false);
            return;
          }
        }

        setAssessmentPassage(passageText);
        try {
          const parsedAnswers = JSON.parse(jsonString);
          const answerValues = Object.values(parsedAnswers);
          const allWordsPresent = currentBatchWords.every((word) =>
            answerValues.includes(word)
          );
          const allBlanksPresent = Object.keys(parsedAnswers).every((key) =>
            passageText.includes(key)
          );

          if (
            Object.keys(parsedAnswers).length !== currentBatchWords.length ||
            !allWordsPresent ||
            !allBlanksPresent
          ) {
            console.error(
              "Mismatch between expected words/blanks and API response:",
              {
                expectedCount: currentBatchWords.length,
                actualCount: Object.keys(parsedAnswers).length,
                parsedAnswers,
                currentBatchWords,
                passageText,
              }
            );
            setError(
              "Passage generation error: The number of blanks or words in the generated passage doesn't match the input. Please try generating again."
            );
            setAppStage("assessment_prompt");
            setAssessmentPassage("");
            setAssessmentAnswers({});
          } else {
            setAssessmentAnswers(parsedAnswers);
            const initialUserAnswers = {};
            Object.keys(parsedAnswers).forEach((blankKey) => {
              initialUserAnswers[blankKey] = "";
            });
            setAssessmentUserAnswers(initialUserAnswers);
          }
        } catch (e) {
          console.error(
            "Failed to parse assessment answers JSON:",
            jsonString,
            e
          );
          setError(
            "Failed to parse assessment answers from API. The format might be incorrect. Please check console for details."
          );
          setAppStage("assessment_prompt");
        }
      } else {
        setError(
          "Received an unexpected response structure from the API for passage generation."
        );
        setAppStage("assessment_prompt");
      }
    } catch (err) {
      console.error("Error in startPassageAssessment:", err);
      setError(
        `Error generating assessment: ${err.message}. Please try again or skip.`
      );
      setAppStage("assessment_prompt");
    } finally {
      setIsLoading(false);
    }
  }, [geminiApiKey, currentBatchWords]);

  const handlePassageAssessmentAnswerChange = (blankKey, value) => {
    setAssessmentUserAnswers((prev) => ({ ...prev, [blankKey]: value }));
  };

  const handleSubmitPassageAssessment = () => {
    let score = 0;
    const totalQuestions = Object.keys(assessmentAnswers).length;
    if (totalQuestions === 0) {
      setError("Assessment data is not loaded correctly. Cannot submit.");
      setAppStage("assessment_results");
      return;
    }
    for (const blankKey in assessmentAnswers) {
      if (assessmentUserAnswers[blankKey] === assessmentAnswers[blankKey]) {
        score++;
      }
    }
    setAssessmentScore({ score, total: totalQuestions });
    setAppStage("assessment_results");
  };

  const handleContinueAfterPassageAssessment = () => {
    setAssessmentPassage("");
    setAssessmentAnswers({});
    setAssessmentUserAnswers({});
    setAssessmentScore(null);
    setFeedback("");
    const nextBatchStartIndexAfterCurrent =
      currentBatchStartIndex + currentBatchWords.length;
    if (nextBatchStartIndexAfterCurrent < unitWords.length) {
      setCurrentBatchStartIndex(nextBatchStartIndexAfterCurrent);
      prepareNextWordBatchAndStartMcq(nextBatchStartIndexAfterCurrent);
    } else {
      setFeedback("You've completed all words in this unit!");
      setAppStage("unit_completed");
    }
  };

  const renderPassageAssessmentContent = () => {
    if (!assessmentPassage || Object.keys(assessmentAnswers).length === 0)
      return <p className="text-gray-600">Loading assessment passage...</p>;
    const wordsForOptions = [...new Set(currentBatchWords)];
    const passageParts = [];
    let lastIndex = 0;
    const blankRegex = /__BLANK_\d+__/g;
    let match;
    const matches = [];
    while ((match = blankRegex.exec(assessmentPassage)) !== null) {
      if (assessmentAnswers[match[0]]) {
        matches.push({ key: match[0], index: match.index });
      }
    }
    matches.sort((a, b) => a.index - b.index);

    matches.forEach(({ key: blankKey, index: matchIndex }) => {
      passageParts.push(assessmentPassage.substring(lastIndex, matchIndex));
      passageParts.push(
        <select
          key={blankKey}
          value={assessmentUserAnswers[blankKey] || ""}
          onChange={(e) =>
            handlePassageAssessmentAnswerChange(blankKey, e.target.value)
          }
          className="border border-gray-300 rounded-md p-2 mx-1 my-1 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select word</option>
          {wordsForOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
      lastIndex = matchIndex + blankKey.length;
    });
    passageParts.push(assessmentPassage.substring(lastIndex));
    return (
      <div className="prose max-w-none text-gray-700 leading-relaxed">
        {passageParts.map((part, i) => (
          <React.Fragment key={i}>{part}</React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-8 flex flex-col items-center font-['Inter',_sans-serif]">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl">
        <header className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 text-center">
            IELTS Vocabulary Practice
          </h1>
          {userId && (
            <p className="text-xs text-center text-gray-400 mt-1">
              User ID: {userId}
            </p>
          )}
        </header>

        {error && (
          <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        {feedback && (
          <div className="my-4 p-3 bg-blue-100 text-blue-700 border border-blue-300 rounded-md text-sm">
            {feedback}
          </div>
        )}

        {appStage === "unit_selection" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Welcome!
            </h2>
            <p className="text-gray-700 mb-6">
              {" "}
              Select an IELTS vocabulary unit to begin your practice. You will
              be tested in batches of words.{" "}
            </p>
            <label
              htmlFor="unitSelect"
              className="block mb-2 text-gray-700 font-medium"
            >
              Choose a Unit:
            </label>
            <select
              id="unitSelect"
              value={selectedUnitName}
              onChange={handleUnitNameChange}
              className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 w-full sm:w-2/3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Select a Unit --</option>
              {Object.keys(ieltsWords).map((unitName) => (
                <option key={unitName} value={unitName}>
                  {" "}
                  {unitName} ({ieltsWords[unitName].length} words){" "}
                </option>
              ))}
            </select>
          </div>
        )}

        {appStage === "start_word_prompt" && unitWords.length > 0 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-1 text-blue-600">
              Unit: {selectedUnitName}
            </h2>
            <p className="mb-4 text-gray-600">
              This unit has {unitWords.length} words/phrases.
            </p>
            <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto text-left">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Words in this unit:
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {" "}
                {unitWords.map((word, index) => (
                  <li key={index}>{word}</li>
                ))}{" "}
              </ul>
            </div>
            <label
              htmlFor="startWordSelect"
              className="block mb-2 text-gray-700 font-medium"
            >
              Choose your starting word:
            </label>
            <select
              id="startWordSelect"
              value={selectedStartWord}
              onChange={handleStartWordChange}
              className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 w-full sm:w-2/3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {unitWords.map((word, index) => (
                <option key={index} value={word}>
                  {" "}
                  {index + 1}. {word}{" "}
                </option>
              ))}
            </select>
            <button
              onClick={handleStartUnitPractice}
              disabled={!selectedStartWord}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {" "}
              Start Practice{" "}
            </button>
          </div>
        )}

        {appStage === "mcq_practice" &&
          (isMcqGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                ✨ Generating your Multiple Choice Questions with AI...
              </p>
            </div>
          ) : mcqQuestions.length > 0 &&
            currentMcqIndex < mcqQuestions.length ? (
            <div>
              <p className="text-sm text-gray-500 mb-2 text-center">
                {" "}
                Unit: {selectedUnitName} | Current Batch:{" "}
                {currentBatchWords.length > 0
                  ? `words starting from "${currentBatchWords[0]}"`
                  : "Loading..."}{" "}
              </p>
              <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
                {mcqQuestions.length !== currentBatchWords.length &&
                incorrectMcqWordsToRetry.length > 0
                  ? "Retry Incorrect Question"
                  : "Multiple Choice Question"}{" "}
                {currentMcqIndex + 1} of {mcqQuestions.length}
              </h2>
              {mcqQuestions[currentMcqIndex].error && (
                <p className="text-red-500 text-center text-sm mb-2">
                  Error generating this question. Using fallback.
                </p>
              )}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <p className="text-lg text-gray-800 mb-4">
                  {mcqQuestions[currentMcqIndex].question}
                </p>
                <div className="space-y-3">
                  {mcqQuestions[currentMcqIndex].options.map(
                    (option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => {
                          handleMcqAnswerSelect(currentMcqIndex, option);
                          if (currentMcqIndex < mcqQuestions.length - 1) {
                            setCurrentMcqIndex(currentMcqIndex + 1);
                          }
                        }}
                        className={`block w-full text-left p-3 rounded-lg border transition-colors ${
                          mcqUserAnswers[currentMcqIndex] === option
                            ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-400"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                      >
                        {" "}
                        {option}{" "}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                {currentMcqIndex === mcqQuestions.length - 1 && (
                  <button
                    onClick={handleSubmitMcqAssessment}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto order-1 sm:order-2"
                  >
                    Submit Answers & View Results
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMcqGenerating(true);
                    generateMcqSet(currentBatchWords);
                  }}
                  disabled={isMcqGenerating}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm w-full sm:w-auto order-2 sm:order-1 text-sm"
                >
                  🔄 Regenerate Questions
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No MCQ questions loaded. There might have been an issue
                generating them. Please try again or select a different
                unit/batch.
              </p>
            </div>
          ))}

        {appStage === "mcq_results" && mcqScore !== null && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Multiple Choice Quiz Results
            </h2>
            <p className="text-3xl font-bold my-4 text-gray-800">
              {" "}
              You scored:{" "}
              <span
                className={
                  mcqScore.score / mcqScore.total >= 0.7
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {" "}
                {mcqScore.score} / {mcqScore.total}{" "}
              </span>{" "}
            </p>
            {incorrectMcqWordsToRetry.length > 0 && (
              <p className="text-red-600 my-2">
                You have {incorrectMcqWordsToRetry.length} incorrect answer(s).
              </p>
            )}
            <div className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left max-h-96 overflow-y-auto">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                Review:
              </h4>
              {mcqQuestions.map((q, index) => {
                const userAnswer = mcqUserAnswers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                const mcqOptionKey = `${q.word}-${userAnswer}`;
                return (
                  <div
                    key={index}
                    className="mb-3 p-3 rounded-md bg-white border border-gray-200"
                  >
                    <p className="text-sm font-semibold text-gray-700">
                      Q: {q.question}
                    </p>
                    <p
                      className={`text-sm ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {" "}
                      Your answer: {userAnswer || "Not answered"}{" "}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-yellow-700">
                        Correct answer: {q.correctAnswer}
                      </p>
                    )}
                    <div className="mt-2 space-x-1 sm:space-x-2 flex flex-wrap gap-1">
                      <button
                        onClick={() => fetchSynonymsAntonyms(q.word)}
                        disabled={synonymsAntonyms[q.word]?.loading}
                        className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                      >
                        {" "}
                        ✨ Syn/Ant{" "}
                      </button>
                      <button
                        onClick={() => fetchSimpleExplanation(q.word)}
                        disabled={simpleExplanations[q.word]?.loading}
                        className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                      >
                        {" "}
                        ✨ Explain{" "}
                      </button>
                      <button
                        onClick={() => fetchMiniStory(q.word)}
                        disabled={miniStories[q.word]?.loading}
                        className="text-xs bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                      >
                        {" "}
                        ✨ Story{" "}
                      </button>
                      {!isCorrect && userAnswer && (
                        <button
                          onClick={() =>
                            fetchMcqOptionExplanation(
                              q.word,
                              userAnswer,
                              q.correctAnswer
                            )
                          }
                          disabled={
                            mcqOptionExplanations[mcqOptionKey]?.loading
                          }
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          {" "}
                          ✨ Why wrong?{" "}
                        </button>
                      )}
                    </div>
                    {synonymsAntonyms[q.word]?.loading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading synonyms/antonyms...
                      </p>
                    )}
                    {synonymsAntonyms[q.word]?.error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {synonymsAntonyms[q.word]?.error}
                      </p>
                    )}
                    {synonymsAntonyms[q.word] &&
                      !synonymsAntonyms[q.word]?.loading &&
                      !synonymsAntonyms[q.word]?.error &&
                      (synonymsAntonyms[q.word]?.syn?.length > 0 ||
                        synonymsAntonyms[q.word]?.ant?.length > 0) && (
                        <div className="mt-1 text-xs text-gray-600">
                          {synonymsAntonyms[q.word]?.syn?.length > 0 && (
                            <p>
                              <strong>Synonyms:</strong>{" "}
                              {synonymsAntonyms[q.word]?.syn.join(", ")}
                            </p>
                          )}
                          {synonymsAntonyms[q.word]?.ant?.length > 0 && (
                            <p>
                              <strong>Antonyms:</strong>{" "}
                              {synonymsAntonyms[q.word]?.ant.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    {simpleExplanations[q.word]?.loading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading explanation...
                      </p>
                    )}
                    {simpleExplanations[q.word]?.error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {simpleExplanations[q.word]?.error}
                      </p>
                    )}
                    {simpleExplanations[q.word]?.explanation && (
                      <p className="mt-1 text-xs text-gray-600 italic">
                        <strong>Simple Explanation:</strong>{" "}
                        {simpleExplanations[q.word]?.explanation}
                      </p>
                    )}

                    {miniStories[q.word]?.loading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading story...
                      </p>
                    )}
                    {miniStories[q.word]?.error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {miniStories[q.word]?.error}
                      </p>
                    )}
                    {miniStories[q.word]?.story && (
                      <p className="mt-1 text-xs text-gray-600 italic">
                        <strong>Mini-Story:</strong>{" "}
                        {miniStories[q.word]?.story}
                      </p>
                    )}

                    {mcqOptionExplanations[mcqOptionKey]?.loading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading why wrong...
                      </p>
                    )}
                    {mcqOptionExplanations[mcqOptionKey]?.error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {mcqOptionExplanations[mcqOptionKey]?.error}
                      </p>
                    )}
                    {mcqOptionExplanations[mcqOptionKey]?.explanation && (
                      <p className="mt-1 text-xs text-gray-600 italic">
                        <strong>Why chosen option was wrong:</strong>{" "}
                        {mcqOptionExplanations[mcqOptionKey]?.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
              {incorrectMcqWordsToRetry.length > 0 ? (
                <button
                  onClick={handleRetryIncorrectMcqs}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto"
                >
                  Retry Incorrect Questions ({incorrectMcqWordsToRetry.length})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAppStage("mcq_practice");
                    generateMcqSet(currentBatchWords);
                  }}
                  disabled={isMcqGenerating}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto"
                >
                  🔄 Re-practice MCQs (New Questions)
                </button>
              )}
              <button
                onClick={handleStartSpellingPractice}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto"
              >
                ✍️ Start Spelling Practice{" "}
                {incorrectMcqWordsToRetry.length > 0 && "(Skip Retry)"}
              </button>
            </div>
          </div>
        )}

        {appStage === "spelling_practice" &&
          wordsForCurrentSpellingRound.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2 text-center">
                {" "}
                Unit: {selectedUnitName} | Spelling{" "}
                {wordsForCurrentSpellingRound.length} word(s){" "}
              </p>
              <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
                Listen and Type the Words
              </h2>
              {!speechSynthesisSupported && (
                <p className="text-sm text-red-500 text-center mb-2">
                  Speech synthesis is not supported in your browser. This
                  feature may not work.
                </p>
              )}
              <div className="space-y-4">
                {wordsForCurrentSpellingRound.map((word, index) => (
                  <div
                    key={word}
                    className="p-3 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <button
                        onClick={() => speakWord(word)}
                        disabled={!speechSynthesisSupported}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-full shadow-md text-xl disabled:bg-gray-300"
                        aria-label={`Play sound for word ${index + 1}`}
                      >
                        {" "}
                        🔊{" "}
                      </button>
                      <input
                        type="text"
                        value={spellingUserAnswers[word] || ""}
                        onChange={(e) =>
                          handleSpellingInputChange(word, e.target.value)
                        }
                        placeholder={`Type word ${index + 1}`}
                        className="flex-grow p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex space-x-1 flex-shrink-0">
                        {" "}
                        {/* Group ancillary buttons */}
                        <button
                          onClick={() => fetchSpellingHint(word)}
                          disabled={spellingHints[word]?.loading}
                          className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          {" "}
                          ✨ Hint{" "}
                        </button>
                        <button
                          onClick={() => handleShowSpellingWord(word)}
                          className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-medium py-1 px-2 rounded-md transition-colors"
                        >
                          {" "}
                          👁️ Show{" "}
                        </button>
                      </div>
                    </div>
                    {spellingHints[word]?.loading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading hint...
                      </p>
                    )}
                    {spellingHints[word]?.error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {spellingHints[word]?.error}
                      </p>
                    )}
                    {spellingHints[word]?.hint && (
                      <p className="mt-1 text-xs text-gray-600 italic">
                        <strong>Hint:</strong> {spellingHints[word]?.hint}
                      </p>
                    )}
                    {revealedSpellingWords[word] && (
                      <p className="mt-1 text-xs text-sky-600 italic">
                        Word: <strong>{word}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmitSpellings}
                className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full"
              >
                Submit All Spellings
              </button>
            </div>
          )}

        {appStage === "spelling_results" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Spelling Results
            </h2>
            {incorrectlySpelledWords.length === 0 ? (
              <p className="text-green-600 my-2 text-lg font-semibold">
                Excellent! All words spelled correctly.
              </p>
            ) : (
              <p className="text-red-600 my-2">
                You misspelled {incorrectlySpelledWords.length} word(s).
              </p>
            )}
            <div className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left max-h-80 overflow-y-auto">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                Review Your Spellings:
              </h4>
              {(wordsForCurrentSpellingRound.length > 0
                ? wordsForCurrentSpellingRound
                : currentBatchWords
              ).map((word, index) => {
                const userAnswer = spellingUserAnswers[word] || "";
                const isCorrect =
                  userAnswer.trim().toLowerCase() === word.toLowerCase();
                return (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded-md border ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-700">
                      Word: {word}
                    </p>
                    <p
                      className={`text-sm ${
                        isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {" "}
                      Your spelling: {userAnswer || "(No answer)"}{" "}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-gray-600">
                        Correct spelling was: {word}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {incorrectlySpelledWords.length > 0 ? (
              <button
                onClick={handleRetryIncorrectSpellings}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto mt-4"
              >
                Retry Misspelled Words ({incorrectlySpelledWords.length})
              </button>
            ) : (
              <button
                onClick={() => setAppStage("assessment_prompt")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto mt-4"
              >
                Proceed to Passage Assessment
              </button>
            )}
          </div>
        )}

        {appStage === "assessment_prompt" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Passage Assessment Time!
            </h2>
            <p className="text-gray-700 mb-4">
              Great job on the spelling! Now, let's test your understanding with
              a fill-in-the-blank passage using the same{" "}
              {currentBatchWords.length} words:{" "}
              <span className="font-medium">
                {currentBatchWords.join(", ")}
              </span>
              .
            </p>
            <button
              onClick={startPassageAssessment}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto disabled:bg-gray-400"
            >
              {isLoading ? "Generating..." : "✨ Start Passage Assessment"}
            </button>
            {isLoading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Preparing your passage...
                </p>
              </div>
            )}
          </div>
        )}

        {appStage === "assessment" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
              Fill-in-the-Blanks Passage
            </h2>
            <p className="text-gray-700 mb-2 text-sm">
              Fill in the blanks using the words from the current batch:{" "}
              <span className="font-semibold">
                {currentBatchWords.join(", ")}
              </span>
              . Each word is used once.
            </p>
            {isLoading ? (
              <div className="text-center py-8">
                {" "}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>{" "}
                <p className="mt-4 text-gray-600">Generating passage...</p>{" "}
              </div>
            ) : assessmentPassage &&
              Object.keys(assessmentAnswers).length > 0 ? (
              <>
                <div className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  {" "}
                  {renderPassageAssessmentContent()}{" "}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={handleSubmitPassageAssessment}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto order-1 sm:order-2"
                  >
                    Submit Passage Assessment
                  </button>
                  <button
                    onClick={startPassageAssessment}
                    disabled={isLoading}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm w-full sm:w-auto order-2 sm:order-1 text-sm"
                  >
                    🔄 Regenerate Passage
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-yellow-600 py-4">
                {error ||
                  "Could not load assessment passage. Please try starting the assessment again."}
              </p>
            )}
          </div>
        )}

        {appStage === "assessment_results" && assessmentScore !== null && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Passage Assessment Results
            </h2>
            <p className="text-3xl font-bold my-4 text-gray-800">
              {" "}
              You scored:{" "}
              <span
                className={
                  assessmentScore.total > 0 &&
                  assessmentScore.score / assessmentScore.total >= 0.7
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {" "}
                {assessmentScore.score} / {assessmentScore.total}{" "}
              </span>{" "}
            </p>
            <div className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left max-h-96 overflow-y-auto">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                Review Your Answers & Words:
              </h4>
              {Object.keys(assessmentAnswers).length > 0 ? (
                currentBatchWords.map((word, idx) => {
                  const blankKey = Object.keys(assessmentAnswers).find(
                    (key) => assessmentAnswers[key] === word
                  );
                  const userAnswerForThisWord = blankKey
                    ? assessmentUserAnswers[blankKey]
                    : "N/A";
                  const isCorrect = blankKey
                    ? userAnswerForThisWord === word
                    : false;
                  return (
                    <div
                      key={idx}
                      className="mb-3 p-3 rounded-md bg-white border border-gray-200"
                    >
                      <p className="text-sm font-semibold text-gray-700">
                        Word: {word}
                      </p>
                      {blankKey ? (
                        <p
                          className={`text-sm ${
                            isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {" "}
                          Your answer for its blank (
                          {blankKey.replace("__BLANK_", "Blank ")}):{" "}
                          {userAnswerForThisWord || "Not answered"}{" "}
                          {!isCorrect && ` (Correct: ${word})`}{" "}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          This word was part of the batch (may not have been in
                          a blank if there was a generation issue).
                        </p>
                      )}
                      <div className="mt-2 space-x-1 sm:space-x-2 flex flex-wrap gap-1">
                        <button
                          onClick={() => fetchNewExampleSentence(word)}
                          disabled={generatedExamples[word]?.loading}
                          className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          {" "}
                          ✨ New Ex.{" "}
                        </button>
                        <button
                          onClick={() => fetchSimpleExplanation(word)}
                          disabled={simpleExplanations[word]?.loading}
                          className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          {" "}
                          ✨ Explain{" "}
                        </button>
                        <button
                          onClick={() => fetchMiniStory(word)}
                          disabled={miniStories[word]?.loading}
                          className="text-xs bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          {" "}
                          ✨ Story{" "}
                        </button>
                      </div>
                      {generatedExamples[word]?.loading && (
                        <p className="text-xs text-gray-500 mt-1">
                          Loading example...
                        </p>
                      )}
                      {generatedExamples[word]?.error && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {generatedExamples[word]?.error}
                        </p>
                      )}
                      {generatedExamples[word]?.example && (
                        <p className="mt-1 text-xs text-gray-600 italic">
                          "{generatedExamples[word]?.example}"
                        </p>
                      )}

                      {simpleExplanations[word]?.loading && (
                        <p className="text-xs text-gray-500 mt-1">
                          Loading explanation...
                        </p>
                      )}
                      {simpleExplanations[word]?.error && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {simpleExplanations[word]?.error}
                        </p>
                      )}
                      {simpleExplanations[word]?.explanation && (
                        <p className="mt-1 text-xs text-gray-600 italic">
                          <strong>Simple Explanation:</strong>{" "}
                          {simpleExplanations[word]?.explanation}
                        </p>
                      )}

                      {miniStories[word]?.loading && (
                        <p className="text-xs text-gray-500 mt-1">
                          Loading story...
                        </p>
                      )}
                      {miniStories[word]?.error && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {miniStories[word]?.error}
                        </p>
                      )}
                      {miniStories[word]?.story && (
                        <p className="mt-1 text-xs text-gray-600 italic">
                          <strong>Mini-Story:</strong>{" "}
                          {miniStories[word]?.story}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600">
                  No assessment answers to display.
                </p>
              )}
            </div>
            <button
              onClick={handleContinueAfterPassageAssessment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto mt-4"
            >
              {currentBatchStartIndex + currentBatchWords.length <
              unitWords.length
                ? "Next Batch"
                : "Finish Unit"}
            </button>
          </div>
        )}

        {appStage === "unit_completed" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-green-500">
              Congratulations!
            </h2>
            <p className="text-gray-700 mb-6">
              You have practiced all the words in {selectedUnitName}.
            </p>
            <button
              onClick={() => {
                setAppStage("unit_selection");
                setSelectedUnitName("");
                setUnitWords([]);
                setCurrentBatchStartIndex(0);
                setSelectedStartWord("");
                setCurrentBatchWords([]);
                setFeedback("");
                setError("");
                setMcqQuestions([]);
                setMcqUserAnswers({});
                setMcqScore(null);
                setIncorrectMcqWordsToRetry([]);
                setWordsForCurrentSpellingRound([]);
                setSpellingUserAnswers({});
                setIncorrectlySpelledWords([]);
                setRevealedSpellingWords({});
                setAssessmentPassage("");
                setAssessmentAnswers({});
                setAssessmentUserAnswers({});
                setAssessmentScore(null);
                setSynonymsAntonyms({});
                setGeneratedExamples({});
                setSimpleExplanations({});
                setSpellingHints({});
                setMiniStories({});
                setMcqOptionExplanations({});
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto"
            >
              {" "}
              Select Another Unit{" "}
            </button>
          </div>
        )}
      </div>
      <footer className="mt-8 text-center text-xs text-gray-500">
        {" "}
        <p>IELTS Vocabulary Trainer | Learn & Practice</p>{" "}
      </footer>
    </div>
  );
};

export default App;
