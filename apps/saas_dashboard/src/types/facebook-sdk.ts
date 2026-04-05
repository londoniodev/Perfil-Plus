/**
 * Type declarations for the Facebook JavaScript SDK (Embedded Signup flow).
 * @see https://developers.facebook.com/docs/javascript/reference/v21.0
 */

export interface FBInitParams {
  appId: string;
  /** Enable cookie support */
  cookie?: boolean;
  /** Parse social plugins on page load */
  xfbml?: boolean;
  /** Graph API version */
  version: string;
}

/**
 * Login options for Embedded Signup (Config ID flow).
 * Uses `config_id` + `response_type: "code"` per Meta's recommended approach.
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 */
export interface FBLoginOptions {
  /** Configuration ID from Meta Business Suite (Embedded Signup) */
  config_id: string;
  /** Must be "code" for Embedded Signup */
  response_type: "code";
  /** Override default response type behavior */
  override_default_response_type: true;
}

/**
 * Auth response from FB.login() when using `response_type: "code"`.
 * Contains the authorization code to exchange server-side.
 */
export interface FBCodeAuthResponse {
  /** Authorization code to exchange for a long-lived token on the backend */
  code: string;
}

/**
 * Auth response from FB.login() for standard token flow.
 */
export interface FBTokenAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
  graphDomain?: string;
  dataAccessExpirationTime?: number;
}

/** Combined auth response type */
export type FBAuthResponse = FBCodeAuthResponse | FBTokenAuthResponse;

export interface FBLoginResponse {
  status: "connected" | "not_authorized" | "unknown";
  authResponse: FBAuthResponse | null;
}

export interface FacebookSDK {
  init: (params: FBInitParams) => void;
  login: (
    callback: (response: FBLoginResponse) => void,
    options?: FBLoginOptions
  ) => void;
  getLoginStatus: (callback: (response: FBLoginResponse) => void) => void;
  api: (
    path: string,
    method: string,
    params: Record<string, unknown>,
    callback: (response: unknown) => void
  ) => void;
}

/** Augment the global Window interface */
declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}
