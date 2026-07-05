// The famous "time in practice" ideas Ayuta is built around.
// Surfaced in the Path picker, checkpoint tooltips, and the /ideas page.

export interface Framework {
  key: string;
  title: string;
  source: string;
  url?: string;
  blurb: string;
}

export const FRAMEWORKS: Record<string, Framework> = {
  first20: {
    key: "first20",
    title: "The First 20 Hours",
    source: "Josh Kaufman",
    url: "https://first20hours.com",
    blurb:
      "You don't need 10,000 hours to be good at something you enjoy. With focused, deliberate practice, ~20 hours takes you from knowing nothing to being genuinely decent. Perfect for a new dabble.",
  },
  hobby: {
    key: "hobby",
    title: "100 Hours to a Real Hobby",
    source: "Deliberate practice, extended",
    blurb:
      "Around 100 hours is where a curiosity becomes a real, durable hobby — enough repetition to build fluency and start enjoying the craft for its own sake.",
  },
  serious: {
    key: "serious",
    title: "1,000 Hours to Competence",
    source: "Skill-acquisition research",
    blurb:
      "A thousand focused hours is serious commitment — the range where people reach reliable, professional-grade competence in most skills that aren't world-class competition.",
  },
  tenK: {
    key: "tenK",
    title: "The 10,000 Hour Rule",
    source: "Anders Ericsson, popularized by Malcolm Gladwell",
    url: "https://en.wikipedia.org/wiki/Outliers_(book)",
    blurb:
      "Reaching the very top of a ranked, competitive field — elite music, chess, sport — takes roughly 10,000 hours of deliberate practice. Reserve this Path for the one or two things you truly want to master.",
  },
  deliberate: {
    key: "deliberate",
    title: "Deliberate Practice",
    source: "Anders Ericsson",
    url: "https://en.wikipedia.org/wiki/Practice_(learning_method)#Deliberate_practice",
    blurb:
      "Not all hours are equal. Deliberate practice means working at the edge of your ability with focus and feedback — an hour of it is worth far more than an hour of going through the motions. Mark your focused sessions to see how much of your time truly counts.",
  },
  dreyfus: {
    key: "dreyfus",
    title: "Dreyfus Model of Skill Acquisition",
    source: "Stuart & Hubert Dreyfus",
    url: "https://en.wikipedia.org/wiki/Dreyfus_model_of_skill_acquisition",
    blurb:
      "Skill grows through five stages — Novice, Advanced Beginner, Competent, Proficient, Expert — shifting from following rules to acting on intuition. Ayuta's major checkpoints map these stages onto your chosen Path.",
  },
  habit: {
    key: "habit",
    title: "How Habits Really Form",
    source: "Lally et al., 2009 (UCL)",
    url: "https://en.wikipedia.org/wiki/Habit#Formation",
    blurb:
      "The '21 days' figure is a myth. A UCL study found a new behaviour takes on average 66 days to become automatic, and closer to 90 for effortful ones. Ayuta's day-checkpoints mark 7, 21, 66 and 90 days of showing up.",
  },
  compounding: {
    key: "compounding",
    title: "1% Better Every Day",
    source: "James Clear, Atomic Habits",
    url: "https://jamesclear.com/continuous-improvement",
    blurb:
      "Small gains compound. Getting 1% better each day makes you ~37x better over a year. The point of Ayuta is to keep the tiny daily deposits visible so the compounding never feels invisible.",
  },
};

export function getFramework(key?: string): Framework | undefined {
  if (!key) return undefined;
  return FRAMEWORKS[key];
}
