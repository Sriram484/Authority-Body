// src/blockchain/types.ts

export interface BlockchainApprover {
  approverIds: string[];
  approved: string[];
  isApproved: boolean;
  approvedDate: string | null;
}

export interface BlockchainCertificateData {
  certificateName: string;
  courseName: string;
  institutionName: string;
  NSQFLevel: string;
}

export interface BlockchainCertificateAsset {
  certificateId: string;
  learnerID: string;
  issuer: {
    issuerID: string;
    issueDate: string;
  };
  approver: BlockchainApprover;
  certificateData: BlockchainCertificateData;
  status: string; // "Pending" | "approved" | "rejected" | ...
  url?: string | null;
  meta?: Record<string, any>;
}

export interface BlockchainApprovalUpdateOptions {
  approverAbId?: string | null;
  reviewerName?: string | null;
  remarks?: string | null;
  approvedAt?: string | null;
}
