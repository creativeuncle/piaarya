import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { fetchSettings, updateSettings } from '../api/settings';
import { fetchApps } from '../api/apps';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-gray-900 transition-colors" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
    </label>
  );
}

const TABS = [
  { key: 'google', label: 'Google' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'apple', label: 'Apple' },
];

const EMPTY_GOOGLE = { enabled: false, clientId: '', clientSecret: '', clientSecretMasked: '', hasClientSecret: false };
const EMPTY_FACEBOOK = { enabled: false, appId: '', appSecret: '', appSecretMasked: '', hasAppSecret: false };
const EMPTY_APPLE = {
  enabled: false,
  servicesId: '',
  teamId: '',
  keyId: '',
  privateKey: '',
  privateKeyMasked: '',
  hasPrivateKey: false,
};

export default function SocialLoginSettings() {
  const [activeTab, setActiveTab] = useState('google');
  const [google, setGoogle] = useState(EMPTY_GOOGLE);
  const [facebook, setFacebook] = useState(EMPTY_FACEBOOK);
  const [apple, setApple] = useState(EMPTY_APPLE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [appInstalled, setAppInstalled] = useState(null);

  function applyData(data) {
    const s = data.socialLogin;
    setGoogle({
      enabled: s.google.enabled,
      clientId: s.google.clientId,
      clientSecret: '',
      clientSecretMasked: s.google.clientSecretMasked,
      hasClientSecret: s.google.hasClientSecret,
    });
    setFacebook({
      enabled: s.facebook.enabled,
      appId: s.facebook.appId,
      appSecret: '',
      appSecretMasked: s.facebook.appSecretMasked,
      hasAppSecret: s.facebook.hasAppSecret,
    });
    setApple({
      enabled: s.apple.enabled,
      servicesId: s.apple.servicesId,
      teamId: s.apple.teamId,
      keyId: s.apple.keyId,
      privateKey: '',
      privateKeyMasked: s.apple.privateKeyMasked,
      hasPrivateKey: s.apple.hasPrivateKey,
    });
  }

  useEffect(() => {
    Promise.all([fetchSettings(), fetchApps()])
      .then(([settingsData, apps]) => {
        applyData(settingsData);
        const app = apps.find((a) => a.key === 'social_login');
        setAppInstalled(Boolean(app?.isInstalled));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setGoogleField(field, value) {
    setGoogle((prev) => ({ ...prev, [field]: value }));
  }
  function setFacebookField(field, value) {
    setFacebook((prev) => ({ ...prev, [field]: value }));
  }
  function setAppleField(field, value) {
    setApple((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateSettings({
        socialLogin: {
          google: { enabled: google.enabled, clientId: google.clientId, clientSecret: google.clientSecret },
          facebook: { enabled: facebook.enabled, appId: facebook.appId, appSecret: facebook.appSecret },
          apple: {
            enabled: apple.enabled,
            servicesId: apple.servicesId,
            teamId: apple.teamId,
            keyId: apple.keyId,
            privateKey: apple.privateKey,
          },
        },
      });
      applyData(data);
      setMessage('Social login settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!appInstalled) {
    return (
      <div className="p-6">
        <Link to="/apps" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
          Back to Apps
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Social Login</h1>
        <p className="text-sm text-gray-500 max-w-md">
          This app isn't installed. Install "Social Login" from the Apps page to configure Google, Facebook, and
          Apple sign-in.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/apps" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
        Back to Apps
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Social Login</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
        Add credentials for each provider and toggle it on once ready. Storing these keys here is the prep step —
        wiring the actual "Login with Google/Facebook/Apple" buttons on the storefront to a live OAuth flow is a
        separate step, since it also needs a domain to configure as the redirect URI with each provider.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'google' && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-3xl mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900">Google</h2>
            <Toggle checked={google.enabled} onChange={(v) => setGoogleField('enabled', v)} label="Enabled" />
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Create an OAuth Client ID in Google Cloud Console → APIs &amp; Services → Credentials → Create
            Credentials → OAuth client ID (type: Web application). Add your storefront domain under Authorized
            JavaScript origins, and{' '}
            <code className="bg-gray-100 px-1 rounded">{'{your-backend-domain}'}/api/auth/google/callback</code> under
            Authorized redirect URIs.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Client ID</label>
              <input
                className="input w-full"
                placeholder="xxxxxxxxxx.apps.googleusercontent.com"
                value={google.clientId}
                onChange={(e) => setGoogleField('clientId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Client Secret</label>
              <input
                type="password"
                className="input w-full"
                placeholder={google.hasClientSecret ? google.clientSecretMasked : 'GOCSPX-xxxxxxxxxx'}
                value={google.clientSecret}
                onChange={(e) => setGoogleField('clientSecret', e.target.value)}
              />
              {google.hasClientSecret && (
                <p className="text-xs text-gray-400 mt-1">Currently saved: {google.clientSecretMasked}. Leave blank to keep it.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'facebook' && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-3xl mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900">Facebook</h2>
            <Toggle checked={facebook.enabled} onChange={(v) => setFacebookField('enabled', v)} label="Enabled" />
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Create an app at developers.facebook.com → My Apps → Create App (type: Consumer) → add the "Facebook
            Login" product. Add{' '}
            <code className="bg-gray-100 px-1 rounded">{'{your-backend-domain}'}/api/auth/facebook/callback</code>{' '}
            under Valid OAuth Redirect URIs.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">App ID</label>
              <input
                className="input w-full"
                placeholder="1234567890123456"
                value={facebook.appId}
                onChange={(e) => setFacebookField('appId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">App Secret</label>
              <input
                type="password"
                className="input w-full"
                placeholder={facebook.hasAppSecret ? facebook.appSecretMasked : 'Enter App Secret'}
                value={facebook.appSecret}
                onChange={(e) => setFacebookField('appSecret', e.target.value)}
              />
              {facebook.hasAppSecret && (
                <p className="text-xs text-gray-400 mt-1">Currently saved: {facebook.appSecretMasked}. Leave blank to keep it.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'apple' && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-3xl mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900">Apple</h2>
            <Toggle checked={apple.enabled} onChange={(v) => setAppleField('enabled', v)} label="Enabled" />
          </div>
          <p className="text-xs text-gray-500 mb-4">
            From Apple Developer → Certificates, Identifiers &amp; Profiles: create a Services ID (this is the Client
            ID), enable "Sign in with Apple" on it and register{' '}
            <code className="bg-gray-100 px-1 rounded">{'{your-backend-domain}'}/api/auth/apple/callback</code> as
            the return URL, then create a Sign in with Apple private key (.p8) under Keys.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Services ID (Client ID)</label>
              <input
                className="input w-full"
                placeholder="com.piaarya.web"
                value={apple.servicesId}
                onChange={(e) => setAppleField('servicesId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Team ID</label>
              <input
                className="input w-full"
                placeholder="ABCDE12345"
                value={apple.teamId}
                onChange={(e) => setAppleField('teamId', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Key ID</label>
              <input
                className="input w-full"
                placeholder="XYZ1234ABC"
                value={apple.keyId}
                onChange={(e) => setAppleField('keyId', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Private Key (.p8 file contents)</label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                placeholder={apple.hasPrivateKey ? apple.privateKeyMasked : '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'}
                value={apple.privateKey}
                onChange={(e) => setAppleField('privateKey', e.target.value)}
              />
              {apple.hasPrivateKey && (
                <p className="text-xs text-gray-400 mt-1">Currently saved: {apple.privateKeyMasked}. Leave blank to keep it.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
