import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { useCallback } from 'react'

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }))

export const COLLECTION_NAME = 'ArcadeForge Games'
const COLLECTION_DESC = 'AI-generated games built on ArcadeForge'
const COLLECTION_URI = 'https://arcadeforge.app'

export function useNFT() {
  const { account, signAndSubmitTransaction } = useWallet()

  const ensureCollection = useCallback(async (address: string) => {
    try {
      await aptos.getCollectionData({ creatorAddress: address, collectionName: COLLECTION_NAME })
    } catch {
      // collection doesn't exist — create it
      const tx = await signAndSubmitTransaction({
        data: {
          function: '0x4::aptos_token::create_collection',
          typeArguments: [],
          functionArguments: [
            COLLECTION_DESC,
            1000,
            COLLECTION_NAME,
            COLLECTION_URI,
            true, true, true, true, true, true, true, true, false,
            0, 100,
          ],
        } as any,
      })
      await aptos.waitForTransaction({ transactionHash: tx.hash })
    }
  }, [signAndSubmitTransaction])

  const mintGameNFT = useCallback(async (game: { id: string; title: string }) => {
    if (!account) throw new Error('Wallet not connected')
    const address = account.address.toString()

    await ensureCollection(address)

    const metadataUri = `https://api.testnet.shelby.xyz/shelby/v1/blobs/${address}/arcadeforge-game-${game.id}.json`

    const tx = await signAndSubmitTransaction({
      data: {
        function: '0x4::aptos_token::mint',
        typeArguments: [],
        functionArguments: [
          COLLECTION_NAME,
          `AI-generated game: ${game.title}`,
          game.title,
          metadataUri,
          [], [], [],
        ],
      } as any,
    })

    const result = await aptos.waitForTransaction({ transactionHash: tx.hash })
    return result.hash
  }, [account, signAndSubmitTransaction, ensureCollection])

  return { mintGameNFT, connected: !!account }
}

// Fetch all NFTs from all ArcadeForge Games collections via Aptos Indexer
export async function fetchMarketplaceNFTs() {
  const query = `
    query {
      current_token_datas_v2(
        where: {
          current_collection: { collection_name: { _eq: "ArcadeForge Games" } }
        }
        limit: 50
        order_by: { last_transaction_timestamp: desc }
      ) {
        token_data_id
        token_name
        token_uri
        description
        current_token_ownerships_aggregate {
          nodes { owner_address }
        }
      }
    }
  `
  const res = await fetch('https://api.testnet.aptoslabs.com/v1/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const { data } = await res.json()
  return data?.current_token_datas_v2 ?? []
}
