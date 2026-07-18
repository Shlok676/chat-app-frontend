import React from 'react';
import { X, UserMinus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { useRequestStore } from "../store/useRequestStore.js";
import Swal from 'sweetalert2';

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, getUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { unfriend } = useRequestStore();

  const handleUnfriend = () => {
    Swal.fire({
      title: 'Remove Contact?',
      text: `Are you sure you want to remove ${selectedUser.fullName} from your contact list? This will close your active conversation window.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unfriend',
      cancelButtonText: 'Cancel',
      
      background: 'var(--fallback-b1, hsl(var(--b1)))',
      color: 'var(--fallback-bc, hsl(var(--bc)))',
      confirmButtonColor: 'var(--fallback-er, hsl(var(--er)))',
      cancelButtonColor: 'transparent',
      
      customClass: {
        popup: 'rounded-2xl border border-base-300 p-6 max-w-sm font-sans',
        title: 'text-lg font-bold text-base-content',
        htmlContainer: 'text-sm text-base-content/70',
        confirmButton: 'btn btn-sm btn-error text-error-content font-medium px-4 border-none shadow-none',
        cancelButton: 'btn btn-sm btn-ghost text-base-content/70 border-none shadow-none',
        actions: 'flex gap-2 justify-end mt-4'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        await unfriend(selectedUser._id);
        await getUsers();
        setSelectedUser(null);
      }
    });
  };

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleUnfriend}
            className="btn btn-sm btn-ghost text-error gap-1.5"
            title="Remove Contact"
          >
            <UserMinus className="size-4" />
            <span className="hidden sm:inline">Unfriend</span>
          </button>

          <button onClick={() => setSelectedUser(null)} className="btn btn-sm btn-ghost btn-circle">
            <X />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
