/**
 * Shared Portfolio Interactivity & Logic
 * Used across index.html, resume.html, and project.html
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initContactForm();
  initProjectFilters();
  initProjectModal();
  initCopyEmail();
  initPrintButton();
});

/* ==========================================================================
   1. THEME TOGGLE (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Default to light (white background with red wording)
  let savedTheme = localStorage.getItem('portfolio-theme');
  if (!savedTheme || savedTheme === 'dark') {
    savedTheme = 'light';
    localStorage.setItem('portfolio-theme', 'light');
  }
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
  });
}

/* ==========================================================================
   2. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileNav() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (!mobileMenuBtn || !navLinks) return;

  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    mobileMenuBtn.classList.toggle('active', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close nav on click of any nav link
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      mobileMenuBtn.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   3. CONTACT FORM — SENDS REAL EMAIL VIA WEB3FORMS
   ========================================================================== */

// Each Web3Forms access key is tied to ONE inbox. Get a free key for each
// email at https://web3forms.com (enter the email, the key arrives in that
// inbox), then paste it below. Every message is sent to every inbox listed.
const CONTACT_CONFIG = {
  recipients: [
    { email: 'azavian10@icloud.com', accessKey: '673ecb6c-3028-4b7f-801e-40685e1a37a7' },
    { email: 'awil849@lsu.edu', accessKey: 'd491e284-d960-42f1-a360-2c5d8db84549' }
  ]
};

function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      Sending...
    `;

    const recipients = CONTACT_CONFIG.recipients.filter(
      r => r.accessKey && !r.accessKey.startsWith('PASTE_')
    );

    const sendTo = (recipient) =>
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: recipient.accessKey,
          subject: `Portfolio message from ${name}: ${subject}`,
          from_name: 'A\'Zavian Willis Portfolio',
          name: name,
          email: email,          // shown in the email so you can reply
          replyto: email,
          message: message
        })
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(`${recipient.email}: ${data.message || res.status}`);
        }
      });

    try {
      if (!recipients.length) throw new Error('No Web3Forms access keys set');

      const results = await Promise.allSettled(recipients.map(sendTo));
      const failures = results.filter(r => r.status === 'rejected');
      failures.forEach(f => console.error('Contact form error:', f.reason));

      if (failures.length === results.length) throw new Error('All sends failed');

      contactForm.reset();
      showToast('Thank you! Your message has been sent to A\'Zavian Willis.');
    } catch (err) {
      console.error('Contact form error:', err);
      // Fallback: open the visitor's own email app with everything filled in
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      const to = CONTACT_CONFIG.recipients.map(r => r.email).join(',');
      window.location.href =
        `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
      showToast('Opening your email app to finish sending...');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function showToast(message) {
  let toast = document.getElementById('portfolio-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portfolio-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================================================
   4. COPY EMAIL TO CLIPBOARD
   ========================================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.getAttribute('data-email') || 'awil849@lsu.edu';
    try {
      await navigator.clipboard.writeText(email);
      showToast(`Copied "${email}" to clipboard!`);
    } catch (err) {
      showToast(`Email: ${email}`);
    }
  });
}

/* ==========================================================================
   5. PROJECT FILTERING (PROJECT.HTML)
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue || category.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. PROJECT CASE STUDY MODAL (PROJECT.HTML)
   ========================================================================== */
const projectData = {
  'inventory-protocol': {
    title: 'Equipment Oversight & Rental Tracking Protocol',
    category: 'Operations & Information Systems',
    role: 'Manager, Triple A Rentals',
    stack: 'Inventory Systems, Excel/Spreadsheet Protocols, Asset Tracking, Compliance Checklists',
    image: 'assets/project_cloud.jpg',
    description: 'Developed a comprehensive equipment oversight protocol to accurately track rented machinery, monitor return dates, and ensure strict adherence to company compliance guidelines.',
    challenges: 'High rental turnover previously resulted in equipment tracking discrepancies and missing maintenance documentation across New Iberia operations.',
    solution: 'Designed and implemented standardized digital intake logs, daily status verification, and barcode-supported rental registries.',
    results: 'Noticeably reduced rental error rates, improved accountability, and ensured 100% compliance with corporate oversight standards.'
  },
  'financial-budgeting': {
    title: 'Financial Tracking & Monthly Budget Reconciliation System',
    category: 'Finance & Systems',
    role: 'Manager, Triple A Rentals',
    stack: 'Financial Tracking, Budgeting Models, Ledger Systems, Discrepancy Auditing',
    image: 'assets/project_ai.jpg',
    description: 'Formulated a structured financial tracking system to manage operational expenses, rental income flows, and multi-channel customer billing.',
    challenges: 'Monthly financial reports had variances between projected rental revenue and actual bank reconciliations.',
    solution: 'Introduced an automated end-of-day ledger reconciliation process, catching discrepancies early and establishing verifiable budgeting checkpoints.',
    results: 'Substantially reduced discrepancies in monthly reports, ensuring accurate departmental budgeting and reliable forecasting.'
  },
  'pos-data-integrity': {
    title: 'Data Entry Operations & Restaurant Workflow Optimization',
    category: 'Data Integrity & Operations',
    role: 'Area Manager, McDonalds',
    stack: 'POS Systems, Data Entry Auditing, Quality Checks, Workflow Analytics',
    image: 'assets/project_studio.jpg',
    description: 'Directed cross-shift data entry and order processing operations, optimizing touchpoint speeds and strictly enforcing company data protection guidelines.',
    challenges: 'Peak rush periods caused data logging bottlenecks and occasional inventory order entry delays.',
    solution: 'Analyzed hourly workflow bottlenecks, implemented routine quality check gates, and mentored shift members in speed-optimized terminal entry.',
    results: 'Accelerated order accuracy and speed across the restaurant while maintaining pristine data integrity and compliance.'
  }
};

function initProjectModal() {
  const modalOverlay = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const triggerBtns = document.querySelectorAll('.open-case-study');

  if (!modalOverlay) return;

  function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-role').textContent = data.role;
    document.getElementById('modal-stack').textContent = data.stack;
    document.getElementById('modal-image').src = data.image;
    document.getElementById('modal-image').alt = data.title;
    document.getElementById('modal-desc').textContent = data.description;
    document.getElementById('modal-challenges').textContent = data.challenges;
    document.getElementById('modal-solution').textContent = data.solution;
    document.getElementById('modal-results').textContent = data.results;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project');
      openModal(projectId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   7. PRINT RESUME (RESUME.HTML)
   ========================================================================== */
function initPrintButton() {
  const printBtn = document.getElementById('print-resume-btn');
  if (!printBtn) return;

  printBtn.addEventListener('click', () => {
    window.print();
  });
}