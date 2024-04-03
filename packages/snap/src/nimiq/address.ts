import { InternalError } from '@metamask/snaps-sdk';
import blake2b from 'blake2b';

import { toBase32 } from './bufferUtils';

export class Address {
  readonly #obj: Uint8Array;

  static CCODE = 'NQ';

  static BLAKE2B_HASH_SIZE = 32;

  static ADDRESS_SERIALIZED_SIZE = 20;

  constructor(arg: Uint8Array) {
    if (!(arg instanceof Uint8Array)) {
      throw new InternalError('Primitive: Invalid type');
    }
    if (arg.length !== Address.ADDRESS_SERIALIZED_SIZE) {
      throw new InternalError('Primitive: Invalid length');
    }
    this.#obj = arg;
  }

  static fromPublicKey(publicKey: Uint8Array) {
    const hasher = blake2b(Address.BLAKE2B_HASH_SIZE);
    hasher.update(publicKey);
    const hash = hasher.digest('hex');
    return new Address(
      Buffer.from(hash, 'hex').subarray(0, Address.ADDRESS_SERIALIZED_SIZE),
    );
  }

  public toUserFriendlyAddress(withSpaces = true) {
    const base32 = toBase32(this.#obj);
    const check = `00${
      98 - this.#ibanCheck(`${base32 + Address.CCODE}00`)
    }`.slice(-2);
    let res = Address.CCODE + check + base32;
    if (withSpaces) {
      res = res.replace(/.{4}/g, '$& ').trim();
    }
    return res;
  }

  #ibanCheck(str: string) {
    const num = str
      .split('')
      .map((c) => {
        const code = c.toUpperCase().charCodeAt(0);
        return code >= 48 && code <= 57 ? c : (code - 55).toString();
      })
      .join('');
    let tmp = '';

    for (let i = 0; i < Math.ceil(num.length / 6); i++) {
      tmp = (parseInt(tmp + num.substr(i * 6, 6)) % 97).toString();
    }

    return parseInt(tmp);
  }
}
