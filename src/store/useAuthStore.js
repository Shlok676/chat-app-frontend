import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000/api" : "https://chat-app-backend-z4hb.onrender.com/api";
const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:4000" : "https://chat-app-backend-z4hb.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  contacts: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({
        authUser: res.data,
        contacts: res.data.contacts?.map((contact) =>
          typeof contact === "object" ? contact._id : contact
        ) ?? []
      });

      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null, contacts: [] });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({
        authUser: res.data,
        contacts: res.data.contacts?.map((contact) =>
          typeof contact === "object" ? contact._id : contact
        ) ?? []
      });
      toast.success("Account created successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({
        authUser: res.data,
        contacts: res.data.contacts?.map((contact) =>
          typeof contact === "object" ? contact._id : contact
        ) ?? []
      });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set((state) => ({
        authUser: {
          ...state.authUser,
          ...res.data,
          contacts: state.authUser?.contacts ?? []
        }
      }));
    } catch (error) {
      console.log("Error in update profile", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  getUserByUsername: async (username) => {
    try {
      const res = await axiosInstance.get(`/auth/user/${username}`);
      return res.data;
    } catch (error) {
      console.log("Error in getUserByUsername:", error);
      toast.error(error.response?.data?.message || "Unable to find user");
    }
  },

  addContact: async (userId) => {
    try {
      const res = await axiosInstance.post("/auth/contacts", { userId });
      set((state) => ({
        contacts: state.contacts.includes(userId)
          ? state.contacts
          : [...state.contacts, userId]
      }));
      return res.data;
    } catch (error) {
      console.log("Error in addContact:", error);
      toast.error(error.response?.data?.message || "Unable to add contact");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;

    if (get().socket) {
      get().socket.disconnect();
    }

    const socket = io(SOCKET_URL, {
      query: {
        userId: authUser._id
      },
      transports: ['websocket'],
      upgrade: false           
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    })
  },

  disconnectSocket: () => {
    if (get().socket) {
      get().socket.disconnect();
      set({ socket: null });
    }
  }
}));
