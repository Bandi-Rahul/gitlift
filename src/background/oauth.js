// GitHub OAuth "web application flow" run entirely from the extension.
// The user supplies their own OAuth App credentials (Client ID + Secret) in the
// options page, so no secret ever ships inside the published extension.
const REDIRECT = chrome.identity.getRedirectURL();

export function getRedirectURL() {
  return REDIRECT;
}

export async function startOAuth(clientId, clientSecret) {
  const authUrl =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    '&scope=repo' +
    `&redirect_uri=${encodeURIComponent(REDIRECT)}`;

  const redirect = await chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true
  });

  const code = new URL(redirect).searchParams.get('code');
  if (!code) throw new Error('GitHub did not return an authorization code.');

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: REDIRECT
    })
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Token exchange failed: ' + (data.error_description || JSON.stringify(data)));
  }
  return data.access_token;
}
