import { TellerEnrollment } from "@/domain/entities";
import { IBaseRepository } from "./base.repository";

export interface ITellerEnrollmentRepository extends IBaseRepository<TellerEnrollment> {
  findByEnrollmentId(enrollmentId: string): Promise<TellerEnrollment | null>;
  findByUserId(userId: string): Promise<TellerEnrollment[]>;
  findActiveByUserId(userId: string): Promise<TellerEnrollment[]>;
  findAllActive(): Promise<TellerEnrollment[]>;
  updateLastSyncedDate(id: string, date: Date): Promise<void>;
}
