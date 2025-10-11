module.exports = ({ path, count, output, min, shortName }) => {
  const fs = require("fs");
  const input = JSON.parse(fs.readFileSync(path))
    .traceEvents.sort((x1, x2) => x2.dur - x1.dur)
    .slice(0, count)
    .filter((a) => a.dur > min * 1000);

  const grouped = Object.groupBy(input, (a) => a.tid);

  const header =
    "```mermaid" +
    `
  gantt
    dateFormat x
    axisFormat %M:%S
  `;

  const nameAndDuration = (n) => {
    let baseName = n.name.replaceAll(" ", "");
    if (shortName) {
      baseName = baseName
        .replaceAll("/executeTests", "/test")
        .replaceAll("/compileIncremental", "/compile");
    }
    return `${baseName} ${Math.floor(n.dur / 100000) / 10}`;
  };

  const values = Object.keys(grouped)
    .map(
      (k) =>
        `  section ${k}\n` +
        grouped[k]
          .map((n) => {
            const name = nameAndDuration(n);
            const startTime = Math.floor(n.ts / 1000);
            const endTime = Math.floor((n.ts + n.dur) / 1000);
            return `    ${name} : ${startTime} , ${endTime}`;
          })
          .join("\n"),
    )
    .join("\n");

  const result = header + values + "\n```";

  fs.appendFileSync(output, result);

  const list = input.map((n) => `1. ${nameAndDuration(n)}`).join("\n");

  fs.appendFileSync(output, "\n\n" + list);
};
