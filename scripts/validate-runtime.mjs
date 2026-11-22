const base = process.argv[2] ?? process.env.VALIDATION_BASE_URL ?? "http://127.0.0.1:3000";
const email = `e2e-${Date.now()}@example.test`;

async function json(response, label) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status} ${JSON.stringify(body)}`);
  return body;
}

const registration = await fetch(`${base}/api/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    nama: "Uji Neon",
    email,
    password: "UjiNeon123!",
    konfirmasi: "UjiNeon123!",
  }),
});
const cookie = (registration.headers.get("set-cookie") ?? "").split(";")[0];
await json(registration, "register");
if (!cookie) throw new Error("Cookie sesi tidak diterima setelah registrasi.");

let response = await fetch(`${base}/api/evaluation/pretest`, { headers: { cookie } });
const pretest = await json(response, "get pretest");
const pretestAnswers = Object.fromEntries(pretest.questions.map((question) => [String(question.id), "a"]));

response = await fetch(`${base}/api/evaluation/pretest`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ answers: pretestAnswers }),
});
const pretestResult = await json(response, "submit pretest");

response = await fetch(`${base}/api/training`, { headers: { cookie } });
const training = await json(response, "get training");
if (training.session) throw new Error("GET latihan tidak boleh membuat sesi baru.");

response = await fetch(`${base}/api/training`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ action: "start" }),
});
const startedTraining = await json(response, "start training");
const trainingAnswers = Object.fromEntries(startedTraining.questions.map((question) => [String(question.id), "a"]));

response = await fetch(`${base}/api/training`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ action: "submit", sessionId: startedTraining.session.id, answers: trainingAnswers }),
});
const trainingResult = await json(response, "submit training");

console.log(JSON.stringify({
  registration: 201,
  pretestQuestions: pretest.questions.length,
  pretestScore: pretestResult.score,
  trainingQuestions: startedTraining.questions.length,
  trainingResult,
}, null, 2));
