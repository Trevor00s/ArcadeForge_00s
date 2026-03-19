import { NavLink } from 'react-router-dom'
import { Gamepad2, Library, Wallet, LogOut, Loader2 } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'

export default function NavBar() {
  const { connected, connecting, shortAddress, connectPetra, disconnect } = useWallet()

  return (
    <nav className="h-screen w-14 flex flex-col items-center py-4 border-r border-border bg-background gap-1 shrink-0">
      <div className="mb-4 w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
        <Gamepad2 className="w-4 h-4 text-background" />
      </div>

      <NavLink to="/" title="Generate"
        className={({ isActive }) => `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
        <Gamepad2 className="w-4 h-4" />
      </NavLink>

      <NavLink to="/library" title="Library"
        className={({ isActive }) => `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
        <Library className="w-4 h-4" />
      </NavLink>

      <div className="flex-1" />

      {connecting ? (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : connected ? (
        <div className="flex flex-col items-center gap-1">
          <div title={shortAddress ?? ''} className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary cursor-default">
            <Wallet className="w-4 h-4" />
          </div>
          <button onClick={disconnect} title="Disconnect"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={connectPetra} title="Connect Petra"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
          <Wallet className="w-4 h-4" />
        </button>
      )}
    </nav>
  )
}
