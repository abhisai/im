const currentPath = location.pathname.toLowerCase();
if (currentPath.includes('compare')) {
  const comparisonStyles = document.createElement('link');
  comparisonStyles.rel = 'stylesheet';
  comparisonStyles.href = 'comparison-overrides.css';
  document.head.appendChild(comparisonStyles);
  document.querySelector('.page-hero > p:last-child')?.replaceChildren(document.createTextNode('Compare verified product highlights where official insurer information is available. For current premiums and eligibility, request a personalised quote.'));
  document.querySelector('.disclaimer')?.remove();
  const table = document.querySelector('.table-wrap');
  const title = document.querySelector('#table-title');
  const note = document.querySelector('#table-note');
  const verifiedComparisons = {
    term: {
      title: 'Term Insurance Plans',
      note: 'Term premiums and benefits depend on age, health, income, cover amount, and underwriting. Get a current quote from our advisors.',
      rows: []
    },
    health: {
      title: 'Verified Health Insurance Highlights',
      note: 'Highlights checked against current insurer product pages. Benefits, eligibility, exclusions, and availability remain subject to policy wording.',
      rows: [
        ['HDFC ERGO', 'Optima Secure', '4X coverage at no additional cost', '16,000+ cashless healthcare network', 'Procedure and disposable cost coverage'],
        ['ICICI Lombard', 'Health AdvantEdge', 'Pre/post hospitalisation: 60 / 180 days', '13,000+ network hospitals', '24x7 customer support'],
        ['Aditya Birla Health', 'Activ One MAX / NXT', 'HealthReturns up to 100% of premium', '16,500 cashless hospitals', 'No capping and reload benefits']
      ]
    },
    travel: {
      title: 'Verified Travel Insurance Highlights',
      note: 'Highlights checked against current insurer product pages. Coverage, limits, destinations, and exclusions remain subject to policy wording.',
      rows: [
        ['HDFC ERGO', 'Travel Insurance / Explorer', '175+ countries', '24x7 global assistance', 'Medical, baggage, passport, delay, and cancellation cover'],
        ['Digit', 'International Travel Insurance: Smart / Smart 360', '150+ countries and islands', '24x7 travel assistance', 'Medical, baggage, passport, trip cancellation, and flight delay cover'],
        ['ICICI Lombard', 'TripSecure+', 'Up to $5,000,000 sum insured', '24x7 global support', 'Medical, baggage, passport, trip disruption, and add-on covers']
      ]
    }
  };
  const renderVerifiedComparison = type => {
    const data = verifiedComparisons[type];
    if (!data || !title || !note || !table) return;
    title.textContent = data.title;
    note.textContent = data.note;
    if (!data.rows.length) {
      table.innerHTML = '<div class="comparison-empty"><h3>Current term plan details require a personalised quote</h3><p>Term insurance pricing and eligibility depend on personal underwriting factors. Our advisors will compare current insurer documents for your profile.</p><a class="btn btn-primary" href="contact.html">Get Personalised Advice</a></div>';
      return;
    }
    table.innerHTML = `<table><thead><tr><th>Provider</th><th>Product</th><th>Verified detail</th><th>Support / network</th><th>Highlights</th><th></th></tr></thead><tbody>${data.rows.map(row => `<tr><td><b>${row[0]}</b></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td><a href="contact.html">Get Quote</a></td></tr>`).join('')}</tbody></table>`;
  };
  renderVerifiedComparison('term');
  const tabGroup = document.querySelector('.tabs');
  if (tabGroup) {
    const cleanTabGroup = tabGroup.cloneNode(true);
    tabGroup.replaceWith(cleanTabGroup);
    cleanTabGroup.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => renderVerifiedComparison(tab.dataset.type)));
  }
}
const logoStyles = document.createElement('link');
logoStyles.rel = 'stylesheet';
logoStyles.href = 'logo-overrides.css';
document.head.appendChild(logoStyles);
document.querySelectorAll('.brand, .footer-brand').forEach(brand => {
  brand.innerHTML = '<img src="logo.svg" alt="Insurance Mentors">';
});
const removedInsurerNames = /\b(LIC|Kotak Life|SBI(?: Life)?)\b/g;
const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
const textNodes = [];
while (textWalker.nextNode()) textNodes.push(textWalker.currentNode);
textNodes.forEach(node => { node.nodeValue = node.nodeValue.replace(removedInsurerNames, ''); });
document.querySelectorAll('.reasons p').forEach(node => { if (node.textContent.includes('HDFC') || node.textContent.trim().startsWith(',')) node.textContent = 'We compare leading insurance providers to help you choose with confidence.'; });
const adviceLink = document.querySelector('.nav-cta');
if (adviceLink) {
  adviceLink.href = 'https://wa.me/918125252378?text=Hi%20Team%2C%20looking%20for%20insurance%20advice%20';
  adviceLink.target = '_blank';
  adviceLink.rel = 'noopener';
}
if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) heroTitle.innerHTML = 'Insurance choices,<br><em>made for real life.</em>';
  const heroText = document.querySelector('.hero-copy > p');
  if (heroText) heroText.textContent = 'Clear, personal guidance for health and term insurance—so you can understand your options and protect what matters.';
  const heroBadge = document.querySelector('.hero .badge');
  if (heroBadge) heroBadge.innerHTML = '<span class="badge-dot"></span> Independent insurance guidance';
  const heroActions = document.querySelector('.hero .actions');
  if (heroActions) {
    heroActions.innerHTML = '<a class="btn btn-primary" href="contact.html">Review my insurance <span aria-hidden="true">→</span></a><a class="btn btn-outline" href="compare.html">Explore plans</a>';
  }
  document.querySelector('.hero')?.insertAdjacentHTML('beforeend', `
    <div class="hero-panel modern-hero-hub" aria-label="Insurance Mentors advisory overview">
      <div class="hero-hub-header">
        <span class="hub-live-tag"><span class="hub-pulse"></span> Active Advisory Desk</span>
        <span class="hub-reg-tag">IRDAI Certified</span>
      </div>

      <div class="hero-hub-body">
        <div class="hub-title-row">
          <h3>Independent Policy Audit</h3>
          <p>We check the hidden fine-print so hospital claims are paid in full.</p>
        </div>

        <div class="hub-tab-switcher" role="tablist">
          <button type="button" class="hub-tab active" data-tab="health">🏥 Health Cover</button>
          <button type="button" class="hub-tab" data-tab="term">🛡️ Term Cover</button>
        </div>

        <div class="hub-check-list" id="hub-health-list">
          <div class="hub-check-item">
            <span class="hub-check-icon good">✓</span>
            <div>
              <strong>Room Rent Capping Audit</strong>
              <small>Prevent 30%–40% proportionate cuts on hospital bills</small>
            </div>
          </div>
          <div class="hub-check-item">
            <span class="hub-check-icon good">✓</span>
            <div>
              <strong>Consumables & PPE Coverage</strong>
              <small>Ensure medical supplies (gloves, syringes) are paid</small>
            </div>
          </div>
          <div class="hub-check-item">
            <span class="hub-check-icon good">✓</span>
            <div>
              <strong>Restoration & No-Claim Bonus</strong>
              <small>100% refill when major hospital treatments occur</small>
            </div>
          </div>
        </div>

        <div class="hub-check-list" id="hub-term-list" hidden>
          <div class="hub-check-item">
            <span class="hub-check-icon good">✓</span>
            <div>
              <strong>True Income Cover (15x–20x)</strong>
              <small>Calculated against inflation, loans, and family goals</small>
            </div>
          </div>
          <div class="hub-check-item">
            <span class="hub-check-icon good">✓</span>
            <div>
              <strong>Official Claim Settlement (CSR)</strong>
              <small>Verified from IRDAI 2023–24 official records</small>
            </div>
          </div>
          <div class="hub-check-item">
            <span class="hub-check-icon good">✓</span>
            <div>
              <strong>Critical Illness & Waiver Rider</strong>
              <small>Income security if diagnosis prevents active work</small>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-hub-footer">
        <div class="hub-trust-note">
          <span class="hub-trust-icon">🛡️</span>
          <span><strong>Zero-Spam Promise:</strong> Unbiased guidance with zero pushy sales calls.</span>
        </div>
      </div>
    </div>
  `);

  // Interactive tab switcher for the hero hub
  const hubTabs = document.querySelectorAll('.hub-tab');
  const healthList = document.querySelector('#hub-health-list');
  const termList = document.querySelector('#hub-term-list');
  hubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      hubTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isHealth = tab.dataset.tab === 'health';
      if (healthList) {
        healthList.hidden = !isHealth;
        healthList.style.display = isHealth ? 'grid' : 'none';
      }
      if (termList) {
        termList.hidden = isHealth;
        termList.style.display = isHealth ? 'none' : 'grid';
      }
    });
  });
  const homeStats = document.querySelectorAll('.stats b');
  if (homeStats[0]) homeStats[0].innerHTML = '1100+<small>Families Protected</small>';
  if (homeStats[2]) homeStats[2].innerHTML = 'Since 2019';
  const trustBlock = document.querySelector('.trust');
  if (trustBlock) {
    trustBlock.innerHTML = '<div class="trust-proof"><strong>1100+</strong><span>families protected</span></div><span class="trust-note">Personal guidance, every step</span>';
  }
  const servicesSection = Array.from(document.querySelectorAll('main > .section')).find(section =>
    section.querySelector('.eyebrow')?.textContent.trim() === 'WHAT WE OFFER'
  );
  servicesSection?.querySelectorAll('.cards article').forEach((card, index) => {
    const type = ['Term Insurance', 'Health Insurance', 'Travel Insurance'][index];
    const link = card.querySelector('a');
    if (type && link) {
      link.href = `contact.html?type=${encodeURIComponent(type)}`;
      link.textContent = 'Get personal guidance →';
    }
  });
  const founderSection = document.querySelector('.story');
  founderSection?.querySelector('.eyebrow')?.replaceChildren(document.createTextNode('OUR FOUNDER’S MISSION'));
  founderSection?.querySelector('blockquote')?.replaceChildren(document.createTextNode('Our mission is to help families make confident health and term insurance decisions. We offer clear, honest guidance so you can understand your options and choose coverage that protects the people you love.'));
  founderSection?.querySelector('b')?.replaceChildren(document.createTextNode('Ravi'));
  founderSection?.querySelector('small')?.replaceChildren(document.createTextNode('Founder and Health Insurance Specialist'));
}
if (currentPath.includes('about')) {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `<section class="page-hero"><p class="eyebrow">OUR STORY</p><h1>We’re Your<br><em>Insurance Mentors</em></h1><p>We started with a simple belief: every family deserves clear, honest guidance when it comes to health and term insurance.</p></section><section class="section about-stats about-source-stats"><div class="about-stat"><strong>1100+</strong><span>Families Protected</span></div><div class="about-stat"><strong>2019</strong><span>Started Independently</span></div><div class="about-stat"><strong>Health</strong><span>Our Core Focus</span></div><div class="about-stat"><strong>100%</strong><span>Personal Guidance</span></div></section><section class="section about-copy"><p class="eyebrow">WHO WE ARE</p><h2>Advice that puts people first</h2><p>InsuranceMentors.in is built around practical, personal guidance. We help families understand their health and term insurance options, compare what matters, and choose protection that fits their real needs.</p><p>We work independently and explain insurance in plain language. Our goal is not to push a policy; it is to help you make a decision you can feel confident about.</p></section><section class="section timeline"><p class="eyebrow">OUR JOURNEY</p><h2>Growing with the families we protect</h2><article><b>2019</b><h3>Working Independently</h3><p>Started working independently with a focus on Health and Term Insurance.</p></article><article><b>2020</b><h3>Growing Partnerships</h3><p>Built partnerships to compare more plans and serve families better.</p></article><article><b>2021</b><h3>100+ Families</h3><p>Helped more than 100 families find suitable insurance protection.</p></article><article><b>2023</b><h3>300+ Families</h3><p>Continued growing through personal referrals and thoughtful advice.</p></article><article><b>2025</b><h3>500+ Families</h3><p>Reached 500+ families protected through personal guidance and trusted referrals.</p></article><article><b>2026</b><h3>1100+ and Counting</h3><p>InsuranceMentors.in launched and crossed 1,100 protected families, with the same personal approach.</p></article></section><section class="section values"><p class="eyebrow">WHAT WE BELIEVE</p><h2>Our Core Values</h2><div class="cards"><article><h3>Health First</h3><p>We begin with your family’s health needs, priorities, and budget before discussing a plan.</p></article><article><h3>Financial Protection</h3><p>We help you build a financial safety net so your family can stay secure through unexpected events.</p></article><article><h3>Honest Comparisons</h3><p>We explain the differences clearly, including limits and exclusions, so you can choose with confidence.</p></article><article><h3>Support That Stays</h3><p>Our guidance does not end when you choose a policy. We remain available when questions arise.</p></article></div></section><section class="section advisors"><p class="eyebrow">THE PEOPLE BEHIND INSURANCEMENTORS</p><h2>Meet Our Top Advisors</h2><p>Personal guidance from a team focused on helping families make better insurance decisions.</p><div class="advisor-grid"><article class="advisor-card"><div class="advisor-avatar">RK</div><h3>Ravi</h3><p>Founder and Health Insurance Specialist</p></article><article class="advisor-card"><div class="advisor-avatar">AS</div><h3>Abhi</h3><p>Health Advisor</p></article><article class="advisor-card"><div class="advisor-avatar">AD</div><h3>Aditya</h3><p>Health Advisor</p></article><article class="advisor-card"><div class="advisor-avatar">NK</div><h3>Naresh</h3><p>Health Advisor</p></article></div></section><section class="cta"><h2>Ready to find your<br><em>right cover?</em></h2><p>Talk to our advisors for clear, personal guidance on health and term insurance.</p><a class="btn" href="contact.html">Get Free Consultation</a></section>`;
  }
}
if (currentPath.includes('contact')) {
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    pageHero.querySelector('.eyebrow')?.replaceChildren(document.createTextNode('PERSONAL GUIDANCE, WITHOUT THE PRESSURE'));
    const heading = pageHero.querySelector('h1');
    if (heading) heading.innerHTML = 'Let’s talk about<br><em>the right cover.</em>';
    pageHero.querySelector('p:last-child')?.replaceChildren(document.createTextNode('A question, a policy review, or help comparing options? Tell us a little about what you need and our team will follow up.'));
  }

  const form = document.querySelector('#contact-form');
  if (form) {
    const formTitle = form.querySelector('h2');
    if (formTitle) {
      formTitle.textContent = 'Tell us how we can help';
      formTitle.insertAdjacentHTML('beforebegin', '<p class="eyebrow form-eyebrow">YOUR ENQUIRY</p>');
      formTitle.insertAdjacentHTML('afterend', '<p class="form-intro">Share a few details. We’ll open WhatsApp with your enquiry so you can review it before sending.</p>');
    }
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Continue on WhatsApp';
    const formNote = document.createElement('p');
    formNote.className = 'form-note';
    formNote.textContent = 'Your message is only sent after you confirm it in WhatsApp.';
    submitButton?.insertAdjacentElement('afterend', formNote);
  }

  const contactInfo = document.querySelector('.contact-info');
  if (contactInfo) {
    contactInfo.innerHTML = `
      <p class="eyebrow contact-eyebrow">GET IN TOUCH</p>
      <h2>Real people.<br><em>Clear answers.</em></h2>
      <p class="contact-intro">Choose the way that feels easiest. We’re here to help you understand your options.</p>
      <div class="contact-methods">
        <a class="contact-method" href="https://wa.me/918125252378" target="_blank" rel="noopener">
          <span class="contact-method-icon" aria-hidden="true">WA</span>
          <span><small>WHATSAPP</small><strong>+91 81252 52378</strong><span>Usually replies within 2 hours</span></span>
          <span class="contact-method-arrow" aria-hidden="true">↗</span>
        </a>
        <a class="contact-method" href="mailto:insurancementors.support@gmail.com">
          <span class="contact-method-icon contact-method-icon-light" aria-hidden="true">@</span>
          <span><small>EMAIL</small><strong>Send us an email</strong><span>insurancementors.support@gmail.com</span></span>
          <span class="contact-method-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
      <div class="contact-hours"><span class="hours-indicator" aria-hidden="true"></span><span><small>ADVISORY HOURS</small><strong>Monday – Saturday</strong><span>9:00 AM – 7:00 PM</span></span></div>
      <div class="contact-next">
        <h3>What happens next?</h3>
        <ol><li><span>01</span>We review your enquiry</li><li><span>02</span>An advisor follows up</li><li><span>03</span>We help you compare your options</li></ol>
      </div>
    `;
  }

  const ageInput = document.querySelector('input[name="age"]');
  if (ageInput) {
    ageInput.min = '0';
    ageInput.max = '120';
    ageInput.inputMode = 'numeric';
  }
  const nameInput = document.querySelector('input[name="name"]');
  if (nameInput) {
    nameInput.autocomplete = 'name';
    nameInput.placeholder = 'Your full name';
  }
  if (ageInput) ageInput.placeholder = 'Your age';
  const placeInput = document.querySelector('input[name="place"]');
  if (placeInput) {
    placeInput.autocomplete = 'address-level2';
    placeInput.placeholder = 'City or town';
  }
  const pincodeInput = document.querySelector('input[name="pincode"]');
  if (pincodeInput) {
    pincodeInput.autocomplete = 'postal-code';
    pincodeInput.placeholder = '6-digit pincode';
  }
  const mobileInput = document.querySelector('input[name="mobile"]');
  if (mobileInput) {
    mobileInput.autocomplete = 'tel';
    mobileInput.placeholder = '10-digit mobile number';
  }
  const queryInput = document.querySelector('textarea[name="query"]');
  if (queryInput) queryInput.placeholder = 'What would you like help with?';
  const successMessage = document.querySelector('#success');
  if (successMessage) {
    successMessage.setAttribute('role', 'status');
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.setAttribute('aria-atomic', 'true');
  }
}

if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
  const quickSection = document.querySelector('.quick');
  if (quickSection) {
    quickSection.insertAdjacentHTML('beforebegin', `
      <section class="section coverage-check-section">
        <div class="coverage-check">
          <div class="coverage-check-copy">
            <p class="eyebrow">QUICK COVERAGE CHECK</p>
            <h2>Which insurance should you review first?</h2>
            <p>Answer a few simple questions. We’ll point you in the right direction.</p>
          </div>
          <div class="coverage-check-card">
            <div class="check-progress"><span></span><small id="check-progress-label">Question 1 of 3</small></div>
            <h3 id="check-question">What matters most to you right now?</h3>
            <div class="check-options" id="check-options">
              <button type="button" data-next="1" data-answer="Family health protection">Protecting my family’s health</button>
              <button type="button" data-next="1" data-answer="Income protection">Protecting family income</button>
              <button type="button" data-next="1" data-answer="Existing cover review">Understanding existing cover</button>
            </div>
            <div class="check-result" id="check-result" hidden>
              <span class="check-result-label">Your suggested next step</span>
              <h3 id="check-result-title"></h3>
              <p id="check-result-copy"></p>
              <a class="btn btn-primary" href="contact.html">Talk to an advisor</a>
            </div>
          </div>
        </div>
      </section>
      <section class="section process">
        <div class="center">
          <p class="eyebrow">HOW WE HELP</p>
          <h2>Simple guidance, <em>step by step</em></h2>
          <p>We explain the choices clearly, compare what matters, and stay available when you need support.</p>
        </div>
        <div class="process-grid">
          <article class="process-card"><h3>Understand your need</h3><p>We begin with your family, health, responsibilities, budget, and existing cover.</p></article>
          <article class="process-card"><h3>Compare with context</h3><p>We explain benefits, exclusions, waiting periods, and other terms without jargon.</p></article>
          <article class="process-card"><h3>Choose confidently</h3><p>We help you evaluate the fit and remain available for questions after you decide.</p></article>
        </div>
      </section>
      <section class="section faq">
        <div class="center">
          <p class="eyebrow">STRAIGHT ANSWERS</p>
          <h2>Questions we hear <em>often</em></h2>
        </div>
        <div class="faq-grid">
          <details><summary>Is your insurance advisory service free?</summary><p>Our advisory guidance is free for you. Always ask us to explain how a recommendation works and verify the final policy terms with the insurer.</p></details>
          <details><summary>Can you compare health insurance plans?</summary><p>Yes. We help you compare plan structure, waiting periods, exclusions, room limits, restoration, network support, and add-ons for your situation.</p></details>
          <details><summary>Do I need term insurance if I already have employer cover?</summary><p>Employer cover may end when you change jobs or retire. We can explain the difference and help you assess whether personal cover is appropriate for you.</p></details>
          <details><summary>Can you help with policy claims?</summary><p>We can explain the process and help you organise documents and questions for the insurer or TPA. Final decisions and claim settlements remain with the insurer.</p></details>
        </div>
      </section>
    `);
  }
}

if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
  const checkOptions = document.querySelector('#check-options');
  const checkQuestion = document.querySelector('#check-question');
  const progressLabel = document.querySelector('#check-progress-label');
  const progress = document.querySelector('.check-progress span');
  const checkResult = document.querySelector('#check-result');
  let selectedNeed = '';

  if (checkOptions) {
    checkOptions.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        selectedNeed = button.dataset.answer;
        checkOptions.innerHTML = `
          <button type="button" data-next="2">Myself</button>
          <button type="button" data-next="2">My partner and me</button>
          <button type="button" data-next="2">My whole family</button>
        `;
        checkQuestion.textContent = 'Who would the cover need to protect?';
        progressLabel.textContent = 'Question 2 of 3';
        progress.style.width = '66%';
        checkOptions.querySelectorAll('button').forEach(secondButton => {
          secondButton.addEventListener('click', () => {
            checkOptions.innerHTML = `
              <button type="button">I have no suitable cover</button>
              <button type="button">I want to review existing cover</button>
              <button type="button">I am exploring options</button>
            `;
            checkQuestion.textContent = 'Where are you starting from?';
            progressLabel.textContent = 'Question 3 of 3';
            progress.style.width = '100%';
            checkOptions.querySelectorAll('button').forEach(finalButton => {
              finalButton.addEventListener('click', () => {
                checkOptions.hidden = true;
                checkQuestion.hidden = true;
                progressLabel.textContent = 'Your result';
                progress.style.width = '100%';
                const isIncome = selectedNeed === 'Income protection';
                document.querySelector('#check-result-title').textContent = isIncome ? 'Start with a term insurance review' : 'Start with a health insurance review';
                document.querySelector('#check-result-copy').textContent = isIncome
                  ? 'We can help you understand suitable cover, term length, and the responsibilities your family may need protection for.'
                  : 'We can help you compare the structure, exclusions, waiting periods, and hospital-related benefits that matter for your family.';
                checkResult.hidden = false;
              });
            });
          });
        });
      });
    });
  }
}
