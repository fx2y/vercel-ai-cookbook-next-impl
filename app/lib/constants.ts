export const ToolResults = {
  CONFIRMED: 'Yes, confirmed.' as const,
  DENIED: 'No, denied.' as const
} as const;

export type ToolResultType = typeof ToolResults[keyof typeof ToolResults];