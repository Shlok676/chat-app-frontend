import React, { useEffect } from 'react'
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { useRequestStore } from "../store/useRequestStore.js";
import { LogOut, MessageSquare, Settings, User, UserCheck } from "lucide-react";

const NavBar = () => {
  const { logout, authUser } = useAuthStore();
  const { pendingRequests, getPendingRequests } = useRequestStore();

  useEffect(() => {
    if (authUser) {
      getPendingRequests();
    }
  }, [authUser, getPendingRequests]);

  const badgeCount = pendingRequests.length;

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg">
      <div className='container mx-auto px-4 h-16'>
        <div className='flex items-center justify-between h-full'>
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/friend-requests"} className={`btn btn-sm gap-2 relative`}>
                  <UserCheck className="size-5" />
                  <span className="hidden sm:inline">Friend Requests</span>
                  
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-error-content text-[10px] font-bold ring-2 ring-base-100 animate-pulse">
                      {badgeCount}
                    </span>
                  )}
                </Link>

                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavBar;
