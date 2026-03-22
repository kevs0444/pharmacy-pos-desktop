import type { ReceiptSettingsRecord } from '../types/domain'
import { SettingsRepository } from '../repositories/settingsRepository'

export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  getReceiptSettings(): ReceiptSettingsRecord {
    return this.settingsRepository.getReceiptSettings()
  }
}
