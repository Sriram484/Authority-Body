// src/blockchain/approval-mapper.ts
import {
  BlockchainCertificateAsset,
  BlockchainApprovalUpdateOptions,
} from "./types";

export function buildApprovedCertificateAsset(
  existing: BlockchainCertificateAsset,
  opts: BlockchainApprovalUpdateOptions
): BlockchainCertificateAsset {
  const approvedAt = opts.approvedAt ?? new Date().toISOString();

  const existingApprover = existing.approver || {
    approverIds: [],
    approved: [],
    isApproved: false,
    approvedDate: null,
  };

  const newApproverIds = new Set(existingApprover.approverIds);
  if (opts.approverAbId) newApproverIds.add(opts.approverAbId);

  return {
    ...existing,
    status: "approved", // keep consistent with Firestore
    approver: {
      approverIds: Array.from(newApproverIds),
      approved: [...(existingApprover.approved ?? []), "approved"],
      isApproved: true,
      approvedDate: approvedAt,
    },
    meta: {
      ...(existing.meta ?? {}),
      approval: {
        ...(existing.meta?.approval ?? {}),
        approverAbId: opts.approverAbId ?? null,
        reviewerName: opts.reviewerName ?? null,
        remarks: opts.remarks ?? null,
        approvedAt,
      },
    },
  };
}
