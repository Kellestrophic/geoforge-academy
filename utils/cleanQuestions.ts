export function cleanQuestions(data: any[]) {
  return data.filter((q) => {
    try {
      if (!q) return false;

      if (typeof q.question !== "string") return false;

      if (q.type === "match") {
        return Array.isArray(q.matchPairs) && q.matchPairs.length > 0;
      }

      if (!Array.isArray(q.choices)) return false;
      if (q.choices.length < 2) return false;

      if (typeof q.correctAnswer !== "number") return false;
      if (q.correctAnswer < 0 || q.correctAnswer >= q.choices.length)
        return false;

      if (typeof q.choices[q.correctAnswer] !== "string") return false;

      return true;
    } catch {
      return false;
    }
  });
}