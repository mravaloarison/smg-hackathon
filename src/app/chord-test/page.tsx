"use client";
import ChordViewer from "@/components/chord-viewer/ChordViewer";

const SAMPLE_1 = `
G           D
Let her go, only know you love her when you let her go
Em          C       G
Staring at the ceiling in the dark
D                Em        C
Same old empty feeling in your heart
G           D
'Cause love comes slow and it goes so fast

G               D
Well you see her when you fall asleep
Em              C
But never to touch and never to keep
G               D
'Cause you loved her too much
Em          C
And you dived too deep
`.trim();

const SAMPLE_2 = `
Am          F           C           G
Is this the real life? Is this just fantasy?
Am              E
Caught in a landslide, no escape from reality
Am      F       G
Open your eyes, look up to the skies and see
Am        Dm
I'm just a poor boy, I need no sympathy
F       Bb      F           Bb
Because it's easy come, easy go, little high, little low
Eb              Bb          F
Anywhere the wind blows doesn't really matter to me
G
To me
`.trim();

export default function ChordTestPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 flex flex-col gap-16">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Chord Viewer — Test Route</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          Hardcoded samples. No app integration yet. Click any diagram to open the voicings modal.
        </p>

        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Let Her Go — Passenger
        </h2>
        <ChordViewer chordsText={SAMPLE_1} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Bohemian Rhapsody — Queen
        </h2>
        <ChordViewer chordsText={SAMPLE_2} />
      </div>
    </main>
  );
}
