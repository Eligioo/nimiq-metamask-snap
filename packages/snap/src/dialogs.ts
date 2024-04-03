import { panel, heading, divider, copyable, text } from '@metamask/snaps-sdk';

import { Address } from './nimiq/address';

/**
 * Request message signing confirmation dialog.
 * @param publicKey - The public key of the private key that signs the message.
 * @param message - The message that will be signed.
 * @returns A confirmation dialog.
 */
export async function dialogSignMessage(publicKey: Buffer, message: string) {
  return snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Sign the following message?'),
        divider(),
        text('Signing address:'),
        copyable(Address.fromPublicKey(publicKey).toUserFriendlyAddress()),
        text('Message:'),
        copyable(message),
      ]),
    },
  });
}
