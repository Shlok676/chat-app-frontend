import React from 'react'

import { useChatStore } from "../store/useChatStore.js";
import { useEffect, useRef } from "react";
import { formatMessageTime } from "../lib/utils.js";

import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";

import { useAuthStore } from "../store/useAuthStore.js";
import MessageSkeleton from './skeletons/MessageSkeleton.jsx';

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    hasMore 
  } = useChatStore();

  const { authUser } = useAuthStore();

  const scrollContainerRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id, false); 

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 200;

    if (isNearBottom && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = async () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMore && !isMessagesLoading) {
      const previousScrollHeight = container.scrollHeight;

      await getMessages(selectedUser._id, true); 

      container.scrollTop = container.scrollHeight - previousScrollHeight;
    }
  };
  
  if (isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isMessagesLoading && hasMore && (
          <div className="text-center py-2 text-sm text-primary font-medium animate-pulse">
            🔄 Loading older history records...
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <div className="text-center py-2 text-xs text-base-content/40 italic">
            🏁 Beginning of conversation history reached
          </div>
        )}

       {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-200px rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  )
}

export default ChatContainer;
