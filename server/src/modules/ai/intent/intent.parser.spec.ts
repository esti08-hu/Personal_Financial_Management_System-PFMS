import { Test, TestingModule } from '@nestjs/testing'
import { IntentParser } from './intent.parser'

describe('IntentParser', () => {
  let service: IntentParser

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntentParser],
    }).compile()

    service = module.get<IntentParser>(IntentParser)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('parseIntent', () => {
    it('should parse query without timeframe or categories', () => {
      const result = service.parseIntent('Show me my expenses')

      expect(result).toEqual({
        query: 'show me my expenses',
        originalQuery: 'Show me my expenses',
        timeframe: undefined,
        categories: [],
      })
    })

    it('should extract timeframe for "last week"', () => {
      const result = service.parseIntent('Show expenses from last week')

      expect(result.timeframe).toBeDefined()
      expect(result.timeframe?.label).toBe('last week')
      expect(result.categories).toEqual([])
    })

    it('should extract timeframe for "this month"', () => {
      const result = service.parseIntent('What did I spend this month')

      expect(result.timeframe).toBeDefined()
      expect(result.timeframe?.label).toBe('this month')
      expect(result.categories).toEqual([])
    })

    it('should extract timeframe for "yesterday"', () => {
      const result = service.parseIntent('What did I spend yesterday')

      expect(result.timeframe).toBeDefined()
      expect(result.timeframe?.label).toBe('yesterday')
      expect(result.categories).toEqual([])
    })

    it('should extract timeframe for "last 7 days"', () => {
      const result = service.parseIntent('Show me expenses from last 7 days')

      expect(result.timeframe).toBeDefined()
      expect(result.timeframe?.label).toBe('last 7 days')
      expect(result.categories).toEqual([])
    })

    it('should extract categories from query', () => {
      const result = service.parseIntent('Show me food and transport expenses')

      expect(result.categories).toEqual(['Food & Dining', 'Transportation'])
    })

    it('should normalize category synonyms', () => {
      const result = service.parseIntent(
        'How much did I spend on restaurants and gas',
      )

      expect(result.categories).toEqual(['Food & Dining', 'Transportation'])
    })

    it('should handle multiple category synonyms', () => {
      const result = service.parseIntent('Show dining and vehicle costs')

      expect(result.categories).toEqual(['Food & Dining', 'Transportation'])
    })

    it('should extract both timeframe and categories', () => {
      const result = service.parseIntent('What did I spend on food last week')

      expect(result.timeframe).toBeDefined()
      expect(result.timeframe?.label).toBe('last week')
      expect(result.categories).toEqual(['Food & Dining'])
    })
  })

  describe('extractTimeframe', () => {
    it('should return undefined for queries without timeframe', () => {
      const result = service.parseIntent('Show all expenses')
      expect(result.timeframe).toBeUndefined()
    })

    it('should handle "today" timeframe', () => {
      const result = service.parseIntent('What did I spend today')
      expect(result.timeframe?.label).toBe('today')
    })

    it('should handle "last month" timeframe', () => {
      const result = service.parseIntent('Show last month expenses')
      expect(result.timeframe?.label).toBe('last month')
    })
  })

  describe('extractCategories', () => {
    it('should return empty array for queries without categories', () => {
      const result = service.parseIntent('Show all transactions')
      expect(result.categories).toEqual([])
    })

    it('should extract single category', () => {
      const result = service.parseIntent('Show me shopping expenses')
      expect(result.categories).toEqual(['Shopping'])
    })

    it('should extract multiple categories', () => {
      const result = service.parseIntent(
        'Compare food and entertainment spending',
      )
      expect(result.categories).toEqual(['Food & Dining', 'Entertainment'])
    })

    it('should deduplicate categories', () => {
      const result = service.parseIntent('Food and dining expenses')
      expect(result.categories).toEqual(['Food & Dining'])
    })
  })

  describe('category management', () => {
    it('should return available categories', () => {
      const categories = service.getAvailableCategories()
      expect(categories).toContain('Food & Dining')
      expect(categories).toContain('Transportation')
      expect(categories).toContain('Shopping')
    })

    it('should return category synonyms', () => {
      const synonyms = service.getCategorySynonyms('Food & Dining')
      expect(synonyms).toContain('food')
      expect(synonyms).toContain('dining')
      expect(synonyms).toContain('restaurant')
    })

    it('should add new category synonym', () => {
      service.addCategorySynonym('meal', 'Food & Dining')
      const synonyms = service.getCategorySynonyms('Food & Dining')
      expect(synonyms).toContain('meal')
    })

    it('should remove category synonym', () => {
      service.addCategorySynonym('snack', 'Food & Dining')
      let synonyms = service.getCategorySynonyms('Food & Dining')
      expect(synonyms).toContain('snack')

      service.removeCategorySynonym('snack')
      synonyms = service.getCategorySynonyms('Food & Dining')
      expect(synonyms).not.toContain('snack')
    })
  })

  describe('edge cases', () => {
    it('should handle empty query', () => {
      const result = service.parseIntent('')
      expect(result.query).toBe('')
      expect(result.timeframe).toBeUndefined()
      expect(result.categories).toEqual([])
    })

    it('should handle query with only punctuation', () => {
      const result = service.parseIntent('!!!???')
      expect(result.query).toBe('!!!???')
      expect(result.timeframe).toBeUndefined()
      expect(result.categories).toEqual([])
    })

    it('should handle mixed case queries', () => {
      const result = service.parseIntent('Show Me FOOD Expenses From LAST Week')
      expect(result.timeframe?.label).toBe('last week')
      expect(result.categories).toEqual(['Food & Dining'])
    })

    it('should handle queries with extra whitespace', () => {
      const result = service.parseIntent(
        '  Show   food   expenses   last   week  ',
      )
      expect(result.query).toBe('show   food   expenses   last   week')
      expect(result.timeframe?.label).toBe('last week')
      expect(result.categories).toEqual(['Food & Dining'])
    })
  })
})
