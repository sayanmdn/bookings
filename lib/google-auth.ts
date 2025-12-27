export interface GoogleTokenResponse {
    access_token: string
    expires_in: number
    token_type: string
    scope: string
    refresh_token?: string
}

export interface GoogleUserProfile {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
}

export class GoogleAuth {
    private clientId: string
    private clientSecret: string
    private redirectUri: string

    constructor() {
        this.clientId = process.env.GOOGLE_CLIENT_ID!
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!
        this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google'
    }

    /**
     * Generate the Google OAuth authorization URL
     */
    getAuthUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
        })

        if (state) {
            params.append('state', state)
        }

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    }

    /**
     * Exchange authorization code for access token
     */
    async getTokens(code: string): Promise<GoogleTokenResponse> {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code',
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to get tokens: ${error}`)
        }

        return response.json()
    }

    /**
     * Fetch user profile from Google
     */
    async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to get user profile: ${error}`)
        }

        return response.json()
    }
}
