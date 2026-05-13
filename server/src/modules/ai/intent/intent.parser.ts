import { Injectable } from '@nestjs/common'
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns'

export interface Timeframe {
  start: Date
  end: Date
  label: string
}

export interface IntentResult {
  timeframe?: Timeframe
  categories?: string[]
  query: string
  originalQuery: string
}

/**
 * Category synonyms map for normalization
 * This provides a foundation mapping that can be expanded as new categories are added
 */
const CATEGORY_SYNONYMS: Record<string, string> = {
  // Food & Dining
  food: 'Food & Dining',
  dining: 'Food & Dining',
  restaurant: 'Food & Dining',
  restaurants: 'Food & Dining',
  groceries: 'Food & Dining',
  grocery: 'Food & Dining',

  // Transportation
  transport: 'Transportation',
  transportation: 'Transportation',
  gas: 'Transportation',
  fuel: 'Transportation',
  car: 'Transportation',
  vehicle: 'Transportation',
  uber: 'Transportation',
  lyft: 'Transportation',
  taxi: 'Transportation',

  // Shopping
  shopping: 'Shopping',
  clothes: 'Shopping',
  clothing: 'Shopping',
  amazon: 'Shopping',
  retail: 'Shopping',

  // Entertainment
  entertainment: 'Entertainment',
  movies: 'Entertainment',
  cinema: 'Entertainment',
  games: 'Entertainment',
  gaming: 'Entertainment',
  music: 'Entertainment',
  concert: 'Entertainment',

  // Bills & Utilities
  bills: 'Bills & Utilities',
  utilities: 'Bills & Utilities',
  electricity: 'Bills & Utilities',
  water: 'Bills & Utilities',
  internet: 'Bills & Utilities',
  phone: 'Bills & Utilities',
  rent: 'Bills & Utilities',
  mortgage: 'Bills & Utilities',

  // Healthcare
  health: 'Healthcare',
  medical: 'Healthcare',
  doctor: 'Healthcare',
  hospital: 'Healthcare',
  pharmacy: 'Healthcare',
  insurance: 'Healthcare',

  // Income
  income: 'Income',
  salary: 'Income',
  payroll: 'Income',
  deposit: 'Income',
  revenue: 'Income',
}

@Injectable()
export class IntentParser {
  /**
   * Parse user query to extract intent information
   */
  parseIntent(query: string): IntentResult {
    const normalizedQuery = query.toLowerCase().trim()
    const result: IntentResult = {
      query: normalizedQuery,
      originalQuery: query,
    }

    // Extract timeframe
    result.timeframe = this.extractTimeframe(normalizedQuery)

    // Extract categories
    result.categories = this.extractCategories(normalizedQuery)

    return result
  }

  /**
   * Extract timeframe from query using regex and date parsing
   */
  private extractTimeframe(query: string): Timeframe | undefined {
    const now = new Date()

    // Direct date patterns
    const datePatterns = [
      // "March 2024", "Mar 2024"
      /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/i,
      // "2024-03", "03/2024"
      /\b(\d{1,2})[\/\-](\d{4})\b/,
      // "March 15", "15th March"
      /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i,
    ]

    for (const pattern of datePatterns) {
      const match = query.match(pattern)
      if (match) {
        const parsedDate = parse(match[0], 'MMMM yyyy', now)
        if (isValid(parsedDate)) {
          return {
            start: startOfMonth(parsedDate),
            end: endOfMonth(parsedDate),
            label: match[0],
          }
        }
      }
    }

    // Relative time patterns
    const relativePatterns = [
      // "last week", "past week"
      /\b(last|past)\s+week\b/i,
      // "this week"
      /\bthis\s+week\b/i,
      // "last month", "past month"
      /\b(last|past)\s+month\b/i,
      // "this month"
      /\bthis\s+month\b/i,
      // "yesterday"
      /\byesterday\b/i,
      // "today"
      /\btoday\b/i,
      // "last 7 days", "past 7 days"
      /\b(last|past)\s+(\d+)\s+days?\b/i,
      // "last 30 days"
      /\b(last|past)\s+(\d+)\s+days?\b/i,
    ]

    // Last week
    if (/\b(last|past)\s+week\b/i.test(query)) {
      const lastWeek = subWeeks(now, 1)
      return {
        start: startOfWeek(lastWeek),
        end: endOfWeek(lastWeek),
        label: 'last week',
      }
    }

    // This week
    if (/\bthis\s+week\b/i.test(query)) {
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
        label: 'this week',
      }
    }

    // Last month
    if (/\b(last|past)\s+month\b/i.test(query)) {
      const lastMonth = subMonths(now, 1)
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
        label: 'last month',
      }
    }

    // This month
    if (/\bthis\s+month\b/i.test(query)) {
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: 'this month',
      }
    }

    // Yesterday
    if (/\byesterday\b/i.test(query)) {
      const yesterday = subDays(now, 1)
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
        label: 'yesterday',
      }
    }

    // Today
    if (/\btoday\b/i.test(query)) {
      return {
        start: startOfDay(now),
        end: endOfDay(now),
        label: 'today',
      }
    }

    // Last N days
    const daysMatch = query.match(/\b(last|past)\s+(\d+)\s+days?\b/i)
    if (daysMatch) {
      const days = parseInt(daysMatch[2])
      const startDate = subDays(now, days)
      return {
        start: startOfDay(startDate),
        end: endOfDay(now),
        label: `last ${days} days`,
      }
    }

    // Default to last 30 days if no specific timeframe found
    return undefined
  }

  /**
   * Extract categories from query using synonym mapping
   */
  private extractCategories(query: string): string[] {
    const words = query.toLowerCase().split(/\s+/)
    const categories = new Set<string>()

    for (const word of words) {
      // Remove punctuation
      const cleanWord = word.replace(/[^\w]/g, '')

      if (CATEGORY_SYNONYMS[cleanWord]) {
        categories.add(CATEGORY_SYNONYMS[cleanWord])
      }
    }

    return Array.from(categories)
  }

  /**
   * Get all available categories
   */
  getAvailableCategories(): string[] {
    return Array.from(new Set(Object.values(CATEGORY_SYNONYMS)))
  }

  /**
   * Get category synonyms for a given category
   */
  getCategorySynonyms(category: string): string[] {
    const synonyms: string[] = []

    for (const [synonym, mappedCategory] of Object.entries(CATEGORY_SYNONYMS)) {
      if (mappedCategory === category) {
        synonyms.push(synonym)
      }
    }

    return synonyms
  }

  /**
   * Add new category synonym
   */
  addCategorySynonym(synonym: string, category: string): void {
    CATEGORY_SYNONYMS[synonym.toLowerCase()] = category
  }

  /**
   * Remove category synonym
   */
  removeCategorySynonym(synonym: string): void {
    delete CATEGORY_SYNONYMS[synonym.toLowerCase()]
  }
}
