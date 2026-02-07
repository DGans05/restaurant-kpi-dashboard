import { describe, it, expect } from 'vitest'
import { getCurrentWeek, getCurrentMonth, getPeriodDateRange } from '@/lib/utils/period-dates'

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
})
