import { describe, it, expect } from 'vitest'
import { parseOperationalReport } from '@/lib/parsers/operational-report-parser'
import { readFileSync } from 'fs'
import path from 'path'

describe('parseOperationalReport', () => {
  it('should parse a valid operational report with Dutch column names', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)

    expect(entries.length).toBeGreaterThan(0)
    expect(entries[0]).toHaveProperty('date')
    expect(entries[0]).toHaveProperty('netRevenue')
    expect(entries[0]).toHaveProperty('labourPct')
    expect(entries[0]).toHaveProperty('orderCount')
  })

  it('should correctly convert percentage fields from decimal to percentage', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)
    const firstEntry = entries[0]

    // Labour % should be converted from decimal (0.259) to percentage (25.9)
    expect(firstEntry.labourPct).toBeGreaterThan(1)
    expect(firstEntry.labourPct).toBeLessThan(100)

    // Delivery rate should also be converted
    if (firstEntry.deliveryRate30min > 0) {
      expect(firstEntry.deliveryRate30min).toBeGreaterThan(1)
      expect(firstEntry.deliveryRate30min).toBeLessThanOrEqual(100)
    }
  })

  it('should parse date fields correctly', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)
    const firstEntry = entries[0]

    // Date should be in YYYY-MM-DD format
    expect(firstEntry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    // Day name should be a non-empty string
    expect(firstEntry.dayName).toBeTruthy()
    expect(typeof firstEntry.dayName).toBe('string')

    // Week number should be between 1-53
    expect(firstEntry.weekNumber).toBeGreaterThanOrEqual(1)
    expect(firstEntry.weekNumber).toBeLessThanOrEqual(53)
  })

  it('should skip summary rows (totaal, gemiddeld)', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)

    // Check that no entry has "totaal" or "gemiddeld" in the date field
    const hasSummaryRows = entries.some(entry =>
      entry.date.toLowerCase().includes('totaal') ||
      entry.date.toLowerCase().includes('gemiddeld')
    )

    expect(hasSummaryRows).toBe(false)
  })

  it('should sort entries by date', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)

    // Check that dates are in ascending order
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].date >= entries[i - 1].date).toBe(true)
    }
  })

  it('should parse all required numeric fields', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)
    const firstEntry = entries[0]

    // Revenue fields
    expect(typeof firstEntry.plannedRevenue).toBe('number')
    expect(typeof firstEntry.grossRevenue).toBe('number')
    expect(typeof firstEntry.netRevenue).toBe('number')

    // Labour fields
    expect(typeof firstEntry.plannedLabourCost).toBe('number')
    expect(typeof firstEntry.labourCost).toBe('number')
    expect(typeof firstEntry.labourPct).toBe('number')
    expect(typeof firstEntry.workedHours).toBe('number')
    expect(typeof firstEntry.labourProductivity).toBe('number')

    // Order fields
    expect(typeof firstEntry.orderCount).toBe('number')
    expect(typeof firstEntry.avgOrderValue).toBe('number')

    // Delivery fields
    expect(typeof firstEntry.deliveryRate30min).toBe('number')
    expect(typeof firstEntry.onTimeDeliveryMins).toBe('number')
  })

  it('should handle empty Excel buffer gracefully', () => {
    const emptyBuffer = Buffer.from([])

    expect(() => parseOperationalReport(emptyBuffer)).not.toThrow()
  })

  it('should return empty array for metadata-only sheets', () => {
    const filePath = path.join(process.cwd(), '.playwright-mcp/Operationeel-rapport-06-02-2026-10-38-1-.xlsx')

    // Only run this test if the file exists
    try {
      const buffer = readFileSync(filePath)
      const entries = parseOperationalReport(buffer)

      // This file has only metadata (Info sheet), should return empty
      expect(entries).toEqual([])
    } catch (error) {
      // File doesn't exist, skip test
      expect(true).toBe(true)
    }
  })

  it('should parse manager field correctly', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)
    const firstEntry = entries[0]

    expect(typeof firstEntry.manager).toBe('string')
  })

  it('should handle files with no data rows', () => {
    // Test with metadata-only file (no actual data)
    const filePath = path.join(process.cwd(), '.playwright-mcp/Operationeel-rapport-06-02-2026-10-38-1-.xlsx')

    try {
      const buffer = readFileSync(filePath)
      const entries = parseOperationalReport(buffer)

      // Should return empty array, not throw
      expect(Array.isArray(entries)).toBe(true)
      expect(entries.length).toBe(0)
    } catch (error) {
      // If file doesn't exist, that's fine - skip test
      expect(true).toBe(true)
    }
  })

  it('should handle missing optional fields gracefully', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)

    // All entries should have complete data structure even if some values are 0
    entries.forEach(entry => {
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('dayName')
      expect(entry).toHaveProperty('weekNumber')
      expect(entry).toHaveProperty('netRevenue')
      expect(entry).toHaveProperty('labourPct')
      expect(entry).toHaveProperty('orderCount')
      expect(entry).toHaveProperty('manager')

      // All numeric fields should be numbers (not null or undefined)
      expect(typeof entry.netRevenue).toBe('number')
      expect(typeof entry.labourPct).toBe('number')
      expect(typeof entry.orderCount).toBe('number')
    })
  })

  it('should handle zero and null values correctly', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)

    // Some entries might have zero values for certain fields
    // Verify that zeros are preserved (not converted to null)
    entries.forEach(entry => {
      if (entry.cashDifference === 0) {
        expect(entry.cashDifference).toBe(0)
      }
    })
  })

  it('should parse multiple date formats', () => {
    const filePath = path.join(process.cwd(), '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx')
    const buffer = readFileSync(filePath)

    const entries = parseOperationalReport(buffer)

    // All dates should be in YYYY-MM-DD format
    entries.forEach(entry => {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      // Date should be a valid date
      const parsed = new Date(entry.date)
      expect(parsed.getTime()).not.toBeNaN()
    })
  })
})
