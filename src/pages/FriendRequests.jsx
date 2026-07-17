import React, { useEffect } from "react";
import { useRequestStore } from "../store/useRequestStore";
import { UserCheck, UserX, BellOff, Loader2 } from "lucide-react";

const FriendRequests = () => {
  const { pendingRequests, isRequestsLoading, getPendingRequests, acceptRequest, declineRequest } = useRequestStore();

  useEffect(() => {
    getPendingRequests();
  }, []);

  if (isRequestsLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-base-200">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-base-200 text-base-content flex flex-col p-6 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
        {pendingRequests.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-60">
            <BellOff size={48} className="mb-4" />
            <h3 className="text-xl font-semibold">All caught up!</h3>
            <p className="text-sm mt-1">No pending friend requests at the moment.</p>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <h2 className="text-xl font-bold mb-6 border-b border-base-300 pb-3">Friend Requests</h2>
            {pendingRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 bg-base-100 border border-base-300 rounded-xl">
                <div className="flex items-center gap-3">
                  <img 
                    src={request.senderId?.profilePic || "/avatar.png"} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full object-cover border border-base-300" 
                  />
                  <div>
                    <h4 className="font-medium">
                      {request.senderId?.fullName || request.senderId?.username}
                    </h4>
                    <p className="text-xs opacity-60">Wants to connect with you</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acceptRequest(request._id, request.senderId?._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-success text-success-content text-sm font-medium rounded-lg transition-colors hover:opacity-90"
                  >
                    <UserCheck size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => declineRequest(request._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-neutral text-neutral-content text-sm font-medium rounded-lg transition-colors hover:opacity-90"
                  >
                    <UserX size={16} />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
