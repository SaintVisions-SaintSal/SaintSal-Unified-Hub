"use client";
import { User, LogOut } from "lucide-react";
interface Props { user: {email:string}|null; onAuth: ()=>void; onSignOut: ()=>void; }
export default function AccountPage({user, onAuth, onSignOut}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <h1 className="text-[19px] font-extrabold text-gold mb-1">Account</h1>
        <p className="text-[12.5px] text-[#555]">Saint Vision Technologies LLC</p>
      </div>
      {user ? (
        <div className="bg-[#111116] border border-gold/15 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-[15px] font-black text-black">{user.email[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-[#E8E6E1]">{user.email}</p>
              <p className="text-[11px] text-accent-green font-semibold">Pro Plan Active</p>
            </div>
          </div>
          <button onClick={onSignOut} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#333] text-[#777] text-[12px] hover:text-[#E8E6E1] transition-colors">
            <LogOut size={12}/>Sign Out
          </button>
        </div>
      ) : (
        <div className="bg-[#111116] border border-gold/15 rounded-xl p-6 text-center">
          <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
            <User size={18} className="text-gold"/>
          </div>
          <h2 className="text-[14px] font-bold text-[#E8E6E1] mb-1.5">Sign in to SaintSal™ Labs</h2>
          <p className="text-[12px] text-[#555] mb-4">Access your workspace, saved chats, and premium features.</p>
          <button onClick={onAuth} className="px-5 py-2.5 rounded-lg bg-gold text-black text-[13px] font-bold hover:bg-gold-light transition-colors">
            Sign In / Create Account
          </button>
        </div>
      )}
    </div>
  );
}
