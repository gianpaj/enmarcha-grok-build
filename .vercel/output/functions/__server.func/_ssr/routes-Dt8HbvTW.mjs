import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dt8HbvTW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var YOU_PICK_MS = 1300;
var scenarios = {
	moto: {
		id: "moto",
		label: "Motorbike",
		opening: [
			{
				speaker: "ai",
				status: "Speaking",
				ms: 2800,
				text: "Rueda, good morning. This is enMarcha. What do you need done?"
			},
			{
				speaker: "you",
				status: "Listening",
				ms: 3400,
				text: "I’ve got a 2019 Street Twin. Full service and front brake pads. When can I bring it in?"
			},
			{
				speaker: "think",
				status: "Checking the diary",
				ms: 1200,
				text: "One moment."
			},
			{
				speaker: "ai",
				status: "Speaking",
				ms: 4200,
				text: "Thursday at 9:30 is open, or Friday at 16:00. Pads and a service take about two hours. Which works?"
			}
		],
		choices: [{
			id: "thu",
			day: "Thursday",
			time: "9:30",
			you: "Thursday at 9:30.",
			confirm: "Booked. Thursday at 9:30, bay two. I’ll text this number. Bring the key, and the service book if you still have it.",
			confirmMs: 4600,
			bay: "Bay 02",
			duration: "About 2 hours",
			work: "Service and front brake pads",
			vehicle: "Street Twin, 2019"
		}, {
			id: "fri",
			day: "Friday",
			time: "16:00",
			you: "Friday at 16:00.",
			confirm: "Booked. Friday at 16:00, bay one. Same work, about two hours. I’ll text the confirmation to this number.",
			confirmMs: 4200,
			bay: "Bay 01",
			duration: "About 2 hours",
			work: "Service and front brake pads",
			vehicle: "Street Twin, 2019"
		}]
	},
	car: {
		id: "car",
		label: "Car",
		opening: [
			{
				speaker: "ai",
				status: "Speaking",
				ms: 2800,
				text: "Rueda, good morning. This is enMarcha. What do you need done?"
			},
			{
				speaker: "you",
				status: "Listening",
				ms: 3600,
				text: "It’s a 2018 Golf. It pulls to the left, and the front pads are finished. When can you see it?"
			},
			{
				speaker: "think",
				status: "Checking the diary",
				ms: 1200,
				text: "One moment."
			},
			{
				speaker: "ai",
				status: "Speaking",
				ms: 4600,
				text: "Wednesday at 11:00 is open, or Thursday at 14:30. Pads and an alignment check take about two and a half hours. Which works?"
			}
		],
		choices: [{
			id: "wed",
			day: "Wednesday",
			time: "11:00",
			you: "Wednesday at 11:00.",
			confirm: "Booked. Wednesday at 11:00, bay three. I’ll text this number. Leave it with us for the morning.",
			confirmMs: 4200,
			bay: "Bay 03",
			duration: "About 2.5 hours",
			work: "Front pads and alignment",
			vehicle: "Golf, 2018"
		}, {
			id: "thu",
			day: "Thursday",
			time: "14:30",
			you: "Thursday at 14:30.",
			confirm: "Booked. Thursday at 14:30, bay one. I’ll text this number. We can finish it the same afternoon.",
			confirmMs: 4e3,
			bay: "Bay 01",
			duration: "About 2.5 hours",
			work: "Front pads and alignment",
			vehicle: "Golf, 2018"
		}]
	}
};
function wordsOf(text) {
	return text.split(/\s+/).filter(Boolean);
}
function shownCount(total, local, ms) {
	if (total === 0) return 0;
	const p = Math.min(1, Math.max(0, local / ms));
	return Math.min(total, Math.max(1, Math.ceil(total * p)));
}
function frameAt(scenario, elapsed, choice) {
	let t = 0;
	let priorSpoken = null;
	let lastSpoken = null;
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
				clockMs: elapsed
			};
		}
		if (line.speaker === "ai" || line.speaker === "you") {
			priorSpoken = lastSpoken;
			lastSpoken = {
				speaker: line.speaker,
				text: line.text
			};
		}
		t = end;
	}
	const offer = lastSpoken ?? {
		speaker: "ai",
		text: ""
	};
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
			clockMs: elapsed
		};
	}
	const picked = scenario.choices.find((c) => c.id === choice.id) ?? scenario.choices[0];
	const local = Math.max(0, elapsed - choice.at);
	if (local < 1300) {
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
			clockMs: elapsed
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
			previous: {
				speaker: "you",
				text: picked.you
			},
			showChoices: false,
			card: null,
			ended: false,
			clockMs: elapsed
		};
	}
	const words = wordsOf(picked.confirm);
	return {
		status: "Booked",
		mode: "idle",
		words,
		shown: words.length,
		speaker: "ai",
		previous: {
			speaker: "you",
			text: picked.you
		},
		showChoices: false,
		card: picked,
		ended: true,
		clockMs: choice.at + YOU_PICK_MS + picked.confirmMs
	};
}
function formatClock(ms) {
	const total = Math.max(0, Math.floor(ms / 1e3));
	return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}
var SAMPLES = 280;
function readColor(el, name, fallback) {
	return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}
function withAlpha(color, alpha) {
	const hex = color.match(/^#([\da-f]{6})$/i);
	if (hex) {
		const n = parseInt(hex[1], 16);
		return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${alpha})`;
	}
	return color;
}
function voiceSample(phase, mode) {
	if (mode === "idle") return Math.sin(phase * .55) * .04 + Math.sin(phase * 1.15) * .018;
	const p = phase * (mode === "speak" ? 1 : .42);
	const syllable = Math.pow(Math.max(0, Math.sin(p * .38)), 1.4);
	let sample = (Math.sin(p * 1.12) * .56 + Math.sin(p * 2.27 + .5) * .26 + Math.sin(p * 3.84) * .1) * (.18 + .82 * syllable);
	if (mode === "speak" && Math.sin(p * .38) > .86) sample += Math.sin(p * 14.5) * .16;
	return mode === "think" ? sample * .42 : sample;
}
function Waveform({ mode, generation }) {
	const canvasRef = (0, import_react.useRef)(null);
	const modeRef = (0, import_react.useRef)(mode);
	modeRef.current = mode;
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const buffer = new Float32Array(SAMPLES);
		let phase = 0;
		let raf = 0;
		let alive = true;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const draw = () => {
			if (!alive) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			const pxW = Math.max(1, Math.floor(width * dpr));
			const pxH = Math.max(1, Math.floor(height * dpr));
			if (canvas.width !== pxW || canvas.height !== pxH) {
				canvas.width = pxW;
				canvas.height = pxH;
			}
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, width, height);
			const current = reduced ? "idle" : modeRef.current;
			const step = current === "speak" ? .34 : current === "think" ? .16 : .05;
			if (!reduced) for (let k = 0; k < 2; k++) {
				phase += step;
				buffer.copyWithin(0, 1);
				buffer[279] = voiceSample(phase, current);
			}
			else if (buffer[10] === 0) for (let i = 0; i < SAMPLES; i++) buffer[i] = voiceSample(i * .2, "idle");
			const voice = readColor(canvas, "--voice", "#1c6b4a");
			const ink = readColor(canvas, "--ink", "#1a1814");
			const speaking = current === "speak" || current === "think";
			const stroke = speaking ? voice : ink;
			const mid = height / 2;
			const gain = height * (current === "speak" ? .46 : current === "think" ? .28 : .22);
			ctx.beginPath();
			ctx.moveTo(0, mid);
			ctx.lineTo(width, mid);
			ctx.strokeStyle = withAlpha(ink, .14);
			ctx.lineWidth = 1;
			ctx.stroke();
			const point = (i, sign) => {
				const taper = Math.sin(i / 279 * Math.PI);
				return [i / 279 * width, mid - sign * buffer[i] * taper * gain];
			};
			const strokeTop = () => {
				ctx.beginPath();
				const first = point(0, 1);
				ctx.moveTo(first[0], first[1]);
				for (let i = 1; i < 279; i++) {
					const a = point(i, 1);
					const b = point(i + 1, 1);
					ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
				}
				ctx.lineTo(point(279, 1)[0], point(279, 1)[1]);
			};
			ctx.beginPath();
			const origin = point(0, 1);
			ctx.moveTo(origin[0], origin[1]);
			for (let i = 1; i < 279; i++) {
				const a = point(i, 1);
				const b = point(i + 1, 1);
				ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
			}
			const end = point(279, 1);
			ctx.lineTo(end[0], end[1]);
			for (let i = 278; i > 0; i--) {
				const a = point(i, -1);
				const b = point(i - 1, -1);
				ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
			}
			ctx.closePath();
			ctx.fillStyle = withAlpha(stroke, speaking ? .16 : .06);
			ctx.fill();
			strokeTop();
			ctx.strokeStyle = withAlpha(stroke, speaking ? .95 : .38);
			ctx.lineWidth = 1.6;
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.stroke();
			if (!reduced) raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => {
			alive = false;
			cancelAnimationFrame(raf);
		};
	}, [generation]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative h-24 sm:h-32",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "absolute inset-0 h-full w-full"
		})
	});
}
var AUTO_MS = 9e3;
function CallDemo() {
	const [scenarioId, setScenarioId] = (0, import_react.useState)("moto");
	const [run, setRun] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "call",
		"aria-label": "Sample call with enMarcha",
		className: "rise rise-3 scroll-mt-6 rounded-3xl border border-line bg-card p-4 shadow-stage sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "radiogroup",
				"aria-label": "Which call to play",
				className: "flex rounded-full bg-paper p-1",
				children: Object.values(scenarios).map((item) => {
					const on = item.id === scenarioId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "radio",
						"aria-checked": on,
						onClick: () => setScenarioId(item.id),
						className: "press min-h-11 rounded-full px-4 text-sm font-medium " + (on ? "bg-ink text-paper" : "text-muted"),
						children: item.label
					}, item.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
					scenarioId,
					run
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setRun((n) => n + 1),
					className: "press min-h-11 rounded-full px-3 text-sm font-medium text-ink",
					children: "Replay"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { scenario: scenarios[scenarioId] }, `${scenarioId}-${run}`)]
	});
}
function Clock({ scenarioId, run }) {
	const [label, setLabel] = (0, import_react.useState)("0:00");
	(0, import_react.useEffect)(() => {
		const start = performance.now();
		const id = window.setInterval(() => {
			setLabel(formatClock(performance.now() - start));
		}, 250);
		return () => window.clearInterval(id);
	}, [scenarioId, run]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-sm text-muted tabular-nums",
		children: label
	});
}
function Stage({ scenario }) {
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [choice, setChoice] = (0, import_react.useState)(null);
	const startRef = (0, import_react.useRef)(0);
	const choiceRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		startRef.current = performance.now();
		const id = window.setInterval(() => {
			setElapsed(performance.now() - startRef.current);
		}, 90);
		return () => window.clearInterval(id);
	}, []);
	const frame = frameAt(scenario, elapsed, choice);
	(0, import_react.useEffect)(() => {
		if (!frame.showChoices || choiceRef.current) return;
		const id = window.setTimeout(() => {
			if (choiceRef.current) return;
			const at = performance.now() - startRef.current;
			const next = {
				id: scenario.choices[0].id,
				at
			};
			choiceRef.current = next;
			setChoice(next);
		}, AUTO_MS);
		return () => window.clearTimeout(id);
	}, [frame.showChoices, scenario]);
	function pick(id) {
		if (choiceRef.current) return;
		const next = {
			id,
			at: performance.now() - startRef.current
		};
		choiceRef.current = next;
		setChoice(next);
	}
	const spoken = frame.words.slice(0, frame.shown).join(" ");
	const live = frame.speaker === "you" ? `You. ${frame.words.join(" ")}` : frame.words.join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "live-dot",
					"data-on": frame.mode !== "idle" ? "true" : "false"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium " + (frame.mode === "idle" ? "text-muted" : "text-voice"),
					children: frame.status
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "ml-auto text-sm text-muted",
					children: "Sample call · Rueda"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waveform, {
			mode: frame.mode,
			generation: 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "sr-only",
			"aria-live": "polite",
			children: [
				frame.status,
				". ",
				live
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-24 border-t border-line pt-4",
			children: [frame.previous ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 line-clamp-2 text-sm leading-relaxed text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-ink",
						children: frame.previous.speaker === "you" ? "You" : "enMarcha"
					}),
					" · ",
					frame.previous.text
				]
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"aria-hidden": "true",
				className: frame.speaker === "you" ? "text-xl leading-snug text-ink sm:text-2xl" : "font-serif text-2xl leading-snug tracking-tight text-ink sm:text-3xl",
				children: spoken
			})]
		}),
		frame.showChoices ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3",
			children: scenario.choices.map((option) => {
				const selected = choice?.id === option.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => pick(option.id),
					disabled: choice !== null,
					className: "press min-h-11 rounded-lg border px-3 py-3 text-left " + (selected ? "border-ink bg-ink text-paper disabled:opacity-100" : "border-line bg-paper text-ink") + (choice !== null && !selected ? " opacity-40" : ""),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm " + (selected ? "text-paper" : "text-muted"),
						children: option.day
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block font-serif text-2xl tabular-nums tracking-tight",
						children: option.time
					})]
				}, option.id);
			})
		}) : null,
		frame.card ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "settle mt-4 rounded-lg border border-line bg-paper px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-voice",
					children: "Held"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-baseline justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-3xl tracking-tight",
						children: frame.card.day
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-3xl tabular-nums tracking-tight",
						children: frame.card.time
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						frame.card.bay,
						" · ",
						frame.card.duration
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-ink",
					children: frame.card.work
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: frame.card.vehicle
				})
			]
		}) : null
	] });
}
var points = [
	{
		n: "01",
		title: "It asks what the job is",
		body: "A service, a noise, a bike that will not start. One clear question, then it stops talking."
	},
	{
		n: "02",
		title: "It only offers time that is free",
		body: "Bays, and how long the work actually takes. If Thursday is full, Thursday is not on the table."
	},
	{
		n: "03",
		title: "The bay is held before goodbye",
		body: "The customer leaves with a time, a bay, and what to bring. The desk has it in writing."
	}
];
function SitePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "top",
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#top",
					className: "font-serif text-xl tracking-tight text-ink",
					children: "enMarcha"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "For dealerships"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto grid max-w-6xl items-center gap-8 px-5 pt-4 pb-16 sm:px-8 lg:min-h-[40rem] lg:grid-cols-12 lg:gap-14 lg:pt-8 lg:pb-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rise text-sm font-medium text-voice",
								children: "Voice receptionist"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "rise rise-2 mt-3 font-serif text-4xl leading-display tracking-display text-ink sm:text-5xl lg:text-6xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block",
									children: "It picks up."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block italic font-normal",
									children: "It books the bay."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rise rise-3 mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg",
								children: "enMarcha answers the service line for car and motorbike dealerships. A customer calls about a repair. It checks the diary, and the visit is held before they hang up."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallDemo, {})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					id: "work",
					className: "mx-auto max-w-6xl scroll-mt-8 px-5 pb-16 sm:px-8 lg:pb-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-3xl tracking-tight text-ink sm:text-4xl",
						children: "What the call does"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-8 divide-y divide-line border-y border-line",
						children: points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid gap-2 py-6 sm:grid-cols-12 sm:gap-8 sm:py-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-serif text-lg tabular-nums text-muted sm:col-span-2",
								children: point.n
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-10 sm:grid sm:grid-cols-2 sm:gap-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-serif text-2xl tracking-tight text-ink",
									children: point.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-base leading-relaxed text-muted sm:mt-0",
									children: point.body
								})]
							})]
						}, point.n))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-6xl px-5 pb-20 sm:px-8 lg:pb-28",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/workshop.jpg",
						alt: "A sunlit workshop with a black motorcycle on a stand by the window, and the rear of a dark car.",
						width: 1792,
						height: 1008,
						className: "aspect-video w-full rounded-3xl object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
						className: "mt-3 text-sm text-muted",
						children: "Cars and motorbikes. The same service desk."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-14 max-w-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-3xl leading-display tracking-tight text-ink sm:text-4xl",
							children: "The workshop stays under the bike. The phone still gets answered."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-base leading-relaxed text-muted",
							children: "Service, repairs, and the question everyone calls with: when can I bring it in."
						})]
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-base text-ink",
						children: "enMarcha"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Voice receptionist for car and motorbike dealerships." })]
				})
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SitePage, {});
}
//#endregion
export { Home as component };
