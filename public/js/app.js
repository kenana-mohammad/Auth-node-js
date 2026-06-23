/* FreshBite — Multi-page SPA */

const App = {
  user: null,
  currentRoute: '/',

  init() {
    this.bindGlobalEvents();
    this.checkAuth().then(() => this.router());
    window.addEventListener('hashchange', () => this.router());
  },

  bindGlobalEvents() {
    document.getElementById('nav-toggle').addEventListener('click', () => {
      const nav = document.getElementById('main-nav');
      const open = nav.classList.toggle('open');
      document.getElementById('nav-toggle').setAttribute('aria-expanded', open);
    });

    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });

    document.querySelectorAll('.nav-link, .brand').forEach(el => {
      el.addEventListener('click', () => {
        document.getElementById('main-nav').classList.remove('open');
      });
    });
  },

  async checkAuth() {
    const res = await API.auth.profile();
    if (res.ok && res.data?.profile) {
      this.user = res.data.profile;
      document.body.classList.add('authenticated');
      // Add is-admin class if user is resturant-owner
      if (this.user.role === 'resturant-owner') {
        document.body.classList.add('is-admin');
      } else {
        document.body.classList.remove('is-admin');
      }
    } else {
      this.user = null;
      document.body.classList.remove('authenticated');
      document.body.classList.remove('is-admin');
    }
  },

  async handleLogout() {
    await API.auth.logout();
    this.user = null;
    document.body.classList.remove('authenticated');
    document.body.classList.remove('is-admin');
    toast('Signed out successfully', 'success');
    location.hash = '#/login';
  },

  router() {
    const hash = location.hash.slice(1) || '/';
    const segments = hash.split('/').filter(Boolean);
    const route = segments.length ? `/${segments[0]}` : '/';
    const param = segments[1] || null;

    this.currentRoute = route;
    this.updateNav(route);

    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading...</p></div>';

    if (route === '/user' && param) {
      this.guard(() => Pages.userDetail(param));
      return;
    }

    const routes = {
      '/': () => Pages.home(),
      '/login': () => Pages.login(),
      '/register': () => Pages.register(),
      '/profile': () => this.guard(Pages.profile),
      '/items': () => Pages.items(),
      '/items-new': () => this.guardAdmin(Pages.addItem),
      '/users': () => this.guardAdmin(Pages.users),
      '/uploads': () => this.guardAdmin(Pages.uploads)
    };

    const handler = routes[route];
    if (handler) {
      handler();
    } else {
      main.innerHTML = `<div class="container empty-state"><div class="empty-state-icon">🔍</div><h2>Page not found</h2><p>The page you're looking for doesn't exist.</p><a href="#/" class="btn btn-primary" style="margin-top:1rem">Go Home</a></div>`;
    }
  },

  guard(pageFn) {
    if (!this.user) {
      toast('Please sign in to continue', 'warning');
      location.hash = '#/login';
      return;
    }
    pageFn();
  },

  guardAdmin(pageFn) {
    if (!this.user) {
      toast('Please sign in to continue', 'warning');
      location.hash = '#/login';
      return;
    }
    if (this.user.role !== 'resturant-owner') {
      toast('Admin access required', 'error');
      location.hash = '#/';
      return;
    }
    pageFn();
  },

  updateNav(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const r = link.dataset.route;
      link.classList.toggle('active', r === route || (route === '/items-new' && r === '/items'));
    });
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },

  openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml || '';
    document.getElementById('modal-overlay').classList.remove('hidden');
  }
};

const Pages = {
  async home() {
    const main = document.getElementById('main-content');
    const [healthRes, itemsRes, usersRes] = await Promise.all([
      API.health(),
      API.items.getAll(),
      API.users.getAll()
    ]);

    const items = itemsRes.ok ? (itemsRes.data?.data || []) : [];
    const users = usersRes.ok ? (usersRes.data || []) : [];
    const healthy = healthRes.ok;

    main.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <span class="hero-badge">✦ Fresh &amp; Delicious</span>
            <h1>Taste the <em>FreshBite</em> difference</h1>
            <p class="hero-desc">Browse our curated menu, manage your community, and upload media — all in one beautiful platform connected to your API.</p>
            <div class="hero-actions">
              <a href="#/items" class="btn btn-primary">Explore Menu</a>
              ${App.user
                ? `<a href="#/profile" class="btn btn-outline">My Account</a>`
                : `<a href="#/register" class="btn btn-outline">Create Account</a>`}
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-card"><div class="hero-card-icon">🥗</div><h3>Fresh Items</h3><p>Browse and add menu items</p></div>
            <div class="hero-card"><div class="hero-card-icon">👥</div><h3>User Management</h3><p>Full CRUD for your users</p></div>
            <div class="hero-card"><div class="hero-card-icon">📤</div><h3>Media Uploads</h3><p>Local &amp; cloud storage</p></div>
          </div>
        </div>
      </section>
      <section class="container">
        <div class="stats-row">
          <div class="stat-card ${healthy ? 'healthy' : ''}">
            <div class="stat-value">${healthy ? '●' : '○'}</div>
            <div class="stat-label">API ${healthy ? 'Online' : 'Offline'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${items.length}</div>
            <div class="stat-label">Menu Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${users.length}</div>
            <div class="stat-label">Registered Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${App.user ? '✓' : '—'}</div>
            <div class="stat-label">${App.user ? `Signed in as ${escapeHtml(App.user.name)}` : 'Guest Session'}</div>
          </div>
        </div>
        ${items.length ? `
          <div class="page-header"><h1>Featured Items</h1><p>A taste of what's on the menu right now.</p></div>
          <div class="grid-3">${items.slice(0, 3).map(item => itemCard(item)).join('')}</div>
          ${items.length > 3 ? `<div style="text-align:center;margin-top:2rem"><a href="#/items" class="btn btn-secondary">View Full Menu</a></div>` : ''}
        ` : ''}
      </section>`;
  },

  login() {
    if (App.user) { location.hash = '#/profile'; return; }

    document.getElementById('main-content').innerHTML = `
      <div class="container form-section">
        <div class="form-card">
          <h2>Welcome back</h2>
          <p class="form-subtitle">Sign in to your FreshBite account</p>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" required placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" required placeholder="Your password" autocomplete="current-password">
              <p class="form-hint">Min 8 chars, 2 lowercase, 1 uppercase, 1 number, 1 symbol</p>
            </div>
            <div id="login-error"></div>
            <button type="submit" class="btn btn-primary btn-block" id="login-submit">Sign In</button>
          </form>
          <p class="form-footer">Don't have an account? <a href="#/register">Create one</a></p>
        </div>
      </div>`;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-submit');
      const errEl = document.getElementById('login-error');
      errEl.innerHTML = '';
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      const res = await API.auth.login({
        email: document.getElementById('login-email').value.trim(),
        password: document.getElementById('login-password').value
      });

      btn.disabled = false;
      btn.textContent = 'Sign In';

      if (res.ok) {
        App.user = res.data.user;
        document.body.classList.add('authenticated');
        toast('Welcome back!', 'success');
        location.hash = '#/profile';
      } else {
        errEl.innerHTML = `<div class="error-banner">${escapeHtml(parseError(res.data))}</div>`;
      }
    });
  },

  register() {
    if (App.user) { location.hash = '#/profile'; return; }

    document.getElementById('main-content').innerHTML = `
      <div class="container form-section">
        <div class="form-card">
          <h2>Join FreshBite</h2>
          <p class="form-subtitle">Create your account and start exploring</p>
          <form id="register-form">
            <div class="form-group">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" required placeholder="John Doe" minlength="2" maxlength="100">
            </div>
            <div class="form-group">
              <label for="reg-email">Email</label>
              <input type="email" id="reg-email" required placeholder="you@example.com">
            </div>
            <div class="form-group">
              <label for="reg-phone">Phone</label>
              <input type="tel" id="reg-phone" required placeholder="+1234567890">
            </div>
            <div class="form-group">
              <label for="reg-password">Password</label>
              <input type="password" id="reg-password" required placeholder="Strong password">
              <p class="form-hint">Min 8 chars, 2 lowercase, 1 uppercase, 1 number, 1 symbol</p>
            </div>
            <div id="register-error"></div>
            <button type="submit" class="btn btn-primary btn-block" id="register-submit">Create Account</button>
          </form>
          <p class="form-footer">Already have an account? <a href="#/login">Sign in</a></p>
        </div>
      </div>`;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-submit');
      const errEl = document.getElementById('register-error');
      errEl.innerHTML = '';
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      const res = await API.auth.register({
        name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        password: document.getElementById('reg-password').value
      });

      btn.disabled = false;
      btn.textContent = 'Create Account';

      if (res.ok) {
        toast('Account created! Please sign in.', 'success');
        location.hash = '#/login';
      } else {
        errEl.innerHTML = `<div class="error-banner">${escapeHtml(parseError(res.data))}</div>`;
      }
    });
  },

  async profile() {
    const main = document.getElementById('main-content');
    const res = await API.auth.profile();

    if (!res.ok) {
      App.user = null;
      document.body.classList.remove('authenticated');
      location.hash = '#/login';
      return;
    }

    const user = res.data.profile;
    App.user = user;

    main.innerHTML = `
      <div class="container">
        <div class="page-header"><h1>My Account</h1><p>Manage your profile and account settings.</p></div>
        <div class="profile-layout">
          <aside class="profile-sidebar">
            <div class="profile-avatar">${getInitials(user.name)}</div>
            <h2>${escapeHtml(user.name)}</h2>
            <p style="color:var(--text-muted);font-size:0.875rem">${escapeHtml(user.email)}</p>
            <span class="profile-role">${escapeHtml(user.role || 'customer')}</span>
          </aside>
          <div class="profile-details">
            <h3 style="margin-bottom:1.25rem;font-size:1.125rem">Account Details</h3>
            <div class="detail-row"><span class="detail-label">Full Name</span><span class="detail-value">${escapeHtml(user.name)}</span></div>
            <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(user.email)}</span></div>
            <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(user.phone || '—')}</span></div>
            <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value"><span class="role-badge ${escapeHtml(user.role)}">${escapeHtml(user.role || 'customer')}</span></span></div>
            <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${escapeHtml(user.address || '—')}</span></div>
            <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${escapeHtml(user.realtimelocation || '—')}</span></div>
            <div class="detail-row"><span class="detail-label">Available</span><span class="detail-value">${user.available !== false ? 'Yes' : 'No'}</span></div>
            <div class="detail-row"><span class="detail-label">Member Since</span><span class="detail-value">${formatDate(user.createdAt)}</span></div>
            <div style="margin-top:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap">
              <a href="#/user/${user._id}" class="btn btn-outline btn-sm">Edit Profile</a>
              <button class="btn btn-outline btn-sm" id="refresh-token-btn">Refresh Token</button>
              ${user.role === 'admin' ? `<button class="btn btn-secondary btn-sm" id="admin-test-btn">Test Admin API</button>` : ''}
            </div>
            <div id="profile-action-result" style="margin-top:1rem"></div>
          </div>
        </div>
      </div>`;

    document.getElementById('refresh-token-btn')?.addEventListener('click', async () => {
      const r = await API.auth.refresh();
      const el = document.getElementById('profile-action-result');
      if (r.ok) {
        el.innerHTML = '<div class="upload-result">Token refreshed successfully</div>';
        toast('Session refreshed', 'success');
      } else {
        el.innerHTML = `<div class="error-banner">${escapeHtml(parseError(r.data))}</div>`;
      }
    });

    document.getElementById('admin-test-btn')?.addEventListener('click', async () => {
      const r = await API.users.adminTest();
      const el = document.getElementById('profile-action-result');
      if (r.ok) {
        el.innerHTML = '<div class="upload-result">Admin endpoint verified ✓</div>';
        toast('Admin access confirmed', 'success');
      } else {
        el.innerHTML = `<div class="error-banner">${escapeHtml(parseError(r.data))}</div>`;
      }
    });
  },

  async items() {
    const main = document.getElementById('main-content');
    const res = await API.items.getAll();
    const items = res.ok ? (res.data?.data || []) : [];
    const isAdmin = App.user?.role === 'resturant-owner';

    main.innerHTML = `
      <div class="container">
        <div class="page-toolbar">
          <div class="page-header" style="margin:0">
            <h1>Our Menu</h1>
            <p>Discover fresh items from our kitchen.</p>
          </div>
          ${isAdmin ? `<a href="#/items-new" class="btn btn-primary">+ Add Item</a>` : ''}
        </div>
        ${!res.ok ? `<div class="error-banner">${escapeHtml(parseError(res.data))}</div>` : ''}
        ${items.length
          ? `<div class="grid-3" id="items-grid">${items.map(item => itemCard(item)).join('')}</div>`
          : `<div class="empty-state"><div class="empty-state-icon">🍽</div><h2>No items yet</h2><p>${isAdmin ? 'Be the first to add something delicious.' : 'No items available yet.'}</p>${isAdmin ? `<a href="#/items-new" class="btn btn-primary" style="margin-top:1rem">Add First Item</a>` : ''}</div>`}
      </div>`;
  },

  addItem() {
    document.getElementById('main-content').innerHTML = `
      <div class="container">
        <div class="page-header"><h1>Add Menu Item</h1><p>Create a new item for the menu. Upload an image first or paste a URL.</p></div>
        <div class="grid-2" style="align-items:start">
          <div class="form-card">
            <form id="add-item-form">
              <div class="form-group">
                <label for="item-title">Title</label>
                <input type="text" id="item-title" required placeholder="e.g. Grilled Salmon">
              </div>
              <div class="form-group">
                <label for="item-image">Image URL</label>
                <input type="text" id="item-image" placeholder="Paste URL or upload below">
                <p class="form-hint">Upload a file on the right, then the URL will fill automatically.</p>
              </div>
              <div id="item-preview" style="margin-bottom:1rem"></div>
              <div id="item-error"></div>
              <button type="submit" class="btn btn-primary btn-block">Add to Menu</button>
            </form>
          </div>
          <div class="card card-body">
            <h3 class="card-title">Quick Upload</h3>
            <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1rem">Upload locally to get an image path for this item.</p>
            <div class="upload-zone" id="item-upload-zone">
              <div class="upload-zone-icon">📷</div>
              <p>Drop image here or <strong>browse</strong></p>
              <input type="file" id="item-file-input" accept="image/*" hidden>
            </div>
            <div id="item-upload-result"></div>
          </div>
        </div>
      </div>`;

    setupUploadZone('item-upload-zone', 'item-file-input', 'item-upload-result', (url) => {
      document.getElementById('item-image').value = url;
      document.getElementById('item-preview').innerHTML = `<img src="${escapeHtml(url)}" alt="Preview" style="max-width:100%;border-radius:8px;max-height:180px">`;
    });

    document.getElementById('item-image').addEventListener('input', (e) => {
      const url = e.target.value.trim();
      document.getElementById('item-preview').innerHTML = url
        ? `<img src="${escapeHtml(url)}" alt="Preview" style="max-width:100%;border-radius:8px;max-height:180px" onerror="this.style.display='none'">`
        : '';
    });

    document.getElementById('add-item-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      const errEl = document.getElementById('item-error');
      errEl.innerHTML = '';
      btn.disabled = true;

      const body = { title: document.getElementById('item-title').value.trim() };
      const img = document.getElementById('item-image').value.trim();
      if (img) body.image = img;

      const res = await API.items.create(body);
      btn.disabled = false;

      if (res.ok) {
        toast('Item added to menu!', 'success');
        location.hash = '#/items';
      } else {
        errEl.innerHTML = `<div class="error-banner">${escapeHtml(parseError(res.data))}</div>`;
      }
    });
  },

  async users() {
    const main = document.getElementById('main-content');
    const res = await API.users.getAll();
    const users = res.ok ? (res.data || []) : [];

    main.innerHTML = `
      <div class="container">
        <div class="page-toolbar">
          <div class="page-header" style="margin:0">
            <h1>Users</h1>
            <p>Manage all registered users in the platform.</p>
          </div>
          <div style="display:flex;gap:0.75rem;align-items:center">
            <div class="search-box">
              <span>🔍</span>
              <input type="search" id="user-search" placeholder="Search users...">
            </div>
            ${App.user ? `<button class="btn btn-primary btn-sm" id="add-user-btn">+ Add User</button>` : ''}
          </div>
        </div>
        ${!res.ok ? `<div class="error-banner">${escapeHtml(parseError(res.data))}</div>` : ''}
        ${users.length ? `
          <div class="table-wrap">
            <table class="data-table" id="users-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>${users.map(u => userRow(u)).join('')}</tbody>
            </table>
          </div>` : `<div class="empty-state"><div class="empty-state-icon">👥</div><h2>No users found</h2></div>`}
      </div>`;

    document.getElementById('user-search')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#users-table tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    document.getElementById('add-user-btn')?.addEventListener('click', () => Pages.showAddUserModal());

    main.querySelectorAll('[data-delete-user]').forEach(btn => {
      btn.addEventListener('click', () => Pages.confirmDeleteUser(btn.dataset.deleteUser, btn.dataset.userName));
    });
  },

  async userDetail(id) {
    const main = document.getElementById('main-content');
    const res = await API.users.getById(id);

    if (!res.ok) {
      main.innerHTML = `<div class="container"><div class="error-banner">${escapeHtml(parseError(res.data))}</div><a href="#/users" class="btn btn-outline">← Back to Users</a></div>`;
      return;
    }

    const user = res.data;

    main.innerHTML = `
      <div class="container">
        <a href="#/users" style="color:var(--text-muted);text-decoration:none;font-size:0.875rem;display:inline-block;margin-bottom:1rem">← Back to Users</a>
        <div class="page-header"><h1>Edit User</h1><p>Update user information for ${escapeHtml(user.name)}.</p></div>
        <div class="form-card" style="max-width:560px">
          <form id="edit-user-form">
            <div class="form-row">
              <div class="form-group"><label>Name</label><input type="text" id="edit-name" value="${escapeHtml(user.name)}" required></div>
              <div class="form-group"><label>Phone</label><input type="tel" id="edit-phone" value="${escapeHtml(user.phone || '')}"></div>
            </div>
            <div class="form-group"><label>Email</label><input type="email" id="edit-email" value="${escapeHtml(user.email)}" required></div>
            <div class="form-group"><label>Password</label><input type="password" id="edit-password" placeholder="Leave blank to keep current"></div>
            <div class="form-group"><label>Address</label><input type="text" id="edit-address" value="${escapeHtml(user.address || '')}"></div>
            <div class="form-group"><label>Real-time Location</label><input type="text" id="edit-location" value="${escapeHtml(user.realtimelocation || '')}"></div>
            <div id="edit-user-error"></div>
            <div style="display:flex;gap:0.75rem">
              <button type="submit" class="btn btn-primary">Save Changes</button>
              <button type="button" class="btn btn-danger btn-sm" id="delete-this-user">Delete User</button>
            </div>
          </form>
        </div>
      </div>`;

    document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        name: document.getElementById('edit-name').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        phone: document.getElementById('edit-phone').value.trim(),
        address: document.getElementById('edit-address').value.trim(),
        realtimelocation: document.getElementById('edit-location').value.trim()
      };
      const pw = document.getElementById('edit-password').value;
      if (pw) body.password = pw;

      const r = await API.users.update(id, body);
      const errEl = document.getElementById('edit-user-error');
      if (r.ok) {
        toast('User updated', 'success');
        if (App.user && App.user._id === id) await App.checkAuth();
        location.hash = '#/users';
      } else {
        errEl.innerHTML = `<div class="error-banner">${escapeHtml(parseError(r.data))}</div>`;
      }
    });

    document.getElementById('delete-this-user').addEventListener('click', () => {
      Pages.confirmDeleteUser(id, user.name);
    });
  },

  showAddUserModal() {
    App.openModal('Add New User', `
      <form id="modal-add-user">
        <div class="form-group"><label>Name</label><input type="text" id="modal-name" required></div>
        <div class="form-group"><label>Email</label><input type="email" id="modal-email" required></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="modal-phone" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="modal-password" required></div>
        <div class="form-group"><label>Address</label><input type="text" id="modal-address"></div>
        <div id="modal-user-error"></div>
      </form>`,
      `<button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
       <button class="btn btn-primary" id="modal-save-user">Create User</button>`
    );

    document.getElementById('modal-save-user').addEventListener('click', async () => {
      const res = await API.users.create({
        name: document.getElementById('modal-name').value.trim(),
        email: document.getElementById('modal-email').value.trim(),
        phone: document.getElementById('modal-phone').value.trim(),
        password: document.getElementById('modal-password').value,
        address: document.getElementById('modal-address').value.trim()
      });
      if (res.ok) {
        App.closeModal();
        toast('User created', 'success');
        Pages.users();
      } else {
        document.getElementById('modal-user-error').innerHTML = `<div class="error-banner">${escapeHtml(parseError(res.data))}</div>`;
      }
    });
  },

  confirmDeleteUser(id, name) {
    App.openModal('Delete User', `<p>Are you sure you want to delete <strong>${escapeHtml(name)}</strong>? This action cannot be undone.</p>`,
      `<button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
       <button class="btn btn-danger" id="confirm-delete-user">Delete</button>`
    );

    document.getElementById('confirm-delete-user').addEventListener('click', async () => {
      const res = await API.users.delete(id);
      App.closeModal();
      if (res.ok) {
        toast('User deleted', 'success');
        if (location.hash.includes('/user/')) location.hash = '#/users';
        else Pages.users();
      } else {
        toast(parseError(res.data), 'error');
      }
    });
  },

  uploads() {
    document.getElementById('main-content').innerHTML = `
      <div class="container">
        <div class="page-header"><h1>Media Uploads</h1><p>Upload files to local storage or Cloudinary cloud.</p></div>
        <div class="upload-grid">
          <div class="card card-body">
            <h3 class="card-title">📁 Local Upload</h3>
            <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1rem">Save files to the server uploads folder.</p>
            <div class="upload-zone" id="local-upload-zone">
              <div class="upload-zone-icon">⬆️</div>
              <p>Drop file here or <strong>browse</strong></p>
              <input type="file" id="local-file-input" hidden>
            </div>
            <div id="local-upload-result"></div>
          </div>
          <div class="card card-body">
            <h3 class="card-title">☁️ Cloudinary Upload</h3>
            <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1rem">Upload directly to Cloudinary CDN.</p>
            <div class="upload-zone" id="cloud-upload-zone">
              <div class="upload-zone-icon">🌐</div>
              <p>Drop file here or <strong>browse</strong></p>
              <input type="file" id="cloud-file-input" hidden>
            </div>
            <div id="cloud-upload-result"></div>
          </div>
        </div>
      </div>`;

    setupUploadHandler('local-upload-zone', 'local-file-input', 'local-upload-result', API.uploads.local);
    setupUploadHandler('cloud-upload-zone', 'cloud-file-input', 'cloud-upload-result', API.uploads.external);
  }
};

function itemCard(item) {
  const imgUrl = resolveImageUrl(item.image);
  return `
    <article class="item-card">
      <div class="item-card-image">
        ${imgUrl
          ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.title)}" loading="lazy">`
          : `<span class="placeholder">🍽</span>`}
      </div>
      <div class="item-card-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="item-card-meta">Added ${formatDate(item.createdAt)}</p>
      </div>
    </article>`;
}

function userRow(user) {
  return `
    <tr>
      <td><strong>${escapeHtml(user.name)}</strong></td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.phone || '—')}</td>
      <td><span class="role-badge ${escapeHtml(user.role)}">${escapeHtml(user.role || 'customer')}</span></td>
      <td>${formatDate(user.createdAt)}</td>
      <td class="table-actions">
        <a href="#/user/${user._id}" class="icon-btn">Edit</a>
        <button class="icon-btn danger" data-delete-user="${user._id}" data-user-name="${escapeHtml(user.name)}">Delete</button>
      </td>
    </tr>`;
}

function setupUploadZone(zoneId, inputId, resultId, onSuccess) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0], resultId, API.uploads.local, onSuccess);
  });
  input.addEventListener('change', () => {
    if (input.files[0]) uploadFile(input.files[0], resultId, API.uploads.local, onSuccess);
  });
}

function setupUploadHandler(zoneId, inputId, resultId, uploadFn) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0], resultId, uploadFn);
  });
  input.addEventListener('change', () => {
    if (input.files[0]) uploadFile(input.files[0], resultId, uploadFn);
  });
}

async function uploadFile(file, resultId, uploadFn, onSuccess) {
  const el = document.getElementById(resultId);
  el.innerHTML = '<div class="upload-preview">Uploading...</div>';

  const res = await uploadFn(file);
  if (res.ok) {
    const path = res.data.path;
    const url = resolveImageUrl(typeof path === 'string' ? path : path?.path || path);
    el.innerHTML = `
      <div class="upload-result">
        <strong>Upload successful!</strong>
        <p style="margin-top:0.5rem;word-break:break-all">${escapeHtml(typeof path === 'string' ? path : JSON.stringify(path))}</p>
        ${url && file.type.startsWith('image/') ? `<img src="${escapeHtml(url)}" alt="Uploaded">` : ''}
      </div>`;
    toast('File uploaded', 'success');
    if (onSuccess && url) onSuccess(url);
  } else {
    el.innerHTML = `<div class="error-banner">${escapeHtml(parseError(res.data))}</div>`;
    toast('Upload failed', 'error');
  }
}

function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => App.init());
