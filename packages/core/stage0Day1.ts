import { storage } from "./storage";

export const STAGE0_DAY1_KEY = "ie_stage0_day1";
export const STAGE0_DAY1_VERSION = 2 as const;

export type Day1Mode = "full" | "short";
export type Day1Block = "core" | "guided-variation" | "fluency-mini" | "closing";
export type Day1CorePhase = "prime" | "text" | "retrieve" | "produce" | "voice" | "summary";
export type Day1FluencyEvidence = "recorded" | "said-aloud-confirmed";
export type Day1Comprehension = "unanswered" | "retry" | "resolved" | "shown";

export type Day1Evidence = {
  primeSeen: boolean;
  textRead: boolean;
  retrievalsCompleted: number;
  productionSaved: boolean;
  guidedSlotsCompleted: number;
  guidedSubmitted: boolean;
  fluencyVersions: readonly [Day1FluencyEvidence | null, Day1FluencyEvidence | null];
};

export type Stage0Day1State = {
  version: typeof STAGE0_DAY1_VERSION;
  activePath: string;
  mode: Day1Mode;
  block: Day1Block;
  corePhase: Day1CorePhase;
  comprehension: Day1Comprehension;
  productionText: string;
  retrievalDraft: string;
  retrievalSupportLevel: 0 | 1 | 2 | 3;
  guidedDrafts: readonly [string, string, string];
  currentGuidedSlot: 0 | 1 | 2;
  currentFluencyVersion: 0 | 1;
  evidence: Day1Evidence;
  completed: boolean;
  completionMode?: Day1Mode;
  completedAt?: number;
  updatedAt: number;
};

export type Stage0Day1Patch = Partial<
  Pick<
    Stage0Day1State,
    | "block"
    | "mode"
    | "corePhase"
    | "comprehension"
    | "productionText"
    | "retrievalDraft"
    | "retrievalSupportLevel"
    | "guidedDrafts"
    | "currentGuidedSlot"
    | "currentFluencyVersion"
  >
> & { evidence?: Partial<Day1Evidence> };

export type Day1NextRequirement =
  | { kind: "core"; phase: Day1CorePhase }
  | { kind: "guided-variation"; slot: 0 | 1 | 2 }
  | { kind: "fluency-mini"; version: 0 | 1 }
  | { kind: "closing" }
  | { kind: "completed" };

export const DAY1_FULL_BLOCKS: readonly Day1Block[] = [
  "core",
  "guided-variation",
  "fluency-mini",
  "closing",
];

export const DAY1_SHORT_BLOCKS: readonly Day1Block[] = ["core", "closing"];
export const DAY1_MINUTES: Record<Day1Mode, number> = { full: 30, short: 16 };

export const DAY1_FULL_FACTS = [
  "Ты написала свою фразу о работе — своими словами.",
  "Ты собрала три фразы по одной рамке — про три разных дела.",
  "Ты сказала свою фразу вслух — 2 раза.",
] as const;

export const DAY1_SHORT_FACTS = [
  "Ты написала свою фразу о работе — своими словами.",
  "Ты прочитала текст дня и вернула из него одну фразу.",
] as const;

const CORE_PHASES: readonly Day1CorePhase[] = [
  "prime",
  "text",
  "retrieve",
  "produce",
  "voice",
  "summary",
];

function activePath(): string | null {
  const value = storage().getItem("ie_active_path");
  return value && value.trim() ? value : null;
}

function initialState(path: string, mode: Day1Mode, now: number): Stage0Day1State {
  return {
    version: STAGE0_DAY1_VERSION,
    activePath: path,
    mode,
    block: "core",
    corePhase: "prime",
    comprehension: "unanswered",
    productionText: "",
    retrievalDraft: "",
    retrievalSupportLevel: 0,
    guidedDrafts: ["", "", ""],
    currentGuidedSlot: 0,
    currentFluencyVersion: 0,
    evidence: {
      primeSeen: false,
      textRead: false,
      retrievalsCompleted: 0,
      productionSaved: false,
      guidedSlotsCompleted: 0,
      guidedSubmitted: false,
      fluencyVersions: [null, null],
    },
    completed: false,
    updatedAt: now,
  };
}

function isMode(value: unknown): value is Day1Mode {
  return value === "full" || value === "short";
}

function isBlock(value: unknown): value is Day1Block {
  return DAY1_FULL_BLOCKS.includes(value as Day1Block);
}

function isPhase(value: unknown): value is Day1CorePhase {
  return CORE_PHASES.includes(value as Day1CorePhase);
}

function isComprehension(value: unknown): value is Day1Comprehension {
  return value === "unanswered" || value === "retry" || value === "resolved" || value === "shown";
}

function isFluencyEvidence(value: unknown): value is Day1FluencyEvidence | null {
  return value === null || value === "recorded" || value === "said-aloud-confirmed";
}

function isState(value: unknown): value is Stage0Day1State {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Stage0Day1State>;
  const e = v.evidence as Partial<Day1Evidence> | undefined;
  return (
    v.version === STAGE0_DAY1_VERSION &&
    typeof v.activePath === "string" &&
    isMode(v.mode) &&
    isBlock(v.block) &&
    isPhase(v.corePhase) &&
    isComprehension(v.comprehension) &&
    typeof v.productionText === "string" &&
    typeof v.retrievalDraft === "string" &&
    (v.retrievalSupportLevel === 0 ||
      v.retrievalSupportLevel === 1 ||
      v.retrievalSupportLevel === 2 ||
      v.retrievalSupportLevel === 3) &&
    Array.isArray(v.guidedDrafts) &&
    v.guidedDrafts.length === 3 &&
    v.guidedDrafts.every((item) => typeof item === "string") &&
    (v.currentGuidedSlot === 0 || v.currentGuidedSlot === 1 || v.currentGuidedSlot === 2) &&
    (v.currentFluencyVersion === 0 || v.currentFluencyVersion === 1) &&
    !!e &&
    typeof e.primeSeen === "boolean" &&
    typeof e.textRead === "boolean" &&
    Number.isInteger(e.retrievalsCompleted) &&
    typeof e.productionSaved === "boolean" &&
    Number.isInteger(e.guidedSlotsCompleted) &&
    typeof e.guidedSubmitted === "boolean" &&
    Array.isArray(e.fluencyVersions) &&
    e.fluencyVersions.length === 2 &&
    e.fluencyVersions.every(isFluencyEvidence) &&
    typeof v.completed === "boolean" &&
    typeof v.updatedAt === "number"
  );
}

function persist(value: Stage0Day1State): boolean {
  const encoded = JSON.stringify(value);
  storage().setItem(STAGE0_DAY1_KEY, encoded);
  return storage().getItem(STAGE0_DAY1_KEY) === encoded;
}

function update(
  current: Stage0Day1State,
  patch: Stage0Day1Patch,
  now: number
): Stage0Day1State | null {
  const next: Stage0Day1State = {
    ...current,
    ...patch,
    evidence: patch.evidence ? { ...current.evidence, ...patch.evidence } : current.evidence,
    updatedAt: now,
  };
  return isState(next) && persist(next) ? next : null;
}

export function startStage0Day1(mode: Day1Mode, now = Date.now()): Stage0Day1State | null {
  const path = activePath();
  if (!path) return null;
  const existing = loadStage0Day1();
  if (existing && !existing.completed) return existing;
  const value = initialState(path, mode, now);
  return persist(value) ? value : null;
}

export function loadStage0Day1(): Stage0Day1State | null {
  const path = activePath();
  const raw = storage().getItem(STAGE0_DAY1_KEY);
  if (!path || !raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isState(value) || value.activePath !== path) return null;
    return value;
  } catch {
    return null;
  }
}

export function saveStage0Day1(
  patch: Stage0Day1Patch,
  now = Date.now()
): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed) return null;
  return update(current, patch, now);
}

export function day1ShortMinimumMet(value: Stage0Day1State): boolean {
  return (
    value.evidence.primeSeen &&
    value.evidence.textRead &&
    value.evidence.retrievalsCompleted >= 1 &&
    value.evidence.productionSaved
  );
}

export function day1FullMinimumMet(value: Stage0Day1State): boolean {
  return (
    day1ShortMinimumMet(value) &&
    value.evidence.guidedSubmitted &&
    value.evidence.guidedSlotsCompleted >= 3 &&
    value.evidence.fluencyVersions.every((item) => item !== null)
  );
}

export function stage0Day1Facts(value: Stage0Day1State): readonly string[] {
  if (value.mode === "short") return day1ShortMinimumMet(value) ? DAY1_SHORT_FACTS : [];
  return day1FullMinimumMet(value) ? DAY1_FULL_FACTS : [];
}

export function firstIncompleteStage0Day1(
  value: Stage0Day1State,
  mode: Day1Mode = value.mode
): Day1NextRequirement {
  if (value.completed) return { kind: "completed" };
  if (!value.evidence.primeSeen) return { kind: "core", phase: "prime" };
  if (!value.evidence.textRead) return { kind: "core", phase: "text" };
  if (value.comprehension !== "resolved" && value.comprehension !== "shown") {
    return { kind: "core", phase: "text" };
  }
  const requiredRetrievals = mode === "short" ? 1 : 3;
  if (value.evidence.retrievalsCompleted < requiredRetrievals) {
    return { kind: "core", phase: "retrieve" };
  }
  if (!value.evidence.productionSaved) return { kind: "core", phase: "produce" };
  if (mode === "short") return { kind: "closing" };
  if (!value.evidence.guidedSubmitted || value.evidence.guidedSlotsCompleted < 3) {
    const slot = Math.min(value.evidence.guidedSlotsCompleted, 2) as 0 | 1 | 2;
    return { kind: "guided-variation", slot };
  }
  const missingVersion = value.evidence.fluencyVersions.findIndex((item) => item === null);
  if (missingVersion >= 0) return { kind: "fluency-mini", version: missingVersion as 0 | 1 };
  return { kind: "closing" };
}

function patchForRequirement(requirement: Day1NextRequirement): Stage0Day1Patch {
  switch (requirement.kind) {
    case "core":
      return { block: "core", corePhase: requirement.phase };
    case "guided-variation":
      return { block: "guided-variation", currentGuidedSlot: requirement.slot };
    case "fluency-mini":
      return { block: "fluency-mini", currentFluencyVersion: requirement.version };
    case "closing":
    case "completed":
      return { block: "closing" };
  }
}

export function switchStage0Day1Mode(
  mode: Day1Mode,
  now = Date.now()
): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed) return null;
  const requirement = firstIncompleteStage0Day1(current, mode);
  return update(current, { mode, ...patchForRequirement(requirement) }, now);
}

export function markStage0Day1TextRead(now = Date.now()): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed) return null;
  return update(current, { corePhase: "text", evidence: { textRead: true } }, now);
}

export function answerStage0Day1Comprehension(
  correct: boolean,
  now = Date.now()
): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed || !current.evidence.textRead) return null;
  if (correct) {
    return update(current, { comprehension: "resolved", corePhase: "retrieve" }, now);
  }
  if (current.comprehension === "retry") {
    return update(current, { comprehension: "shown", corePhase: "retrieve" }, now);
  }
  return update(current, { comprehension: "retry", corePhase: "text" }, now);
}

export function submitStage0Day1Retrieval(
  answer: string,
  now = Date.now()
): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed || !answer.trim()) return null;
  const required = current.mode === "short" ? 1 : 3;
  const completed = Math.min(required, current.evidence.retrievalsCompleted + 1);
  return update(
    current,
    {
      retrievalDraft: "",
      retrievalSupportLevel: 0,
      corePhase: completed >= required ? "produce" : "retrieve",
      evidence: { retrievalsCompleted: completed },
    },
    now
  );
}

export function submitStage0Day1Production(
  text: string,
  now = Date.now()
): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed || !text.trim()) return null;
  return update(
    current,
    { productionText: text, corePhase: "voice", evidence: { productionSaved: true } },
    now
  );
}

export function finishStage0Day1Core(now = Date.now()): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed || !day1ShortMinimumMet(current)) return null;
  const requirement = firstIncompleteStage0Day1(current, current.mode);
  return update(current, patchForRequirement(requirement), now);
}

export function saveStage0Day1GuidedSlot(
  slot: 0 | 1 | 2,
  text: string,
  now = Date.now()
): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed || current.evidence.guidedSubmitted) return null;
  const drafts: [string, string, string] = [...current.guidedDrafts];
  drafts[slot] = text;
  const completed = drafts.filter((item) => item.trim()).length;
  return update(
    current,
    {
      block: "guided-variation",
      guidedDrafts: drafts,
      currentGuidedSlot: slot,
      evidence: { guidedSlotsCompleted: completed },
    },
    now
  );
}

export function submitStage0Day1GuidedVariation(now = Date.now()): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (
    !current ||
    current.completed ||
    current.evidence.guidedSubmitted ||
    current.guidedDrafts.some((item) => !item.trim())
  ) {
    return null;
  }
  return update(
    current,
    {
      block: "fluency-mini",
      currentFluencyVersion: 0,
      evidence: { guidedSlotsCompleted: 3, guidedSubmitted: true },
    },
    now
  );
}

export function skipStage0Day1GuidedVariation(now = Date.now()): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed) return null;
  const nextMode: Day1Mode = day1ShortMinimumMet(current) ? "short" : current.mode;
  const requirement = firstIncompleteStage0Day1(current, "short");
  return update(current, { mode: nextMode, ...patchForRequirement(requirement) }, now);
}

export function confirmStage0Day1FluencyVersion(
  evidence: Day1FluencyEvidence,
  now = Date.now()
): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || current.completed || current.mode !== "full") return null;
  const versions: [Day1FluencyEvidence | null, Day1FluencyEvidence | null] = [
    ...current.evidence.fluencyVersions,
  ];
  versions[current.currentFluencyVersion] = evidence;
  const nextVersion = versions[0] === null ? 0 : versions[1] === null ? 1 : current.currentFluencyVersion;
  return update(
    current,
    {
      block: versions.every((item) => item !== null) ? "closing" : "fluency-mini",
      currentFluencyVersion: nextVersion,
      evidence: { fluencyVersions: versions },
    },
    now
  );
}

export function completeStage0Day1(now = Date.now()): Stage0Day1State | null {
  const current = loadStage0Day1();
  if (!current || stage0Day1Facts(current).length === 0) return null;
  const next: Stage0Day1State = {
    ...current,
    block: "closing",
    completed: true,
    completionMode: current.mode,
    completedAt: now,
    updatedAt: now,
  };
  return persist(next) ? next : null;
}
