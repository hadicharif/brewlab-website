// ─────────────────────────────────────────────────────────────
//  Photos (files live in /public/photos)
//  To add a photo to a menu item: put a square .webp in
//  public/photos and add a line to ITEM_PHOTOS with the item id.
// ─────────────────────────────────────────────────────────────
const dir = `${import.meta.env.BASE_URL}photos/`

// small photos next to menu items (and in the best-seller pop-up)
export const ITEM_PHOTOS = {
  'd-brownie': `${dir}d-brownie.webp`,
  'd-oreoballs': `${dir}d-oreoballs.webp`,
  'd-lotusballs': `${dir}d-lotusballs.webp`,
  'd-lazycake': `${dir}d-lazycake.webp`,
}
