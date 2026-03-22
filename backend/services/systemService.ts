import type { DatabaseStatus } from '../types/domain'
import { SystemRepository } from '../repositories/systemRepository'

export class SystemService {
  constructor(private readonly systemRepository: SystemRepository) {}

  getStatus(): DatabaseStatus {
    return this.systemRepository.getStatus()
  }
}
