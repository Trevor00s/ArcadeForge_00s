import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { useCallback } from 'react'

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }))

export const COLLECTION_NAME = 'ArcadeForge Games'
const COLLECTION_DESC = 'AI-generated games built on ArcadeForge'
const COLLECTION_URI = 'https://arcadeforge.app'

export function useNFT() {
  const { account, signAndSubmitTransaction } = useWallet()

  const ensureCollection = useCallback(async () => {
    if (!account) return
    try {
      // Try to create collection — fails silently if already exists
      const tx = await signAndSubmitTransaction({
        data: {
          function: '0x3::token::create_collection_script',
          typeArguments: [],
          functionArguments: [
            COLLECTION_NAME,
            COLLECTION_DESC,
            COLLECTION_URI,
            1000,                    // max supply
            [false, false, false],   // mutate_setting
          ],
        } as any,
      })
      await aptos.waitForTransaction({ transactionHash: tx.hash })
    } catch {
      // Collection already exists — continue
    }
  }, [account, signAndSubmitTransaction])

  const mintGameNFT = useCallback(async (game: { id: string; title: string }) => {
    if (!account) throw new Error('Wallet not connected')
    const address = account.address.toString()

    await ensureCollection()

    const metadataUri = `https://api.testnet.shelby.xyz/shelby/v1/blobs/${address}/arcadeforge-game-${game.id}.json`

    const tx = await signAndSubmitTransaction({
      data: {
        function: '0x3::token::create_token_script',
        typeArguments: [],
        functionArguments: [
          COLLECTION_NAME,
          game.title,
          `AI-generated game: ${game.title}`,
          1,          // balance
          1,          // maximum (1 = unique NFT)
          metadataUri,
          address,    // royalty payee
          100,        // royalty_points_denominator
          0,          // royalty_points_numerator (0% royalty)
          [false, false, false, false, false], // mutate_setting
          [],         // property_keys
          [],         // property_values
          [],         // property_types
        ],
      } as any,
    })

    const result = await aptos.waitForTransaction({ transactionHash: tx.hash })
    return result.hash
  }, [account, signAndSubmitTransaction, ensureCollection])

  return { mintGameNFT, connected: !!account }
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
        current_token_ownerships(limit: 1) {
          owner_address
        }
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
