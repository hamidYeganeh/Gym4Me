import { Types } from 'mongoose';

type PopulatedUser = {
  _id: Types.ObjectId;
  phone?: string;
  name?: { first?: string | null; last?: string | null };
};

function toPublicUser(value: Types.ObjectId | PopulatedUser | undefined) {
  if (!value) return null;
  if (value instanceof Types.ObjectId) return value.toString();
  return {
    id: value._id.toString(),
    phone: value.phone ?? null,
    name: value.name ?? null,
  };
}

export function toPublicTicket(doc: {
  _id: Types.ObjectId;
  ticketNumber: string;
  requester: { userId: Types.ObjectId | PopulatedUser; role: string };
  category: string;
  priority: string;
  status: string;
  subject: string;
  relatedEntity?: { kind: string; id: Types.ObjectId };
  assignment?: { adminId: Types.ObjectId | PopulatedUser; assignedAt: Date };
  resolution?: {
    note?: string;
    resolvedBy: Types.ObjectId | PopulatedUser;
    resolvedAt: Date;
  };
  lastMessageAt?: Date;
  messageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: doc._id.toString(),
    ticketNumber: doc.ticketNumber,
    requester: {
      user: toPublicUser(doc.requester.userId),
      role: doc.requester.role,
    },
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    subject: doc.subject,
    relatedEntity: doc.relatedEntity
      ? { kind: doc.relatedEntity.kind, id: doc.relatedEntity.id.toString() }
      : null,
    assignment: doc.assignment
      ? {
          admin: toPublicUser(doc.assignment.adminId),
          assignedAt: doc.assignment.assignedAt,
        }
      : null,
    resolution: doc.resolution
      ? {
          note: doc.resolution.note ?? null,
          resolvedBy: toPublicUser(doc.resolution.resolvedBy),
          resolvedAt: doc.resolution.resolvedAt,
        }
      : null,
    lastMessageAt: doc.lastMessageAt ?? null,
    messageCount: doc.messageCount ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function toPublicMessage(doc: {
  _id: Types.ObjectId;
  ticketId: Types.ObjectId;
  author: { userId: Types.ObjectId | PopulatedUser; kind: string };
  body: string;
  attachments?: Types.ObjectId[];
  createdAt: Date;
}) {
  return {
    id: doc._id.toString(),
    ticketId: doc.ticketId.toString(),
    author: {
      user: toPublicUser(doc.author.userId),
      kind: doc.author.kind,
    },
    body: doc.body,
    attachments: (doc.attachments ?? []).map((id) => id.toString()),
    createdAt: doc.createdAt,
  };
}
