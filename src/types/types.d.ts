export interface DefaultJWT extends Record<string, unknown> {
  name?: string | null
  email?: string | null
  sub?: string
}

export interface JWT extends Record<string, unknown>, DefaultJWT {}
