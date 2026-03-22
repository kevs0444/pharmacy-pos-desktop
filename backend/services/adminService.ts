import type { AdminUserListQuery, PaginatedResult } from '../types/api'
import type { ManufacturerRecord, UserRecord } from '../types/domain'
import { ManufacturersRepository } from '../repositories/manufacturersRepository'
import { UsersRepository } from '../repositories/usersRepository'

export class AdminService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly manufacturersRepository: ManufacturersRepository,
  ) {}

  listUsers(query?: AdminUserListQuery): PaginatedResult<Omit<UserRecord, 'passwordHash'>> {
    return this.usersRepository.list(query)
  }

  listManufacturers(): ManufacturerRecord[] {
    return this.manufacturersRepository.list()
  }
}
