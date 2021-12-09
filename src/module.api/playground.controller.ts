import { Controller, Get } from '@nestjs/common'
import { JsonRpcClient } from '@muirglacier/jellyfish-api-jsonrpc'
import { Info } from '@playground-api-client/api/playground'

@Controller('/v0/playground')
export class PlaygroundController {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Get('/info')
  async info (): Promise<Info> {
    const info = await this.client.blockchain.getBlockchainInfo()
    return {
      block: {
        count: info.blocks,
        hash: info.bestblockhash
      }
    }
  }
}
