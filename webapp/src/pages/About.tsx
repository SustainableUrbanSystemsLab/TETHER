import { useEffect } from "react";
import { AcronymTooltip } from "@/components/AcronymTooltip";
import { Link, useLocation } from "react-router";
import { ScenarioExplainer, type ScenarioData } from "@/components/ScenarioExplainer";
import { STEP_VISUALS } from "@/components/AlgorithmSteps";
import { DataChecklist } from "@/components/DataChecklist";
import {
  IconContribution,
  IconFeatures,
  IconFlags,
  IconMnn,
  IconNndr,
  IconSmd,
  IconTier,
  IconTies,
} from "@/components/SignalIcons";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MATCHER_VERSION, REPO_URL, SITE_URL } from "@/lib/about";
import { isDesktopApp } from "@/lib/platform";
import { useTheme } from "@/lib/use-theme";
import scenariosJson from "@/data/scenarios.json";

const SCENARIOS = scenariosJson as unknown as ScenarioData[];

const ALGORITHM_STEPS: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: "Identify shared columns.",
    body: (
      <>
        Columns with matching names link automatically; link others by hand. Exclude identifiers or unwanted variables from matching while keeping them in the output.
      </>
    ),
  },
  {
    title: "Put every variable on the same scale.",
    body: (
      <>
        Variables become z-scores using both files together. This keeps large numeric values, such as dollar amounts, from outweighing smaller values simply because of their scale.
      </>
    ),
  },
  {
    title: "Measure similarity.",
    body: (
      <>
        The tool measures Euclidean distance from each target row to every supplemental row across your chosen variables. Smaller distances mean more similar rows.
      </>
    ),
  },
  {
    title: "Pick the best match.",
    body: (
      <>
        The closest row wins. For an exact tie, the first row in file order is selected and flagged, so repeated runs give the same result.
      </>
    ),
  },
  {
    title: "Report quality signals.",
    body: (
      <>
        Confidence tier,{" "}
        <AcronymTooltip label="NNDR" explanation="Nearest Neighbor Distance Ratio: the closest distance divided by the second-closest. Lower values indicate a clearer winner." />
        ,{" "}
        <AcronymTooltip label="MNN" explanation="Mutual Nearest Neighbor: the two rows are each other’s closest match." />
        , near misses, ties, per-feature contribution and{" "}
        <AcronymTooltip label="SMD" explanation="Standardized Mean Difference: the difference in means relative to their spread. Values closer to zero indicate better dataset balance." />
        , all explained below.
      </>
    ),
  },
];

const LINK = "text-blue-600 dark:text-blue-400 underline hover:text-blue-800";

const SIGNALS: Array<{
  name: React.ReactNode;
  question: string;
  body: React.ReactNode;
  Icon: () => React.JSX.Element;
}> = [
  {
    name: "Confidence tier",
    question: "How much should you trust this match?",
    Icon: IconTier,
    body: (
      <>
        <strong>High</strong> indicates a clear, mutual match with complete data. <strong>Medium</strong> and <strong>Low</strong> indicate increasing ambiguity or limited evidence. <strong>No match</strong> means no row was assigned.
      </>
    ),
  },
  {
    name: "NNDR and near-miss count",
    question: "How clearly did one row stand out?",
    Icon: IconNndr,
    body: (
      <>
        NNDR divides the best distance by the second-best: near 0 means a clear winner; near 1 means ambiguity. Near misses count close alternatives (<a href="https://doi.org/10.1023/B:VISI.0000029664.99615.94" target="_blank" rel="noreferrer" className={LINK}>Lowe 2004</a>).
      </>
    ),
  },
  {
    name: "Mutual Nearest Neighbor (MNN)",
    question: "Does the match hold in both directions?",
    Icon: IconMnn,
    body: (
      <>
        Confirmed means both rows are each other’s nearest neighbor. Otherwise, the supplemental row is closer to another target; review the pairing before using it (<a href="https://doi.org/10.5220/0001787803310340" target="_blank" rel="noreferrer" className={LINK}>Muja &amp; Lowe 2009</a>).
      </>
    ),
  },
  {
    name: "Variables used",
    question: "How many variables went into the match?",
    Icon: IconFeatures,
    body: (
      <>
        Only values observed in both rows are compared; missing values add a fixed penalty. More shared variables give the match more evidence. Exact observed matches are also marked.
      </>
    ),
  },
  {
    name: (
      <>
        Ties (<code>repeats</code>)
      </>
    ),
    question: "Did several rows land at exactly the same distance?",
    Icon: IconTies,
    body: (
      <>
        <code>repeats</code> counts rows at the minimum distance, including the winner. A value of 1 means no tie. Ties select the first row in file order and are flagged.
      </>
    ),
  },
  {
    name: "Per-feature contribution",
    question: "Which variables made up the distance?",
    Icon: IconContribution,
    body: (
      <>
        Each variable contributes a share of the distance. If one dominates a large distance, check its units or scale. Dominating a small distance is usually unremarkable.
      </>
    ),
  },
  {
    name: "Standardized Mean Difference (SMD)",
    question: "Are the two datasets balanced overall?",
    Icon: IconSmd,
    body: (
      <>
        SMD measures overall balance for each variable, rather than individual match quality. Absolute values below 0.10 indicate good balance; values at or above 0.25 indicate poor balance (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3472075/" target="_blank" rel="noreferrer" className={LINK}>Austin</a>).
      </>
    ),
  },
  {
    name: "Plain-English flags",
    question: "Why was this row flagged?",
    Icon: IconFlags,
    body: (
      <>
        Flags explain why a match needs review, such as ties, missing values, or a one-sided pairing. Use them alongside the confidence tier to inspect individual rows.
      </>
    ),
  },
];

export default function About() {
  const theme = useTheme();
  // Client-side navigation does not scroll to a #fragment (the home page
  // links to #offline): do it once the section has rendered.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hash]);
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">How it works</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} />
            <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800">
              ← Home
            </Link>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-600">
          <strong>TETHER:</strong> Tying Environmental context To Human records, Ensuring Residential privacy
        </p>

        <section className="mb-6 rounded-lg border border-gray-200 bg-surface p-5">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            The matching algorithm
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            For each row in your target file, the tool finds the most similar
            row in the supplemental file, using the characteristics you
            choose — never ZIP codes, census tract IDs or other geographic
            identifiers, which the tool refuses to use as matching variables.
          </p>
          <ol className="space-y-2">
            {ALGORITHM_STEPS.map((step, i) => {
              const Visual = STEP_VISUALS[i]!;
              return (
                <li key={step.title} className="flex items-center gap-4">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {i + 1}
                  </div>
                  <div className="h-16 w-24 flex-none rounded border border-gray-100 bg-gray-50/60 p-1">
                    <Visual />
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{step.title}</strong> {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mb-6 rounded-lg border border-gray-200 bg-surface p-5">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Preparing your data
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            Standardization fixes <em>scale</em>, not <em>meaning</em>: the
            tool cannot tell that two columns with the same name were
            computed differently. That check is yours.
          </p>
          <DataChecklist />
        </section>

        <section
          id="offline"
          className="mb-6 scroll-mt-4 rounded-lg border border-gray-200 bg-surface p-5"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Offline options
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            Nothing here needs a connection except the first visit: the
            Python runtime, the matching engine and every asset are served by
            this site itself and cached in your browser. Three ways to run the
            tool where there is no Internet at all:
          </p>
          <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <h3 className="font-semibold text-gray-900">Keep this site offline</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Wait for <em>Available offline on this device</em> in the footer. You can then use TETHER without a connection or install it from your browser menu.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <h3 className="font-semibold text-gray-900">Desktop app</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Install TETHER on a computer with no Internet access, including secure environments. The matching engine and runtime are bundled, so no additional downloads are needed.
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>
                  <a href={`${REPO_URL}/releases/latest/download/NeighborhoodMatcher-darwin-aarch64.dmg`} className={`${LINK} inline-flex items-center gap-2`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <rect x="3" y="3" width="18" height="13" rx="2" /><path d="M12 16v5m-4 0h8" />
                    </svg>
                    macOS (Apple Silicon) .dmg
                  </a>
                </li>
                <li>
                  <a href={`${REPO_URL}/releases/latest/download/NeighborhoodMatcher-windows-x64-setup.exe`} className={`${LINK} inline-flex items-center gap-2`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <path d="M3 5.5 11 4.4v7H3zm9-1.2L22 3v8.4H12zM3 12.5h8v7L3 18.4zm9 0h10V21l-10-1.4z" fill="currentColor" stroke="none" />
                    </svg>
                    Windows (x64) installer
                  </a>
                  <span className="text-gray-500"> — WebView2 runtime included (~220 MB)</span>
                </li>
                <li>
                  <a href={`${REPO_URL}/releases/latest`} target="_blank" rel="noreferrer" className={`${LINK} inline-flex items-center gap-2`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />
                    </svg>
                    All releases
                  </a>
                </li>
              </ul>
              <details className="mt-3 text-xs text-gray-600">
                <summary className="cursor-pointer font-medium text-gray-800">
                  Installation help
                </summary>
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  The apps carry no developer certificate yet. macOS blocks
                  the first launch: click <em>Done</em>, open <em>System
                  Settings</em> → <em>Privacy &amp; Security</em> and click{" "}
                  <em>Open Anyway</em>. Or install from Terminal, with no
                  prompt at all:
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-700">
                  <code className="break-all">curl -fsSL {REPO_URL}/releases/latest/download/install-macos.sh | sh</code>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                  Windows SmartScreen: <em>More info</em>, then <em>Run
                  anyway</em>. Your IT department may need to approve the
                  installer first.
                </p>
              </details>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <h3 className="font-semibold text-gray-900">Host it yourself</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Download this build for your institution’s server or intranet. It includes all dependencies and a HOSTING.txt file with setup instructions for your server administrator.
              </p>
              <p className="mt-2 text-xs">
                {/* The desktop app does not embed the zip: link the website's copy. */}
                <a
                  href={`${isDesktopApp() ? SITE_URL : "/"}offline/nbhdmatch-site-v${MATCHER_VERSION}.zip`}
                  className={LINK}
                >
                  Download the site (v{MATCHER_VERSION}, ~12 MB)
                </a>
              </p>
            </div>
          </div>
        </section>

        <details className="group mb-6 rounded-lg border border-gray-200 bg-surface">
          <summary className="flex cursor-pointer items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
            <span className="text-gray-400 transition-transform group-open:rotate-90">
              ▸
            </span>
            <span>
              <span className="block text-lg font-semibold text-gray-900">
                Quality signals
              </span>
              <span className="block text-xs text-gray-500">
                Start with the confidence tier and the flags. Then look at
                NNDR, MNN and near misses. Contribution tells you <em>why</em>;
                SMD tells you about the run as a whole.
              </span>
            </span>
          </summary>
          <dl className="grid gap-x-6 gap-y-3 px-5 pb-5 text-sm text-gray-700 sm:grid-cols-2">
            {SIGNALS.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-12 w-12 flex-none rounded border border-gray-100 bg-gray-50/60 p-1">
                  <s.Icon />
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">{s.name}</dt>
                  <dd className="mt-0.5">
                    <span className="text-gray-500">{s.question}</span> {s.body}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </details>

        <details className="group mb-4 rounded-lg border border-gray-200 bg-surface">
          <summary className="flex cursor-pointer items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
            <span className="text-gray-400 transition-transform group-open:rotate-90">
              ▸
            </span>
            <span>
              <span className="block text-lg font-semibold text-gray-900">
                Scenarios
              </span>
              <span className="block text-xs text-gray-500">
                Five small example datasets: an exact match, rounding, a
                scale mismatch, an ambiguous match, and MNN not confirmed.
                Each shows the matcher&apos;s real numbers and the
                corresponding math.
              </span>
            </span>
          </summary>
          <div className="space-y-4 px-5 pb-5">
            {SCENARIOS.map((s, i) => (
              <ScenarioExplainer key={s.scenario_label} scenario={s} index={i} />
            ))}
          </div>
        </details>

        <SiteFooter />
      </div>
    </div>
  );
}
