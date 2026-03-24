/**
 * Mock Product Service
 * Simulates async API calls for the product builder.
 */

const PRODUCT_TYPES = [
  {
    id: 'tender-coconut',
    name: 'Tender Coconut Water',
    description: '100% pure, natural coconut water with no added sugar or preservatives.',
    icon: 'water_drop',
    basePrice: 0.45,
  },
  {
    id: 'concentrate',
    name: 'Concentrate',
    description: 'Highly concentrated coconut base for industrial applications and rehydration.',
    icon: 'liquor',
    basePrice: 0.62,
  },
]

const PACKAGING_OPTIONS = [
  {
    id: 'pet-bottle',
    name: 'PET Bottle',
    description: 'Lightweight, recyclable, and cost-effective for retail.',
    icon: 'pill',
    priceAddon: 0.10,
    premium: false,
  },
  {
    id: 'glass-bottle',
    name: 'Glass Bottle',
    description: 'Superior shelf life and premium brand positioning.',
    icon: 'wine_bar',
    priceAddon: 0.18,
    premium: true,
  },
  {
    id: 'tetra-pack',
    name: 'Tetra Pack',
    description: 'Aseptic packaging for long-term storage without cooling.',
    icon: 'box',
    priceAddon: 0.12,
    premium: false,
  },
]

/**
 * Fetches available product types.
 * @returns {Promise<object>}
 */
export const getProductTypes = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, products: PRODUCT_TYPES })
    }, 200)
  })
}

/**
 * Fetches available packaging options.
 * @returns {Promise<object>}
 */
export const getPackagingOptions = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, packaging: PACKAGING_OPTIONS })
    }, 200)
  })
}
