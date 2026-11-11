# DARK BITES — asset manifest

Originals are never modified. They are kept in `media-source/` (not served). Web derivatives (AVIF + WebP at 480 / 960 / 1440 px, capped at source width) are in `public/media/`. The machine-readable list is `src/data/media.ts`. No photograph is cropped or stretched anywhere on the site.

## Stock product photographs (added in this revision)

| Original file | Size | Key | Category | Product | Placement | Source / licence |
|---|---|---|---|---|---|---|
| `pexels-hassan-91945496-9188670.jpg` | 2145×2576 | `stock-burger` | Burgers | Classic Burger (new product) | Primary — listing, product detail, Burgers category, homepage savoury lead | Hassan / Pexels — Pexels License |
| `pexels-selen-ongoren-10957111-6170675.jpg` | 2061×2576 | `stock-cheese-rolls` | Garlic bread & savoury sides | Cheesy Herb Rolls (new product) | Primary — listing, product detail | Selen Ongoren / Pexels — Pexels License |
| `pexels-ramon-hernandez-243129494-17907813.jpg` | 1717×2576 | `stock-pizza-red` | Pizza | Category image only | Pizza category tile and menu header. Not used as the Jalapeño & Pineapple Pizza photo because it shows different toppings | Ramon Hernandez / Pexels — Pexels License |
| `pexels-polina-tankilevitch-4109997.jpg` | 1717×2576 | `stock-chocolate-cake` | Cakes | Dark Chocolate Cake | Supplementary — product gallery (2nd), Cakes category tile, homepage Cakes section | Polina Tankilevitch / Pexels — Pexels License |
| `pexels-subhrajyoti-paul-447200412-35011684.jpg` | 1717×2576 | `stock-plum-cake` | Cakes | Not placed | Held back: shows a dry fruit (plum) cake, which is a different product from the cream-based Fresh Fruit Cake. Ready to use if the client sells a plum cake | Subhrajyoti Paul / Pexels — Pexels License |
| `pexels-luan-humberto-501848079-17927075.jpg` | 1717×2576 | `stock-cookie-dessert` | Cookies | Category image only | Cookies category tile and menu header. Not presented as the Nutella Cookie Tub; the client’s own campaign image stays primary | Luan Humberto / Pexels — Pexels License |
| `pexels-tharunthejasjp-34638147.jpg` | 1717×2576 | `stock-chocolate-cheesecake` | Cheesecakes | Category image only | Cheesecakes category tile and menu header. Does not match the Nutella Cheesecake product, so not in its gallery | Tharun Thejas / Pexels — Pexels License |
| `pexels-medine-dilek-kizmaz-7160768-35047343.jpg` | 1717×2576 | `stock-berry-cheesecake` | Cheesecakes | Blueberry Cheesecake | Primary listing image; product gallery (1st). Client campaign image kept as 2nd gallery image | Medine Dilek Kizmaz / Pexels — Pexels License |
| `pexels-nano-erdozain-120534369-28895990.jpg` | 1718×2576 | `stock-biscoff-cheesecake` | Cheesecakes | Biscoff Cheesecake | Primary listing image; product gallery (1st). Client campaign image kept as 2nd gallery image | Nano Erdozain / Pexels — Pexels License |
| `pexels-kawerodriguess-17488699.jpg` | 1717×2576 | `stock-brownie-stack` | Brownies & desserts | Brownie with Vanilla Ice Cream — “Box of 4” variant | Supplementary — gallery (2nd), shown when “Box of 4” is selected; Brownies category tile; homepage brownies feature | Kawe Rodrigues / Pexels — Pexels License |

**Pexels License:** free for commercial use, no attribution required. It does not cover trademarks or identifiable brands shown in a photo, and photos may not be used to imply endorsement. Points to note:
- `pexels-hassan-…` (burger) shows another restaurant’s printed wrapper and logo.
- `pexels-kawerodriguess-…` (brownies) shows a third-party sticker logo in the bottom-right corner.
- Nutella, Lotus Biscoff and Ferrero products appear in some photos. No brand partnership is implied.

The site labels stock photos “Representative image” in the product gallery, and the footer says some menu photographs are representative.

## Client photographs (supplied by DARK BITES)

| Original (in media-source/client) | Key | Role / placement |
|---|---|---|
| brownie-vanilla.jpg | brownie-vanilla | Homepage hero; Brownie with Vanilla Ice Cream (primary) |
| biscoff-cheesecake-promo.jpg | biscoff-cheesecake | Biscoff Cheesecake gallery (campaign artwork, shown whole) |
| nutella-cheesecake-promo.jpg | nutella-cheesecake | Nutella Cheesecake (primary, campaign artwork) |
| blueberry-cheesecake-promo.jpg | blueberry-cheesecake | Blueberry Cheesecake gallery (campaign artwork) |
| nutella-cookie-tub-promo.jpg | nutella-cookie-tub | Nutella Cookie Tub (primary, campaign artwork) |
| biscoff-brownie.jpg | biscoff-brownie | Biscoff Brownie (primary) |
| chocolate-cake.jpg | chocolate-cake | Dark Chocolate Cake (primary) |
| fresh-fruit-cake.jpg | fresh-fruit-cake | Fresh Fruit Cake (primary) |
| pizza-jalapeno-pineapple.jpg | pizza-jalapeno-pineapple | Jalapeño & Pineapple Pizza (primary) |
| garlic-bread.jpg | garlic-bread | Cheesy Garlic Bread (primary); Savoury sides category tile |
| aryaman-plated.jpg | aryaman-plated | Hero founder credit, The baker, Story |
| award-2022.jpg | award-2022 | Recognition, Story |
| aryaman-puppy.jpg | aryaman-puppy | The baker (small), Story |
| kitchen-team.jpg | kitchen-team | Story |
| logo-original.png | — | Source for the redrawn logo in `public/brand/` |

## Logo (`public/brand/`)

These are vector redraws of the original lips-and-chocolate logo. The drawing is unchanged; the improvements are a transparent background, sharp edges at any size, and the corner sparkle removed.

- `darkbites-logo.svg` / `-light.svg`: the complete circular logo (footer, story).
- `darkbites-symbol.svg` / `-light.svg`: the lips mark alone (header, favicon).
- `darkbites-wordmark.svg` / `-light.svg`: “DARK BITES” set in Canela.
- `darkbites-primary.svg` / `-light.svg`: horizontal lockup, mark plus wordmark.

## Videos

`reel-pizza-540.mp4` and `reel-kitchen-540.mp4`, with their poster frames, stay in `public/media/`. They are not used on any page, because their footage is behind-the-scenes rather than finished product. The `Reel` component is kept for future use.
