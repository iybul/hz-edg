import { Wizard } from "./components/wizard/Wizard";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            SQF Edition 10
          </p>
          <h1 className="mt-2 text-4xl font-bold">Documentation Generator</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Capture facility details, HACCP inputs, and infrastructure controls,
            then generate a structured food safety manual.
          </p>
        </div>
        <Wizard />
      </div>
    </main>
  );
}
