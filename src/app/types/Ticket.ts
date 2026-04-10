export type Priority = 'low' | 'medium' | 'high';
export type Status = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: Priority;
  status: Status;

  userId: string | null;
  userEmail: string | null;
  userName: string;

  createdAt: { seconds: number } | null;

  assignedToId: string | null;
  assignedToName: string | null;
}