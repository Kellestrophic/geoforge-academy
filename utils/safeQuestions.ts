export function getSafeQuestions(questions: any[]) {
  return questions.filter((q) => {
    try {
      // must exist
      if (!q) return false;

      // must have question string
      if (typeof q.question !== "string") return false;

      // MATCH questions → allow ONLY if they have valid pairs
if (q.type === "match") {
  return Array.isArray(q.matchPairs) && q.matchPairs.length > 0;
}

      // MULTIPLE CHOICE → strict validation
      if (!Array.isArray(q.choices)) return false;
      if (q.choices.length === 0) return false;

      if (typeof q.correctAnswer !== "number") return false;
      if (q.correctAnswer < 0 || q.correctAnswer >= q.choices.length) return false;

      return true;
    } catch {
      return false;
    }
  });
}