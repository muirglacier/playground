import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { AddPoolLiquiditySource, CreatePoolPairMetadata } from '@muirglacier/jellyfish-api-core/dist/category/poolpair'
import { BalanceTransferPayload } from '@muirglacier/jellyfish-api-core/dist/category/account'

interface PoolPairSetup {
  symbol: `${string}-${string}`
  create: CreatePoolPairMetadata
  add?: AddPoolLiquiditySource
  utxoToAccount?: BalanceTransferPayload
}

@Injectable()
export class SetupDex extends PlaygroundSetup<PoolPairSetup> {
  list (): PoolPairSetup[] {
    // MAX_SYMBOL_LENGTH = 8
    return [
      {
        symbol: 'BTC-DFI',
        create: {
          tokenA: 'BTC',
          tokenB: 'DFI',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '1000@BTC']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'ETH-DFI',
        create: {
          tokenA: 'ETH',
          tokenB: 'DFI',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '100000@ETH']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'USDT-DFI',
        create: {
          tokenA: 'USDT',
          tokenB: 'DFI',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '10000000@USDT']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'LTC-DFI',
        create: {
          tokenA: 'LTC',
          tokenB: 'DFI',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['100@DFI', '10000@LTC']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '100@0'
        }
      },
      {
        symbol: 'USDC-DFI',
        create: {
          tokenA: 'USDC',
          tokenB: 'DFI',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['2000@DFI', '20000000@USDC']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '2000@0'
        }
      },
      {
        symbol: 'DUSD-DFI',
        create: {
          tokenA: 'DUSD',
          tokenB: 'DFI',
          commission: 0.02,
          status: true,
          ownerAddress: PlaygroundSetup.address
        }
      },
      {
        symbol: 'TU10-DUSD',
        create: {
          tokenA: 'TU10',
          tokenB: 'DUSD',
          commission: 0.02,
          status: true,
          ownerAddress: PlaygroundSetup.address
        }
      },
      {
        symbol: 'TD10-DUSD',
        create: {
          tokenA: 'TD10',
          tokenB: 'DUSD',
          commission: 0.02,
          status: true,
          ownerAddress: PlaygroundSetup.address
        }
      },
      {
        symbol: 'TS25-DUSD',
        create: {
          tokenA: 'TS25',
          tokenB: 'DUSD',
          commission: 0.02,
          status: true,
          ownerAddress: PlaygroundSetup.address
        }
      },
      {
        symbol: 'TR50-DUSD',
        create: {
          tokenA: 'TR50',
          tokenB: 'DUSD',
          commission: 0.02,
          status: true,
          ownerAddress: PlaygroundSetup.address
        }
      }
    ]
  }

  async create (each: PoolPairSetup): Promise<void> {
    if (each.utxoToAccount !== undefined) {
      const amount = Object.values(each.utxoToAccount)[0].replace('@0', '')
      await this.waitForBalance(Number(amount) + 1)
      await this.client.account.utxosToAccount(each.utxoToAccount)
      await this.generate(1)
    }

    await this.client.poolpair.createPoolPair(each.create)
    await this.generate(1)

    if (each.add !== undefined) {
      await this.client.poolpair.addPoolLiquidity(each.add, PlaygroundSetup.address)
      await this.generate(1)
    }
  }

  async has (each: PoolPairSetup): Promise<boolean> {
    try {
      await this.client.poolpair.getPoolPair(each.symbol)
      return true
    } catch (e) {
      return false
    }
  }

  async after (list: PoolPairSetup[]): Promise<void> {
    const poolPairs = await this.client.poolpair.listPoolPairs()
    const poolPairIds = Object.keys(poolPairs)
    const splits = 1 / poolPairIds.length

    const lpSplits: any = {}
    for (const k in poolPairs) {
      lpSplits[parseInt(k)] = splits
    }

    await this.client.masternode.setGov({ LP_SPLITS: lpSplits })
    await this.generate(1)
  }
}
