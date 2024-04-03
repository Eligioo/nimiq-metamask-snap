import { SLIP10Node } from '@metamask/key-tree';
import { InternalError, UserRejectedRequestError } from '@metamask/snaps-sdk';
import nacl from 'tweetnacl';

import { dialogSignMessage } from './dialogs';

/**
 * Derive a public key based on the provided account and index.
 * @param account - The account of a BIP44 path.
 * @param index - The address of a BIP44 path.
 * @returns Returns a compressed public key.
 */
export async function getPublicKey(account: number, index: number) {
  const accountNode = await getAccount(account);
  const { compressedPublicKey } = await getAddress(accountNode, index);

  return compressedPublicKey.slice(4);
}

/**
 * Sign an arbitrary message.
 * @param account - The account of a BIP44 path.
 * @param index - The address of a BIP44 path.
 * @param message - The message that needs to be signed.
 * @returns Returns the signature including the corresponding public key.
 */
export async function signMessage(
  account: number,
  index: number,
  message: string,
) {
  const accountNode = await getAccount(account);
  const addressNode = await getAddress(accountNode, index);

  const confirmation = await dialogSignMessage(
    Buffer.from(addressNode.compressedPublicKey.slice(4), 'hex'),
    message,
  );
  if (!confirmation) {
    throw new UserRejectedRequestError();
  }

  if (!addressNode.privateKeyBytes) {
    throw new InternalError(
      'Failed to derive private key needed for signing the message.',
    );
  }

  const keyPair = nacl.sign.keyPair.fromSeed(
    Uint8Array.from(addressNode.privateKeyBytes),
  );

  const signature = nacl.sign.detached(Buffer.from(message), keyPair.secretKey);

  return {
    publicKey: addressNode.compressedPublicKey.slice(4),
    signature: Buffer.from(signature).toString('hex'),
  };
}

/**
 * Derives a hardend BIP44 account node.
 * @param account - The account of a BIP44 path.
 * @returns Returns a BIP44 account node.
 */
async function getAccount(account: number) {
  const accountNode = await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path: ['m', `44'`, `242'`, `${account}'`],
      curve: 'ed25519',
    },
  });

  return await SLIP10Node.fromJSON(accountNode);
}

/**
 * Derives a hardend BIP44 address node.
 * @param account - A BIP44 account node.
 * @param index - The index of a BIP44 path.
 * @returns A BIP44 address (index) node.
 */
async function getAddress(account: SLIP10Node, index: number) {
  return await account.derive([`slip10:${index}'`]);
}
