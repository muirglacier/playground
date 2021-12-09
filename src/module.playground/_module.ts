import { Global, Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { SetupToken } from '@src/module.playground/setup/setup.token'
import { SetupDex } from '@src/module.playground/setup/setup.dex'
import { SetupOracle } from '@src/module.playground/setup/setup.oracle'
import { PlaygroundProbeIndicator } from '@src/module.playground/playground.indicator'
import { JsonRpcClient } from '@muirglacier/jellyfish-api-jsonrpc'
import { PlaygroundBlock } from '@src/module.playground/playground.block'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { GenesisKeys } from '@muirglacier/testcontainers'
import { SetupMasternode } from '@src/module.playground/setup/setup.masternode'
import { SetupUtxo } from '@src/module.playground/setup/setup.utxo'
import { OracleBot } from './bot/oracle.bot'
import { SetupLoanScheme } from '@src/module.playground/setup/setup.loan.scheme'
import { SetupLoanToken } from '@src/module.playground/setup/setup.loan.token'
import { SetupLoanCollateral } from '@src/module.playground/setup/setup.loan.collateral'
import { VaultBot } from '@src/module.playground/bot/vault.bot'

@Global()
@Module({
  providers: [
    SetupUtxo,
    SetupToken,
    SetupDex,
    SetupOracle,
    SetupMasternode,
    SetupLoanScheme,
    SetupLoanToken,
    SetupLoanCollateral,
    OracleBot,
    VaultBot,
    PlaygroundBlock,
    PlaygroundProbeIndicator
  ],
  exports: [
    PlaygroundProbeIndicator
  ]
})
export class PlaygroundModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(PlaygroundModule.name)

  private readonly setups: Array<PlaygroundSetup<any>>

  constructor (
    private readonly client: JsonRpcClient,
    private readonly indicator: PlaygroundProbeIndicator,
    utxo: SetupUtxo,
    token: SetupToken,
    dex: SetupDex,
    oracle: SetupOracle,
    masternode: SetupMasternode,
    loanScheme: SetupLoanScheme,
    loanToken: SetupLoanToken,
    loanCollateral: SetupLoanCollateral
  ) {
    this.setups = [
      utxo,
      token,
      oracle,
      masternode,
      loanScheme,
      loanToken,
      loanCollateral,
      dex
    ]
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.waitForDeFiD()
    await this.importPrivKey()

    for (const setup of this.setups) {
      await setup.setup()
    }

    this.logger.log('setup completed')
    this.indicator.ready = true
  }

  async importPrivKey (): Promise<void> {
    this.logger.log('importing private keys')

    if (await this.client.blockchain.getBlockCount() > 0) {
      return
    }

    for (const genesisKey of GenesisKeys) {
      await this.client.wallet.importPrivKey(genesisKey.owner.privKey, undefined, true)
      await this.client.wallet.importPrivKey(genesisKey.operator.privKey, undefined, true)
    }
  }

  async waitForDeFiD (timeout = 45000): Promise<void> {
    const expiredAt = Date.now() + timeout

    while (expiredAt > Date.now()) {
      try {
        const info = await this.client.blockchain.getBlockchainInfo()
        if (info.blocks === 0) {
          return
        }
        if (!info.initialblockdownload) {
          return
        }
      } catch (err) {
      }
      await new Promise((resolve) => {
        setTimeout(_ => resolve(0), 1000)
      })
    }

    throw new Error(`DeFiD not ready within given timeout of ${timeout}ms.`)
  }
}
