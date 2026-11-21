(() => {
  const allowedCompanies = new Set([
    'HDFC ERGO',
    'ICICI Lombard',
    'Care Health Insurance',
    'Aditya Birla Health Insurance',
    'Niva Bupa'
  ]);

  const clauseCategories = [
    {
      id: 'dealbreakers',
      label: 'Critical Dealbreakers',
      icon: '★',
      description: 'The 6 clauses that most often decide whether your claim is paid in full or deductions apply.',
      fields: [
        'Room Rent Limit',
        'Co-Pay',
        'Pre-existing Waiting',
        'Restoration Benefit',
        'Consumables Cover',
        'Sublimits'
      ]
    },
    {
      id: 'hospitalization',
      label: 'Hospitalization & Treatments',
      icon: '🏥',
      description: 'Core inpatient care, hospital stay rules, day-care procedures, and ambulance allowances.',
      fields: [
        'Pre/Post Hospitalisation',
        'Day Care procedure',
        'Road Ambulance',
        'Ayush Coverage',
        'Deductible'
      ]
    },
    {
      id: 'coverage',
      label: 'Limits & Network',
      icon: '💰',
      description: 'Sum insured options, cashless hospital access, renewal stability, and waiting periods.',
      fields: [
        'Sum Insured (In Lacs)',
        'Hospital Network',
        'Life Long Renewability',
        'Initial Waiting'
      ]
    },
    {
      id: 'wellness',
      label: 'Add-ons & Extra Benefits',
      icon: '✨',
      description: 'No-claim bonus multipliers, outpatient doctor consultations, maternity, and preventive checkups.',
      fields: [
        'Power Booster',
        'OPD',
        'Maternity',
        'Preventive Checkup',
        'Extra Features'
      ]
    }
  ];

  const fieldOrder = clauseCategories.flatMap(c => c.fields);

  const clauseExplanations = {
    'Room Rent Limit': 'Crucial clause: If capped (e.g. 1% of SI), picking a room above the cap causes proportionate deductions on your ENTIRE hospital bill (doctors, ICU, surgery).',
    'Co-Pay': 'The percentage of every hospital bill you must pay from your pocket before the insurer covers the remaining balance.',
    'Pre-existing Waiting': 'The required waiting period before illnesses you had prior to buying this policy are eligible for claims.',
    'Restoration Benefit': 'Automatically refills your Sum Insured if exhausted by hospital claims during a single policy year.',
    'Consumables Cover': 'Covers medical disposables like gloves, syringes, cotton, and PPE kits—which otherwise cost 10%–15% of your hospital bill.',
    'Sublimits': 'Caps on spending for specific high-cost treatments like cataract surgery, joint replacements, kidney dialysis, or hernia.',
    'Pre/Post Hospitalisation': 'Medical expenses covered before admission (consultations, diagnostics) and after discharge (medications, tests, recovery).',
    'Day Care procedure': 'Treatments or surgeries requiring modern medical equipment that wrap up in under 24 hours without an overnight stay.',
    'Road Ambulance': 'Emergency transport coverage to take the patient to the nearest medical center or network hospital.',
    'Ayush Coverage': 'In-patient hospitalization coverage under alternative medical systems: Ayurveda, Yoga, Unani, Siddha, and Homeopathy.',
    'Deductible': 'An agreed initial deductible amount paid by the policyholder per year or claim to earn a discount on the annual premium.',
    'Sum Insured (In Lacs)': 'The maximum financial protection limit available for hospital claims under this insurance policy.',
    'Hospital Network': 'Number of hospitals across India where cashless claim processing is supported without upfront cash payments.',
    'Life Long Renewability': 'Statutory guarantee that your policy can be renewed for life regardless of your age, claims history, or emerging conditions.',
    'Initial Waiting': 'The initial 30-day waiting period from policy inception during which non-accidental illnesses are not yet covered.',
    'Power Booster': 'Cumulative No-Claim Bonus (NCB) that multiplies your sum insured for claim-free policy renewal years.',
    'OPD': 'Outpatient doctor consultations, dental/optical checkups, and routine diagnostic tests outside hospital admission.',
    'Maternity': 'Hospitalization and delivery costs for childbirth, typically requiring a 2-to-4 year continuous waiting period.',
    'Preventive Checkup': 'Free annual health checkup packages offered by the insurer to track early health vitals for insured adults.',
    'Extra Features': 'Unique plan highlights, wellness reward points, global emergency assistance, and teleconsultation benefits.'
  };

  const escapeHtml = value => String(value ?? '-').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const parseJsonBlocks = text => {
    const blocks = [];
    let start = -1;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < text.length; i += 1) {
      const c = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (c === '\\') escaped = true;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') { inString = true; continue; }
      if (c === '{') {
        if (depth === 0) start = i;
        depth += 1;
      } else if (c === '}') {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          blocks.push(JSON.parse(text.slice(start, i + 1)));
          start = -1;
        }
      }
    }
    return blocks.flatMap(b => Array.isArray(b.documents) ? b.documents : [b]);
  };

  const normalizePlan = doc => {
    const company = doc.Company || doc.company;
    const product = doc.plan_name;
    const fields = doc.data_points || Object.fromEntries(Object.entries(doc).filter(([k]) => !['Company', 'company', 'plan_name'].includes(k)));
    return { company, product, fields };
  };

  // Helper to extract an intuitive quick badge for any clause
  const analyzeClause = (field, rawValue) => {
    const val = String(rawValue || '').trim();
    const lval = val.toLowerCase();

    if (!val || val === '-' || lval === 'not stated' || lval === 'not displayed on page') {
      return { type: 'muted', label: 'Not Stated in Brochure', isGood: false };
    }

    if (field === 'Room Rent Limit') {
      if (lval.includes('no room-rent') || lval.includes('no room rent') || lval.includes('at actuals') || lval.includes('up to si') || lval.includes('gold - none')) {
        return { type: 'good', label: '✓ No Room Rent Capping', isGood: true };
      }
      if (lval.includes('single private')) {
        return { type: 'good', label: '✓ Single Private AC Room', isGood: true };
      }
      if (lval.includes('1%') || lval.includes('twin sharing') || lval.includes('general room') || lval.includes('breach attracts co-pay')) {
        return { type: 'warn', label: '⚠ Room Capping / Sharing Limits', isGood: false };
      }
      return { type: 'info', label: 'Room Category Conditions', isGood: false };
    }

    if (field === 'Co-Pay') {
      if (lval.includes('none') || lval === 'no' || lval.includes('no base co-payment') || lval.includes('no geography-based') || lval.includes('0%')) {
        return { type: 'good', label: '✓ 0% Co-Payment (Full Cover)', isGood: true };
      }
      if (lval.includes('20%') || lval.includes('10%') || lval.includes('zone-based') || lval.includes('co-payment')) {
        return { type: 'warn', label: '⚠ Co-Payment Applies', isGood: false };
      }
      return { type: 'info', label: 'Optional Co-Pay Choices', isGood: false };
    }

    if (field === 'Restoration Benefit') {
      if (lval.includes('unlimited') || lval.includes('forever')) {
        return { type: 'good', label: '✓ Unlimited Restoration', isGood: true };
      }
      if (lval.includes('100%') || lval.includes('reset') || lval.includes('recharge')) {
        return { type: 'good', label: '✓ 100% Sum Insured Refill', isGood: true };
      }
      return { type: 'info', label: 'Restoration Available', isGood: true };
    }

    if (field === 'Consumables Cover') {
      if (lval.includes('included in the base') || lval.includes('covered up to') || lval.includes('protect benefit covers') || lval.includes('claim safeguard+ covers')) {
        return { type: 'good', label: '✓ Inbuilt / 100% Covered', isGood: true };
      }
      if (lval.includes('optional') || lval.includes('claim shield') || lval.includes('safeguard')) {
        return { type: 'info', label: '⚡ Optional Rider / Add-on', isGood: false };
      }
      if (lval.includes('not included') || lval.includes('not covered') || lval.includes('not stated')) {
        return { type: 'warn', label: '✕ Not Included in Base', isGood: false };
      }
      return { type: 'info', label: 'Check Policy Schedule', isGood: false };
    }

    if (field === 'Pre-existing Waiting') {
      if (lval.includes('36 months') || lval.includes('3 years') || lval.includes('36m')) {
        return { type: 'neutral', label: '36 Months (3 Years)', isGood: false };
      }
      if (lval.includes('24 months') || lval.includes('2 years') || lval.includes('day 1')) {
        return { type: 'good', label: '✓ 24 Months Waiting', isGood: true };
      }
      if (lval.includes('48 months') || lval.includes('4 years')) {
        return { type: 'warn', label: '⚠ 48 Months (4 Years)', isGood: false };
      }
      return { type: 'info', label: 'Standard Waiting Period', isGood: false };
    }

    if (field === 'Sublimits') {
      if (lval.includes('no general treatment') || lval.includes('no sub-limit') || lval.includes('no sublimit')) {
        return { type: 'good', label: '✓ No Treatment Sub-limits', isGood: true };
      }
      if (lval.includes('cataract') || lval.includes('knee replacement') || lval.includes('sublimit')) {
        return { type: 'warn', label: '⚠ Disease Sub-limits Apply', isGood: false };
      }
      return { type: 'info', label: 'Ancillary Limits Apply', isGood: false };
    }

    if (field === 'Day Care procedure') {
      if (lval.includes('all') || lval.includes('covered') || lval.includes('540')) {
        return { type: 'good', label: '✓ All Day-Care Covered', isGood: true };
      }
      return { type: 'info', label: 'Day-Care Eligible', isGood: true };
    }

    if (field === 'Life Long Renewability') {
      if (lval.includes('yes') || lval.includes('lifelong') || lval.includes('no upper age') || lval.includes('no exit age')) {
        return { type: 'good', label: '✓ Lifelong Renewal Guaranteed', isGood: true };
      }
      return { type: 'neutral', label: 'Renewable as per Terms', isGood: true };
    }

    if (field === 'Hospital Network') {
      const match = val.match(/[\d,]+/);
      if (match) {
        return { type: 'good', label: `✓ ${match[0]}+ Cashless Hospitals`, isGood: true };
      }
      return { type: 'info', label: 'Cashless Network Available', isGood: true };
    }

    if (field === 'Ayush Coverage') {
      if (lval.includes('up to si') || lval.includes('up to sum insured') || lval.includes('included') || lval.includes('covered')) {
        return { type: 'good', label: '✓ Inpatient AYUSH Covered', isGood: true };
      }
      return { type: 'info', label: 'Subject to Terms', isGood: false };
    }

    if (field === 'Maternity') {
      if (lval.includes('not covered') || lval.includes('not available') || lval.includes('excluded') || lval.includes('not stated')) {
        return { type: 'warn', label: '✕ Maternity Excluded', isGood: false };
      }
      if (lval.includes('optional') || lval.includes('add-on')) {
        return { type: 'info', label: '⚡ Optional Maternity Rider', isGood: false };
      }
      if (lval.includes('covered')) {
        return { type: 'good', label: '✓ Maternity Covered', isGood: true };
      }
      return { type: 'neutral', label: 'Not Included in Base', isGood: false };
    }

    if (field === 'OPD') {
      if (lval.includes('not covered') || lval.includes('not stated') || lval.includes('under exclusions') || lval.includes('not included')) {
        return { type: 'warn', label: '✕ Inpatient Only (No OPD)', isGood: false };
      }
      if (lval.includes('optional') || lval.includes('add-on') || lval.includes('available')) {
        return { type: 'info', label: '⚡ Optional OPD Add-on', isGood: true };
      }
      if (lval.includes('covered')) {
        return { type: 'good', label: '✓ OPD Covered', isGood: true };
      }
      return { type: 'neutral', label: 'Check OPD Options', isGood: false };
    }

    if (field === 'Power Booster') {
      if (lval.includes('2x') || lval.includes('3x') || lval.includes('10x') || lval.includes('500%') || lval.includes('100%')) {
        return { type: 'good', label: '✓ High NCB / Multiplier Cover', isGood: true };
      }
      if (lval.includes('not stated') || lval.includes('not displayed')) {
        return { type: 'muted', label: 'Standard Bonus', isGood: false };
      }
      return { type: 'info', label: 'No Claim Bonus Included', isGood: true };
    }

    return { type: 'neutral', label: val.length > 32 ? val.slice(0, 32) + '...' : val, isGood: false };
  };

  const renderHealthPicker = plans => {
    const root = document.querySelector('#health-comparison-view');
    if (!root) return;

    const companies = [...new Set(plans.map(p => p.company))];
    const plansByCompany = company => plans.filter(p => p.company === company);

    const companyOptions = selected => companies.map(c => `<option value="${escapeHtml(c)}"${c === selected ? ' selected' : ''}>${escapeHtml(c)}</option>`).join('');
    const planOptions = company => plansByCompany(company).map(p => `<option value="${escapeHtml(p.product)}">${escapeHtml(p.product)}</option>`).join('');

    root.innerHTML = `
      <div class="compare-toolbar-copy term-comparison-heading">
        <span class="eyebrow">INTELLIGENT HEALTH COMPARISON</span>
        <h2>Compare Health Insurance on What Actually Matters</h2>
        <p>Premium is just a number. Real peace of mind comes from knowing how the clauses behave when you are at the hospital. Put any two plans side by side below.</p>
      </div>

      <div class="health-selection-panel modern-selector">
        <div class="health-selection-slot">
          <span class="health-selection-label">Select Plan A</span>
          <label>Company
            <select class="health-company-select" data-slot="0">${companyOptions(companies[0])}</select>
          </label>
          <label>Policy
            <select class="health-plan-select" data-slot="0">${planOptions(companies[0])}</select>
          </label>
        </div>

        <div class="health-vs-divider">
          <span>VS</span>
        </div>

        <div class="health-selection-slot">
          <span class="health-selection-label">Select Plan B</span>
          <label>Company
            <select class="health-company-select" data-slot="1">${companyOptions(companies[1] || companies[0])}</select>
          </label>
          <label>Policy
            <select class="health-plan-select" data-slot="1">${planOptions(companies[1] || companies[0])}</select>
          </label>
        </div>

        <button class="btn btn-primary health-compare-button" type="button">
          Compare Both Plans Side-by-Side
        </button>
        <p class="health-selection-message" role="alert"></p>
      </div>

      <div class="health-comparison-result" hidden></div>
    `;

    const companySelects = [...root.querySelectorAll('.health-company-select')];
    const planSelects = [...root.querySelectorAll('.health-plan-select')];
    const message = root.querySelector('.health-selection-message');
    const result = root.querySelector('.health-comparison-result');

    companySelects.forEach((select, index) => select.addEventListener('change', event => {
      planSelects[index].innerHTML = planOptions(event.target.value);
      result.hidden = true;
      message.textContent = '';
    }));

    const renderResult = (planA, planB) => {
      // Build top verdict cards
      const roomA = analyzeClause('Room Rent Limit', planA.fields['Room Rent Limit']);
      const roomB = analyzeClause('Room Rent Limit', planB.fields['Room Rent Limit']);
      const copayA = analyzeClause('Co-Pay', planA.fields['Co-Pay']);
      const copayB = analyzeClause('Co-Pay', planB.fields['Co-Pay']);
      const consumA = analyzeClause('Consumables Cover', planA.fields['Consumables Cover']);
      const consumB = analyzeClause('Consumables Cover', planB.fields['Consumables Cover']);
      const restoreA = analyzeClause('Restoration Benefit', planA.fields['Restoration Benefit']);
      const restoreB = analyzeClause('Restoration Benefit', planB.fields['Restoration Benefit']);

      const planCardsHtml = `
        <div class="cmp-verdict-grid">
          <div class="cmp-verdict-card">
            <div class="cmp-card-header">
              <span class="cmp-insurer-tag">${escapeHtml(planA.company)}</span>
              <h3>${escapeHtml(planA.product)}</h3>
            </div>
            <div class="cmp-quick-pills">
              <span class="cmp-pill pill-${roomA.type}">${roomA.label}</span>
              <span class="cmp-pill pill-${copayA.type}">${copayA.label}</span>
              <span class="cmp-pill pill-${consumA.type}">${consumA.label}</span>
              <span class="cmp-pill pill-${restoreA.type}">${restoreA.label}</span>
            </div>
            <a class="btn btn-outline cmp-enquire-btn" href="https://wa.me/918125252378?text=${encodeURIComponent(`Hi InsuranceMentors, I want to review ${planA.company} - ${planA.product}. Please help me with quotes and brochure details.`)}" target="_blank" rel="noopener">
              Discuss ${escapeHtml(planA.product)} on WhatsApp →
            </a>
          </div>

          <div class="cmp-verdict-card">
            <div class="cmp-card-header">
              <span class="cmp-insurer-tag">${escapeHtml(planB.company)}</span>
              <h3>${escapeHtml(planB.product)}</h3>
            </div>
            <div class="cmp-quick-pills">
              <span class="cmp-pill pill-${roomB.type}">${roomB.label}</span>
              <span class="cmp-pill pill-${copayB.type}">${copayB.label}</span>
              <span class="cmp-pill pill-${consumB.type}">${consumB.label}</span>
              <span class="cmp-pill pill-${restoreB.type}">${restoreB.label}</span>
            </div>
            <a class="btn btn-outline cmp-enquire-btn" href="https://wa.me/918125252378?text=${encodeURIComponent(`Hi InsuranceMentors, I want to review ${planB.company} - ${planB.product}. Please help me with quotes and brochure details.`)}" target="_blank" rel="noopener">
              Discuss ${escapeHtml(planB.product)} on WhatsApp →
            </a>
          </div>
        </div>
      `;

      // Build interactive control toolbar
      const toolbarHtml = `
        <div class="cmp-toolbar-panel">
          <div class="cmp-category-nav" role="tablist" aria-label="Feature categories">
            <button type="button" class="cmp-cat-btn active" data-cat="all">All Clauses (20)</button>
            <button type="button" class="cmp-cat-btn" data-cat="dealbreakers">★ Critical Dealbreakers (6)</button>
            <button type="button" class="cmp-cat-btn" data-cat="hospitalization">🏥 Hospitalization</button>
            <button type="button" class="cmp-cat-btn" data-cat="coverage">💰 Limits & Network</button>
            <button type="button" class="cmp-cat-btn" data-cat="wellness">✨ Extra Benefits</button>
          </div>

          <div class="cmp-toolbar-filters">
            <label class="cmp-diff-switch">
              <input type="checkbox" id="cmp-diff-checkbox">
              <span>Show only where plans differ</span>
            </label>
            <div class="cmp-search-wrap">
              <input type="search" id="cmp-clause-search" placeholder="Filter clauses (e.g. room, waiting, maternity)..." aria-label="Filter clauses">
            </div>
          </div>
        </div>
      `;

      // Build categorized breakdown tables
      const sectionsHtml = clauseCategories.map(cat => {
        const rowsHtml = cat.fields.map(field => {
          const valA = planA.fields[field] ?? '-';
          const valB = planB.fields[field] ?? '-';
          const isDifferent = String(valA).trim().toLowerCase() !== String(valB).trim().toLowerCase();
          const isDealbreaker = cat.id === 'dealbreakers';
          const analysisA = analyzeClause(field, valA);
          const analysisB = analyzeClause(field, valB);
          const explainer = clauseExplanations[field] || '';

          return `
            <tr class="cmp-data-row ${isDifferent ? 'is-diff' : 'is-same'}" data-field="${escapeHtml(field)}" data-cat="${cat.id}">
              <th class="cmp-clause-header">
                <div class="cmp-clause-title">
                  <strong>${escapeHtml(field)}</strong>
                  ${isDealbreaker ? '<span class="star-badge" title="Critical clause that most often determines claim deductions">★ Crucial</span>' : ''}
                </div>
                ${explainer ? `<small class="cmp-clause-tip">${escapeHtml(explainer)}</small>` : ''}
              </th>
              <td class="cmp-col-val" data-plan="A">
                <div class="cmp-badge-wrap">
                  <span class="cmp-pill pill-${analysisA.type}">${escapeHtml(analysisA.label)}</span>
                </div>
                <div class="cmp-detail-copy">${escapeHtml(valA)}</div>
              </td>
              <td class="cmp-col-val" data-plan="B">
                <div class="cmp-badge-wrap">
                  <span class="cmp-pill pill-${analysisB.type}">${escapeHtml(analysisB.label)}</span>
                </div>
                <div class="cmp-detail-copy">${escapeHtml(valB)}</div>
              </td>
            </tr>
          `;
        }).join('');

        return `
          <div class="cmp-category-section" data-cat="${cat.id}">
            <div class="cmp-category-header">
              <div class="cmp-cat-title-wrap">
                <span class="cmp-cat-icon">${cat.icon}</span>
                <div>
                  <h3>${cat.label}</h3>
                  <p>${cat.description}</p>
                </div>
              </div>
            </div>
            <div class="table-wrap modern-table health-compare-table">
              <table>
                <thead>
                  <tr>
                    <th style="width: 32%;">Clause & Why It Matters</th>
                    <th style="width: 34%;">
                      <strong>${escapeHtml(planA.company)}</strong>
                      <span class="term-product">${escapeHtml(planA.product)}</span>
                    </th>
                    <th style="width: 34%;">
                      <strong>${escapeHtml(planB.company)}</strong>
                      <span class="term-product">${escapeHtml(planB.product)}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }).join('');

      result.innerHTML = `
        ${planCardsHtml}
        ${toolbarHtml}
        <div class="cmp-sections-container">
          ${sectionsHtml}
        </div>
        <div class="cmp-empty-search" hidden>
          <p>No clauses match your search or filter. <button type="button" class="btn btn-outline btn-sm cmp-reset-filter">Reset Filters</button></p>
        </div>
        <p class="disclaimer">
          ★ Marked clauses are the ones that most often decide your claim settlement. All data points are extracted from official insurer policy brochures. Eligibility, policy wording, and premium terms remain subject to official insurer underwriting.
        </p>
      `;

      result.hidden = false;

      // Attach Category Filter buttons
      const catButtons = result.querySelectorAll('.cmp-cat-btn');
      const catSections = result.querySelectorAll('.cmp-category-section');
      const diffCheckbox = result.querySelector('#cmp-diff-checkbox');
      const searchInput = result.querySelector('#cmp-clause-search');
      const emptyState = result.querySelector('.cmp-empty-search');
      const resetBtn = result.querySelector('.cmp-reset-filter');

      const applyFilters = () => {
        const activeCat = result.querySelector('.cmp-cat-btn.active')?.dataset.cat || 'all';
        const onlyDiff = diffCheckbox?.checked || false;
        const query = searchInput?.value.trim().toLowerCase() || '';

        let visibleRowsCount = 0;

        catSections.forEach(sec => {
          const secCat = sec.dataset.cat;
          const isCategoryMatch = activeCat === 'all' || activeCat === secCat;

          if (!isCategoryMatch) {
            sec.hidden = true;
            return;
          }

          let sectionHasVisibleRows = false;
          const rows = sec.querySelectorAll('.cmp-data-row');

          rows.forEach(row => {
            const isDiff = row.classList.contains('is-diff');
            const fieldText = row.dataset.field.toLowerCase();
            const fullText = row.textContent.toLowerCase();

            const passesDiff = !onlyDiff || isDiff;
            const passesSearch = !query || fieldText.includes(query) || fullText.includes(query);

            if (passesDiff && passesSearch) {
              row.hidden = false;
              sectionHasVisibleRows = true;
              visibleRowsCount += 1;
            } else {
              row.hidden = true;
            }
          });

          sec.hidden = !sectionHasVisibleRows;
        });

        if (emptyState) emptyState.hidden = visibleRowsCount > 0;
      };

      catButtons.forEach(btn => btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      }));

      diffCheckbox?.addEventListener('change', applyFilters);
      searchInput?.addEventListener('input', applyFilters);
      resetBtn?.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
        if (diffCheckbox) diffCheckbox.checked = false;
        if (searchInput) searchInput.value = '';
        applyFilters();
      });

      // Scroll smoothly to results
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    root.querySelector('.health-compare-button').addEventListener('click', () => {
      const selectedPlans = planSelects.map(select =>
        plans.find(p => p.company === companySelects[Number(select.dataset.slot)].value && p.product === select.value)
      );

      if (!selectedPlans[0] || !selectedPlans[1]) {
        message.textContent = 'Please choose one plan from each selection column.';
        return;
      }
      message.textContent = '';
      renderResult(selectedPlans[0], selectedPlans[1]);
    });

    // Auto-trigger comparison on initial load for top 2 popular plans (HDFC ERGO Optima Secure vs Care Supreme)
    const hdfc = plans.find(p => p.company === 'HDFC ERGO' && p.product.includes('Optima Secure')) || plans[0];
    const care = plans.find(p => p.company === 'Care Health Insurance' && p.product.includes('Supreme')) || plans[1];
    if (hdfc && care && companySelects.length >= 2) {
      companySelects[0].value = hdfc.company;
      planSelects[0].innerHTML = planOptions(hdfc.company);
      planSelects[0].value = hdfc.product;

      companySelects[1].value = care.company;
      planSelects[1].innerHTML = planOptions(care.company);
      planSelects[1].value = care.product;

      renderResult(hdfc, care);
    }
  };

  try {
    const source = typeof window.healthInsuranceSource === 'string' ? window.healthInsuranceSource : window.healthInsuranceSource?.value;
    if (!source) throw new Error('Embedded health comparison data is unavailable.');
    renderHealthPicker(parseJsonBlocks(source).map(normalizePlan).filter(plan => allowedCompanies.has(plan.company)));
  } catch (error) {
    const root = document.querySelector('#health-comparison-view');
    if (root) root.innerHTML = `<div class="comparison-empty"><h3>Health comparison data could not be loaded</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
})();
