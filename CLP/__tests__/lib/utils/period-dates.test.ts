import { describe, it, expect } from 'vitest'
import {
  getCurrentWeek,
  getCurrentMonth,
  getPeriodDateRange,
  getNextPeriod,
  getPrevPeriod,
  getPeriodLabel,
  canGoPrev,
  canGoNext,
  getPreviousPeriodKey,
  convertPeriodKey,
  parseISOWeekString,
  formatISOWeek,
} from '@/lib/utils/period-dates'

describe('period-dates', () => {
  describe('getCurrentWeek', () => {
    it('should return week string in YYYY-WNN format', () => {
      const week = getCurrentWeek()
      expect(week).toMatch(/^\d{4}-W\d{2}$/)
    })

    it('should return a valid week number (1-53)', () => {
      const week = getCurrentWeek()
      const weekNum = parseInt(week.split('-W')[1])
      expect(weekNum).toBeGreaterThanOrEqual(1)
      expect(weekNum).toBeLessThanOrEqual(53)
    })
  })

  describe('getCurrentMonth', () => {
    it('should return month string in YYYY-MM format', () => {
      const month = getCurrentMonth()
      expect(month).toMatch(/^\d{4}-\d{2}$/)
    })

    it('should return a valid month number (01-12)', () => {
      const month = getCurrentMonth()
      const monthNum = parseInt(month.split('-')[1])
      expect(monthNum).toBeGreaterThanOrEqual(1)
      expect(monthNum).toBeLessThanOrEqual(12)
    })
  })

  describe('getPeriodDateRange', () => {
    it('should return correct date range for week view', () => {
      const result = getPeriodDateRange('week', '2025-W01')

      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
      expect(result.end >= result.start).toBe(true)

      // Week should span approximately 7 days
      const daysDiff = (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeGreaterThanOrEqual(6)
      expect(daysDiff).toBeLessThanOrEqual(7)
    })

    it('should return correct date range for month view', () => {
      const result = getPeriodDateRange('month', '2025-02')

      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
      expect(result.end >= result.start).toBe(true)

      // Start should be first day of month
      expect(result.start.getDate()).toBe(1)

      // February 2025 should have 28 days
      const daysDiff = (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeGreaterThanOrEqual(27)
      expect(daysDiff).toBeLessThanOrEqual(31)
    })

    it('should handle different months correctly', () => {
      // January (31 days)
      const jan = getPeriodDateRange('month', '2025-01')
      const janDays = (jan.end.getTime() - jan.start.getTime()) / (1000 * 60 * 60 * 24)
      expect(janDays).toBeGreaterThanOrEqual(30)

      // April (30 days)
      const apr = getPeriodDateRange('month', '2025-04')
      const aprDays = (apr.end.getTime() - apr.start.getTime()) / (1000 * 60 * 60 * 24)
      expect(aprDays).toBeGreaterThanOrEqual(29)
      expect(aprDays).toBeLessThanOrEqual(30)
    })

    it('should handle week strings correctly', () => {
      const result = getPeriodDateRange('week', '2025-W10')

      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
      expect(result.start.getFullYear()).toBe(2025)
    })

    it('should use current period when period param is provided as current', () => {
      const currentWeek = getCurrentWeek()
      const weekResult = getPeriodDateRange('week', currentWeek)
      expect(weekResult.start).toBeInstanceOf(Date)
      expect(weekResult.end).toBeInstanceOf(Date)

      const currentMonth = getCurrentMonth()
      const monthResult = getPeriodDateRange('month', currentMonth)
      expect(monthResult.start).toBeInstanceOf(Date)
      expect(monthResult.end).toBeInstanceOf(Date)
    })
  })

  describe('parseISOWeekString', () => {
    it('should parse ISO week string to Monday of that week', () => {
      const date = parseISOWeekString('2026-W01')
      expect(date).toBeInstanceOf(Date)
      expect(date.getDay()).toBe(1) // Monday
    })

    it('should handle different week numbers', () => {
      const week10 = parseISOWeekString('2025-W10')
      const week52 = parseISOWeekString('2025-W52')
      expect(week10).toBeInstanceOf(Date)
      expect(week52).toBeInstanceOf(Date)
    })
  })

  describe('formatISOWeek', () => {
    it('should format date to ISO week string', () => {
      const date = new Date('2026-01-05') // Week 1 or 2 of 2026
      const weekStr = formatISOWeek(date)
      expect(weekStr).toMatch(/^2026-W\d{2}$/)
    })

    it('should pad week numbers with zero', () => {
      const date = new Date('2026-01-05')
      const weekStr = formatISOWeek(date)
      expect(weekStr.split('-W')[1]).toHaveLength(2)
    })
  })

  describe('getNextPeriod', () => {
    it('should return next week for week view', () => {
      const next = getNextPeriod('week', '2025-W10')
      expect(next).toBe('2025-W11')
    })

    it('should return next month for month view', () => {
      const next = getNextPeriod('month', '2025-02')
      expect(next).toBe('2025-03')
    })

    it('should handle year boundary for weeks', () => {
      const next = getNextPeriod('week', '2025-W52')
      expect(next).toMatch(/^2026-W/)
    })

    it('should handle year boundary for months', () => {
      const next = getNextPeriod('month', '2025-12')
      expect(next).toBe('2026-01')
    })
  })

  describe('getPrevPeriod', () => {
    it('should return previous week for week view', () => {
      const prev = getPrevPeriod('week', '2025-W10')
      expect(prev).toBe('2025-W09')
    })

    it('should return previous month for month view', () => {
      const prev = getPrevPeriod('month', '2025-02')
      expect(prev).toBe('2025-01')
    })

    it('should handle year boundary for weeks', () => {
      const prev = getPrevPeriod('week', '2026-W01')
      expect(prev).toMatch(/^2025-W/)
    })

    it('should handle year boundary for months', () => {
      const prev = getPrevPeriod('month', '2026-01')
      expect(prev).toBe('2025-12')
    })
  })

  describe('getPeriodLabel', () => {
    it('should return week label in format "Week N, YYYY"', () => {
      const label = getPeriodLabel('week', '2025-W10')
      expect(label).toMatch(/^Week \d+, \d{4}$/)
      expect(label).toContain('2025')
    })

    it('should return month label in Dutch with capitalized first letter', () => {
      const label = getPeriodLabel('month', '2025-02')
      // February in Dutch is "februari"
      expect(label).toMatch(/^[A-Z]/) // First letter capitalized
      expect(label).toContain('2025')
    })

    it('should handle different months correctly', () => {
      const jan = getPeriodLabel('month', '2025-01')
      const dec = getPeriodLabel('month', '2025-12')
      expect(jan).toBeTruthy()
      expect(dec).toBeTruthy()
      expect(jan).not.toBe(dec)
    })
  })

  describe('canGoPrev', () => {
    it('should allow going back to September 2025 for months', () => {
      expect(canGoPrev('month', '2025-10')).toBe(true)
      expect(canGoPrev('month', '2025-09')).toBe(false) // At earliest month
    })

    it('should not allow going before September 2025 for months', () => {
      expect(canGoPrev('month', '2025-09')).toBe(false)
    })

    it('should allow going back for weeks if date >= Sep 2025', () => {
      // Week in October 2025
      expect(canGoPrev('week', '2025-W40')).toBe(true)
    })

    it('should not allow going before earliest week', () => {
      // First week of September 2025
      expect(canGoPrev('week', '2025-W36')).toBe(false)
    })
  })

  describe('canGoNext', () => {
    it('should not allow going beyond current week', () => {
      const currentWeek = getCurrentWeek()
      expect(canGoNext('week', currentWeek)).toBe(false)
    })

    it('should allow going forward if before current week', () => {
      expect(canGoNext('week', '2025-W01')).toBe(true)
    })

    it('should not allow going beyond current month', () => {
      const currentMonth = getCurrentMonth()
      expect(canGoNext('month', currentMonth)).toBe(false)
    })

    it('should allow going forward if before current month', () => {
      expect(canGoNext('month', '2025-01')).toBe(true)
    })
  })

  describe('getPreviousPeriodKey', () => {
    it('should return previous period key for week', () => {
      const prev = getPreviousPeriodKey('week', '2025-W10')
      expect(prev).toBe('2025-W09')
    })

    it('should return previous period key for month', () => {
      const prev = getPreviousPeriodKey('month', '2025-05')
      expect(prev).toBe('2025-04')
    })
  })

  describe('convertPeriodKey', () => {
    it('should return same key when converting to same view', () => {
      expect(convertPeriodKey('week', 'week', '2025-W10')).toBe('2025-W10')
      expect(convertPeriodKey('month', 'month', '2025-05')).toBe('2025-05')
    })

    it('should convert week to month using the month of Monday', () => {
      const monthKey = convertPeriodKey('week', 'month', '2025-W10')
      expect(monthKey).toMatch(/^2025-\d{2}$/)
    })

    it('should convert month to week using ISO week of first day', () => {
      const weekKey = convertPeriodKey('month', 'week', '2025-05')
      expect(weekKey).toMatch(/^2025-W\d{2}$/)
    })

    it('should handle year boundary conversions', () => {
      const monthKey = convertPeriodKey('week', 'month', '2026-W01')
      expect(monthKey).toMatch(/^\d{4}-\d{2}$/)
    })
  })
})
