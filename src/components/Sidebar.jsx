import React from 'react';
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useRequestStore } from "../store/useRequestStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton.jsx";
import { Users, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, getUserByUsername, contacts } = useAuthStore();
  const { sendRequest } = useRequestStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = searchResult
    ? [searchResult]
    : showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  const handleSearchContacts = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResult(null);
      toast.error("Please enter a valid username");
      return;
    }

    const result = await getUserByUsername(searchQuery.trim());

    if (!result) {
      setSearchResult(null);
      return;
    }

    setSearchResult(result);
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    if (searchResult && user._id === searchResult._id) {
      if (!contacts.includes(user._id)) {
        await sendRequest(user._id);
      } else {
        toast.error("User is already in your contact list");
      }
      setSearchResult(null);
      setSearchQuery("");
    }
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Fixed Header Section */}
      <div className="border-b border-base-300 w-full p-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <form
          onSubmit={handleSearchContacts}
          className="mt-3 w-full"
          aria-label="add-contact-search-form"
        >
          <input
            type="text"
            name="contactSearch"
            placeholder="Search contacts to add to your contact list"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full max-w-xs"
          />
        </form>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({users.filter((user) => onlineUsers.includes(user._id)).length} online)</span>
        </div>

      </div>

      {/* Scrollable Main Section */}
      <div className="overflow-y-auto flex-1 min-h-0 w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleSelectUser(user)}
            className={`
              w-full p-3 flex items-center justify-between
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative mx-auto lg:mx-0 flex-shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </div>

            {searchResult && user._id === searchResult._id && !contacts.includes(user._id) && (
              <div className="hidden lg:flex items-center text-primary text-xs font-semibold gap-1 pr-2">
                <UserPlus size={14} />
                <span>Add</span>
              </div>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
