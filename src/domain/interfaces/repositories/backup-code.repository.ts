export interface BackupCodeRecord {
  id: string;
  userId: string;
  codeHash: string;
  used: boolean;
  createdAt: Date;
}

export interface IBackupCodeRepository {
  createMany(userId: string, codeHashes: string[]): Promise<void>;
  findUnusedByUser(userId: string): Promise<BackupCodeRecord[]>;
  markUsed(id: string): Promise<void>;
  deleteByUser(userId: string): Promise<void>;
}
