import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { AppointOracleOptions, OraclePriceFeed } from '@muirglacier/jellyfish-api-core/dist/category/oracle'
import { OracleBot } from '@src/module.playground/bot/oracle.bot'
import { RegTestFoundationKeys } from '@muirglacier/jellyfish-network'
import { JsonRpcClient } from '@muirglacier/jellyfish-api-jsonrpc'

interface OracleSetup {
  address: string
  priceFeeds: OraclePriceFeed[]
  options: AppointOracleOptions
}

const FEEDS: OraclePriceFeed[] = [
  {
    token: 'TSLA',
    currency: 'USD'
  },
  {
    token: 'AAPL',
    currency: 'USD'
  },
  {
    token: 'FB',
    currency: 'USD'
  },
  {
    token: 'CU10',
    currency: 'USD'
  },
  {
    token: 'TU10',
    currency: 'USD'
  },
  {
    token: 'CD10',
    currency: 'USD'
  },
  {
    token: 'TD10',
    currency: 'USD'
  },
  {
    token: 'CS25',
    currency: 'USD'
  },
  {
    token: 'TS25',
    currency: 'USD'
  },
  {
    token: 'CR50',
    currency: 'USD'
  },
  {
    token: 'TR50',
    currency: 'USD'
  },
  {
    token: 'DFI',
    currency: 'USD'
  },
  {
    token: 'BTC',
    currency: 'USD'
  },
  {
    token: 'ETH',
    currency: 'USD'
  },
  {
    token: 'USDC',
    currency: 'USD'
  },
  {
    token: 'USDT',
    currency: 'USD'
  }
]

@Injectable()
export class SetupOracle extends PlaygroundSetup<OracleSetup> {
  oracleOwnerAddress: string = RegTestFoundationKeys[0].owner.address
  private readonly oracleIds: string[] = []

  constructor (client: JsonRpcClient, readonly oracleBot: OracleBot) {
    super(client)
  }

  list (): OracleSetup[] {
    return [
      {
        address: this.oracleOwnerAddress,
        priceFeeds: FEEDS,
        options: {
          weightage: 1
        }
      },
      {
        address: this.oracleOwnerAddress,
        priceFeeds: FEEDS,
        options: {
          weightage: 1
        }
      },
      {
        address: this.oracleOwnerAddress,
        priceFeeds: FEEDS,
        options: {
          weightage: 1
        }
      }
    ]
  }

  async create (each: OracleSetup): Promise<void> {
    await this.waitForBalance(101)
    const oracleId = await this.client.oracle.appointOracle(each.address, each.priceFeeds, each.options)
    this.oracleIds.push(oracleId)
  }

  protected async after (list: OracleSetup[]): Promise<void> {
    await this.generate(1)
    this.oracleBot.oracleIds = this.oracleIds
    await this.oracleBot.run()
    await this.generate(1)
  }

  async has (each: OracleSetup): Promise<boolean> {
    try {
      return (await this.client.oracle.listOracles()).length >= this.list().length
    } catch (e) {
      return false
    }
  }
}
