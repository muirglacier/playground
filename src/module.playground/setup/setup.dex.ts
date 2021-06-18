import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { AddPoolLiquiditySource, CreatePoolPairMetadata } from '@defichain/jellyfish-api-core/dist/category/poolpair'
import { BalanceTransferPayload } from '@defichain/jellyfish-api-core/dist/category/account'

interface PoolPairSetup {
  symbol: `${string}-${string}`
  create: CreatePoolPairMetadata
  add: AddPoolLiquiditySource
  utxoToAccount?: BalanceTransferPayload
}

@Injectable()
export class SetupDex extends PlaygroundSetup<PoolPairSetup> {
  list (): PoolPairSetup[] {
    // MAX_SYMBOL_LENGTH = 8
    return [
      {
        symbol: 'DFI-tBTC',
        create: {
          tokenA: 'DFI',
          tokenB: 'tBTC',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '1000@tBTC']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'DFI-tETH',
        create: {
          tokenA: 'DFI',
          tokenB: 'tETH',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '100000@tETH']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'DFI-tUSD',
        create: {
          tokenA: 'DFI',
          tokenB: 'tUSD',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '10000000@tUSD']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'DFI-tLTC',
        create: {
          tokenA: 'DFI',
          tokenB: 'tLTC',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['100@DFI', '10000@tLTC']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '100@0'
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

    await this.client.poolpair.addPoolLiquidity(each.add, PlaygroundSetup.address)
    await this.generate(1)
  }

  async has (each: PoolPairSetup): Promise<boolean> {
    try {
      await this.client.poolpair.getPoolPair(each.symbol)
      return true
    } catch (e) {
      return false
    }
  }
}