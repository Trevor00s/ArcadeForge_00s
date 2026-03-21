import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { useCallback } from 'react'

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY
const EXPIRATION = () => (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000 // 30 days

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }))

async function getShelby() {
  const { ShelbyClient, ShelbyBlobClient, createDefaultErasureCodingProvider, generateCommitments, expectedTotalChunksets } =
    await import('@shelby-protocol/sdk/browser')
  const shelby = new ShelbyClient({ network: Network.TESTNET, apiKey: SHELBY_API_KEY })
  return { ShelbyBlobClient, createDefaultErasureCodingProvider, generateCommitments, expectedTotalChunksets, shelby }
}

export function useShelby() {
  const { account, signAndSubmitTransaction } = useWallet()

  const uploadJson = useCallback(async (blobName: string, data: unknown) => {
    if (!account) throw new Error('Wallet not connected')

    const { ShelbyBlobClient, createDefaultErasureCodingProvider, generateCommitments, expectedTotalChunksets, shelby } = await getShelby()

    const file = globalThis.Buffer.from(JSON.stringify(data))

    const provider = await createDefaultErasureCodingProvider()
    const commitments = await generateCommitments(provider, file)

    const payload = ShelbyBlobClient.createRegisterBlobPayload({
      account: account.address as any,
      blobName,
      blobMerkleRoot: commitments.blob_merkle_root,
      numChunksets: expectedTotalChunksets(commitments.raw_data_size),
      expirationMicros: EXPIRATION(),
      blobSize: commitments.raw_data_size,
      encoding: 0,
    })

    const tx = await signAndSubmitTransaction({ data: payload as any })
    await aptos.waitForTransaction({ transactionHash: tx.hash })

    await shelby.rpc.putBlob({
      account: account.address,
      blobName,
      blobData: new Uint8Array(file),
    })
  }, [account, signAndSubmitTransaction])

  const downloadJson = useCallback(async (address: string, blobName: string) => {
    try {
      const url = `https://api.testnet.shelby.xyz/shelby/v1/blobs/${address}/${blobName}`
      const res = await fetch(url)
      if (!res.ok) return null
      return res.json()
    } catch {
      return null
    }
  }, [])

  // index f localStorage — kol game tsave f blob unique ta3ha f Shelby
  const getIndex = useCallback((address: string): string[] => {
    try { return JSON.parse(localStorage.getItem(`af-index-${address}`) || '[]') } catch { return [] }
  }, [])

  const setIndex = useCallback((address: string, ids: string[]) => {
    localStorage.setItem(`af-index-${address}`, JSON.stringify(ids))
  }, [])

  const saveGame = useCallback(async (game: { id: string; title: string; html: string; createdAt: string }) => {
    if (!account) throw new Error('Wallet not connected')
    const blobName = `arcadeforge-game-${game.id}.json`
    await uploadJson(blobName, game)
    // zid l id f localStorage index
    const address = account.address.toString()
    const ids = getIndex(address)
    if (!ids.includes(game.id)) setIndex(address, [game.id, ...ids].slice(0, 50))
    return game
  }, [account, uploadJson, getIndex, setIndex])

  const getGames = useCallback(async () => {
    if (!account) return []
    const address = account.address.toString()
    const ids = getIndex(address)
    if (ids.length === 0) return []
    const results = await Promise.all(
      ids.map(id => downloadJson(address, `arcadeforge-game-${id}.json`))
    )
    return results.filter(Boolean)
  }, [account, downloadJson, getIndex])

  const deleteGame = useCallback(async (gameId: string) => {
    if (!account) throw new Error('Wallet not connected')
    const address = account.address.toString()
    const ids = getIndex(address)
    setIndex(address, ids.filter(id => id !== gameId))
  }, [account, getIndex, setIndex])

  const updateGamePrice = useCallback(async (gameId: string, priceApt: number) => {
    if (!account) throw new Error('Wallet not connected')
    const address = account.address.toString()
    const current = await downloadJson(address, `arcadeforge-game-${gameId}.json`)
    if (!current) throw new Error('Game not found in Shelby')
    await uploadJson(`arcadeforge-game-${gameId}.json`, { ...current, priceApt })
  }, [account, uploadJson, downloadJson])

  return { saveGame, getGames, deleteGame, updateGamePrice, connected: !!account }
}
