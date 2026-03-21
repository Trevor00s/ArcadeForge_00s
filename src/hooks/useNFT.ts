import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { useCallback } from 'react'

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }))

export const COLLECTION_NAME = 'ArcadeForge Games'
const COLLECTION_DESC = 'AI-generated games built on ArcadeForge'
const COLLECTION_URI = 'https://arcadeforge.app'

const APT_OCTAS = 100_000_000 // 1 APT = 100,000,000 octas

export function useNFT() {
  const { account, signAndSubmitTransaction } = useWallet()

  const ensureCollection = useCallback(async () => {
    if (!account) return
    // Check first — avoids Petra showing simulation error if collection exists
    try {
      await aptos.view({
        payload: {
          function: '0x3::token::get_collection_supply',
          typeArguments: [],
          functionArguments: [account.address.toString(), COLLECTION_NAME],
        } as any,
      })
      return // collection already exists
    } catch {
      // collection doesn't exist, create it
    }
    try {
      const tx = await signAndSubmitTransaction({
        data: {
          function: '0x3::token::create_collection_script',
          typeArguments: [],
          functionArguments: [
            COLLECTION_NAME,
            COLLECTION_DESC,
            COLLECTION_URI,
            1000,
            [false, false, false],
          ],
        } as any,
      })
      await aptos.waitForTransaction({ transactionHash: tx.hash })
    } catch {
      // ignore
    }
  }, [account, signAndSubmitTransaction])

  const mintGameNFT = useCallback(async (game: { id: string; title: string }, priceApt: number = 0) => {
    if (!account) throw new Error('Wallet not connected')
    const address = account.address.toString()

    await ensureCollection()

    const metadataUri = `https://api.testnet.shelby.xyz/shelby/v1/blobs/${address}/arcadeforge-game-${game.id}.json`

    // Store price as a token property so marketplace can read it
    const priceOctas = Math.round(priceApt * APT_OCTAS)
    // Encode price in description so marketplace can read it without extra fields
    const description = priceOctas > 0
      ? `price:${priceOctas}|AI-generated game: ${game.title}`
      : `AI-generated game: ${game.title}`

    const tx = await signAndSubmitTransaction({
      data: {
        function: '0x3::token::create_token_script',
        typeArguments: [],
        functionArguments: [
          COLLECTION_NAME,
          game.title,
          description,
          1,
          1,
          metadataUri,
          address,
          100,
          0,
          [false, false, false, false, false],
          [],
          [],
          [],
        ],
      } as any,
    })

    const result = await aptos.waitForTransaction({ transactionHash: tx.hash })
    return result.hash
  }, [account, signAndSubmitTransaction, ensureCollection])

  // Pay APT to the game owner to unlock play
  const payToPlay = useCallback(async (ownerAddress: string, priceOctas: number) => {
    if (!account) throw new Error('Wallet not connected')
    const tx = await signAndSubmitTransaction({
      data: {
        function: '0x1::aptos_account::transfer',
        typeArguments: [],
        functionArguments: [ownerAddress, priceOctas],
      } as any,
    })
    const result = await aptos.waitForTransaction({ transactionHash: tx.hash })
    return result.hash
  }, [account, signAndSubmitTransaction])

  return { mintGameNFT, payToPlay, connected: !!account }
}

// Fetch all NFTs from ArcadeForge Games collections via Aptos Indexer
export async function fetchMarketplaceNFTs() {
  const query = `
    query {
      current_token_datas(
        where: {
          collection_name: { _eq: "ArcadeForge Games" }
        }
        limit: 50
        order_by: { last_transaction_timestamp: desc }
      ) {
        token_data_id_hash
        name
        metadata_uri
        description
        creator_address
      }
    }
  `
  try {
    const res = await fetch('https://api.testnet.aptoslabs.com/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await res.json()
    return data?.current_token_datas ?? []
  } catch {
    return []
  }
}
