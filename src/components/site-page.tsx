import { CallDemo } from "@/components/call-demo";

const points = [
  {
    n: "01",
    title: "It asks what the job is",
    body: "A service, a noise, a bike that will not start. One clear question, then it stops talking.",
  },
  {
    n: "02",
    title: "It only offers time that is free",
    body: "Bays, and how long the work actually takes. If Thursday is full, Thursday is not on the table.",
  },
  {
    n: "03",
    title: "The bay is held before goodbye",
    body: "The customer leaves with a time, a bay, and what to bring. The desk has it in writing.",
  },
];

export function SitePage() {
  return (
    <div id="top" className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="font-serif text-xl tracking-tight text-ink">
          enMarcha
        </a>
        <p className="text-sm text-muted">For dealerships</p>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-4 pb-16 sm:px-8 lg:min-h-[40rem] lg:grid-cols-12 lg:gap-14 lg:pt-8 lg:pb-24">
          <div className="lg:col-span-5">
            <p className="rise text-sm font-medium text-voice">Voice receptionist</p>
            <h1 className="rise rise-2 mt-3 font-serif text-4xl leading-display tracking-display text-ink sm:text-5xl lg:text-6xl">
              <span className="block">It picks up.</span>
              <span className="mt-1 block italic font-normal">It books the bay.</span>
            </h1>
            <p className="rise rise-3 mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              enMarcha answers the service line for car and motorbike dealerships. A customer calls
              about a repair. It checks the diary, and the visit is held before they hang up.
            </p>
          </div>
          <div className="lg:col-span-7">
            <CallDemo />
          </div>
        </section>

        <section id="work" className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-16 sm:px-8 lg:pb-24">
          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">What the call does</h2>
          <ol className="mt-8 divide-y divide-line border-y border-line">
            {points.map((point) => (
              <li key={point.n} className="grid gap-2 py-6 sm:grid-cols-12 sm:gap-8 sm:py-8">
                <p className="font-serif text-lg tabular-nums text-muted sm:col-span-2">{point.n}</p>
                <div className="sm:col-span-10 sm:grid sm:grid-cols-2 sm:gap-8">
                  <h3 className="font-serif text-2xl tracking-tight text-ink">{point.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted sm:mt-0">{point.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 lg:pb-28">
          <figure>
            <img
              src="/workshop.jpg"
              alt="A sunlit workshop with a black motorcycle on a stand by the window, and the rear of a dark car."
              width={1792}
              height={1008}
              className="aspect-video w-full rounded-3xl object-cover"
            />
            <figcaption className="mt-3 text-sm text-muted">
              Cars and motorbikes. The same service desk.
            </figcaption>
          </figure>
          <div className="mt-14 max-w-xl">
            <p className="font-serif text-3xl leading-display tracking-tight text-ink sm:text-4xl">
              The workshop stays under the bike. The phone still gets answered.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Service, repairs, and the question everyone calls with: when can I bring it in.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="font-serif text-base text-ink">enMarcha</p>
          <p>Voice receptionist for car and motorbike dealerships.</p>
        </div>
      </footer>
    </div>
  );
}
