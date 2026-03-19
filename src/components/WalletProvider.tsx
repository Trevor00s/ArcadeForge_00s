import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { type ReactNode } from 'react'

export default function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: 'testnet' as any }}
      onError={(err) => console.error('[Wallet]', err)}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
