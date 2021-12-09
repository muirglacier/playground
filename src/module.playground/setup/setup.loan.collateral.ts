import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { SetCollateralToken } from '@muirglacier/jellyfish-api-core/dist/category/loan'
import BigNumber from 'bignumber.js'

@Injectable()
export class SetupLoanCollateral extends PlaygroundSetup<SetCollateralToken> {
  list (): SetCollateralToken[] {
    return [
      {
        token: 'DFI',
        fixedIntervalPriceId: 'DFI/USD',
        factor: new BigNumber('1')
      },
      {
        token: 'BTC',
        fixedIntervalPriceId: 'BTC/USD',
        factor: new BigNumber('1')
      },
      {
        token: 'ETH',
        fixedIntervalPriceId: 'ETH/USD',
        factor: new BigNumber('0.7')
      },
      {
        token: 'USDC',
        fixedIntervalPriceId: 'USDC/USD',
        factor: new BigNumber('1')
      },
      {
        token: 'USDT',
        fixedIntervalPriceId: 'USDT/USD',
        factor: new BigNumber('1')
      },
      {
        token: 'CU10',
        fixedIntervalPriceId: 'CU10/USD',
        factor: new BigNumber('1')
      },
      {
        token: 'CD10',
        fixedIntervalPriceId: 'CD10/USD',
        factor: new BigNumber('1')
      },
      {
        token: 'CS25',
        fixedIntervalPriceId: 'CS25/USD',
        factor: new BigNumber('1')
      },
      {
        token: 'CR50',
        fixedIntervalPriceId: 'CR50/USD',
        factor: new BigNumber('1')
      }
    ]
  }

  async create (each: SetCollateralToken): Promise<void> {
    await this.client.loan.setCollateralToken(each)
  }

  async has (each: SetCollateralToken): Promise<boolean> {
    try {
      const token = await this.client.loan.getCollateralToken(each.token)
      return token.token !== undefined
    } catch (e) {
      return false
    }
  }
}
