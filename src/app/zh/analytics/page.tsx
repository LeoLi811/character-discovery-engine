import { discoveryCharacters, discoveryQuestions } from "@/lib/discovery-data";
import { traitMatches } from "@/lib/discovery-engine";
import { translateQuestion, translateTerm, uiText } from "@/lib/i18n";

export default function ChineseAnalyticsPage() {
  const text = uiText.zh.analytics;
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
          <h1>{text.title}</h1>
          <p>{text.body}</p>
        </div>
      </section>
      <section className="stat-row">
        <Stat label={text.characters} value={discoveryCharacters.length} />
        <Stat label={text.questions} value={discoveryQuestions.length} />
        <Stat label={text.globalQuestions} value={discoveryQuestions.filter((question) => question.scope === "global").length} />
        <Stat label={text.hsrQuestions} value={discoveryQuestions.filter((question) => question.scope === "game:hsr").length} />
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <h2>{text.usefulSplits}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{text.question}</th>
                  <th>{text.scope}</th>
                  <th>{text.matches}</th>
                  <th>{text.split}</th>
                </tr>
              </thead>
              <tbody>
                {questionStats.slice(0, 14).map(({ question, matches, split }) => (
                  <tr key={question.id}>
                    <td>{translateQuestion(question, "zh")}</td>
                    <td>{translateTerm(question.scope, "zh")}</td>
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
          <h2>{text.ambiguity}</h2>
          <div className="bar-list">
            {ambiguousTraits.map((item) => (
              <div className="bar-item" key={item.label}>
                <div className="bar-label">
                  <span>{translateTerm(item.label, "zh")}</span>
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
