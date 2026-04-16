let reviewQuestions: any[] = [];

export function addReviewQuestion(q: any) {
  // 🔥 prevent duplicates
  const exists = reviewQuestions.some((item) => item.id === q.id);
  if (!exists) {
    reviewQuestions.push(q);
  }
}

export function getReviewQuestions() {
  return reviewQuestions;
}

export function clearReviewQuestions() {
  reviewQuestions = [];
}