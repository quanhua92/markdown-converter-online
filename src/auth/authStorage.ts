import CryptoJS from 'crypto-js'
import { StorageService } from '../db/storage'
import type { AuthTokenData, EncryptedToken } from '../types/git'

const AUTH_TOKEN_PREFIX = 'auth-token-'
const ENCRYPTION_KEY_PREFIX = 'auth-key-'

/**
 * Secure authentication token storage using IndexedDB and AES encryption
 */
export class AuthStorage {
  private static async generateEncryptionKey(userId: string): Promise<string> {
    // Create a deterministic but secure key based on user ID and browser fingerprint
    const browserFingerprint = navigator.userAgent + navigator.language + screen.width + screen.height
    const keyMaterial = userId + browserFingerprint + 'markdown-converter-secret'
    
    // Use PBKDF2 to derive a strong encryption key
    const key = CryptoJS.PBKDF2(keyMaterial, 'salt', {
      keySize: 256/32,
      iterations: 10000
    })
    
    return key.toString()
  }

  private static async encryptToken(token: AuthTokenData, userId: string): Promise<string> {
    const encryptionKey = await this.generateEncryptionKey(userId)
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(token), encryptionKey)
    return encrypted.toString()
  }

  private static async decryptToken(encryptedData: string, userId: string): Promise<AuthTokenData | null> {
    try {
      const encryptionKey = await this.generateEncryptionKey(userId)
      const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey)
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
      
      if (!decryptedString) {
        console.warn('Failed to decrypt token - invalid key or corrupted data')
        return null
      }
      
      return JSON.parse(decryptedString)
    } catch (error) {
      console.error('Token decryption failed:', error)
      return null
    }
  }

  /**
   * Store an encrypted authentication token
   */
  static async storeToken(provider: 'github', userId: string, token: AuthTokenData): Promise<void> {
    try {
      const encryptedData = await this.encryptToken(token, userId)
      
      const encryptedToken: EncryptedToken = {
        provider,
        userId,
        encryptedData,
        expiresAt: token.expiresAt,
        createdAt: new Date().toISOString()
      }
      
      const key = `${AUTH_TOKEN_PREFIX}${provider}-${userId}`
      await StorageService.saveItem(key, encryptedToken)
      
      console.log('✅ AuthStorage: Token stored securely for', provider, userId)
    } catch (error) {
      console.error('❌ AuthStorage: Failed to store token:', error)
      throw new Error(`Failed to store ${provider} token`)
    }
  }

  /**
   * Retrieve and decrypt an authentication token
   */
  static async getToken(provider: 'github', userId: string): Promise<AuthTokenData | null> {
    try {
      const key = `${AUTH_TOKEN_PREFIX}${provider}-${userId}`
      const encryptedToken: EncryptedToken | null = await StorageService.loadItem(key)
      
      if (!encryptedToken) {
        console.log('📭 AuthStorage: No token found for', provider, userId)
        return null
      }
      
      // Check if token is expired
      if (Date.now() > encryptedToken.expiresAt) {
        console.log('⏰ AuthStorage: Token expired for', provider, userId)
        await this.removeToken(provider, userId)
        return null
      }
      
      const decryptedToken = await this.decryptToken(encryptedToken.encryptedData, userId)
      
      if (!decryptedToken) {
        console.warn('⚠️ AuthStorage: Failed to decrypt token, removing corrupted data')
        await this.removeToken(provider, userId)
        return null
      }
      
      console.log('✅ AuthStorage: Token retrieved for', provider, userId)
      return decryptedToken
    } catch (error) {
      console.error('❌ AuthStorage: Failed to retrieve token:', error)
      return null
    }
  }

  /**
   * Remove a stored authentication token
   */
  static async removeToken(provider: 'github', userId: string): Promise<void> {
    try {
      const key = `${AUTH_TOKEN_PREFIX}${provider}-${userId}`
      await StorageService.removeItem(key)
      console.log('🗑️ AuthStorage: Token removed for', provider, userId)
    } catch (error) {
      console.error('❌ AuthStorage: Failed to remove token:', error)
    }
  }

  /**
   * Check if a valid token exists for a provider and user
   */
  static async hasValidToken(provider: 'github', userId: string): Promise<boolean> {
    const token = await this.getToken(provider, userId)
    return token !== null && Date.now() < token.expiresAt
  }

  /**
   * Update an existing token (useful for refresh token scenarios)
   */
  static async updateToken(provider: 'github', userId: string, newToken: Partial<AuthTokenData>): Promise<void> {
    const existingToken = await this.getToken(provider, userId)
    
    if (!existingToken) {
      throw new Error(`No existing token found for ${provider} user ${userId}`)
    }
    
    const updatedToken: AuthTokenData = {
      ...existingToken,
      ...newToken
    }
    
    await this.storeToken(provider, userId, updatedToken)
  }

  /**
   * Get all stored tokens for debugging/management
   */
  static async getAllTokens(): Promise<Array<{ provider: string; userId: string; expiresAt: number; createdAt: string }>> {
    try {
      const allItems = await StorageService.getAllItems()
      
      return allItems
        .filter(item => item.key.startsWith(AUTH_TOKEN_PREFIX))
        .map(item => {
          const token = item.value as EncryptedToken
          return {
            provider: token.provider,
            userId: token.userId,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt
          }
        })
    } catch (error) {
      console.error('❌ AuthStorage: Failed to get all tokens:', error)
      return []
    }
  }

  /**
   * Clear all authentication tokens (useful for logout/reset)
   */
  static async clearAllTokens(): Promise<void> {
    try {
      const allItems = await StorageService.getAllItems()
      const tokenKeys = allItems
        .filter(item => item.key.startsWith(AUTH_TOKEN_PREFIX))
        .map(item => item.key)
      
      for (const key of tokenKeys) {
        await StorageService.removeItem(key)
      }
      
      console.log('🧹 AuthStorage: All tokens cleared')
    } catch (error) {
      console.error('❌ AuthStorage: Failed to clear all tokens:', error)
    }
  }

  /**
   * Validate token format and required fields
   */
  static validateToken(token: any): token is AuthTokenData {
    return (
      typeof token === 'object' &&
      typeof token.accessToken === 'string' &&
      typeof token.expiresAt === 'number' &&
      Array.isArray(token.scopes) &&
      token.tokenType === 'bearer'
    )
  }
}

// Export convenience functions
export const storeGitHubToken = (userId: string, token: AuthTokenData) => 
  AuthStorage.storeToken('github', userId, token)

export const getGitHubToken = (userId: string) => 
  AuthStorage.getToken('github', userId)

export const removeGitHubToken = (userId: string) => 
  AuthStorage.removeToken('github', userId)

export const hasValidGitHubToken = (userId: string) => 
  AuthStorage.hasValidToken('github', userId)