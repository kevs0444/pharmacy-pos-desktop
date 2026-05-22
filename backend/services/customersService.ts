import type { CustomerRecord } from '../types/domain'
import type { CustomerSaveInput, CustomerSearchQuery } from '../types/api'
import { CustomersRepository } from '../repositories/customersRepository'

export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  search(query: CustomerSearchQuery): CustomerRecord[] {
    if (!query.query || query.query.length < 2) return []
    return this.customersRepository.search(query)
  }

  save(input: CustomerSaveInput): CustomerRecord {
    return this.customersRepository.upsert(input)
  }
}
