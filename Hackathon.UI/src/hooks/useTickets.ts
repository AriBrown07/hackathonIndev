import { useState, useEffect } from 'react';
import type { User} from '@supabase/supabase-js';

export interface Ticket {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicName: string;
  clinicAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentId: string;
  createdAt: string;
  status: 'active' | 'used' | 'cancelled';
}

export const useTickets = (user: User | null) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Загрузка талонов из localStorage при инициализации
  useEffect(() => {
    if (user) {
      const savedTickets = localStorage.getItem(`tickets_${user.id}`);
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      }
    }
  }, [user]);

  // Сохранение талонов в localStorage
  const saveTickets = (newTickets: Ticket[]) => {
    if (user) {
      localStorage.setItem(`tickets_${user.id}`, JSON.stringify(newTickets));
      setTickets(newTickets);
    }
  };

  // Добавление нового талона
  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedTickets = [...tickets, newTicket];
    saveTickets(updatedTickets);
    return newTicket;
  };

  // Удаление талона
  const removeTicket = (ticketId: string) => {
    const updatedTickets = tickets.filter(ticket => ticket.id !== ticketId);
    saveTickets(updatedTickets);
  };

  // Обновление статуса талона
  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status } : ticket
    );
    saveTickets(updatedTickets);
  };

  return {
    tickets,
    addTicket,
    removeTicket,
    updateTicketStatus,
  };
};