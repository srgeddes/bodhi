import { OtpPurpose } from "@/domain/enums";

export interface OtpRecord {
  id: string;
  userId: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface IOtpRepository {
  create(userId: string, codeHash: string, purpose: OtpPurpose, expiresAt: Date): Promise<OtpRecord>;
  findLatestValid(userId: string, purpose: OtpPurpose): Promise<OtpRecord | null>;
  markUsed(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
  deleteByUserAndPurpose(userId: string, purpose: OtpPurpose): Promise<void>;
}
