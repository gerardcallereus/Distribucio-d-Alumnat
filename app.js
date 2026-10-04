// ============================================================
// DADES D'EXEMPLE
// ============================================================
const EXAMPLE_STUDENTS = [
  "Aina Masferrer",
  "Arnau Vila",
  "Biel Rovira",
  "Clara Pujol",
  "David Solà",
  "Emma Font",
  "Ferran Martí",
  "Gisela Bosch",
  "Hugo Serrat",
  "Júlia Casals",
  "Laia Valls",
  "Marc Puig",
  "Marina Costa",
  "Nil Oliver",
  "Ona Domènech",
  "Pau Riera",
  "Queralt Serra",
  "Roger Ferrer",
  "Sara Alarcón",
  "Víctor Camps"
];

// Utilitat d'escapat d'HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Mostrar Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Algorisme de barreja (Fisher-Yates)
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Stepper global per botons + / -
window.stepValue = function(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const min = parseInt(input.min, 10) || 1;
  const max = parseInt(input.max, 10) || 100;
  let val = (parseInt(input.value, 10) || min) + delta;
  if (val < min) val = min;
  if (val > max) val = max;
  input.value = val;

  if (inputId === 'num-tables' || inputId === 'max-per-table') {
    updateCapacitySummary();
  } else if (inputId === 'num-workgroups') {
    updateWorkgroupsConfigPreview();
  }
};

// ============================================================
// GESTIÓ DE PESTANYES (TABS)
// ============================================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // Botons de sincronització entre pestanyes
  const btnSyncToGroups = document.getElementById('btn-sync-to-groups');
  const btnImportFromTables = document.getElementById('btn-import-from-tables');

  if (btnSyncToGroups) {
    btnSyncToGroups.addEventListener('click', () => {
      const text = document.getElementById('students-input').value;
      const groupsInput = document.getElementById('groups-students-input');
      groupsInput.value = text;
      updateWorkgroupsConfigPreview();
      // Canviar a pestanya de grups
      document.getElementById('tab-btn-groups').click();
      showToast("📋 Llista d'alumnes copiada a la pestanya de grups");
    });
  }

  if (btnImportFromTables) {
    btnImportFromTables.addEventListener('click', () => {
      const text = document.getElementById('students-input').value;
      const groupsInput = document.getElementById('groups-students-input');
      if (!text.trim()) {
        showToast("⚠️ La llista de la pestanya de taules està buida");
        return;
      }
      groupsInput.value = text;
      updateWorkgroupsConfigPreview();
      showToast("📋 Llista importada correctament des de Taules");
    });
  }
}

// ============================================================
// PESTANYA 1: TAULES D'AULA (Eina existent)
// ============================================================
const tablesElements = {
  numTables: document.getElementById('num-tables'),
  maxPerTable: document.getElementById('max-per-table'),
  studentsInput: document.getElementById('students-input'),
  studentsCountBadge: document.getElementById('students-count-badge'),
  totalCapacityVal: document.getElementById('total-capacity-val'),
  capacityFeedbackHint: document.getElementById('capacity-feedback-hint'),
  btnDistribute: document.getElementById('btn-distribute'),
  btnExample: document.getElementById('btn-example'),
  btnClearStudents: document.getElementById('btn-clear-students'),
  btnSortStudents: document.getElementById('btn-sort-students'),
  btnReshuffle: document.getElementById('btn-reshuffle'),
  btnCopy: document.getElementById('btn-copy'),
  btnPrint: document.getElementById('btn-print'),
  resultsToolbar: document.getElementById('results-toolbar'),
  statusAlert: document.getElementById('status-alert'),
  statsGrid: document.getElementById('stats-grid'),
  tablesContainer: document.getElementById('tables-container'),
  distributionStatusBadge: document.getElementById('distribution-status-badge'),
  resultsMetaText: document.getElementById('results-meta-text'),
  statTotalStudents: document.getElementById('stat-total-students'),
  statTotalTables: document.getElementById('stat-total-tables'),
  statAvgStudents: document.getElementById('stat-avg-students'),
  statFreeSeats: document.getElementById('stat-free-seats')
};

let currentTablesResult = null;

function getCleanStudentList() {
  const text = tablesElements.studentsInput.value;
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(name => name.length > 0);
}

function updateCapacitySummary() {
  const numTables = parseInt(tablesElements.numTables.value, 10) || 0;
  const maxPerTable = parseInt(tablesElements.maxPerTable.value, 10) || 0;
  const totalCapacity = numTables * maxPerTable;
  
  tablesElements.totalCapacityVal.textContent = `${totalCapacity} places`;
  tablesElements.capacityFeedbackHint.textContent = `${numTables} taules × ${maxPerTable} alumnes màxim`;

  const students = getCleanStudentList();
  tablesElements.studentsCountBadge.textContent = `${students.length} ${students.length === 1 ? 'alumne' : 'alumnes'}`;

  if (students.length > totalCapacity && totalCapacity > 0) {
    tablesElements.studentsCountBadge.style.background = '#fee2e2';
    tablesElements.studentsCountBadge.style.color = '#991b1b';
  } else {
    tablesElements.studentsCountBadge.style.background = '#e0e7ff';
    tablesElements.studentsCountBadge.style.color = '#3730a3';
  }
}

function calculateDistribution(studentsList, numTables, maxPerTable, mode = 'random') {
  let list = mode === 'random' ? shuffleArray(studentsList) : [...studentsList];
  
  const totalStudents = list.length;
  const totalCapacity = numTables * maxPerTable;
  
  const tables = Array.from({ length: numTables }, (_, i) => ({
    id: i + 1,
    name: `Taula ${i + 1}`,
    students: [],
    max: maxPerTable
  }));

  if (totalStudents === 0 || numTables === 0) {
    return { tables, overflow: [], error: null };
  }

  let assignableStudents = list;
  let overflowStudents = [];
  
  if (totalStudents > totalCapacity) {
    assignableStudents = list.slice(0, totalCapacity);
    overflowStudents = list.slice(totalCapacity);
  }

  const base = Math.floor(assignableStudents.length / numTables);
  const remainder = assignableStudents.length % numTables;

  let currentIndex = 0;
  for (let i = 0; i < numTables; i++) {
    const countForThisTable = i < remainder ? base + 1 : base;
    tables[i].students = assignableStudents.slice(currentIndex, currentIndex + countForThisTable);
    currentIndex += countForThisTable;
  }

  return {
    tables,
    overflow: overflowStudents,
    totalStudents,
    totalCapacity,
    exceeded: overflowStudents.length > 0
  };
}

function renderDistribution(result) {
  const { tables, overflow, totalStudents, totalCapacity, exceeded } = result;
  
  tablesElements.resultsToolbar.style.display = 'flex';
  tablesElements.statsGrid.style.display = 'grid';

  if (exceeded) {
    tablesElements.statusAlert.className = 'alert alert-danger';
    tablesElements.statusAlert.style.display = 'flex';
    tablesElements.statusAlert.innerHTML = `
      <span>⚠️</span>
      <div>
        <strong>Capacitat superada!</strong> Hi ha ${totalStudents} alumnes, però amb ${tables.length} taules i ${tables[0]?.max} màxim per taula, l'aula només pot acollir ${totalCapacity} alumnes.
        <br>Queden <strong>${overflow.length} alumnes sense taula</strong>: ${overflow.join(', ')}.
        <br><small>Afegeix més taules o amplia el màxim per taula per encabir tothom.</small>
      </div>
    `;
    tablesElements.distributionStatusBadge.className = 'badge danger';
    tablesElements.distributionStatusBadge.textContent = 'Falten cadires';
  } else if (totalStudents === 0) {
    tablesElements.statusAlert.className = 'alert alert-warning';
    tablesElements.statusAlert.style.display = 'flex';
    tablesElements.statusAlert.innerHTML = `<span>ℹ️</span> No s'ha introduït cap alumne per distribuir.`;
    tablesElements.distributionStatusBadge.className = 'badge warning';
    tablesElements.distributionStatusBadge.textContent = 'Llista buida';
  } else {
    tablesElements.statusAlert.className = 'alert alert-info';
    tablesElements.statusAlert.style.display = 'none';
    tablesElements.distributionStatusBadge.className = 'badge success';
    tablesElements.distributionStatusBadge.textContent = 'Distribució equilibrada';
  }

  const assignedCount = totalStudents - overflow.length;
  const occupiedTables = tables.filter(t => t.students.length > 0).length;
  const freeSeats = Math.max(0, totalCapacity - assignedCount);
  
  tablesElements.statTotalStudents.textContent = assignedCount;
  tablesElements.statTotalTables.textContent = `${occupiedTables} / ${tables.length}`;
  
  const counts = tables.map(t => t.students.length);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  tablesElements.statAvgStudents.textContent = minCount === maxCount ? `${minCount}` : `${minCount} - ${maxCount}`;
  tablesElements.statFreeSeats.textContent = freeSeats;

  tablesElements.resultsMetaText.textContent = `${assignedCount} alumnes repartits de forma equitativa entre les ${tables.length} taules`;

  tablesElements.tablesContainer.innerHTML = '';
  
  tables.forEach(table => {
    const card = document.createElement('div');
    card.className = 'table-card';

    const isFull = table.students.length === table.max;
    const isEmpty = table.students.length === 0;
    const tagClass = isFull ? 'full' : (isEmpty ? 'empty' : '');
    
    let html = `
      <div class="table-card-header">
        <span class="table-name">
          <span>🪑</span> ${table.name}
        </span>
        <span class="table-capacity-tag ${tagClass}">
          ${table.students.length} / ${table.max}
        </span>
      </div>
      <ul class="students-list">
    `;

    table.students.forEach((student, idx) => {
      const initials = student
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      html += `
        <li class="student-item">
          <div class="student-info-left">
            <span class="student-index">${idx + 1}</span>
            <span class="student-avatar">${initials || '•'}</span>
            <span class="student-name">${escapeHtml(student)}</span>
          </div>
        </li>
      `;
    });

    const emptyCount = table.max - table.students.length;
    for (let k = 0; k < emptyCount; k++) {
      html += `
        <li class="empty-seat-item">
          <span>🪑</span> Lloc buit
        </li>
      `;
    }

    html += `</ul>`;
    card.innerHTML = html;
    tablesElements.tablesContainer.appendChild(card);
  });

  currentTablesResult = result;
}

function handleDistributeTables() {
  const students = getCleanStudentList();
  const numTables = parseInt(tablesElements.numTables.value, 10) || 0;
  const maxPerTable = parseInt(tablesElements.maxPerTable.value, 10) || 0;
  
  if (numTables <= 0) {
    showToast("⚠️ El nombre de taules ha de ser com a mínim 1");
    tablesElements.numTables.focus();
    return;
  }

  if (maxPerTable <= 0) {
    showToast("⚠️ La capacitat màxima per taula ha de ser com a mínim 1");
    tablesElements.maxPerTable.focus();
    return;
  }

  if (students.length === 0) {
    showToast("⚠️ Si us plau, afegeix almenys un alumne a la llista");
    tablesElements.studentsInput.focus();
    return;
  }

  const modeRadio = document.querySelector('input[name="dist-mode"]:checked');
  const mode = modeRadio ? modeRadio.value : 'random';

  const result = calculateDistribution(students, numTables, maxPerTable, mode);
  renderDistribution(result);
  showToast("✅ Distribució calculada amb èxit!");
}

function copyTablesDistribution() {
  if (!currentTablesResult || !currentTablesResult.tables) return;
  
  let text = `DISTRIBUCIÓ D'ALUMNAT A LES TAULES\n`;
  text += `===================================\n\n`;
  
  currentTablesResult.tables.forEach(t => {
    text += `${t.name} (${t.students.length}/${t.max} alumnes):\n`;
    if (t.students.length === 0) {
      text += `  - (Cap alumne)\n`;
    } else {
      t.students.forEach((s, idx) => {
        text += `  ${idx + 1}. ${s}\n`;
      });
    }
    text += `\n`;
  });

  if (currentTablesResult.overflow && currentTablesResult.overflow.length > 0) {
    text += `ALUMNES SENSE TAULA (${currentTablesResult.overflow.length}):\n`;
    currentTablesResult.overflow.forEach((s, idx) => {
      text += `  - ${s}\n`;
    });
    text += `\n`;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 S'ha copiat la distribució al portapapers!");
  }).catch(() => {
    showToast("No s'ha pogut copiar automàticament.");
  });
}

function loadExampleData() {
  tablesElements.studentsInput.value = EXAMPLE_STUDENTS.join('\n');
  tablesElements.numTables.value = 5;
  tablesElements.maxPerTable.value = 4;
  updateCapacitySummary();
  handleDistributeTables();

  const groupsInput = document.getElementById('groups-students-input');
  if (groupsInput && !groupsInput.value.trim()) {
    groupsInput.value = EXAMPLE_STUDENTS.join('\n');
    updateWorkgroupsConfigPreview();
  }

  showToast("✨ S'han carregat 20 alumnes d'exemple!");
}

function initTablesEvents() {
  tablesElements.studentsInput.addEventListener('input', updateCapacitySummary);
  tablesElements.numTables.addEventListener('input', updateCapacitySummary);
  tablesElements.maxPerTable.addEventListener('input', updateCapacitySummary);

  tablesElements.btnDistribute.addEventListener('click', handleDistributeTables);
  tablesElements.btnExample.addEventListener('click', loadExampleData);

  tablesElements.btnClearStudents.addEventListener('click', () => {
    tablesElements.studentsInput.value = '';
    updateCapacitySummary();
    showToast("Llista d'alumnes buidada.");
  });

  tablesElements.btnSortStudents.addEventListener('click', () => {
    const students = getCleanStudentList();
    if (students.length === 0) return;
    students.sort((a, b) => a.localeCompare(b, 'ca'));
    tablesElements.studentsInput.value = students.join('\n');
    updateCapacitySummary();
    showToast("🔤 Llista d'alumnes ordenada alfabèticament!");
  });

  tablesElements.btnReshuffle.addEventListener('click', () => {
    const modeRadio = document.querySelector('input[name="dist-mode"][value="random"]');
    if (modeRadio) modeRadio.checked = true;
    handleDistributeTables();
  });

  tablesElements.btnCopy.addEventListener('click', copyTablesDistribution);
  tablesElements.btnPrint.addEventListener('click', () => {
    window.print();
  });
}

// ============================================================
// PESTANYA 2: GRUPS DE TREBALL (Metodologia de Veto i Consens)
// ============================================================
const workgroupsState = {
  // Mapa de cada alumne: nom -> { name: string, hasObjected: boolean }
  studentsMap: new Map(),
  // Array de grups: { id, name, status: 'provisional'|'confirmed'|'auto-confirmed'|'objected', students: Array<{name, hasObjected}> }
  groups: [],
  numGroups: 4,
  sessionActive: false
};

const groupsElements = {
  numWorkgroups: document.getElementById('num-workgroups'),
  groupsApproxSize: document.getElementById('groups-approx-size'),
  groupsStudentsInput: document.getElementById('groups-students-input'),
  groupsStudentsCountBadge: document.getElementById('groups-students-count-badge'),
  btnGenerateGroups: document.getElementById('btn-generate-groups'),
  btnGroupsClear: document.getElementById('btn-groups-clear'),
  btnGroupsSort: document.getElementById('btn-groups-sort'),
  workgroupsSection: document.getElementById('workgroups-section'),
  workgroupsStatusBadge: document.getElementById('workgroups-status-badge'),
  workgroupsMetaText: document.getElementById('workgroups-meta-text'),
  workgroupsToolbar: document.getElementById('workgroups-toolbar'),
  workgroupsAlert: document.getElementById('workgroups-alert'),
  workgroupsStatsGrid: document.getElementById('workgroups-stats-grid'),
  workgroupsContainer: document.getElementById('workgroups-container'),
  btnApproveAllProvisionals: document.getElementById('btn-approve-all-provisionals'),
  btnRedistributeObjected: document.getElementById('btn-redistribute-objected'),
  countObjectedGroups: document.getElementById('count-objected-groups'),
  btnResetWorkgroups: document.getElementById('btn-reset-workgroups'),
  btnCopyWorkgroups: document.getElementById('btn-copy-workgroups'),
  btnPrintWorkgroups: document.getElementById('btn-print-workgroups'),
  statConfirmedGroups: document.getElementById('stat-confirmed-groups'),
  statProvisionalGroups: document.getElementById('stat-provisional-groups'),
  statObjectedGroups: document.getElementById('stat-objected-groups'),
  statUsedVetoes: document.getElementById('stat-used-vetoes')
};

function getCleanWorkgroupsStudents() {
  const text = groupsElements.groupsStudentsInput.value;
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(name => name.length > 0);
}

function updateWorkgroupsConfigPreview() {
  const students = getCleanWorkgroupsStudents();
  const numGroups = parseInt(groupsElements.numWorkgroups.value, 10) || 1;
  groupsElements.groupsStudentsCountBadge.textContent = `${students.length} ${students.length === 1 ? 'alumne' : 'alumnes'}`;

  if (students.length > 0 && numGroups > 0) {
    const avg = (students.length / numGroups).toFixed(1);
    groupsElements.groupsApproxSize.textContent = `~${avg} alumnes/grup`;
  } else {
    groupsElements.groupsApproxSize.textContent = `-`;
  }
}

// Inicialitza la sessió de grups de treball
function generateInitialWorkgroups() {
  const studentNames = getCleanWorkgroupsStudents();
  const numGroups = parseInt(groupsElements.numWorkgroups.value, 10) || 1;

  if (studentNames.length < 2) {
    showToast("⚠️ Cal afegir com a mínim 2 alumnes per fer grups de treball");
    groupsElements.groupsStudentsInput.focus();
    return;
  }

  if (numGroups < 2) {
    showToast("⚠️ El nombre de grups ha de ser com a mínim 2");
    groupsElements.numWorkgroups.focus();
    return;
  }

  if (numGroups > studentNames.length) {
    showToast("⚠️ No pots demanar més grups que el nombre total d'alumnes");
    groupsElements.numWorkgroups.focus();
    return;
  }

  // Inicialització del mapa d'alumnes amb dret a veto intacte
  workgroupsState.studentsMap = new Map();
  studentNames.forEach(name => {
    workgroupsState.studentsMap.set(name, {
      name,
      hasObjected: false
    });
  });

  workgroupsState.numGroups = numGroups;
  workgroupsState.sessionActive = true;

  // Barrejar llista d'alumnes inicial
  const shuffled = shuffleArray(studentNames);

  // Repartiment equitatiu entre 'numGroups'
  const groups = Array.from({ length: numGroups }, (_, i) => ({
    id: i + 1,
    name: `Grup ${i + 1}`,
    status: 'provisional', // 'provisional', 'confirmed', 'auto-confirmed', 'objected'
    students: []
  }));

  const base = Math.floor(shuffled.length / numGroups);
  const remainder = shuffled.length % numGroups;

  let currentIndex = 0;
  for (let i = 0; i < numGroups; i++) {
    const count = i < remainder ? base + 1 : base;
    const groupStudents = shuffled.slice(currentIndex, currentIndex + count).map(name => {
      return workgroupsState.studentsMap.get(name);
    });
    groups[i].students = groupStudents;
    currentIndex += count;

    // Comprovar si aquest grup té el 100% de membres amb veto usat
    checkAutoConfirmed(groups[i]);
  }

  workgroupsState.groups = groups;
  renderWorkgroups();
  showToast("🚀 Grups inicials generats! Comença la ronda de consens.");
}

// Comprova si tots els membres del grup ja han gastat el seu dret a veto
function checkAutoConfirmed(group) {
  if (group.students.length === 0) return false;
  const allUsed = group.students.every(s => s.hasObjected);
  if (allUsed) {
    group.status = 'auto-confirmed';
    return true;
  }
  return false;
}

// Acció de Votar en contra (exercir el veto)
window.handleStudentVeto = function(groupId, studentName) {
  const group = workgroupsState.groups.find(g => g.id === groupId);
  if (!group) return;

  const student = workgroupsState.studentsMap.get(studentName);
  if (!student) return;

  if (student.hasObjected) {
    showToast(`⚠️ ${studentName} ja ha utilitzat el seu únic dret a veto anteriorment.`);
    return;
  }

  // Marcar veto com a consumit
  student.hasObjected = true;
  // Actualitzar l'objecte dins del grup
  const studentInGroup = group.students.find(s => s.name === studentName);
  if (studentInGroup) {
    studentInGroup.hasObjected = true;
  }

  // Impugnar aquest grup
  group.status = 'objected';

  // Mostrar Toast
  showToast(`✋ En/Na ${studentName} ha votat en contra! El ${group.name} s'ha d'impugnar.`);

  renderWorkgroups();
};

// Aprovar un grup individual provisional
window.handleApproveGroup = function(groupId) {
  const group = workgroupsState.groups.find(g => g.id === groupId);
  if (!group) return;

  if (group.status === 'objected') {
    showToast("⚠️ Aquest grup està impugnat per un vot en contra i no es pot aprovar directament.");
    return;
  }

  group.status = 'confirmed';
  showToast(`✅ ${group.name} confirmat com a Grup Definitiu!`);
  renderWorkgroups();
};

// Aprovar tots els grups provisionals que no tenen queixes
function approveAllProvisionals() {
  let count = 0;
  workgroupsState.groups.forEach(group => {
    if (group.status === 'provisional') {
      group.status = 'confirmed';
      count++;
    }
  });

  if (count > 0) {
    showToast(`✅ S'han confirmat ${count} grups provisionals com a Definitius.`);
  } else {
    showToast("ℹ️ No hi ha cap grup provisional pendent d'aprovar.");
  }

  renderWorkgroups();
}

// Redistribuir els grups impugnats
function redistributeObjectedGroups() {
  const objectedGroups = workgroupsState.groups.filter(g => g.status === 'objected');

  if (objectedGroups.length === 0) {
    showToast("ℹ️ No hi ha cap grup impugnat per redistribuir.");
    return;
  }

  // Recollir tots els membres dels grups impugnats
  let pool = [];
  objectedGroups.forEach(g => {
    pool.push(...g.students);
  });

  // Barrejar membres impugnats
  const shuffledPool = shuffleArray(pool);

  // Repartir equitativament entre els mateixos grups impugnats
  const numObj = objectedGroups.length;
  const base = Math.floor(shuffledPool.length / numObj);
  const remainder = shuffledPool.length % numObj;

  let currentIndex = 0;
  objectedGroups.forEach((group, i) => {
    const count = i < remainder ? base + 1 : base;
    group.students = shuffledPool.slice(currentIndex, currentIndex + count);
    currentIndex += count;

    // Regla clau: si un nou grup està format 100% per alumnes amb veto esgotat -> DEFINITIU AUTOMÀTIC!
    const isAuto = checkAutoConfirmed(group);
    if (!isAuto) {
      group.status = 'provisional';
    }
  });

  renderWorkgroups();
  showToast(`🔄 S'han redistribuït els membres de ${numObj} ${numObj === 1 ? 'grup' : 'grups'} impugnats.`);
}

// Reiniciar sessió de grups de treball
function resetWorkgroups() {
  if (confirm("Vols reiniciar la sessió de grups de treball des de zero? Es restabliran els vetos i els grups.")) {
    workgroupsState.groups = [];
    workgroupsState.studentsMap = new Map();
    workgroupsState.sessionActive = false;

    groupsElements.workgroupsToolbar.style.display = 'none';
    groupsElements.workgroupsStatsGrid.style.display = 'none';
    groupsElements.workgroupsAlert.style.display = 'none';

    groupsElements.workgroupsStatusBadge.className = 'badge';
    groupsElements.workgroupsStatusBadge.textContent = "Pendent d'iniciar";
    groupsElements.workgroupsMetaText.textContent = "Genera els grups inicials per començar la ronda de consens i dret a veto.";

    groupsElements.workgroupsContainer.innerHTML = `
      <div class="empty-state" id="workgroups-empty-state">
        <div class="empty-icon">🤝</div>
        <h3>Cap sessió de grups de treball iniciada</h3>
        <p>Indica el nombre de grups, els alumnes i fes clic a "Generar Grups Inicials" per engegar la dinàmica.</p>
      </div>
    `;

    showToast("⏮️ Sessió de grups reiniciada.");
  }
}

// Renderitzar tot el tauler de grups de treball
function renderWorkgroups() {
  const groups = workgroupsState.groups;
  if (!groups || groups.length === 0) return;

  groupsElements.workgroupsToolbar.style.display = 'flex';
  groupsElements.workgroupsStatsGrid.style.display = 'grid';

  // Comptadors d'estat
  const confirmedCount = groups.filter(g => g.status === 'confirmed' || g.status === 'auto-confirmed').length;
  const provisionalCount = groups.filter(g => g.status === 'provisional').length;
  const objectedCount = groups.filter(g => g.status === 'objected').length;

  let usedVetoes = 0;
  workgroupsState.studentsMap.forEach(s => {
    if (s.hasObjected) usedVetoes++;
  });

  groupsElements.statConfirmedGroups.textContent = `${confirmedCount} / ${groups.length}`;
  groupsElements.statProvisionalGroups.textContent = provisionalCount;
  groupsElements.statObjectedGroups.textContent = objectedCount;
  groupsElements.statUsedVetoes.textContent = `${usedVetoes} / ${workgroupsState.studentsMap.size}`;

  // Botó de redistribució
  if (objectedCount > 0) {
    groupsElements.btnRedistributeObjected.style.display = 'inline-flex';
    groupsElements.countObjectedGroups.textContent = objectedCount;
  } else {
    groupsElements.btnRedistributeObjected.style.display = 'none';
  }

  // Estat global i missatges
  if (confirmedCount === groups.length) {
    // Tots completats!
    groupsElements.workgroupsAlert.className = 'alert alert-success';
    groupsElements.workgroupsAlert.style.display = 'flex';
    groupsElements.workgroupsAlert.innerHTML = `
      <span>🎉</span>
      <div>
        <strong>Procés finalitzat amb èxit!</strong> Tots els grups són ara <strong>Definitius</strong> per consens o esgotament de vetos. Podeu començar la feina!
      </div>
    `;
    groupsElements.workgroupsStatusBadge.className = 'badge success';
    groupsElements.workgroupsStatusBadge.textContent = 'Consens Complet 🔒';
    groupsElements.workgroupsMetaText.textContent = `Tots els ${groups.length} grups han quedat blindats com a definitius.`;
  } else if (objectedCount > 0) {
    groupsElements.workgroupsAlert.className = 'alert alert-danger';
    groupsElements.workgroupsAlert.style.display = 'flex';
    groupsElements.workgroupsAlert.innerHTML = `
      <span>⚠️</span>
      <div>
        Hi ha <strong>${objectedCount} ${objectedCount === 1 ? 'grup impugnat' : 'grups impugnats'}</strong>. Fes clic al botó blau <strong>"Redistribuir impugnats"</strong> per tornar a barrejar aleatòriament els seus membres.
      </div>
    `;
    groupsElements.workgroupsStatusBadge.className = 'badge danger';
    groupsElements.workgroupsStatusBadge.textContent = 'Grups Impugnats';
    groupsElements.workgroupsMetaText.textContent = `${confirmedCount} definitius, ${provisionalCount} provisionals, ${objectedCount} impugnats.`;
  } else {
    groupsElements.workgroupsAlert.className = 'alert alert-info';
    groupsElements.workgroupsAlert.style.display = 'flex';
    groupsElements.workgroupsAlert.innerHTML = `
      <span>💡</span>
      <div>
        Ronda oberta: Cada alumne que no estigui conforme pot prémer <strong>"✋ En desacord"</strong> per impugnar el grup (1 sol cop). Si tothom hi està d'acord, premeu <strong>"Aprovar grup"</strong> o <strong>"Confirmar provisionals"</strong>.
      </div>
    `;
    groupsElements.workgroupsStatusBadge.className = 'badge warning';
    groupsElements.workgroupsStatusBadge.textContent = 'En votació';
    groupsElements.workgroupsMetaText.textContent = `${confirmedCount} definitius, ${provisionalCount} provisionals pendents de consens.`;
  }

  // Renderitzar la graella de targetes de grup
  groupsElements.workgroupsContainer.innerHTML = '';

  groups.forEach(group => {
    const card = document.createElement('div');
    card.className = `group-card ${group.status}`;

    // Badge d'estat
    let badgeHtml = '';
    let headerIcon = '🤝';
    if (group.status === 'confirmed') {
      badgeHtml = `<span class="group-status-badge badge-confirmed">🔒 Definitiu</span>`;
      headerIcon = '✅';
    } else if (group.status === 'auto-confirmed') {
      badgeHtml = `<span class="group-status-badge badge-auto" title="Tots els membres han gastat el seu veto">🔒 Definitiu (100% vetos)</span>`;
      headerIcon = '🔒';
    } else if (group.status === 'objected') {
      badgeHtml = `<span class="group-status-badge badge-objected">❌ Impugnat</span>`;
      headerIcon = '⚠️';
    } else {
      badgeHtml = `<span class="group-status-badge badge-provisional">⏳ Provisional</span>`;
      headerIcon = '⏳';
    }

    let html = `
      <div class="table-card-header">
        <span class="table-name">
          <span>${headerIcon}</span> ${group.name}
        </span>
        ${badgeHtml}
      </div>
      <ul class="students-list">
    `;

    // Llista d'alumnes
    group.students.forEach((student, idx) => {
      const initials = student.name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      // Botó de veto o pill de veto gastat
      let actionHtml = '';
      if (group.status === 'confirmed' || group.status === 'auto-confirmed') {
        // En grup confirmat, només mostrem si tenia el veto gastat o no
        actionHtml = student.hasObjected 
          ? `<span class="veto-used-pill">⛔ Veto gastat</span>` 
          : `<span class="veto-used-pill" style="color:#059669; background:#ecfdf5;">✔️ Acceptat</span>`;
      } else if (group.status === 'objected') {
        actionHtml = student.hasObjected
          ? `<span class="veto-used-pill" style="color:#dc2626; background:#fee2e2;">✋ S'ha oposat</span>`
          : `<span class="veto-used-pill">Esperant redistribució</span>`;
      } else {
        // Grup provisional
        if (student.hasObjected) {
          actionHtml = `<span class="veto-used-pill">⛔ Veto gastat</span>`;
        } else {
          // Botó actiu per votar en contra
          actionHtml = `
            <button type="button" class="veto-btn" onclick="handleStudentVeto(${group.id}, '${escapeHtml(student.name).replace(/'/g, "\\'")}')" title="Exercir el teu únic dret a vot en contra d'aquest grup">
              ✋ En desacord
            </button>
          `;
        }
      }

      html += `
        <li class="student-item">
          <div class="student-info-left">
            <span class="student-index">${idx + 1}</span>
            <span class="student-avatar">${initials || '•'}</span>
            <span class="student-name">${escapeHtml(student.name)}</span>
          </div>
          <div class="student-action-right">
            ${actionHtml}
          </div>
        </li>
      `;
    });

    html += `</ul>`;

    // Footer de targeta: Botó d'aprovació si és provisional
    let footerHtml = '';
    if (group.status === 'provisional') {
      footerHtml = `
        <div class="group-card-footer">
          <span class="group-footer-info">Cap membre s'ha queixat?</span>
          <button type="button" class="btn-approve-group" onclick="handleApproveGroup(${group.id})">
            ✅ Aprovar grup
          </button>
        </div>
      `;
    } else if (group.status === 'auto-confirmed') {
      footerHtml = `
        <div class="group-card-footer">
          <span class="group-footer-info" style="color: #065f46; font-weight: 600;">🔒 Blindat: Tots els membres ja no tenen dret a veto.</span>
        </div>
      `;
    } else if (group.status === 'confirmed') {
      footerHtml = `
        <div class="group-card-footer">
          <span class="group-footer-info" style="color: #166534; font-weight: 600;">✅ Grup consolidat per consens.</span>
        </div>
      `;
    } else if (group.status === 'objected') {
      footerHtml = `
        <div class="group-card-footer">
          <span class="group-footer-info" style="color: #991b1b; font-weight: 600;">❌ Pendents de ser redistribuïts.</span>
        </div>
      `;
    }

    html += footerHtml;
    card.innerHTML = html;
    groupsElements.workgroupsContainer.appendChild(card);
  });
}

function copyWorkgroupsDistribution() {
  if (!workgroupsState.groups || workgroupsState.groups.length === 0) return;

  let text = `GRUPS DE TREBALL (METODOLOGIA DE CONSENS I VETO)\n`;
  text += `====================================================\n\n`;

  workgroupsState.groups.forEach(g => {
    let statusLabel = 'Provisional';
    if (g.status === 'confirmed') statusLabel = 'Definitiu (Consens)';
    if (g.status === 'auto-confirmed') statusLabel = 'Definitiu (Sense més vetos)';
    if (g.status === 'objected') statusLabel = 'Impugnat';

    text += `${g.name} [${statusLabel}] (${g.students.length} membres):\n`;
    g.students.forEach((s, idx) => {
      text += `  ${idx + 1}. ${s.name} ${s.hasObjected ? '[Veto gastat]' : ''}\n`;
    });
    text += `\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 S'ha copiat la llista dels grups de treball al portapapers!");
  }).catch(() => {
    showToast("No s'ha pogut copiar automàticament.");
  });
}

function initWorkgroupsEvents() {
  groupsElements.groupsStudentsInput.addEventListener('input', updateWorkgroupsConfigPreview);
  groupsElements.numWorkgroups.addEventListener('input', updateWorkgroupsConfigPreview);

  groupsElements.btnGenerateGroups.addEventListener('click', generateInitialWorkgroups);
  groupsElements.btnApproveAllProvisionals.addEventListener('click', approveAllProvisionals);
  groupsElements.btnRedistributeObjected.addEventListener('click', redistributeObjectedGroups);
  groupsElements.btnResetWorkgroups.addEventListener('click', resetWorkgroups);
  groupsElements.btnCopyWorkgroups.addEventListener('click', copyWorkgroupsDistribution);
  groupsElements.btnPrintWorkgroups.addEventListener('click', () => {
    window.print();
  });

  groupsElements.btnGroupsClear.addEventListener('click', () => {
    groupsElements.groupsStudentsInput.value = '';
    updateWorkgroupsConfigPreview();
    showToast("Llista de grups buidada.");
  });

  groupsElements.btnGroupsSort.addEventListener('click', () => {
    const students = getCleanWorkgroupsStudents();
    if (students.length === 0) return;
    students.sort((a, b) => a.localeCompare(b, 'ca'));
    groupsElements.groupsStudentsInput.value = students.join('\n');
    updateWorkgroupsConfigPreview();
    showToast("🔤 Llista d'alumnes ordenada alfabèticament!");
  });
}

// ============================================================
// INICIALITZACIÓ GLOBAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTablesEvents();
  initWorkgroupsEvents();

  updateCapacitySummary();
  updateWorkgroupsConfigPreview();
});
