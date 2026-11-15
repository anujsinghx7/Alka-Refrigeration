import { create } from 'zustand';

export const useAdminStore = create((set) => ({
  activeSection: 'dashboard', // 'dashboard' | 'complaints' | 'customers' | 'coupons' | 'reports'
  setActiveSection: (section) => set({ activeSection: section }),

  // Complaint filters
  workStatusFilter: 'Pending', // 'Pending' | 'Done' | 'All'
  setWorkStatusFilter: (filter) => set({ workStatusFilter: filter }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Modals in admin
  amountModalOpen: false,
  cancelModalOpen: false,
  selectedComplaint: null,

  openAmountModal: (complaint) =>
    set({ amountModalOpen: true, selectedComplaint: complaint }),
  closeAmountModal: () =>
    set({ amountModalOpen: false, selectedComplaint: null }),

  openCancelModal: (complaint) =>
    set({ cancelModalOpen: true, selectedComplaint: complaint }),
  closeCancelModal: () =>
    set({ cancelModalOpen: false, selectedComplaint: null }),
}));
