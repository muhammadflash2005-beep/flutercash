import { createAuthClient } from '@neon/auth';

const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL;
const auth = createAuthClient(AUTH_URL);
const $ = (id) => document.getElementById(id);
const say = (message) => window.toast ? window.toast(message) : alert(message);
let activeEmail = '';
const nextScreen = () => localStorage.getItem('fluterTelegramStepDone') !== '1' ? 'telegram' : (localStorage.getItem('fluterOnboardingDone') !== '1' ? 'onboarding' : 'dashboard');

function friendly(error) {
  const message = error?.message || String(error || 'Something went wrong.');
  if (/invalid email or password|invalid credentials/i.test(message)) return 'Email or password is incorrect.';
  if (/already exists|user already exists/i.test(message)) return 'An account already exists with this email. Please sign in.';
  if (/not verified|email_not_verified/i.test(message)) return 'Please verify your email before signing in.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a moment and try again.';
  return message;
}
function busy(button, text) {
  if (!button) return () => {};
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = text;
  return () => { button.disabled = false; button.innerHTML = original; };
}
function applyUser(user) {
  if (!user) return;
  const name = user.name || (user.email || '').split('@')[0] || 'Member';
  if (typeof window.setFluterProfile === 'function') window.setFluterProfile({name, email: user.email || ''});
  if ($('profileEmail')) $('profileEmail').textContent = user.email || '';
  if ($('profileName')) $('profileName').textContent = name;
}
window.applyAuthenticatedUser = applyUser;

window.fluterAuth = {
  async signIn() {
    const email = $('loginEmail')?.value.trim();
    const password = $('loginPassword')?.value;
    if (!email || !password) return say('Enter your email and password.');
    const done = busy(document.querySelector('#signin form button[type="submit"]'), 'Signing in…');
    try {
      const result = await auth.signIn.email({ email, password });
      if (result.error) throw result.error;
      applyUser(result.data?.user);
      window.showScreen(nextScreen());
      say('Welcome back!');
    } catch (error) { say(friendly(error)); }
    finally { done(); }
  },
  async signUp() {
    const name = $('signupName')?.value.trim();
    const email = $('signupEmail')?.value.trim();
    const password = $('signupPassword')?.value;
    const phone = $('signupPhone')?.value.trim() || '';
    if (phone) localStorage.setItem('fluterPhone', phone);
    if (!localStorage.getItem('fluterMemberSince')) localStorage.setItem('fluterMemberSince', new Date().toLocaleDateString('en',{month:'long',year:'numeric'}));
    if (!name || !email || !password) return say('Complete all required fields.');
    if (password.length < 8) return say('Use a password with at least 8 characters.');
    const done = busy(document.querySelector('#signup form button[type="submit"]'), 'Creating account…');
    try {
      const result = await auth.signUp.email({ name, email, password });
      if (result.error) throw result.error;
      applyUser(result.data?.user);
      if (result.data?.user) {
        window.showScreen(nextScreen());
        say('Account created. Check your inbox if email verification is requested.');
      } else {
        say('Account created. Check your email to complete verification, then sign in.');
        window.showScreen('signin');
      }
    } catch (error) { say(friendly(error)); }
    finally { done(); }
  },
  async googleSignIn() {
    try {
      const result = await auth.signIn.social({ provider: 'google', callbackURL: window.location.origin + window.location.pathname });
      if (result?.error) throw result.error;
    } catch (error) { say(friendly(error)); }
  },
  async signOut() {
    try {
      const result = await auth.signOut();
      if (result?.error) throw result.error;
      window.showScreen('signin');
      say('You have signed out.');
    } catch (error) { say(friendly(error)); }
  },
  async forgotPassword() {
    const email = $('loginEmail')?.value.trim() || $('signupEmail')?.value.trim() || window.prompt('Enter the email address on your account:');
    if (!email) return;
    try {
      const result = await auth.requestPasswordReset({ email, redirectTo: window.location.origin + window.location.pathname });
      if (result?.error) throw result.error;
      say('If an account exists for that email, a password reset message has been sent.');
    } catch (error) { say(friendly(error)); }
  }
};

async function restore() {
  try {
    const result = await auth.getSession();
    if (result?.error) throw result.error;
    const user = result?.data?.user || result?.data?.session?.user;
    if (user) {
      applyUser(user);
      window.showScreen(nextScreen());
    } else {
      window.showScreen('signin');
    }
  } catch (error) {
    console.error('Session restore failed', error);
    window.showScreen('signin');
  }
}
window.addEventListener('DOMContentLoaded', () => setTimeout(restore, 1700));
