export const EVALUATION_WARNING_SECONDS = 10 * 60;
export const EVALUATION_SUBMIT_GRACE_MS = 15_000;

export function remainingEvaluationSeconds(deadlineMs: number, nowMs = Date.now()) {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

export function resolveEvaluationAnswers(
  draftAnswers: Record<string, string>,
  submittedAnswers: Record<string, string>,
  deadlineMs: number | null,
  nowMs = Date.now(),
) {
  const timeExpired = deadlineMs !== null && nowMs >= deadlineMs;
  const acceptsSubmittedAnswers = deadlineMs === null || nowMs <= deadlineMs + EVALUATION_SUBMIT_GRACE_MS;
  return {
    timeExpired,
    answers: acceptsSubmittedAnswers ? { ...draftAnswers, ...submittedAnswers } : { ...draftAnswers },
  };
}
