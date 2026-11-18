import { useEffect, useRef, useState } from "react";
import { frameAt, formatClock, scenarios, type Scenario } from "@/lib/demo-call";
import { Waveform } from "@/components/waveform";

const AUTO_MS = 9000;

export function CallDemo() {
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>("moto");
  const [run, setRun] = useState(0);

  return (
    <section
      id="call"
      aria-label="Sample call with enMarcha"
      className="rise rise-3 scroll-mt-6 rounded-3xl border border-line bg-card p-4 shadow-stage sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Which call to play" className="flex rounded-full bg-paper p-1">
          {(Object.values(scenarios) as Scenario[]).map((item) => {
            const on = item.id === scenarioId;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setScenarioId(item.id)}
                className={
                  "press min-h-11 rounded-full px-4 text-sm font-medium " +
                  (on ? "bg-ink text-paper" : "text-muted")
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <Clock scenarioId={scenarioId} run={run} />
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="press min-h-11 rounded-full px-3 text-sm font-medium text-ink"
          >
            Replay
          </button>
        </div>
      </div>
      <Stage key={`${scenarioId}-${run}`} scenario={scenarios[scenarioId]} />
    </section>
  );
}

function Clock({ scenarioId, run }: { scenarioId: Scenario["id"]; run: number }) {
  const [label, setLabel] = useState("0:00");

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      setLabel(formatClock(performance.now() - start));
    }, 250);
    return () => window.clearInterval(id);
  }, [scenarioId, run]);

  return <span className="text-sm text-muted tabular-nums">{label}</span>;
}

function Stage({ scenario }: { scenario: Scenario }) {
  const [elapsed, setElapsed] = useState(0);
  const [choice, setChoice] = useState<{ id: string; at: number } | null>(null);
  const startRef = useRef(0);
  const choiceRef = useRef<{ id: string; at: number } | null>(null);

  useEffect(() => {
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      setElapsed(performance.now() - startRef.current);
    }, 90);
    return () => window.clearInterval(id);
  }, []);

  const frame = frameAt(scenario, elapsed, choice);

  useEffect(() => {
    if (!frame.showChoices || choiceRef.current) return;
    const id = window.setTimeout(() => {
      if (choiceRef.current) return;
      const at = performance.now() - startRef.current;
      const next = { id: scenario.choices[0].id, at };
      choiceRef.current = next;
      setChoice(next);
    }, AUTO_MS);
    return () => window.clearTimeout(id);
  }, [frame.showChoices, scenario]);

  function pick(id: string) {
    if (choiceRef.current) return;
    const at = performance.now() - startRef.current;
    const next = { id, at };
    choiceRef.current = next;
    setChoice(next);
  }

  const spoken = frame.words.slice(0, frame.shown).join(" ");
  const live = frame.speaker === "you" ? `You. ${frame.words.join(" ")}` : frame.words.join(" ");

  return (
    <div>
      <div className="mt-5 flex items-center gap-2">
        <span className="live-dot" data-on={frame.mode !== "idle" ? "true" : "false"} />
        <p className={"text-sm font-medium " + (frame.mode === "idle" ? "text-muted" : "text-voice")}>
          {frame.status}
        </p>
        <p className="ml-auto text-sm text-muted">Sample call · Rueda</p>
      </div>

      <Waveform mode={frame.mode} />

      <p className="sr-only" aria-live="polite">
        {frame.status}. {live}
      </p>

      <div className="min-h-24 border-t border-line pt-4">
        {frame.previous ? (
          <p className="mb-3 hidden text-sm leading-relaxed text-muted sm:line-clamp-2">
            <span className="font-medium text-ink">
              {frame.previous.speaker === "you" ? "You" : "enMarcha"}
            </span>
            {" · "}
            {frame.previous.text}
          </p>
        ) : null}
        <p
          aria-hidden="true"
          className={
            frame.speaker === "you"
              ? "text-xl leading-snug text-ink sm:text-2xl"
              : "font-serif text-2xl leading-snug tracking-tight text-ink sm:text-3xl"
          }
        >
          {spoken}
        </p>
      </div>

      {frame.showChoices ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {scenario.choices.map((option) => {
            const selected = choice?.id === option.id;
            const dim = choice !== null && !selected;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => pick(option.id)}
                disabled={choice !== null}
                className={
                  "press min-h-11 rounded-lg border px-3 py-3 text-left " +
                  (selected
                    ? "border-ink bg-ink text-paper disabled:opacity-100"
                    : "border-line bg-paper text-ink") +
                  (dim ? " opacity-40" : "")
                }
              >
                <span className={"block text-sm " + (selected ? "text-paper" : "text-muted")}>{option.day}</span>
                <span className="mt-1 block font-serif text-2xl tabular-nums tracking-tight">
                  {option.time}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {frame.card ? (
        <div className="settle mt-4 rounded-lg border border-line bg-paper px-4 py-4">
          <p className="text-sm font-medium text-voice">Held</p>
          <div className="mt-1 flex items-baseline justify-between gap-4">
            <p className="font-serif text-3xl tracking-tight">{frame.card.day}</p>
            <p className="font-serif text-3xl tabular-nums tracking-tight">{frame.card.time}</p>
          </div>
          <p className="mt-2 text-sm text-muted">
            {frame.card.bay}
            {" · "}
            {frame.card.duration}
          </p>
          <p className="mt-4 text-sm text-ink">{frame.card.work}</p>
          <p className="text-sm text-muted">{frame.card.vehicle}</p>
        </div>
      ) : null}
    </div>
  );
}
