import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore.js";

const formatRequestData = (req) => {
  if (!req) return null;
  return {
    _id: req._id,
    senderId: req.s ? {
      _id: req.s._id,
      userName: req.s.u || req.s.userName,
      profilePic: req.s.r || req.s.profilePic,
      fullName: req.s.f || req.s.fullName
    } : null,
    receiverId: req.r || req.receiverId,
    status: req.st || req.status,
    createdAt: req.c || req.createdAt
  };
};

export const useRequestStore = create((set, get) => ({
  pendingRequests: [],
  isRequestsLoading: false,

  getPendingRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/requests/pending");
      const formatted = res.data.map(req => formatRequestData(req));
      set({ pendingRequests: formatted, isRequestsLoading: false });
    } catch (error) {
      console.error("Error loading pending requests:", error);
      toast.error(error.response?.data?.message || "Error loading requests");
      set({ isRequestsLoading: false });
    }
  },

  sendRequest: async (receiverId) => {
    try {
      await axiosInstance.post("/requests/send", { receiverId });
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error(error.response.data.message);
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
      toast.error(error.response.data.message);
    }
  },

  declineRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/requests/decline/${requestId}`);
      
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((req) => req._id !== requestId),
      }));
      
      toast.success("Friend request declined");
    } catch (error) {
      toast.error(error.response.data.message);
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
      toast.error(error.response.data.message);
    }
  },

  listenToRequests: () => {
    const { socket } = useAuthStore.getState();
    const { getUsers, selectedUser } = useChatStore.getState();
    
    if (!socket) return;

    socket.off("newFriendRequest").on("newFriendRequest", (newRequest) => {
      const formatted = formatRequestData(newRequest);
      set((state) => ({
        pendingRequests: [formatted, ...state.pendingRequests]
      }));
    });

    socket.off("friendRequestAccepted").on("friendRequestAccepted", async (data) => {
      await getUsers(); 
    });

    socket.off("userUnfriended").on("userUnfriended", async (data) => {
      if (selectedUser && selectedUser._id === data.unfriendedByUserId) {
        useChatStore.setState({ selectedUser: null });
      }
      await getUsers();
    });
  },

  stopListeningToRequests: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newFriendRequest");
      socket.off("friendRequestAccepted");
      socket.off("userUnfriended");
    }
  }
}));
