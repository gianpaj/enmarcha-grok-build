export type Speaker = "ai" | "you" | "think";
export type WaveMode = "speak" | "think" | "idle";

export type Choice = {
  id: string;
  day: string;
  time: string;
  you: string;
  confirm: string;
  confirmMs: number;
  bay: string;
  duration: string;
  work: string;
  vehicle: string;
};

export type Line = {
  speaker: Speaker;
  text: string;
  ms: number;
  status: string;
};

export type Scenario = {
  id: "moto" | "car";
  label: string;
  opening: Line[];
  choices: [Choice, Choice];
};

export type Spoken = { speaker: "ai" | "you"; text: string };

export type Frame = {
  status: string;
  mode: WaveMode;
  words: string[];
  shown: number;
  speaker: Speaker;
  previous: Spoken | null;
  showChoices: boolean;
  card: Choice | null;
  ended: boolean;
  clockMs: number;
};

export const YOU_PICK_MS = 1300;

const moto: Scenario = {
  id: "moto",
  label: "Motorbike",
  opening: [
    {
      speaker: "ai",
      status: "Speaking",
      ms: 2800,
      text: "Rueda, good morning. This is enMarcha. What do you need done?",
    },
    {
      speaker: "you",
      status: "Listening",
      ms: 3400,
      text: "I’ve got a 2019 Street Twin. Full service and front brake pads. When can I bring it in?",
    },
    {
      speaker: "think",
      status: "Checking the diary",
      ms: 1200,
      text: "One moment.",
    },
    {
      speaker: "ai",
      status: "Speaking",
      ms: 4200,
      text: "Thursday at 9:30 is open, or Friday at 16:00. Pads and a service take about two hours. Which works?",
    },
  ],
  choices: [
    {
      id: "thu",
      day: "Thursday",
      time: "9:30",
      you: "Thursday at 9:30.",
      confirm:
        "Booked. Thursday at 9:30, bay two. I’ll text this number. Bring the key, and the service book if you still have it.",
      confirmMs: 4600,
      bay: "Bay 02",
      duration: "About 2 hours",
      work: "Service and front brake pads",
      vehicle: "Street Twin, 2019",
    },
    {
      id: "fri",
      day: "Friday",
      time: "16:00",
      you: "Friday at 16:00.",
      confirm:
        "Booked. Friday at 16:00, bay one. Same work, about two hours. I’ll text the confirmation to this number.",
      confirmMs: 4200,
      bay: "Bay 01",
      duration: "About 2 hours",
      work: "Service and front brake pads",
      vehicle: "Street Twin, 2019",
    },
  ],
};

const car: Scenario = {
  id: "car",
  label: "Car",
  opening: [
    {
      speaker: "ai",
      status: "Speaking",
      ms: 2800,
      text: "Rueda, good morning. This is enMarcha. What do you need done?",
    },
    {
      speaker: "you",
      status: "Listening",
      ms: 3600,
      text: "It’s a 2018 Golf. It pulls to the left, and the front pads are finished. When can you see it?",
    },
    {
      speaker: "think",
      status: "Checking the diary",
      ms: 1200,
      text: "One moment.",
    },
    {
      speaker: "ai",
      status: "Speaking",
      ms: 4600,
      text: "Wednesday at 11:00 is open, or Thursday at 14:30. Pads and an alignment check take about two and a half hours. Which works?",
    },
  ],
  choices: [
    {
      id: "wed",
      day: "Wednesday",
      time: "11:00",
      you: "Wednesday at 11:00.",
      confirm:
        "Booked. Wednesday at 11:00, bay three. I’ll text this number. Leave it with us for the morning.",
      confirmMs: 4200,
      bay: "Bay 03",
      duration: "About 2.5 hours",
      work: "Front pads and alignment",
      vehicle: "Golf, 2018",
    },
    {
      id: "thu",
      day: "Thursday",
      time: "14:30",
      you: "Thursday at 14:30.",
      confirm:
        "Booked. Thursday at 14:30, bay one. I’ll text this number. We can finish it the same afternoon.",
      confirmMs: 4000,
      bay: "Bay 01",
      duration: "About 2.5 hours",
      work: "Front pads and alignment",
      vehicle: "Golf, 2018",
    },
  ],
};

export const scenarios: Record<Scenario["id"], Scenario> = { moto, car };

function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function shownCount(total: number, local: number, ms: number): number {
  if (total === 0) return 0;
  const p = Math.min(1, Math.max(0, local / ms));
  return Math.min(total, Math.max(1, Math.ceil(total * p)));
}

export function frameAt(
  scenario: Scenario,
  elapsed: number,
  choice: { id: string; at: number } | null,
): Frame {
  let t = 0;
  let priorSpoken: Spoken | null = null;
  let lastSpoken: Spoken | null = null;

  for (const line of scenario.opening) {
    const end = t + line.ms;
    if (elapsed < end) {
      const words = wordsOf(line.text);
      return {
        status: line.status,
        mode: line.speaker === "ai" ? "speak" : line.speaker === "think" ? "think" : "idle",
        words,
        shown: shownCount(words.length, elapsed - t, line.ms),
        speaker: line.speaker,
        previous: lastSpoken,
        showChoices: false,
        card: null,
        ended: false,
        clockMs: elapsed,
      };
    }
    if (line.speaker === "ai" || line.speaker === "you") {
      priorSpoken = lastSpoken;
      lastSpoken = { speaker: line.speaker, text: line.text };
    }
    t = end;
  }

  const offer = lastSpoken ?? { speaker: "ai" as const, text: "" };

  if (!choice) {
    const words = wordsOf(offer.text);
    return {
      status: "Choose a time",
      mode: "idle",
      words,
      shown: words.length,
      speaker: "ai",
      previous: priorSpoken,
      showChoices: true,
      card: null,
      ended: false,
      clockMs: elapsed,
    };
  }

  const picked = scenario.choices.find((c) => c.id === choice.id) ?? scenario.choices[0];
  const local = Math.max(0, elapsed - choice.at);

  if (local < YOU_PICK_MS) {
    const words = wordsOf(picked.you);
    return {
      status: "Listening",
      mode: "idle",
      words,
      shown: shownCount(words.length, local, YOU_PICK_MS),
      speaker: "you",
      previous: offer.speaker === "ai" || offer.speaker === "you" ? offer : null,
      showChoices: true,
      card: null,
      ended: false,
      clockMs: elapsed,
    };
  }

  const intoConfirm = local - YOU_PICK_MS;
  if (intoConfirm < picked.confirmMs) {
    const words = wordsOf(picked.confirm);
    return {
      status: "Speaking",
      mode: "speak",
      words,
      shown: shownCount(words.length, intoConfirm, picked.confirmMs),
      speaker: "ai",
      previous: { speaker: "you", text: picked.you },
      showChoices: false,
      card: null,
      ended: false,
      clockMs: elapsed,
    };
  }

  const words = wordsOf(picked.confirm);
  return {
    status: "Booked",
    mode: "idle",
    words,
    shown: words.length,
    speaker: "ai",
    previous: { speaker: "you", text: picked.you },
    showChoices: false,
    card: picked,
    ended: true,
    clockMs: choice.at + YOU_PICK_MS + picked.confirmMs,
  };
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
