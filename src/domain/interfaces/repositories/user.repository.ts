import { User } from "@/domain/entities";
import { IBaseRepository } from "./base.repository";

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
}
