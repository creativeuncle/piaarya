// Shared with RoleSelect and the Team page — one place to keep each role's
// display label and description in sync.
export const ROLE_META: Record<string, { label: string; description: string }> = {
  customer_support: {
    label: 'Customer support',
    description: 'Can fulfill orders, edit order line items, process payments and returns.',
  },
  marketer: {
    label: 'Marketer',
    description: 'Can create, edit, and launch marketing campaigns.',
  },
  merchandiser: {
    label: 'Merchandiser',
    description: 'Can create, edit, and publish products, including editing price and cost.',
  },
  online_store_editor: {
    label: 'Online store editor',
    description: 'Can edit and publish the storefront theme, including the Theme Editor.',
  },
  store_administrator: {
    label: 'Store administrator',
    description: 'Has full administrative access to the store.',
  },
  store_user_administrator: {
    label: 'Store user administrator',
    description: 'Can add, remove, and manage team members and their roles.',
  },
};

export function roleLabel(role: string) {
  return ROLE_META[role]?.label || role;
}
