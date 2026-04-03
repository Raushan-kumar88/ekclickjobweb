import type { Job } from "@/types";

/**
 * Scoring criteria (higher = better match):
 *  +3 per matching skill (capped at 4 skills = max 12 points)
 *  +4 for city match
 *  +2 for state match (when city doesn't match)
 *  +3 for matching job type preference
 *  +2 for matching experience level (within 1 step)
 */
export function scoreJob(
  job: Job,
  userSkills: string[],
  userCity: string,
  userState: string,
  preferredJobTypes: string[],
  experienceLevel: string | null
): number {
  let score = 0;

  if (userSkills.length > 0 && job.skills?.length > 0) {
    const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());
    const matchCount = userSkillsLower.filter((s) =>
      jobSkillsLower.some((js) => js.includes(s) || s.includes(js))
    ).length;
    score += Math.min(matchCount, 4) * 3;
  }

  const jobCity = job.location?.city?.toLowerCase() ?? "";
  const jobState = job.location?.state?.toLowerCase() ?? "";
  if (userCity && jobCity && jobCity === userCity.toLowerCase()) {
    score += 4;
  } else if (userState && jobState && jobState === userState.toLowerCase()) {
    score += 2;
  }

  if (
    preferredJobTypes.length > 0 &&
    job.jobType &&
    preferredJobTypes.map((t) => t.toLowerCase()).includes(job.jobType.toLowerCase())
  ) {
    score += 3;
  }

  if (experienceLevel && job.experienceLevel) {
    const expMap: Record<string, number> = {
      fresher: 0,
      "1-3 years": 1,
      "3-5 years": 2,
      "5-10 years": 3,
      "10+ years": 4,
    };
    const userExp = expMap[experienceLevel] ?? -1;
    const jobExp = expMap[job.experienceLevel] ?? -1;
    if (userExp !== -1 && jobExp !== -1 && Math.abs(userExp - jobExp) <= 1) {
      score += 2;
    }
  }

  return score;
}

export function deriveExperienceLevel(
  experience: Array<{ startDate: string; endDate: string | null }>
): string | null {
  if (experience.length === 0) return null;
  const total = experience.reduce((acc, e) => {
    const start = new Date(e.startDate).getFullYear();
    const end = e.endDate ? new Date(e.endDate).getFullYear() : new Date().getFullYear();
    return acc + Math.max(0, end - start);
  }, 0);
  if (total === 0) return "fresher";
  if (total <= 3) return "1-3 years";
  if (total <= 5) return "3-5 years";
  if (total <= 10) return "5-10 years";
  return "10+ years";
}
