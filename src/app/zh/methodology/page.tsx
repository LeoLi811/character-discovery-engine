import { Database, FileSearch, Scale, WandSparkles } from "lucide-react";
import { uiText } from "@/lib/i18n";

const steps = [
  {
    title: "人工种子列表",
    icon: FileSearch,
    body: "V1 先从一批容易识别的角色开始，让网站可以立即运行，并且之后能按批次稳定扩展。"
  },
  {
    title: "信号分开存储",
    icon: Database,
    body: "热度输入会保留为独立信号，包括来源、数值、可信度和收集日期，而不是隐藏成一个不可解释的数字。"
  },
  {
    title: "透明评分",
    icon: Scale,
    body: "当前分数来自标准化信号的平均值，适合排序和展示，但不是对全球热度的最终判断。"
  },
  {
    title: "未来增强",
    icon: WandSparkles,
    body: "之后可以加入 Wikidata、IGDB、RAWG、浏览量、搜索趋势、同人内容和服装风格分类器。"
  }
];

export default function ChineseMethodologyPage() {
  const text = uiText.zh.methodology;

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>{text.title}</h1>
          <p>{text.body}</p>
        </div>
      </section>
      <section className="method-grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="panel" key={step.title}>
              <Icon size={24} aria-hidden="true" />
              <h2>{step.title}</h2>
              <p className="muted">{step.body}</p>
            </article>
          );
        })}
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>{text.knownGaps}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{text.area}</th>
                <th>{text.current}</th>
                <th>{text.future}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>热度</td>
                <td>人工整理基线，加上占位增强信号。</td>
                <td>加入浏览量、搜索兴趣、社群帖子、奖项和问卷数据。</td>
              </tr>
              <tr>
                <td>图片</td>
                <td>使用版权安全的颜色标识和风格元数据，不直接存储受版权保护的图。</td>
                <td>加入授权图片、官方媒体嵌入或带署名的用户资产。</td>
              </tr>
              <tr>
                <td>服装/风格</td>
                <td>手动记录服装、颜色、配饰和轮廓标签。</td>
                <td>建立受控分类体系，并可选加入计算机视觉辅助标注。</td>
              </tr>
              <tr>
                <td>外部 API</td>
                <td>记录存放在本地 JSON 中，所以网站不需要凭据也能构建。</td>
                <td>加入服务端 Wikidata 和 IGDB 抓取脚本，并缓存输出结果。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
