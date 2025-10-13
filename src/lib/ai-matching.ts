import { Tutor, User, SearchCriteria, MatchingScore } from '../types';

export class AIMatchingEngine {
  calculateMatchScore(
    student: User,
    tutor: Tutor,
    criteria: SearchCriteria
  ): MatchingScore {
    let totalScore = 0;
    const reasons: string[] = [];

    // 1. Subject Match (40% weight)
    const subjectScore = this.calculateSubjectMatch(tutor, criteria);
    totalScore += subjectScore * 0.4;
    if (subjectScore > 0.8) reasons.push('Perfect subject match');
    else if (subjectScore > 0.6) reasons.push('Good subject alignment');

    // 2. Availability Match (25% weight)
    const availabilityScore = this.calculateAvailabilityMatch(tutor, criteria);
    totalScore += availabilityScore * 0.25;
    if (availabilityScore > 0.8) reasons.push('Available at preferred times');
    else if (availabilityScore > 0.6) reasons.push('Good availability match');

    // 3. Rating & Reviews (20% weight)
    const ratingScore = this.calculateRatingScore(tutor, criteria);
    totalScore += ratingScore * 0.2;
    if (ratingScore > 0.8) reasons.push('Excellent ratings');
    else if (ratingScore > 0.6) reasons.push('Good reviews');

    // 4. Student Profile Match (15% weight)
    const profileScore = this.calculateProfileMatch(student, tutor);
    totalScore += profileScore * 0.15;
    if (profileScore > 0.8) reasons.push('Great fit for your learning style');
    else if (profileScore > 0.6) reasons.push('Good learning match');

    return {
      tutor,
      score: Math.min(totalScore, 1.0), // Cap at 1.0
      reasons
    };
  }

  private calculateSubjectMatch(tutor: Tutor, criteria: SearchCriteria): number {
    if (!criteria.subject) return 0.5; // Neutral if no subject filter

    const tutorSubjects = tutor.specialties || [];
    const searchSubject = criteria.subject.toLowerCase();

    // Exact match
    if (tutorSubjects.some(s => s.toLowerCase() === searchSubject)) {
      return 1.0;
    }

    // Partial match
    if (tutorSubjects.some(s => s.toLowerCase().includes(searchSubject))) {
      return 0.8;
    }

    // Related subjects (simplified)
    const relatedSubjects: Record<string, string[]> = {
      'mathematics': ['calculus', 'algebra', 'statistics'],
      'physics': ['mechanics', 'thermodynamics', 'quantum'],
      'chemistry': ['organic', 'inorganic', 'biochemistry']
    };

    const related = relatedSubjects[searchSubject] || [];
    if (tutorSubjects.some(s => related.some(r => s.toLowerCase().includes(r)))) {
      return 0.6;
    }

    return 0.2; // Low score for no match
  }

  private calculateAvailabilityMatch(tutor: Tutor, criteria: SearchCriteria): number {
    if (!criteria.availability) return 0.5;

    const now = new Date();
    const today = now.getDay();

    // Check if tutor is available now
    if (criteria.availability === 'available' && tutor.status === 'available') {
      return 1.0;
    }

    // Check availability for today
    if (criteria.availability === 'today') {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today];
      
      if (tutor.availability[todayName] && tutor.availability[todayName].length > 0) {
        return 0.9;
      }
    }

    // Check availability for this week
    if (criteria.availability === 'week') {
      const hasAvailability = Object.values(tutor.availability).some(slots => slots.length > 0);
      return hasAvailability ? 0.8 : 0.3;
    }

    return 0.5; // Default score
  }

  private calculateRatingScore(tutor: Tutor, criteria: SearchCriteria): number {
    const rating = tutor.rating || 0;
    
    if (!criteria.rating) return rating / 5.0; // Normalize to 0-1

    const requiredRating = parseFloat(criteria.rating.replace('+', ''));
    
    if (rating >= requiredRating) {
      return 1.0;
    } else if (rating >= requiredRating - 0.5) {
      return 0.7;
    } else {
      return 0.3;
    }
  }

  private calculateProfileMatch(student: User, tutor: Tutor): number {
    // Mock profile matching based on university and major
    let score = 0.5; // Base score

    // Same university bonus
    if (student.university === tutor.university) {
      score += 0.2;
    }

    // Related major bonus
    const relatedMajors: Record<string, string[]> = {
      'Computer Science': ['Mathematics', 'Physics'],
      'Mathematics': ['Physics', 'Computer Science'],
      'Physics': ['Mathematics', 'Chemistry']
    };

    const studentMajor = student.major || '';
    const tutorSpecialties = tutor.specialties || [];
    
    const related = relatedMajors[studentMajor] || [];
    if (related.some(major => tutorSpecialties.some(s => s.includes(major)))) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  rankTutors(tutors: Tutor[], student: User, criteria: SearchCriteria): MatchingScore[] {
    const scores = tutors.map(tutor => 
      this.calculateMatchScore(student, tutor, criteria)
    );

    return scores.sort((a, b) => b.score - a.score);
  }
}

export const aiMatchingEngine = new AIMatchingEngine();
