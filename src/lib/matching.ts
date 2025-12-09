// Smart matching algorithm using ASR insights
import type { VoiceGig } from './supabase'

export interface MatchScore {
  gig: VoiceGig
  score: number
  reasons: string[]
}

/**
 * Match workers to jobs based on ASR-extracted insights
 */
export function matchWorkersToJobs(
  workers: VoiceGig[],
  job: VoiceGig
): MatchScore[] {
  return workers.map(worker => {
    let score = 0
    const reasons: string[] = []

    // 1. Skill matching (highest weight)
    if (job.skills && worker.skills && job.skills.length > 0) {
      const matchingSkills = job.skills.filter(skill => 
        worker.skills!.some(ws => 
          ws.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(ws.toLowerCase())
        )
      )
      if (matchingSkills.length > 0) {
        const skillScore = (matchingSkills.length / job.skills.length) * 40
        score += skillScore
        reasons.push(`${matchingSkills.length} matching skill${matchingSkills.length > 1 ? 's' : ''}: ${matchingSkills.slice(0, 3).join(', ')}`)
      }
    }

    // 2. Location matching
    if (job.location && worker.location) {
      const jobLoc = job.location.toLowerCase()
      const workerLoc = worker.location.toLowerCase()
      
      if (jobLoc === workerLoc) {
        score += 25
        reasons.push('Same location')
      } else if (jobLoc.includes(workerLoc) || workerLoc.includes(jobLoc)) {
        score += 15
        reasons.push('Nearby location')
      }
    }

    // 3. Experience level matching
    if (job.experience_level && worker.experience_level) {
      if (job.experience_level === worker.experience_level) {
        score += 15
        reasons.push(`Matching experience: ${worker.experience_level}`)
      } else if (
        (job.experience_level === 'expert' && worker.experience_level === 'expert') ||
        (job.experience_level === 'intermediate' && ['intermediate', 'expert'].includes(worker.experience_level))
      ) {
        score += 10
        reasons.push(`Suitable experience: ${worker.experience_level}`)
      }
    }

    // 4. Accent matching (cultural preference)
    if (job.accent_primary && worker.accent_primary) {
      if (job.accent_primary === worker.accent_primary) {
        score += 10
        reasons.push(`Same accent: ${worker.accent_primary}`)
      } else if (job.accent_primary.includes('caribbean') || worker.accent_primary.includes('caribbean')) {
        score += 5
        reasons.push('Caribbean accent match')
      }
    }

    // 5. Speech clarity (quality indicator)
    if (worker.speech_clarity) {
      if (worker.speech_clarity === 'excellent' || worker.speech_clarity === 'good') {
        score += 5
        reasons.push(`Clear communication: ${worker.speech_clarity}`)
      }
    }

    // 6. Urgency matching (workers available for urgent jobs)
    if (job.urgency === 'high' && worker.urgency !== 'low') {
      score += 5
      reasons.push('Available for urgent work')
    }

    // 7. Budget compatibility (if worker has budget expectations)
    if (job.budget_min && worker.budget_min) {
      if (worker.budget_min <= job.budget_max || !job.budget_max) {
        score += 5
        reasons.push('Budget compatible')
      }
    }

    return {
      gig: worker,
      score: Math.min(score, 100), // Cap at 100
      reasons
    }
  })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
}

/**
 * Match jobs to workers based on ASR-extracted insights
 */
export function matchJobsToWorkers(
  jobs: VoiceGig[],
  worker: VoiceGig
): MatchScore[] {
  return jobs
    .filter(job => job.gig_type === 'job_posting')
    .map(job => {
      let score = 0
      const reasons: string[] = []

      // 1. Skill matching
      if (job.skills && worker.skills && job.skills.length > 0) {
        const matchingSkills = job.skills.filter(skill => 
          worker.skills!.some(ws => 
            ws.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(ws.toLowerCase())
          )
        )
        if (matchingSkills.length > 0) {
          const skillScore = (matchingSkills.length / job.skills.length) * 40
          score += skillScore
          reasons.push(`${matchingSkills.length} matching skill${matchingSkills.length > 1 ? 's' : ''}`)
        }
      }

      // 2. Location matching
      if (job.location && worker.location && job.location === worker.location) {
        score += 25
        reasons.push('Same location')
      }

      // 3. Experience level matching
      if (job.experience_level && worker.experience_level && job.experience_level === worker.experience_level) {
        score += 15
        reasons.push(`Matching experience: ${worker.experience_level}`)
      }

      // 4. Accent matching
      if (job.accent_primary && worker.accent_primary && job.accent_primary === worker.accent_primary) {
        score += 10
        reasons.push(`Same accent`)
      }

      // 5. Speech clarity
      if (worker.speech_clarity === 'excellent' || worker.speech_clarity === 'good') {
        score += 5
      }

      // 6. Budget compatibility
      if (job.budget_min && worker.budget_min && worker.budget_min <= (job.budget_max || job.budget_min)) {
        score += 5
        reasons.push('Budget compatible')
      }

      return { gig: job, score: Math.min(score, 100), reasons }
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
}

/**
 * Find similar gigs based on ASR insights
 */
export function findSimilarGigs(
  targetGig: VoiceGig,
  allGigs: VoiceGig[],
  limit: number = 5
): MatchScore[] {
  const similar = allGigs
    .filter(gig => gig.id !== targetGig.id && gig.gig_type === targetGig.gig_type)
    .map(gig => {
      let score = 0
      const reasons: string[] = []

      // Skill similarity
      if (targetGig.skills && gig.skills) {
        const commonSkills = targetGig.skills.filter(skill =>
          gig.skills!.some(gs => 
            gs.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(gs.toLowerCase())
          )
        )
        if (commonSkills.length > 0) {
          score += (commonSkills.length / Math.max(targetGig.skills.length, gig.skills.length)) * 40
          reasons.push(`Similar skills: ${commonSkills.slice(0, 2).join(', ')}`)
        }
      }

      // Location similarity
      if (targetGig.location && gig.location && targetGig.location === gig.location) {
        score += 30
        reasons.push('Same location')
      }

      // Accent similarity
      if (targetGig.accent_primary && gig.accent_primary && targetGig.accent_primary === gig.accent_primary) {
        score += 15
        reasons.push('Same accent')
      }

      // Experience level similarity
      if (targetGig.experience_level && gig.experience_level && targetGig.experience_level === gig.experience_level) {
        score += 15
        reasons.push('Similar experience level')
      }

      return { gig, score, reasons }
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return similar
}

