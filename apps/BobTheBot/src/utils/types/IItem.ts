type I1 = {
  sellable: false;
  buyable: false;
  price: undefined;
};

type I2 = {
  sellable: boolean;
  buyable: true;
  price: number;
};

type I3 = {
  sellable: true;
  buyable: boolean;
  price: number;
};

type II = I1 | I2 | I3;

export type IItem = II & {
  id: string;
  name: string;
  description: string;
  note: string | undefined;
  type: string;
  usable: boolean;
  usage: string;
};
