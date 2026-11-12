// Asset manifest — every image the site uses, mapped to its source file.
// Client photographs: supplied by DARK BITES. Stock photographs: Pexels (see ASSET_MANIFEST.md).
// Originals live untouched in /media-source; derivatives (AVIF + WebP) in /public/media.
// `edge` is the median border colour of the photo, used as a letterbox tone. Nothing is ever cropped.
export type MediaRole = 'product' | 'campaign' | 'story';
export type MediaOrigin = 'client' | 'stock';
export interface MediaAsset {
  key: string;
  source: string;
  role: MediaRole;
  origin: MediaOrigin;
  credit?: string;
  w: number;
  h: number;
  edge: string;
  widths: number[];
  alt: string;
}

export const media = {
  'garlic-bread': { key: 'garlic-bread', source: '93d1df25-image.jpg', role: 'product', origin: 'client', w: 1536, h: 1024, edge: '#3c3129', widths: [480, 960, 1440], alt: "Two pieces of cheesy garlic bread with herbs on a wooden board, garlic cloves beside it" },
  'pizza-jalapeno-pineapple': { key: 'pizza-jalapeno-pineapple', source: '823529f3-image.jpg', role: 'product', origin: 'client', w: 1086, h: 1448, edge: '#443b38', widths: [480, 960, 1086], alt: "Jalape\u00f1o and pineapple pizza on a wooden pizza paddle" },
  'fresh-fruit-cake': { key: 'fresh-fruit-cake', source: '8c513334-image.jpg', role: 'product', origin: 'client', w: 1536, h: 1024, edge: '#7c522e', widths: [480, 960, 1440], alt: "Slice of layered fruit cake with cream, kiwi and pomegranate on a ceramic plate" },
  'chocolate-cake': { key: 'chocolate-cake', source: '55c8209c-image.jpg', role: 'product', origin: 'client', w: 1536, h: 1024, edge: '#4d2f27', widths: [480, 960, 1440], alt: "Slice of layered dark chocolate cake dusted with cocoa on a pink and white plate" },
  'nutella-cookie-tub': { key: 'nutella-cookie-tub', source: '3772296d-image.jpg', role: 'campaign', origin: 'client', w: 900, h: 1600, edge: '#b7a38d', widths: [480, 900], alt: "Nutella Cookie Tub promotional image: a baked cookie in a dark tub on a wooden board" },
  'brownie-vanilla': { key: 'brownie-vanilla', source: '0c5ea463-image.jpg', role: 'product', origin: 'client', w: 1086, h: 1448, edge: '#303411', widths: [480, 960, 1086], alt: "Chocolate brownie with a scoop of vanilla ice cream and chocolate sauce on a dark plate" },
  'blueberry-cheesecake': { key: 'blueberry-cheesecake', source: '1f1423b0-image.jpg', role: 'campaign', origin: 'client', w: 1122, h: 1402, edge: '#e7d7d0', widths: [480, 960, 1122], alt: "Blueberry Cheesecake promotional image: a cheesecake slice with blueberry topping on a pink plate" },
  'biscoff-brownie': { key: 'biscoff-brownie', source: 'c9d3aa87-image.jpg', role: 'product', origin: 'client', w: 1086, h: 1448, edge: '#886c41', widths: [480, 960, 1086], alt: "Brownie topped with vanilla ice cream, Biscoff drizzle, crumb and a Lotus biscuit" },
  'biscoff-cheesecake': { key: 'biscoff-cheesecake', source: '044ee2a0-image.jpg', role: 'campaign', origin: 'client', w: 1254, h: 1254, edge: '#4b3511', widths: [480, 960, 1254], alt: "Biscoff Cheesecake promotional image: a cheesecake slice with Biscoff topping beside Biscoff spread and biscuits" },
  'nutella-cheesecake': { key: 'nutella-cheesecake', source: '78e32de0-image.jpg', role: 'campaign', origin: 'client', w: 1122, h: 1402, edge: '#22150a', widths: [480, 960, 1122], alt: "Nutella Cheesecake promotional image: a cheesecake slice with Nutella drizzle and hazelnuts on a black plate" },
  'kitchen-team': { key: 'kitchen-team', source: '03ff56fb-image.jpg', role: 'story', origin: 'client', w: 1036, h: 1280, edge: '#838578', widths: [480, 960, 1036], alt: "A group of chefs in black chef jackets wearing medals, standing in a kitchen" },
  'aryaman-puppy': { key: 'aryaman-puppy', source: '62cdea0b-image.jpg', role: 'story', origin: 'client', w: 853, h: 1280, edge: '#999989', widths: [480, 853], alt: "Aryaman Srivastava in a black chef jacket holding a golden puppy" },
  'aryaman-plated': { key: 'aryaman-plated', source: '51f33afb-image.jpg', role: 'story', origin: 'client', w: 1026, h: 1280, edge: '#efe8e0', widths: [480, 960, 1026], alt: "Aryaman Srivastava in a black chef jacket and striped cap, holding a plated dessert" },
  'award-2022': { key: 'award-2022', source: '71b8bc96-image.jpg', role: 'story', origin: 'client', w: 1040, h: 883, edge: '#d0d3d7', widths: [480, 960, 1040], alt: "Aryaman Srivastava receiving the Best Plated Dessert Student Award, November 2022, from Truffle Nation" },
  'stock-burger': { key: 'stock-burger', source: 'pexels-hassan-91945496-9188670.jpg', role: 'product', origin: 'stock', credit: "Hassan / Pexels", w: 2145, h: 2576, edge: '#869893', widths: [480, 960, 1440], alt: "Two burgers on branded wax paper, the front one with cheese, sauce and a crisp patty, a second burger behind" },
  'stock-cheese-rolls': { key: 'stock-cheese-rolls', source: 'pexels-selen-ongoren-10957111-6170675.jpg', role: 'product', origin: 'stock', credit: "Selen Ongoren / Pexels", w: 2061, h: 2576, edge: '#d2cecb', widths: [480, 960, 1440], alt: "Golden baked bread rolls split and filled with melted cheese, scattered with parsley" },
  'stock-pizza-red': { key: 'stock-pizza-red', source: 'pexels-ramon-hernandez-243129494-17907813.jpg', role: 'product', origin: 'stock', credit: "Ramon Hernandez / Pexels", w: 1717, h: 2576, edge: '#8c0304', widths: [480, 960, 1440], alt: "A whole sliced pizza with cheese and pineapple, shot from above on a red background" },
  'stock-chocolate-cake': { key: 'stock-chocolate-cake', source: 'pexels-polina-tankilevitch-4109997.jpg', role: 'product', origin: 'stock', credit: "Polina Tankilevitch / Pexels", w: 1717, h: 2576, edge: '#edeff0', widths: [480, 960, 1440], alt: "Two slices of layered chocolate cake on pale stoneware plates, one with a fork" },
  'stock-plum-cake': { key: 'stock-plum-cake', source: 'pexels-subhrajyoti-paul-447200412-35011684.jpg', role: 'product', origin: 'stock', credit: "Subhrajyoti Paul / Pexels", w: 1717, h: 2576, edge: '#c09f7b', widths: [480, 960, 1440], alt: "A dry fruit cake with candied fruit and cashews being pulled apart by hand" },
  'stock-cookie-dessert': { key: 'stock-cookie-dessert', source: 'pexels-luan-humberto-501848079-17927075.jpg', role: 'product', origin: 'stock', credit: "Luan Humberto / Pexels", w: 1717, h: 2576, edge: '#5b291f', widths: [480, 960, 1440], alt: "A chocolate-glazed cookie dessert on a small plate, surrounded by chocolate chip cookies" },
  'stock-chocolate-cheesecake': { key: 'stock-chocolate-cheesecake', source: 'pexels-tharunthejasjp-34638147.jpg', role: 'product', origin: 'stock', credit: "Tharun Thejas / Pexels", w: 1717, h: 2576, edge: '#d1d2d3', widths: [480, 960, 1440], alt: "A slice of chocolate cheesecake on a dark plate with the whole cheesecake behind it" },
  'stock-berry-cheesecake': { key: 'stock-berry-cheesecake', source: 'pexels-medine-dilek-kizmaz-7160768-35047343.jpg', role: 'product', origin: 'stock', credit: "Medine Dilek Kizmaz / Pexels", w: 1717, h: 2576, edge: '#322722', widths: [480, 960, 1440], alt: "Overhead view of a cheesecake slice with berry topping on a blue plate, a bowl of berries above" },
  'stock-biscoff-cheesecake': { key: 'stock-biscoff-cheesecake', source: 'pexels-nano-erdozain-120534369-28895990.jpg', role: 'product', origin: 'stock', credit: "Nano Erdozain / Pexels", w: 1718, h: 2576, edge: '#5b4d3e', widths: [480, 960, 1440], alt: "A baked cheesecake slice on a biscuit base with caramelised top and a Lotus biscuit standing on it" },
  'stock-login-cocoa': { key: 'stock-login-cocoa', source: 'pexels-pealdesign-30699392.jpg', role: 'story', origin: 'stock', credit: "pealdesign / Pexels", w: 1717, h: 2576, edge: '#696965', widths: [480, 960, 1440], alt: "A hand dusting cocoa powder through a sieve over a stack of cream-filled biscuits on a plate" },
  'stock-brownie-stack': { key: 'stock-brownie-stack', source: 'pexels-kawerodriguess-17488699.jpg', role: 'product', origin: 'stock', credit: "Kawe Rodrigues / Pexels", w: 1717, h: 2576, edge: '#f1ad24', widths: [480, 960, 1440], alt: "A stack of four cocoa-dusted chocolate brownies on a mustard-yellow background" },
} satisfies Record<string, MediaAsset>;

export type MediaKey = keyof typeof media;
