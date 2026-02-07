import { describe, it, expect } from 'vitest'
import {
  formatEUR,
  formatEURWithCents,
  formatPct,
  formatNumber,
  formatEuroAxis,
} from '@/lib/utils/formatters'

describe('formatters', () => {
  describe('formatEUR', () => {
    it('should format euros without cents (Dutch locale)', () => {
      // nl-NL format includes € symbol and separators
      expect(formatEUR(1234.56)).toContain('€')
      expect(formatEUR(1234.56)).toContain('1')
      expect(formatEUR(1234.56)).toContain('235') // rounded

      expect(formatEUR(1000)).toContain('1')
      expect(formatEUR(1000)).toContain('000')

      expect(formatEUR(0)).toContain('0')
    })

    it('should handle negative values', () => {
      const result = formatEUR(-1234.56)
      expect(result).toContain('-')
      expect(result).toContain('1')
      expect(result).toContain('235')
    })

    it('should round to nearest euro', () => {
      expect(formatEUR(1234.49)).toContain('234')
      expect(formatEUR(1234.50)).toContain('235')
    })
  })

  describe('formatEURWithCents', () => {
    it('should format euros with cents (Dutch locale)', () => {
      // nl-NL format includes € symbol, separators, and comma for decimals
      expect(formatEURWithCents(1234.56)).toContain('€')
      expect(formatEURWithCents(1234.56)).toContain(',56')

      expect(formatEURWithCents(1000)).toContain(',00')
      expect(formatEURWithCents(0)).toContain('0,00')
    })

    it('should handle negative values with cents', () => {
      const result = formatEURWithCents(-1234.56)
      expect(result).toContain('-')
      expect(result).toContain(',56')
    })

    it('should show exactly 2 decimal places', () => {
      expect(formatEURWithCents(1234.5)).toContain(',50')
      expect(formatEURWithCents(1234.567)).toContain(',57')
    })
  })

  describe('formatPct', () => {
    it('should format percentages with 1 decimal', () => {
      expect(formatPct(25.5)).toBe('25.5%')
      expect(formatPct(100)).toBe('100.0%')
      expect(formatPct(0)).toBe('0.0%')
    })

    it('should handle negative percentages', () => {
      expect(formatPct(-5.5)).toBe('-5.5%')
    })

    it('should round to 1 decimal place', () => {
      expect(formatPct(25.55)).toBe('25.6%')
      expect(formatPct(25.54)).toBe('25.5%')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with thousand separators (Dutch locale)', () => {
      // nl-NL format: 1.234 (dot for thousands)
      expect(formatNumber(1234)).toBe('1.234')
      expect(formatNumber(1000000)).toBe('1.000.000')
      expect(formatNumber(0)).toBe('0')
    })

    it('should not show decimal places for whole numbers', () => {
      expect(formatNumber(1234.00)).toBe('1.234')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234)).toBe('-1.234')
    })
  })

  describe('formatEuroAxis', () => {
    it('should format axis values in thousands with k suffix', () => {
      expect(formatEuroAxis(1000)).toBe('€1.0k')
      expect(formatEuroAxis(5000)).toBe('€5.0k')
      expect(formatEuroAxis(15000)).toBe('€15.0k')
    })

    it('should handle values under 1000', () => {
      expect(formatEuroAxis(500)).toBe('€0.5k')
      expect(formatEuroAxis(0)).toBe('€0.0k')
    })

    it('should round to 1 decimal', () => {
      expect(formatEuroAxis(1499)).toBe('€1.5k')
      expect(formatEuroAxis(1500)).toBe('€1.5k')
    })
  })
})
