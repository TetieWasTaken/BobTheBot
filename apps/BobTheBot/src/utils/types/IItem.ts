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

export type IItem = II & {
  description: string;
  id: string;
  name: string;
  note: string | undefined;
  type: string;
  usable: boolean;
  usage: string;
};
