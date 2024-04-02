import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  InvalidInputError,
  InvalidParamsError,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';

import { getPublicKey, signMessage } from './rpcHandlers';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const { account, index, message } = request.params as {
    account?: number;
    index?: number;
    message?: string;
  };

  switch (request.method) {
    case 'getPublicKey':
      if (typeof account !== 'number' || typeof index !== 'number') {
        throw new InvalidParamsError();
      } else if (account < 0 || index < 0) {
        throw new InvalidInputError();
      }

      const publicKey = await getPublicKey(account, index);

      return { publicKey };
    case 'signMessage':
      if (typeof account !== 'number' || typeof index !== 'number') {
        throw new InvalidParamsError();
      } else if (account < 0 || index < 0) {
        throw new InvalidInputError();
      } else if (typeof message !== 'string') {
        throw new InvalidParamsError();
      }

      const signature = await signMessage(account, index, message);

      return {
        publicKey: signature.publicKey,
        signature: signature.signature,
      };
    default:
      throw new MethodNotFoundError();
  }
};
