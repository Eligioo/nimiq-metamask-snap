const BASE32_ALPHABET = {
  RFC4648: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
  RFC4648_HEX: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
  NIMIQ: '0123456789ABCDEFGHJKLMNPQRSTUVXY',
};

/**
 * Converts a buffer into a base32 encoded string.
 * @param buf - The buffer that needs to be transformed.
 * @param alphabet - The set of encoding characters.
 * @returns A base32 encoded string based on the specified alphabet.
 */
export function toBase32(buf: Uint8Array, alphabet = BASE32_ALPHABET.NIMIQ) {
  let shift = 3;
  let carry = 0;
  let byte;
  let symbol;
  let i;
  let res = '';

  for (i = 0; i < buf.length; i++) {
    byte = buf[i];
    // @ts-ignore
    symbol = carry | (byte >> shift);
    res += alphabet[symbol & 0x1f];

    if (shift > 5) {
      shift -= 5;
      // @ts-ignore
      symbol = byte >> shift;
      res += alphabet[symbol & 0x1f];
    }

    shift = 5 - shift;
    // @ts-ignore
    carry = byte << shift;
    shift = 8 - shift;
  }

  if (shift !== 3) {
    res += alphabet[carry & 0x1f];
  }

  while (res.length % 8 !== 0 && alphabet.length === 33) {
    res += alphabet[32];
  }

  return res;
}
