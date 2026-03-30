import { SEATS } from '@/game/config/layout';
import type { AgentRole } from '@/lib/state/types';

interface Seat {
  id: string;
  x: number;
  y: number;
  reserved: string | null;
}

export class SeatManager {
  private seats: Seat[];
  private assignments = new Map<string, string>();

  constructor() {
    this.seats = SEATS.map((s) => ({ ...s, reserved: s.reserved }));
  }

  assign(agentId: string, role: AgentRole): Seat | null {
    const existing = this.assignments.get(agentId);
    if (existing) return this.seats.find((s) => s.id === existing) || null;

    if (role === 'primary') {
      const reserved = this.seats.find((s) => s.reserved === 'primary');
      if (reserved) {
        this.assignments.set(agentId, reserved.id);
        return reserved;
      }
    }

    const occupied = new Set(this.assignments.values());
    const available = this.seats.filter(
      (s) => !occupied.has(s.id) && (s.reserved === null || s.reserved === role)
    );

    if (available.length === 0) return null;

    const seat = available[0];
    this.assignments.set(agentId, seat.id);
    return seat;
  }

  release(agentId: string): void {
    this.assignments.delete(agentId);
  }

  releaseAll(): void {
    this.assignments.clear();
  }

  getSeatFor(agentId: string): Seat | undefined {
    const seatId = this.assignments.get(agentId);
    return seatId ? this.seats.find((s) => s.id === seatId) : undefined;
  }
}
