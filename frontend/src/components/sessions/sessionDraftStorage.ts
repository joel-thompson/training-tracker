import { isValid } from "date-fns";
import { SESSION_TYPES } from "shared/constants";
import type { ClassType, SessionType } from "shared/types";

export const LAST_CLASS_TYPE_KEY = "training-tracker:last-class-type";
export const LAST_SESSION_TYPE_KEY = "training-tracker:last-session-type";
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export type SessionDraftState = {
  savedAt: string;
  sessionDate: string;
  classType: ClassType;
  sessionType: SessionType;
  techniqueCovered: string;
  generalNotes: string;
  successes: string[];
  problems: string[];
  questions: string[];
};

function normalizeRows(rows: string[]) {
  return rows.length > 0 ? rows : [""];
}

export function getDraftKey(userId: string) {
  return `training-tracker:session-draft:${userId}`;
}

export function getStoredClassType(): ClassType {
  if (typeof window === "undefined") {
    return "gi";
  }

  return window.localStorage.getItem(LAST_CLASS_TYPE_KEY) === "nogi" ? "nogi" : "gi";
}

export function getStoredSessionType(): SessionType {
  if (typeof window === "undefined") {
    return "class";
  }

  const stored = window.localStorage.getItem(LAST_SESSION_TYPE_KEY);
  return SESSION_TYPES.includes((stored ?? "") as SessionType) ? (stored as SessionType) : "class";
}

export function parseStoredDraft(value: string | null): SessionDraftState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as SessionDraftState;
    const savedAt = new Date(parsed.savedAt);
    if (!isValid(savedAt) || Date.now() - savedAt.getTime() > DRAFT_TTL_MS) {
      return null;
    }

    return {
      savedAt: parsed.savedAt,
      sessionDate: parsed.sessionDate,
      classType: parsed.classType === "nogi" ? "nogi" : "gi",
      sessionType: SESSION_TYPES.includes(parsed.sessionType) ? parsed.sessionType : "class",
      techniqueCovered: parsed.techniqueCovered ?? "",
      generalNotes: parsed.generalNotes ?? "",
      successes: normalizeRows(parsed.successes ?? [""]),
      problems: normalizeRows(parsed.problems ?? [""]),
      questions: normalizeRows(parsed.questions ?? [""]),
    };
  } catch {
    return null;
  }
}

export function readFreshSessionDraft(userId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredDraft(window.localStorage.getItem(getDraftKey(userId)));
}

export function hasFreshSessionDraft(userId: string) {
  return readFreshSessionDraft(userId) !== null;
}

