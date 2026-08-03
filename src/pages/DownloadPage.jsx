import React from 'react';

export default function DownloadPage() {
  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center p-4">
      
      <div className="card max-w-md w-full bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center text-center p-6">
          <h2 className="card-title text-2xl font-bold mb-4 text-base-content">Download Our App</h2>

          <div className="w-full space-y-6">
            <div className="p-4 border border-base-300 rounded-xl bg-base-200/50 hover:shadow-inner transition-all space-y-2">
              <div className="text-3xl">💻</div>
              <h3 className="font-bold text-lg text-base-content">Windows Desktop</h3>
              <p className="text-xs text-base-content/70">Compatible with Windows 10 / 11 (64-bit)</p>
              <div className="card-actions w-full pt-2">
                <a
                  href="https://github.com/Shlok676/chat-app-frontend/releases/latest/download/Chatty.Setup.1.1.0.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                >
                  Download for Windows
                </a>
              </div>
            </div>

            <div className="p-4 border border-base-300 rounded-xl bg-base-200/50 hover:shadow-inner transition-all space-y-2">
              <div className="text-3xl">🤖</div>
              <h3 className="font-bold text-lg text-base-content">Android Mobile</h3>
              <p className="text-xs text-base-content/70">Requires Android 8.0 or higher</p>
              <div className="card-actions w-full pt-2">
                <a
                  href="https://github.com/Shlok676/chat-app-frontend/releases/latest/download/chatty-v-1.1.0.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full"
                >
                  Download for Android
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
