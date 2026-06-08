import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

type OAuthProvider = "google" | "apple" | "azure";

/**
 * Wrapper de auth usando Supabase OAuth nativo.
 * Substitui o @lovable.dev/cloud-auth-js que só funciona no ambiente Lovable Cloud.
 */
export const lovable = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, opts?: SignInOptions) => {
      const redirectTo = opts?.redirect_uri ?? window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: opts?.extraParams,
        },
      });

      if (error) {
        return { error, redirected: false };
      }

      // Supabase OAuth redireciona automaticamente o browser
      return { error: null, redirected: true };
    },
  },
};
