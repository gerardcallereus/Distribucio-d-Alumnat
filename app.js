// Gestió de l'estat de l'aplicació
const state = {
  students: [],
  tables: [],
  numTables: 5,
  maxPerTable: 5,
  mode: 'random'
};

// Dades d'exemple amb noms realistes
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

// Elements del DOM
const elements = {
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
  statFreeSeats: document.getElementById('stat-free-seats'),
  toast: document.getElementById('toast')
};

// Utilitats d'increment / decrement amb botons
window.stepValue = function(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const min = parseInt(input.min, 10) || 1;
  const max = parseInt(input.max, 10) || 100;
  let val = (parseInt(input.value, 10) || min) + delta;
  if (val < min) val = min;
  if (val > max) val = max;
  input.value = val;
  updateCapacitySummary();
};

// Obtenir llista neta d'alumnes del textarea
function getCleanStudentList() {
  const text = elements.studentsInput.value;
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(name => name.length > 0);
}

// Actualitzar resum de capacitat de l'aula
function updateCapacitySummary() {
  const numTables = parseInt(elements.numTables.value, 10) || 0;
  const maxPerTable = parseInt(elements.maxPerTable.value, 10) || 0;
  const totalCapacity = numTables * maxPerTable;
  
  elements.totalCapacityVal.textContent = `${totalCapacity} places`;
  elements.capacityFeedbackHint.textContent = `${numTables} taules × ${maxPerTable} alumnes màxim`;

  const students = getCleanStudentList();
  elements.studentsCountBadge.textContent = `${students.length} ${students.length === 1 ? 'alumne' : 'alumnes'}`;

  // Advertir visualment si supera la capacitat
  if (students.length > totalCapacity && totalCapacity > 0) {
    elements.studentsCountBadge.style.background = '#fee2e2';
    elements.studentsCountBadge.style.color = '#991b1b';
  } else {
    elements.studentsCountBadge.style.background = '#e0e7ff';
    elements.studentsCountBadge.style.color = '#3730a3';
  }
}

// Algorisme de barreja aleatòria (Fisher-Yates)
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Distribució equitativa matemàtica
function calculateDistribution(studentsList, numTables, maxPerTable, mode = 'random') {
  let list = mode === 'random' ? shuffleArray(studentsList) : [...studentsList];
  
  const totalStudents = list.length;
  const totalCapacity = numTables * maxPerTable;
  
  // Inicialitzar taules
  const tables = Array.from({ length: numTables }, (_, i) => ({
    id: i + 1,
    name: `Taula ${i + 1}`,
    students: [],
    max: maxPerTable
  }));

  if (totalStudents === 0 || numTables === 0) {
    return { tables, overflow: [], error: null };
  }

  // Si hi ha més alumnes que la capacitat total
  let assignableStudents = list;
  let overflowStudents = [];
  
  if (totalStudents > totalCapacity) {
    assignableStudents = list.slice(0, totalCapacity);
    overflowStudents = list.slice(totalCapacity);
  }

  // Repartiment equitatiu:
  // Calculem quants alumnes per taula: base + residu
  const base = Math.floor(assignableStudents.length / numTables);
  const remainder = assignableStudents.length % numTables;

  let currentIndex = 0;
  for (let i = 0; i < numTables; i++) {
    // Les primeres 'remainder' taules reben (base + 1), la resta reben (base)
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

// Renderitzar la distribució visual
function renderDistribution(result) {
  const { tables, overflow, totalStudents, totalCapacity, exceeded } = result;
  
  // Mostrar toolbar i estadístiques
  elements.resultsToolbar.style.display = 'flex';
  elements.statsGrid.style.display = 'grid';

  // Alerta d'estat
  if (exceeded) {
    elements.statusAlert.className = 'alert alert-danger';
    elements.statusAlert.style.display = 'flex';
    elements.statusAlert.innerHTML = `
      <span>⚠️</span>
      <div>
        <strong>Capacitat superada!</strong> Hi ha ${totalStudents} alumnes, però amb ${tables.length} taules i ${tables[0]?.max} màxim per taula, l'aula només pot acollir ${totalCapacity} alumnes.
        <br>Queden <strong>${overflow.length} alumnes sense taula</strong>: ${overflow.join(', ')}.
        <br><small>Afegeix més taules o amplia el màxim per taula per encabir tothom.</small>
      </div>
    `;
    elements.distributionStatusBadge.className = 'badge danger';
    elements.distributionStatusBadge.textContent = 'Falten cadires';
  } else if (totalStudents === 0) {
    elements.statusAlert.className = 'alert alert-warning';
    elements.statusAlert.style.display = 'flex';
    elements.statusAlert.innerHTML = `<span>ℹ️</span> No s'ha introduït cap alumne per distribuir.`;
    elements.distributionStatusBadge.className = 'badge warning';
    elements.distributionStatusBadge.textContent = 'Llista buida';
  } else {
    elements.statusAlert.className = 'alert alert-info';
    elements.statusAlert.style.display = 'none';
    elements.distributionStatusBadge.className = 'badge success';
    elements.distributionStatusBadge.textContent = 'Distribució equilibrada';
  }

  // Actualitzar estadístiques
  const assignedCount = totalStudents - overflow.length;
  const occupiedTables = tables.filter(t => t.students.length > 0).length;
  const freeSeats = Math.max(0, totalCapacity - assignedCount);
  
  elements.statTotalStudents.textContent = assignedCount;
  elements.statTotalTables.textContent = `${occupiedTables} / ${tables.length}`;
  
  const counts = tables.map(t => t.students.length);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  elements.statAvgStudents.textContent = minCount === maxCount ? `${minCount}` : `${minCount} - ${maxCount}`;
  elements.statFreeSeats.textContent = freeSeats;

  elements.resultsMetaText.textContent = `${assignedCount} alumnes repartits de forma equitativa entre les ${tables.length} taules`;

  // Renderitzar graella de taules
  elements.tablesContainer.innerHTML = '';
  
  tables.forEach(table => {
    const card = document.createElement('div');
    card.className = 'table-card';

    const isFull = table.students.length === table.max;
    const isEmpty = table.students.length === 0;
    const tagClass = isFull ? 'full' : (isEmpty ? 'empty' : '');
    
    // Header de la taula
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

    // Alumnes assignats
    table.students.forEach((student, idx) => {
      // Obtenir inicial per a l'avatar
      const initials = student
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      html += `
        <li class="student-item">
          <span class="student-index">${idx + 1}</span>
          <span class="student-avatar">${initials || '•'}</span>
          <span class="student-name">${escapeHtml(student)}</span>
        </li>
      `;
    });

    // Cadires buides restants
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
    elements.tablesContainer.appendChild(card);
  });

  state.currentResult = result;
}

// Escapar HTML per seguretat
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Mostrar Toast
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// Execució de la distribució
function handleDistribute() {
  const students = getCleanStudentList();
  const numTables = parseInt(elements.numTables.value, 10) || 0;
  const maxPerTable = parseInt(elements.maxPerTable.value, 10) || 0;
  
  if (numTables <= 0) {
    showToast("⚠️ El nombre de taules ha de ser com a mínim 1");
    elements.numTables.focus();
    return;
  }

  if (maxPerTable <= 0) {
    showToast("⚠️ La capacitat màxima per taula ha de ser com a mínim 1");
    elements.maxPerTable.focus();
    return;
  }

  if (students.length === 0) {
    showToast("⚠️ Si us plau, afegeix almenys un alumne a la llista");
    elements.studentsInput.focus();
    return;
  }

  const modeRadio = document.querySelector('input[name="dist-mode"]:checked');
  const mode = modeRadio ? modeRadio.value : 'random';

  const result = calculateDistribution(students, numTables, maxPerTable, mode);
  renderDistribution(result);
  showToast("✅ Distribució calculada amb èxit!");
}

// Copiar resum de la distribució al portapapers
function copyDistribution() {
  if (!state.currentResult || !state.currentResult.tables) return;
  
  let text = `DISTRIBUCIÓ D'ALUMNAT A L'AULA\n`;
  text += `===================================\n\n`;
  
  state.currentResult.tables.forEach(t => {
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

  if (state.currentResult.overflow && state.currentResult.overflow.length > 0) {
    text += `ALUMNES SENSE TAULA (${state.currentResult.overflow.length}):\n`;
    state.currentResult.overflow.forEach((s, idx) => {
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

// Carregar dades d'exemple
function loadExampleData() {
  elements.studentsInput.value = EXAMPLE_STUDENTS.join('\n');
  elements.numTables.value = 5;
  elements.maxPerTable.value = 4;
  updateCapacitySummary();
  handleDistribute();
  showToast("✨ S'han carregat 20 alumnes i 5 taules de 4 places!");
}

// Ordenar la llista d'alumnes A-Z
function sortStudentsAlphabetically() {
  const students = getCleanStudentList();
  if (students.length === 0) return;
  students.sort((a, b) => a.localeCompare(b, 'ca'));
  elements.studentsInput.value = students.join('\n');
  updateCapacitySummary();
  showToast("🔤 Llista d'alumnes ordenada alfabèticament!");
}

// Event Listeners
elements.studentsInput.addEventListener('input', updateCapacitySummary);
elements.numTables.addEventListener('input', updateCapacitySummary);
elements.maxPerTable.addEventListener('input', updateCapacitySummary);

elements.btnDistribute.addEventListener('click', handleDistribute);
elements.btnExample.addEventListener('click', loadExampleData);

elements.btnClearStudents.addEventListener('click', () => {
  elements.studentsInput.value = '';
  updateCapacitySummary();
  showToast("Llista d'alumnes buidada.");
});

elements.btnSortStudents.addEventListener('click', sortStudentsAlphabetically);

elements.btnReshuffle.addEventListener('click', () => {
  const modeRadio = document.querySelector('input[name="dist-mode"][value="random"]');
  if (modeRadio) modeRadio.checked = true;
  handleDistribute();
});

elements.btnCopy.addEventListener('click', copyDistribution);
elements.btnPrint.addEventListener('click', () => {
  window.print();
});

// Inicialització en carregar la pàgina
updateCapacitySummary();
