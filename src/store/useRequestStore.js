import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import toast from "react-hot-toast";

export const useRequestStore = create((set, get) => ({
  pendingRequests: [],
  isRequestsLoading: false,

  getPendingRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/requests/pending");
      set({ pendingRequests: res.data, isRequestsLoading: false });
    } catch (error) {
      console.error("Error loading pending requests:", error);
      toast.error(error.response.data.message);
      set({ isRequestsLoading: false });
    }
  },

  sendRequest: async (receiverId) => {
    try {
      await axiosInstance.post("/requests/send", { receiverId });
      toast.success("Friend request sent!");
    } catch (error) {
      const errorMsg = error.response.data.message || "Failed to send request";
      toast.error(errorMsg);
    }
  },

  acceptRequest: async (requestId, senderId) => {
    try {
      await axiosInstance.put(`/requests/accept/${requestId}`);
      
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((req) => req._id !== requestId),
      }));
      
      useAuthStore.getState().addContact(senderId);
      
      toast.success("You are now friends!");
    } catch (error) {
      toast.error("Failed to accept request");
    }
  },

  declineRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/requests/decline/${requestId}`);
      
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((req) => req._id !== requestId),
      }));
      
      toast.success("Request removed");
    } catch (error) {
      toast.error("Failed to decline request");
    }
  },

  unfriend: async (targetUserId) => {
    try {
      await axiosInstance.delete(`/requests/unfriend/${targetUserId}`);
      
      useAuthStore.setState((state) => ({
        contacts: state.contacts.filter((id) => id !== targetUserId)
      }));
      
      toast.success("Removed from your contacts");
    } catch (error) {
      toast.error("Failed to unfriend user");
    }
  },

}));
