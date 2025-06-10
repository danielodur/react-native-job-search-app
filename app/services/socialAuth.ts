import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Sharing from 'expo-sharing';

WebBrowser.maybeCompleteAuthSession();

export interface SocialMediaProfile {
  id: string;
  name: string | null;
  photoUrl: string | null;
  email: string | null;
  phoneNumber?: string | null;
  provider: 'google' | 'facebook' | 'whatsapp';
}

export const socialAuthService = {
  async signInWithGoogle(): Promise<SocialMediaProfile | null> {
    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: 'YOUR_WEB_CLIENT_ID',
      androidClientId: 'YOUR_ANDROID_CLIENT_ID',
      iosClientId: 'YOUR_IOS_CLIENT_ID',
    });

    try {
      const result = await promptAsync();
      if (result?.type === 'success' && result.authentication) {
        const userInfo = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
        });
        const user = await userInfo.json();
        
        return {
          id: user.id,
          name: user.name,
          photoUrl: user.picture,
          email: user.email,
          provider: 'google'
        };
      }
      return null;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      return null;
    }
  },

  async signInWithFacebook(): Promise<SocialMediaProfile | null> {
    const [request, response, promptAsync] = Facebook.useAuthRequest({
      clientId: 'YOUR_FACEBOOK_APP_ID',
    });

    try {
      const result = await promptAsync();
      if (result?.type === 'success' && result.authentication) {
        const userInfo = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${result.authentication.accessToken}`
        );
        const user = await userInfo.json();
        
        return {
          id: user.id,
          name: user.name,
          photoUrl: user.picture?.data?.url,
          email: user.email,
          provider: 'facebook'
        };
      }
      return null;
    } catch (error) {
      console.error('Facebook Sign In Error:', error);
      return null;
    }
  },

  async shareViaWhatsApp(message: string): Promise<SocialMediaProfile | null> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(message);
        // Note: WhatsApp sharing won't return user profile info
        // This is a limitation of the platform
        return {
          id: 'whatsapp_share',
          name: null,
          photoUrl: null,
          email: null,
          provider: 'whatsapp'
        };
      }
      return null;
    } catch (error) {
      console.error('WhatsApp Share Error:', error);
      return null;
    }
  }
};