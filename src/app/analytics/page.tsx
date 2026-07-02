import { discoveryCharacters, discoveryQuestions } from "@/lib/discovery-data";
import { traitMatches } from "@/lib/discovery-engine";

export default function AnalyticsPage() {
  const questionStats = discoveryQuestions
    .map((question) => {
      const matches = discoveryCharacters.filter((character) => traitMatches(character, question)).length;
      const ratio = matches / discoveryCharacters.length;
      const split = Math.round((1 - Math.abs(0.5 - ratio) * 2) * 100);
      return { question, matches, split };
    })
    .sort((a, b) => b.split - a.split || b.question.weight - a.question.weight);
  const ambiguousTraits = getAmbiguousTraits();

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>Engine analytics.</h1>
          <p>
            These diagnostics show why the project is more than a game: questions are measurable,
            traits can be audited, and ambiguity can be improved with better data.
          </p>
        </div>
      </section>
      <section className="stat-row">
        <Stat label="Characters" value={discoveryCharacters.length} />
        <Stat label="Questions" value={discoveryQuestions.length} />
        <Stat label="Global questions" value={discoveryQuestions.filter((question) => question.scope === "global").length} />
        <Stat label="HSR questions" value={discoveryQuestions.filter((question) => question.scope === "game:hsr").length} />
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <h2>Most useful split questions</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Scope</th>
                  <th>Matches</th>
                  <th>Split</th>
                </tr>
              </thead>
              <tbody>
                {questionStats.slice(0, 14).map(({ question, matches, split }) => (
                  <tr key={question.id}>
                    <td>{question.text}</td>
                    <td>{question.scope}</td>
                    <td>
                      {matches}/{discoveryCharacters.length}
                    </td>
                    <td>{split}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <h2>Ambiguity watchlist</h2>
          <div className="bar-list">
            {ambiguousTraits.map((item) => (
              <div className="bar-item" key={item.label}>
                <div className="bar-label">
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
                <div className="score-bar">
                  <span className="score-fill" style={{ width: `${(item.count / discoveryCharacters.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function getAmbiguousTraits() {
  const labels = ["purple hair", "Stellaron Hunters", "Penacony", "Nihility", "Harmony", "animated short"];
  const paths = [
    ["global.primaryHairColor", "purple"],
    ["hsr.faction", "Stellaron Hunters"],
    ["hsr.worldOrRegion", "Penacony"],
    ["hsr.path", "Nihility"],
    ["hsr.path", "Harmony"],
    ["hsr.hasAnimatedShort", true]
  ] as const;

  return paths
    .map(([traitPath, expectedValue], index) => ({
      label: labels[index],
      count: discoveryCharacters.filter((character) =>
        traitMatches(character, {
          id: labels[index],
          text: labels[index],
          scope: "global",
          traitPath,
          expectedValue,
          category: "identity",
          weight: 1
        })
      ).length
    }))
    .sort((a, b) => b.count - a.count);
}
