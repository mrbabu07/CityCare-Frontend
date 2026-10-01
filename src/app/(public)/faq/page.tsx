export const metadata = {
  title: "Help center",
  description:
    "Answers to common CityCare questions about requests, attachments, and payments.",
};
const questions = [
  [
    "Who can submit a request?",
    "Anyone with a citizen account can submit a neighborhood issue. Registration is free.",
  ],
  [
    "What should I include in a request?",
    "A clear title, the service category, a description, and a precise address or landmark. You can add supporting files after submitting.",
  ],
  [
    "Which files are accepted?",
    "JPEG, PNG, WebP images and PDF documents, up to 4 MB per file.",
  ],
  [
    "Who can see my request?",
    "Your request is available to you, city administrators, and the staff member assigned to it.",
  ],
  [
    "Can I follow the progress?",
    "Your request detail page includes its current status, assigned department, service target, and status history.",
  ],
  [
    "What happens if payment fails?",
    "A failed payment does not grant urgent priority. The request stays available and the payment can be retried. If the result is uncertain, check the payment status before paying again.",
  ],
  [
    "When can I leave feedback?",
    "After the request is resolved or closed, its owner can submit a rating and comment.",
  ],
];
export default function Faq() {
  return (
    <>
      <p className="eyebrow">A LITTLE GUIDANCE</p>
      <h1>How can we help?</h1>
      {questions.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </>
  );
}
