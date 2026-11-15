import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  selectedService: 'AC Repair',
  setSelectedService: (service) => set({ selectedService: service }),

  // Modal states for customer dashboard
  activeModal: null, // 'payment' | 'edit' | 'cancel' | null
  activeComplaint: null,
  setActiveModal: (modal, complaint = null) =>
    set({ activeModal: modal, activeComplaint: complaint }),
  closeModal: () => set({ activeModal: null, activeComplaint: null }),

  // Draft form data for multi-step or prefilled bookings
  bookingDraft: {
    serviceType: '',
    instructions: '',
    preferredTime: 'Anytime',
  },
  setBookingDraft: (data) =>
    set((state) => ({ bookingDraft: { ...state.bookingDraft, ...data } })),
  resetBookingDraft: () =>
    set({
      bookingDraft: {
        serviceType: '',
        instructions: '',
        preferredTime: 'Anytime',
      },
    }),
}));
