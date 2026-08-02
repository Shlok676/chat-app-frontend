import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

const formatMessageData = (msg) => {
  if (!msg) return null;
  return {
    _id: msg._id,
    senderId: msg.s || msg.senderId,
    receiverId: msg.r || msg.receiverId,
    text: msg.t || msg.text,
    image: msg.i || msg.image,
    createdAt: msg.c || msg.createdAt
  };
};

const formatUserData = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    userName: user.u || user.userName,
    fullName: user.f || user.fullName,
    email: user.e || user.email,
    profilePic: user.r || user.profilePic
  };
};

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    hasMore: true,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          const formattedUsers = res.data.map(user => formatUserData(user));
          set({ users: formattedUsers });
        } catch (error) {
          toast.error(error.response?.data?.message || "Error loading users");
        } finally {
          set({ isUsersLoading: false });
        }
    },

        getMessages: async (userId, loadMore = false) => {
        const { isMessagesLoading, messages } = get();
        if (isMessagesLoading) return;

        if (!loadMore) {
          set({ messages: [], hasMore: true });
        }

        set({ isMessagesLoading: true });
        try {
          const oldestTimestamp = loadMore && messages.length > 0 ? messages[0].createdAt : null;
          
          const url = oldestTimestamp 
            ? `/messages/${userId}?before=${oldestTimestamp}` 
            : `/messages/${userId}`;

          const res = await axiosInstance.get(url);
          const formattedNewMessages = res.data.map(msg => formatMessageData(msg));
  
          if (formattedNewMessages.length < 50) {
            set({ hasMore: false });
          }

          set({ 
            messages: loadMore ? [...formattedNewMessages, ...messages] : formattedNewMessages 
          });
        } catch (error) {
          toast.error(error.response?.data?.message || "Error loading messages");
        } finally {
          set({ isMessagesLoading: false });
        }
    },


    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          const formattedNewMessage = formatMessageData(res.data);
          set({ messages: [...messages, formattedNewMessage] });
        } catch (error) {
          toast.error(error.response?.data?.message || "Error sending message");
        }
    },

    subscribeToMessages: () => {
      const { selectedUser } = get();
      if (!selectedUser) return;

      const socket = useAuthStore.getState().socket;
      if (!socket) return;

      socket.on("newMessage", (newMessagePayload) => {
        const isMessageSentFromSelectedUser = newMessagePayload.s === selectedUser._id;

        if (!isMessageSentFromSelectedUser) return;

        const formatted = formatMessageData(newMessagePayload);

        set({
          messages: [...get().messages, formatted],
        });
    });
  },

    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      if (socket) socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
    },
}));
