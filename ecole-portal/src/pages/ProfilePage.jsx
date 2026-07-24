import React, { useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import en from '../locales/en.json';

const ProfilePage = ({ language = 'fr' }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ firstname: '', username: '', email: '', adresse: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = sessionStorage.getItem('jwt_token');
  const userId = localStorage.getItem('userId');
  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('Utilisateur non connecte.');
      return;
    }

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(`${baseUrl}/api/users/${userId}/profile`, {
        headers: authHeaders,
      });

      if (!response.ok) {
        let backendMessage = '';
        try {
          backendMessage = (await response.text()).trim();
        } catch {
          // ignore body parse failure
        }
        const fallbackMessage = `${content.profile_load_error || 'Impossible de charger le profil'} (HTTP ${response.status})`;
        throw new Error(backendMessage || fallbackMessage);
      }

      const data = await response.json();
      setProfile(data);
      setProfileForm({
        firstname: data.firstname || '',
        username: data.username || '',
        email: data.email || '',
        adresse: data.adresse || '',
      });
    } catch (err) {
      setError(err.message || content.profile_load_error || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setMessage('');

      const response = await fetch(`${baseUrl}/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        throw new Error('Impossible de mettre a jour le profil');
      }

      const data = await response.json();
      setProfile(data);
      localStorage.setItem('LoggedIn', data.username || profileForm.username);
      setMessage('Profil mis a jour avec succes.');
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise a jour du profil');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setMessage('');

      const response = await fetch(`${baseUrl}/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(passwordForm),
      });

      if (!response.ok) {
        let backendMessage = 'Impossible de changer le mot de passe';
        try {
          backendMessage = await response.text();
        } catch {
          // ignore body parse failure
        }
        throw new Error(backendMessage);
      }

      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Mot de passe mis a jour avec succes.');
    } catch (err) {
      setError(err.message || 'Erreur lors du changement du mot de passe');
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Chargement du profil...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>Mon profil</h2>
      {error && <p style={{ color: '#c00' }}>{error}</p>}
      {message && <p style={{ color: '#0a7a2f' }}>{message}</p>}

      {!profile && !error && <p>Aucune information utilisateur disponible.</p>}

      {profile && (
        <>
          <form onSubmit={updateProfile} style={{ marginBottom: 30 }}>
            <h3>Informations personnelles</h3>
            <div style={{ marginBottom: 10 }}>
              <label>Prenom</label>
              <input
                type="text"
                value={profileForm.firstname}
                onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Nom utilisateur</label>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Adresse</label>
              <input
                type="text"
                value={profileForm.adresse}
                onChange={(e) => setProfileForm({ ...profileForm, adresse: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <button className="buttonStyle" type="submit">Enregistrer le profil</button>
          </form>

          <form onSubmit={changePassword}>
            <h3>Changer le mot de passe</h3>
            <div style={{ marginBottom: 10 }}>
              <label>Mot de passe actuel</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                minLength={6}
                required
                style={{ width: '100%' }}
              />
            </div>
            <button className="buttonStyle" type="submit">Changer le mot de passe</button>
          </form>
        </>
      )}
    </div>
  );
};

export default ProfilePage;

