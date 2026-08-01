import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { getAllClubIds, getClubDetail } from "./club-detail-data";

export type ClassDetailInstruction = {
  title: string;
  body: string;
};

export type ClassDetailRelated = {
  id: string;
  category: string;
  title: string;
  image: string;
  durationLabel: string;
  caloriesLabel: string;
};

export type ClassDetail = {
  id: string;
  clubId: string;
  category: string;
  title: string;
  tagline: string;
  image: string;
  gallery: string[];
  durationLabel: string;
  rating: string;
  caloriesLabel: string;
  description: string;
  benefits: string[];
  tags: string[];
  sessionDuration: {
    range: string;
    unit: string;
    caption: string;
    /** 0–1 fill for the semicircle gauge */
    progress: number;
  };
  intensity: {
    score: string;
    label: string;
    description: string;
  };
  instructions: ClassDetailInstruction[];
  planSteps: ClassDetailInstruction[];
  related: ClassDetailRelated[];
  isBookmarked?: boolean;
};

const DEFAULT_GALLERY = [
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
] as const;

const CLASSES: Record<string, ClassDetail> = {
  "power-hiit": {
    id: "power-hiit",
    clubId: "heavenly",
    category: "HIIT",
    title: "Power HIIT With Core Burn",
    tagline: "intense, efficient, and results-driven — built for a stronger you.",
    image: "/demo/coach-portrait.png",
    gallery: [...DEFAULT_GALLERY],
    durationLabel: "10-20 Minutes",
    rating: "4.6",
    caloriesLabel: "648 kcal",
    description:
      "A high-intensity interval class that blends explosive cardio with focused core work. Expect short bursts, smart recovery, and a finish that leaves you sharp.",
    benefits: [
      "High calorie burn for fat loss",
      "Builds explosive power and stamina",
      "Strengthens core and posture",
      "Scalable for all fitness levels",
      "Easy to fit into a busy schedule",
    ],
    tags: ["HIIT", "Core", "Fat Burn", "All Levels", "Cardio"],
    sessionDuration: {
      range: "30-45",
      unit: "Total minutes",
      caption: "Moderate session length",
      progress: 0.62,
    },
    intensity: {
      score: "87.2",
      label: "Great for fat burn",
      description: "This class is excellent for metabolism and conditioning.",
    },
    instructions: [
      {
        title: "Warm Up & Prep",
        body: "Start with dynamic mobility, light cardio, and activation drills to raise your heart rate safely.",
      },
      {
        title: "Main HIIT Blocks",
        body: "Alternate high-effort intervals with short recovery. Focus on form over speed as fatigue builds.",
      },
      {
        title: "Core Burn & Cool Down",
        body: "Finish with targeted core work, then stretch and breathe to bring your heart rate down.",
      },
    ],
    planSteps: [
      {
        title: "Block A — Power",
        body: "Jump squats, battle ropes, and burpees for 40s on / 20s off × 4.",
      },
      {
        title: "Block B — Core",
        body: "Plank variations, hollow holds, and Russian twists for 3 rounds.",
      },
      {
        title: "Block C — Finisher",
        body: "Assault bike or rower sprint ladder, then full-body stretch.",
      },
    ],
    related: [
      {
        id: "strength-circuit",
        category: "Strength",
        title: "Strength Circuit Deluxe",
        image: PLACEHOLDER_IMAGE,
        durationLabel: "45 Minutes",
        caloriesLabel: "520 kcal",
      },
      {
        id: "mobility-flow",
        category: "Mobility",
        title: "Mobility Flow Session",
        image: PLACEHOLDER_IMAGE,
        durationLabel: "30 Minutes",
        caloriesLabel: "180 kcal",
      },
    ],
    isBookmarked: false,
  },
  "strength-circuit": {
    id: "strength-circuit",
    clubId: "heavenly",
    category: "Strength",
    title: "Strength Circuit Deluxe",
    tagline: "compound lifts, smart pacing, and progressive overload.",
    image: PLACEHOLDER_IMAGE,
    gallery: [...DEFAULT_GALLERY],
    durationLabel: "40-50 Minutes",
    rating: "4.8",
    caloriesLabel: "520 kcal",
    description:
      "A coach-led strength circuit focused on major movement patterns. Build muscle, improve technique, and leave with a clear sense of progress.",
    benefits: [
      "Builds lean muscle efficiently",
      "Improves joint stability",
      "Teaches proper lifting form",
      "Progressive weekly structure",
      "Great for busy schedules",
    ],
    tags: ["Strength", "Barbell", "Hypertrophy", "Gym", "Coach Led"],
    sessionDuration: {
      range: "40-50",
      unit: "Total minutes",
      caption: "Full training session",
      progress: 0.78,
    },
    intensity: {
      score: "82.4",
      label: "Solid for muscle gain",
      description: "Balanced intensity for strength without excessive fatigue.",
    },
    instructions: [
      {
        title: "Movement Prep",
        body: "Foam roll, activate glutes and shoulders, then practice empty-bar patterns.",
      },
      {
        title: "Circuit Rounds",
        body: "Rotate through squat, hinge, push, and pull stations with controlled tempo.",
      },
      {
        title: "Accessories & Stretch",
        body: "Finish with arms/core accessories and a short mobility cool-down.",
      },
    ],
    planSteps: [
      {
        title: "Station 1 — Squat",
        body: "Goblet or back squat · 4 × 8 with 60s rest.",
      },
      {
        title: "Station 2 — Pull",
        body: "Lat pulldown or rows · 4 × 10 controlled reps.",
      },
      {
        title: "Station 3 — Push",
        body: "Bench or push-ups · 4 × 8–12 to near failure.",
      },
    ],
    related: [
      {
        id: "power-hiit",
        category: "HIIT",
        title: "Power HIIT With Core Burn",
        image: "/demo/coach-portrait.png",
        durationLabel: "35 Minutes",
        caloriesLabel: "648 kcal",
      },
    ],
    isBookmarked: true,
  },
};

function titleFromClassId(classId: string): string {
  return classId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createFallbackClass(clubId: string, classId: string): ClassDetail {
  const club = getClubDetail(clubId);
  const title = titleFromClassId(classId) || `Class ${classId}`;

  return {
    id: classId,
    clubId,
    category: "Fitness",
    title,
    tagline: "coach-led training designed for real progress.",
    image: club?.images[0] ?? PLACEHOLDER_IMAGE,
    gallery: club?.images?.length ? club.images : [...DEFAULT_GALLERY],
    durationLabel: "30-45 Minutes",
    rating: "4.5",
    caloriesLabel: "400 kcal",
    description: `Join ${title} at ${club?.title ?? "this club"} — structured programming, expert coaching, and an energetic room.`,
    benefits: [
      "Expert coaching and form cues",
      "Clear session structure",
      "Scalable intensity",
      "Supportive community vibe",
      "Easy to book and attend",
    ],
    tags: ["Fitness", "Club Class", "Coach", "Training"],
    sessionDuration: {
      range: "30-45",
      unit: "Total minutes",
      caption: "Moderate session length",
      progress: 0.55,
    },
    intensity: {
      score: "80.0",
      label: "Balanced intensity",
      description: "A well-rounded class for consistency and progress.",
    },
    instructions: [
      {
        title: "Arrive & Warm Up",
        body: "Check in early, set up your space, and complete the guided warm-up.",
      },
      {
        title: "Main Session",
        body: "Follow coach cues through the primary training blocks.",
      },
      {
        title: "Cool Down",
        body: "Stretch, hydrate, and note any wins for next time.",
      },
    ],
    planSteps: [
      {
        title: "Warm-up",
        body: "5–8 minutes of mobility and activation.",
      },
      {
        title: "Work sets",
        body: "Primary training block with programmed rest.",
      },
      {
        title: "Finisher",
        body: "Optional conditioning plus cool-down stretch.",
      },
    ],
    related: [
      {
        id: "power-hiit",
        category: "HIIT",
        title: "Power HIIT With Core Burn",
        image: "/demo/coach-portrait.png",
        durationLabel: "35 Minutes",
        caloriesLabel: "648 kcal",
      },
    ],
    isBookmarked: false,
  };
}

export function getClassDetail(
  clubId: string,
  classId: string,
): ClassDetail | undefined {
  const club = clubId.trim();
  const id = classId.trim();
  if (!club || !id) return undefined;

  const known = CLASSES[id];
  if (known) {
    return { ...known, clubId: club };
  }

  return createFallbackClass(club, id);
}

/** Pairs for Capacitor static export (`output: "export"`). */
export function getAllClassParams(): { clubId: string; classId: string }[] {
  const fromKnown = Object.values(CLASSES).map((item) => ({
    clubId: item.clubId,
    classId: item.id,
  }));

  const clubIds = getAllClubIds();
  const extras = clubIds.flatMap((clubId) =>
    Object.keys(CLASSES).map((classId) => ({ clubId, classId })),
  );

  const seen = new Set<string>();
  const all = [...fromKnown, ...extras];
  return all.filter((item) => {
    const key = `${item.clubId}/${item.classId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
