import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'

export function useWallet() {
  const {
    connect,
    disconnect,
    account,
    connected,
    wallet,
    wallets,
  } = useAptosWallet()

  const address = account?.address?.toString() ?? null

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null

  async function connectPetra() {
    const petra = wallets?.find(w => w.name === 'Petra')
    if (!petra) {
      window.open('https://petra.app', '_blank')
      return
    }
    await connect(petra.name)
  }

  return {
    address,
    shortAddress,
    connected,
    connecting: false,
    walletName: wallet?.name,
    connectPetra,
    disconnect,
  }
}
