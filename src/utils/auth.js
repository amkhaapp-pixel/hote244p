export function clearAuthSession() {
  localStorage.removeItem('user');
  localStorage.removeItem('adminUser');
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  window.dispatchEvent(new Event('authchange'));
}
