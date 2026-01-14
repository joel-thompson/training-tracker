import type { ClassType, ItemType, GoalCategory } from "shared/types";

const bjjContext = `
# BJJ Fundamentals

## Core Concept
Positional grappling focused on control and submission via joint locks or chokes. Strategy: advance through positions of increasing dominance until submission opportunity arises.

## Positional Hierarchy
**Bottom (worst to best):** Mounted → Back Taken → Side Control → Guard  
**Top (best to worst):** Back Control → Mount → Side Control → Guard Passing

## Guard (Bottom)
Control opponent, prevent passing, create sweeps/submissions.

- Legs as frames/barriers for distance and posture control
- Grips (sleeves, collars, belt) limit mobility
- Angles create off-balancing and sweeps
- Submission threats force reactions

**Common Types (non-exhaustive):**
- Closed: Legs locked around waist - maximum control
- Open: Legs unlocked - mobile, hooks/frames
- Half: One leg trapped - transitional sweeps
- Butterfly: Hooks inside thighs - powerful sweeps

## Guard Passing (Top)
Pass legs to achieve side control or better.

- Maintain posture and base
- Control hips (hips lead body)
- Forward/downward pressure
- Block guard retention
- Secure position before advancing
- Break grips and structure
- Pin hips OR create distance
- Clear legs systematically
- Establish crossface/underhook

## Side Control (Top)
Maintain pressure, prevent escape, advance position.

- Weight on opponent's chest
- Control near hip and far shoulder (crossface)
- Block hip escapes and frames
- Transition to mount/knee-on-belly/north-south

## Mount (Top)
Dominant control, attack submissions.

- High chest position
- Grapevines/hooks prevent bridges/escapes
- Maintain posture and base
- Attack chokes, armlocks, or take back

## Back Control (Top)
Most dominant - attack neck, prevent escape.

- Both hooks secured (feet inside thighs)
- Seatbelt grip (arm over shoulder, arm under arm)
- Stay tight, prevent turning
- Primary: rear naked choke
- Maintain through failed attempts

## Escapes

**Side Control:** Frame for space → shrimp for angles → recover guard (knee/shin) → time during transitions

**Mount:** Protect neck (hands high, elbows tight) → bridge to off-balance → trap arm/leg same side, bridge to reverse OR elbow-knee to half guard

**Back:** Protect neck (chin down, defend grips) → clear hooks one at a time → turn into opponent → stay methodical

## Submissions

**Chokes** (restrict blood/air to neck, examples, not exhaustive):
- Rear Naked: From back, arm across neck
- Triangle: From guard, legs around neck and arm
- Guillotine: Front headlock, arm under chin
- Cross Collar: Gi grips compress neck

**Joint Locks** (hyperextend/twist joints, examples, not exhaustive):
- Armbar: Elbow hyperextension
- Kimura: Shoulder, arm bent 90° behind back
- Americana: Shoulder, arm bent toward head
- Ankle Lock: Ankle hyperextension/twist

## Strategic Principles
- Position before submission
- Top: apply pressure. Bottom: maintain base
- Chain attacks (failed attempt → immediate transition)
- Defend first in bad positions
- Grip control determines execution
`;

export default bjjContext;

interface SessionWithItems {
  id: string;
  sessionDate: string;
  classType: ClassType;
  techniqueCovered: string | null;
  generalNotes: string | null;
  items: {
    type: ItemType;
    content: string;
  }[];
}

interface Goal {
  goalText: string;
  category: GoalCategory | null;
  notes: string | null;
  isActive: boolean;
  completedAt: string | null;
}

export interface UserContext {
  sessions: SessionWithItems[];
  goals: Goal[];
  stats: {
    totalSessions: number;
    giCount: number;
    nogiCount: number;
  };
}

export function buildSystemPrompt(context: UserContext): string {
  const today = new Date().toISOString().split("T")[0];

  const sessionsText =
    context.sessions.length > 0
      ? context.sessions
          .map((s) => {
            const lines = [`- ${s.sessionDate} (${s.classType})`];
            if (s.techniqueCovered) {
              lines.push(`  Technique: ${s.techniqueCovered}`);
            }
            if (s.items.length > 0) {
              const successes = s.items
                .filter((i) => i.type === "success")
                .map((i) => i.content);
              const problems = s.items
                .filter((i) => i.type === "problem")
                .map((i) => i.content);
              const questions = s.items
                .filter((i) => i.type === "question")
                .map((i) => i.content);

              if (successes.length > 0)
                lines.push(`  Successes: ${successes.join("; ")}`);
              if (problems.length > 0)
                lines.push(`  Problems: ${problems.join("; ")}`);
              if (questions.length > 0)
                lines.push(`  Questions: ${questions.join("; ")}`);
            }
            if (s.generalNotes) {
              lines.push(`  Notes: ${s.generalNotes}`);
            }
            return lines.join("\n");
          })
          .join("\n\n")
      : "No recent sessions logged.";

  const activeGoals = context.goals.filter((g) => g.isActive);
  const completedGoals = context.goals.filter((g) => !g.isActive);

  const goalsText =
    activeGoals.length > 0
      ? activeGoals
          .map((g) => {
            let line = `- ${g.goalText}`;
            if (g.category) line += ` (${g.category})`;
            if (g.notes) line += ` — ${g.notes}`;
            return line;
          })
          .join("\n")
      : "No active goals set.";

  const completedGoalsText =
    completedGoals.length > 0
      ? completedGoals
          .slice(0, 5)
          .map(
            (g) => `- ${g.goalText} (completed ${g.completedAt ?? "unknown"})`
          )
          .join("\n")
      : "No completed goals yet.";

  return `You are a supportive BJJ (Brazilian Jiu-Jitsu) training coach helping a practitioner reflect on and improve their training.

${bjjContext}

## User's Training Context

### Training Stats (Last 90 Days)
- Total sessions: ${context.stats.totalSessions}
- Gi sessions: ${context.stats.giCount}
- No-Gi sessions: ${context.stats.nogiCount}

### Recent Training Sessions
${sessionsText}

### Active Goals
${goalsText}

### Recently Completed Goals
${completedGoalsText}

## Guidelines
- Be encouraging but honest
- Reference specific sessions, dates, and details when relevant
- Keep responses concise (2-3 paragraphs max unless the user asks for more detail)
- Use BJJ terminology naturally (positions, submissions, sweeps, etc.)
- If asked about something not in the training data, say so honestly
- When identifying patterns, be specific about dates and occurrences
- Suggest actionable next steps when appropriate

Today's date is: ${today}`;
}
