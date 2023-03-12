type I1 = {
  buyable: false;
  price: undefined;
  sellable: false;
};

type I2 = {
  buyable: true;
  price: number;
  sellable: boolean;
};

type I3 = {
  buyable: boolean;
  price: number;
  sellable: true;
};

type II = I1 | I2 | I3;

/**
 * Type for an item
 *
 * @example
 * ```
 * {
 *  "description": "A fishing rod",
 *  "id": "fishingrod",
 *  "name": "Fishing Rod",
 *  "note": "Has a chance of breaking while fishing",
 *  "type": "tool",
 *  "usable": true,
 *  "usage": "reusable"
 *  "buyable": true,
 *  "price": 100,
 *  "sellable": true,
 * }
 * ```
 */
export type IItem = II & {
  description: string;
  id: string;
  name: string;
  note: string | undefined;
  type: string;
  usable: boolean;
  usage: string;
};
