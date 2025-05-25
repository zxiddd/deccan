import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    orderBy,
    addDoc,
    serverTimestamp,
    deleteDoc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateEmail,
    updatePassword
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA2BA9aJpDB5NKssH-wW-RFZlZLPiRdhFA",
    authDomain: "discountdeccan.firebaseapp.com",
    projectId: "discountdeccan",
    storageBucket: "discountdeccan.firebasestorage.app",
    messagingSenderId: "603416570550",
    appId: "1:603416570550:web:58b53e76355525d8869417",
    measurementId: "G-5K1XLLQXN2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const errorMsg = document.getElementById('errorMsg');
const statusMsg = document.getElementById('statusMsg');
const phoneSearch = document.getElementById('phoneSearch');
const searchBtn = document.getElementById('searchBtn');
const resultsTableBody = document.querySelector('#resultsTable tbody');
const reportTableBody = document.querySelector('#reportTable tbody');
const resultsCard = document.getElementById('resultsCard');
const refreshReportsBtn = document.getElementById('refreshReports');
const refreshDashboardBtn = document.getElementById('refreshDashboard');
const totalCustomersEl = document.getElementById('totalCustomers');
const activeDiscountsEl = document.getElementById('activeDiscounts');
const usedDiscountsEl = document.getElementById('usedDiscounts');
const expiredDiscountsEl = document.getElementById('expiredDiscounts');
const refreshDiscountsBtn = document.getElementById('refreshDiscounts');
const discountsTableBody = document.querySelector('#discountsTable tbody');
const generateCodeBtn = document.getElementById('generateCodeBtn');
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const customerDOB = document.getElementById('customerDOB');
const discountValue = document.getElementById('discountValue');
const generatedCodeContainer = document.getElementById('generatedCodeContainer');
const generatedCode = document.getElementById('generatedCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const bulkGenerateBtn = document.getElementById('bulkGenerateBtn');
const bulkQuantity = document.getElementById('bulkQuantity');
const bulkDiscountValue = document.getElementById('bulkDiscountValue');
const bulkGeneratedCodes = document.getElementById('bulkGeneratedCodes');
const bulkCodesList = document.getElementById('bulkCodesList');
const copyBulkCodesBtn = document.getElementById('copyBulkCodesBtn');
const discountSearch = document.getElementById('discountSearch');
const statusFilter = document.getElementById('statusFilter');
const dateStart = document.getElementById('dateStart');
const dateEnd = document.getElementById('dateEnd');
const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
const selectAllDiscounts = document.getElementById('selectAllDiscounts');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const updateAdminBtn = document.getElementById('updateAdminBtn');
const discountLoginModal = document.getElementById('discountLoginModal');
const discountLoginBtn = document.getElementById('discountLoginBtn');
const closeDiscountModal = document.getElementById('closeDiscountModal');
const discountAdminId = document.getElementById('discountAdminId');
const discountAdminPassword = document.getElementById('discountAdminPassword');
const discountErrorMsg = document.getElementById('discountErrorMsg');
const refreshRemindersBtn = document.getElementById('refreshReminders');
const birthdaysTableBody = document.querySelector('#birthdaysTable tbody');
const upcomingBirthdaysTableBody = document.querySelector('#upcomingBirthdaysTable tbody');
const reportDateStart = document.getElementById('reportDateStart');
const reportDateEnd = document.getElementById('reportDateEnd');
const exportCSVBtn = document.getElementById('exportCSV');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const birthdayRemindersToggle = document.getElementById('birthdayReminders');
const birthdayMessageTemplate = document.getElementById('birthdayMessageTemplate');
const emailNotifications = document.getElementById('emailNotifications');
const requireDOB = document.getElementById('requireDOB');
const discountRangeFrom = document.getElementById('discountRangeFrom');
const discountRangeTo = document.getElementById('discountRangeTo');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const confirmPassword = document.getElementById('confirmPassword');
const settingsStatus = document.getElementById('settingsStatus');

// Page Elements
const pages = {
    dashboard: document.getElementById('dashboardPage'),
    discounts: document.getElementById('discountsPage'),
    reminders: document.getElementById('remindersPage'),
    reports: document.getElementById('reportsPage'),
    settings: document.getElementById('settingsPage')
};

const navLinks = {
    dashboard: document.getElementById('dashboardLink'),
    discounts: document.getElementById('discountsLink'),
    reminders: document.getElementById('remindersLink'),
    reports: document.getElementById('reportsLink'),
    settings: document.getElementById('settingsLink')
};

const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');

// Page titles and subtitles
const pageInfoData = {
    dashboard: { title: 'Dashboard', subtitle: 'Welcome back! Here\'s what\'s happening today.' },
    discounts: { title: 'Discount Codes', subtitle: 'Generate and manage discount codes' },
    reminders: { title: 'Reminders', subtitle: 'Manage birthday reminders and notifications' },
    reports: { title: 'Customer Reports', subtitle: 'View customer analytics and usage reports' },
    settings: { title: 'Settings', subtitle: 'Configure system preferences' }
};

// State
let usageChart;
let isDiscountAdminAuthenticated = false;
let currentPage = 1;
const itemsPerPage = 10;
let allDiscounts = [];
let sortColumn = 'createdAt';
let sortDirection = 'desc';

// Helper Functions
function showError(message, element = errorMsg) {
    element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    element.className = 'status-msg error-msg';
    element.style.display = 'flex';
    setTimeout(() => element.style.display = 'none', 5000);
}

function showStatus(message, type = 'info', element = statusMsg) {
    element.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    element.className = `status-msg ${type}-msg`;
    element.style.display = 'flex';
    setTimeout(() => element.style.display = 'none', 5000);
}

function hideStatus() {
    statusMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    discountErrorMsg.style.display = 'none';
    settingsStatus.style.display = 'none';
}

function isExpired(createdAt) {
    const expiryDays = 30;
    const createdDate = createdAt.toDate();
    const expiryDate = new Date(createdDate);
    expiryDate.setDate(createdDate.getDate() + expiryDays);
    return new Date() > expiryDate;
}

function generateCode() {
    return 'DP' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Navigation
function setupNavigation() {
    for (const [pageId, link] of Object.entries(navLinks)) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (pageId === 'discounts' && !isDiscountAdminAuthenticated) {
                showDiscountLoginModal();
            } else {
                switchPage(pageId);
            }
        });
    }
}

function switchPage(pageId) {
    for (const page of Object.values(pages)) {
        page.classList.remove('active');
    }
    for (const link of Object.values(navLinks)) {
        link.classList.remove('active');
    }
    pages[pageId].classList.add('active');
    navLinks[pageId].classList.add('active');
    pageTitle.textContent = pageInfoData[pageId].title;
    pageSubtitle.textContent = pageInfoData[pageId].subtitle;
    
    if (pageId === 'reports') {
        loadReports();
        initUsageChart();
    } else if (pageId === 'discounts') {
        loadRecentDiscounts();
    } else if (pageId === 'reminders') {
        loadBirthdays();
        loadUpcomingBirthdays();
    }
}

// Mobile Menu
mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Discount Admin Login
function showDiscountLoginModal() {
    discountLoginModal.classList.add('active');
    discountAdminId.value = '';
    discountAdminPassword.value = '';
    discountErrorMsg.style.display = 'none';
}

closeDiscountModal.addEventListener('click', () => {
    discountLoginModal.classList.remove('active');
});

discountLoginBtn.addEventListener('click', async () => {
    const userId = discountAdminId.value.trim();
    const password = discountAdminPassword.value;

    if (!userId || !password) {
        showError('Please enter User ID and Password.', discountErrorMsg);
        return;
    }

    try {
        const adminRef = collection(db, 'discountAdmins');
        const q = query(adminRef, where('userId', '==', userId), where('password', '==', password));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showError('Invalid credentials.', discountErrorMsg);
            return;
        }

        isDiscountAdminAuthenticated = true;
        discountLoginModal.classList.remove('active');
        switchPage('discounts');
    } catch (error) {
        showError(`Error: ${error.message}`, discountErrorMsg);
    }
});

// Authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        errorMsg.style.display = 'none';
        setupNavigation();
        loadStats();
        loadReports();
        loadBirthdays();
        loadUpcomingBirthdays();
    } else {
        loginForm.style.display = 'flex';
        adminPanel.style.display = 'none';
        isDiscountAdminAuthenticated = false;
    }
});

loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Please enter email and password.');
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorMsg.style.display = 'none';
    } catch (error) {
        showError('Login failed: ' + error.message);
    }
});

logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    isDiscountAdminAuthenticated = false;
});

// Load Stats
async function loadStats() {
    try {
        const discountsRef = collection(db, 'discounts');
        const snapshot = await getDocs(discountsRef);
        
        let total = 0, active = 0, used = 0, expired = 0;
        const uniquePhones = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            uniquePhones.add(data.phone);
            total++;
            if (data.used) {
                used++;
            } else if (data.createdAt && isExpired(data.createdAt)) {
                expired++;
            } else {
                active++;
            }
        });

        totalCustomersEl.textContent = uniquePhones.size;
        activeDiscountsEl.textContent = active;
        usedDiscountsEl.textContent = used;
        expiredDiscountsEl.textContent = expired;
    } catch (error) {
        showError('Error loading stats: ' + error.message);
    }
}

// Search Function
searchBtn.addEventListener('click', async () => {
    const phone = phoneSearch.value.trim();
    hideStatus();
    resultsTableBody.innerHTML = '';
    
    if (!phone.match(/^\d{10}$/)) {
        showStatus('Enter a valid 10-digit phone number.', 'error');
        return;
    }
    
    showStatus('Searching...', 'info');
    resultsCard.style.display = 'none';

    try {
        const discountsRef = collection(db, 'discounts');
        const q = query(discountsRef, where('phone', '==', phone));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            showStatus('No records found for this phone number.', 'info');
            return;
        }
        
        showStatus(`${querySnapshot.size} record(s) found.`, 'success');
        resultsCard.style.display = 'block';

        let serial = 1;
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            const tr = document.createElement('tr');

            const serialTd = document.createElement('td');
            serialTd.textContent = serial++;
            tr.appendChild(serialTd);

            const nameTd = document.createElement('td');
            nameTd.textContent = data.name || '-';
            tr.appendChild(nameTd);

            const phoneTd = document.createElement('td');
            phoneTd.textContent = data.phone || '-';
            tr.appendChild(phoneTd);

            const dobTd = document.createElement('td');
            dobTd.textContent = data.dob || '-';
            tr.appendChild(dobTd);

            const discountTd = document.createElement('td');
            discountTd.textContent = data.discount || '-';
            tr.appendChild(discountTd);

            const codeTd = document.createElement('td');
            codeTd.textContent = data.code || '-';
            tr.appendChild(codeTd);

            const usedTd = document.createElement('td');
            const statusBadge = document.createElement('span');
            const isExp = data.createdAt && isExpired(data.createdAt);
            statusBadge.className = isExp ? 'used-expired' : data.used ? 'used-true' : 'used-false';
            statusBadge.innerHTML = isExp ? '<i class="fas fa-clock"></i> Expired' : data.used ? 
                '<i class="fas fa-check-circle"></i> Used' : 
                '<i class="fas fa-hourglass-half"></i> Active';
            usedTd.appendChild(statusBadge);
            tr.appendChild(usedTd);

            const actionsTd = document.createElement('td');
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';
            const markUsedBtn = document.createElement('button');
            markUsedBtn.className = 'btn btn-primary btn-sm';
            markUsedBtn.innerHTML = '<i class="fas fa-check"></i> Mark Used';
            markUsedBtn.disabled = data.used || isExp;
            markUsedBtn.addEventListener('click', async () => {
                try {
                    await updateDoc(doc(db, 'discounts', docSnap.id), { used: true });
                    statusBadge.className = 'used-true';
                    statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Used';
                    markUsedBtn.disabled = true;
                    showStatus('Discount marked as used successfully!', 'success');
                    loadStats();
                } catch (err) {
                    showError('Failed to update record: ' + err.message);
                }
            });
            actionsDiv.appendChild(markUsedBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this discount code?')) {
                    try {
                        await deleteDoc(doc(db, 'discounts', docSnap.id));
                        showStatus('Discount deleted successfully!', 'success');
                        loadStats();
                        tr.remove();
                    } catch (err) {
                        showError('Failed to delete record: ' + err.message);
                    }
                }
            });
            actionsDiv.appendChild(deleteBtn);
            actionsTd.appendChild(actionsDiv);
            tr.appendChild(actionsTd);

            resultsTableBody.appendChild(tr);
        });

    } catch (error) {
        showError('Error fetching data: ' + error.message);
    }
});

// Generate Single Discount Code
generateCodeBtn.addEventListener('click', async () => {
    const name = customerName.value.trim();
    const phone = customerPhone.value.trim();
    const dob = customerDOB.value;
    const discount = discountValue.value;

    if (!name || !phone || (requireDOB.checked && !dob)) {
        showStatus(`Name, phone number${requireDOB.checked ? ', and DOB' : ''} are required`, 'error');
        return;
    }

    if (!phone.match(/^\d{10}$/)) {
        showStatus('Enter a valid 10-digit phone number', 'error');
        return;
    }

    if (!discount || discount < 0 || discount > 100) {
        showStatus('Enter a valid discount percentage (0-100)', 'error');
        return;
    }

    try {
        showStatus('Generating discount code...', 'info');
        
        const code = generateCode();
        
        await addDoc(collection(db, 'discounts'), {
            name,
            phone,
            dob: dob || null,
            discount: `${discount}%`,
            code,
            used: false,
            createdAt: serverTimestamp()
        });

        generatedCode.value = code;
        generatedCodeContainer.style.display = 'block';
        showStatus('Discount code generated successfully!', 'success');
        
        customerName.value = '';
        customerPhone.value = '';
        customerDOB.value = '';
        discountValue.value = '';
        
        loadRecentDiscounts();
        loadStats();

    } catch (error) {
        showError('Failed to generate code: ' + error.message);
    }
});

// Bulk Generate Discount Codes
bulkGenerateBtn.addEventListener('click', async () => {
    const quantity = parseInt(bulkQuantity.value);
    const discount = bulkDiscountValue.value;

    if (!quantity || quantity < 1 || quantity > 100) {
        showStatus('Enter a valid number of codes (1-100)', 'error');
        return;
    }

    if (!discount || discount < 0 || discount > 100) {
        showStatus('Enter a valid discount percentage (0-100)', 'error');
        return;
    }

    try {
        showStatus('Generating bulk discount codes...', 'info');
        const codes = [];
        for (let i = 0; i < quantity; i++) {
            const code = generateCode();
            await addDoc(collection(db, 'discounts'), {
                name: `Bulk User ${i + 1}`,
                phone: `000000${String(i + 1).padStart(4, '0')}`,
                dob: null,
                discount: `${discount}%`,
                code,
                used: false,
                createdAt: serverTimestamp()
            });
            codes.push(code);
        }

        bulkCodesList.value = codes.join('\n');
        bulkGeneratedCodes.style.display = 'block';
        showStatus(`${quantity} discount codes generated successfully!`, 'success');
        
        bulkQuantity.value = '';
        bulkDiscountValue.value = '';
        
        loadRecentDiscounts();
        loadStats();

    } catch (error) {
        showError('Failed to generate bulk codes: ' + error.message);
    }
});

// Copy Code Buttons
copyCodeBtn.addEventListener('click', () => {
    generatedCode.select();
    document.execCommand('copy');
    showStatus('Code copied to clipboard!', 'success');
});

copyBulkCodesBtn.addEventListener('click', () => {
    bulkCodesList.select();
    document.execCommand('copy');
    showStatus('All codes copied to clipboard!', 'success');
});

// Load Recent Discounts with Pagination and Filters
async function loadRecentDiscounts(page = 1) {
    discountsTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading...</td></tr>';
    currentPage = page;

    try {
        let discountsRef = collection(db, 'discounts');
        let q = query(discountsRef, orderBy(sortColumn, sortDirection));
        
        // Fetch all discounts
        const querySnapshot = await getDocs(q);
        allDiscounts = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            data.id = docSnap.id;
            allDiscounts.push(data);
        });

        // Apply filters
        const searchTerm = discountSearch.value.trim().toLowerCase();
        const status = statusFilter.value;
        const startDate = dateStart.value ? new Date(dateStart.value) : null;
        const endDate = dateEnd.value ? new Date(dateEnd.value) : null;

        let filteredDiscounts = allDiscounts.filter(data => {
            const matchesSearch = !searchTerm || 
                (data.name && data.name.toLowerCase().includes(searchTerm)) ||
                (data.phone && data.phone.toLowerCase().includes(searchTerm)) ||
                (data.code && data.code.toLowerCase().includes(searchTerm));
            const isExp = data.createdAt && isExpired(data.createdAt);
            const matchesStatus = status === 'all' ||
                (status === 'active' && !data.used && !isExp) ||
                (status === 'used' && data.used) ||
                (status === 'expired' && isExp);
            const createdDate = data.createdAt?.toDate();
            const matchesDate = (!startDate || createdDate >= startDate) &&
                               (!endDate || createdDate <= new Date(endDate.setHours(23, 59, 59, 999)));
            return matchesSearch && matchesStatus && matchesDate;
        });

        // Sort filtered discounts
        filteredDiscounts.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];
            if (sortColumn === 'createdAt') {
                aValue = a.createdAt?.toDate() || new Date(0);
                bValue = b.createdAt?.toDate() || new Date(0);
            } else if (sortColumn === 'discount') {
                aValue = parseFloat(a.discount) || 0;
                bValue = parseFloat(b.discount) || 0;
            } else {
                aValue = aValue?.toString().toLowerCase() || '';
                bValue = bValue?.toString().toLowerCase() || '';
            }
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        // Pagination
        const totalItems = filteredDiscounts.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedDiscounts = filteredDiscounts.slice(startIndex, startIndex + itemsPerPage);

        discountsTableBody.innerHTML = '';
        
        if (paginatedDiscounts.length === 0) {
            discountsTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No discount codes found</td></tr>';
            updatePagination(totalPages);
            return;
        }

        paginatedDiscounts.forEach((data, index) => {
            const tr = document.createElement('tr');

            const selectTd = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'discount-checkbox';
            checkbox.value = data.id;
            selectTd.appendChild(checkbox);
            tr.appendChild(selectTd);

            const serialTd = document.createElement('td');
            serialTd.textContent = startIndex + index + 1;
            tr.appendChild(serialTd);

            const nameTd = document.createElement('td');
            nameTd.textContent = data.name || '-';
            tr.appendChild(nameTd);

            const phoneTd = document.createElement('td');
            phoneTd.textContent = data.phone || '-';
            tr.appendChild(phoneTd);

            const discountTd = document.createElement('td');
            discountTd.textContent = data.discount || '-';
            tr.appendChild(discountTd);

            const codeTd = document.createElement('td');
            codeTd.textContent = data.code || '-';
            tr.appendChild(codeTd);

            const statusTd = document.createElement('td');
            const statusBadge = document.createElement('span');
            const isExp = data.createdAt && isExpired(data.createdAt);
            statusBadge.className = isExp ? 'used-expired' : data.used ? 'used-true' : 'used-false';
            statusBadge.innerHTML = isExp ? '<i class="fas fa-clock"></i> Expired' : data.used ? 
                '<i class="fas fa-check-circle"></i> Used' : 
                '<i class="fas fa-hourglass-half"></i> Active';
            statusTd.appendChild(statusBadge);
            tr.appendChild(statusTd);

            const dateTd = document.createElement('td');
            dateTd.textContent = data.createdAt?.toDate().toLocaleDateString() || '-';
            tr.appendChild(dateTd);

            const actionsTd = document.createElement('td');
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';
            const markUsedBtn = document.createElement('button');
            markUsedBtn.className = 'btn btn-primary btn-sm';
            markUsedBtn.innerHTML = '<i class="fas fa-check"></i> Mark Used';
            markUsedBtn.disabled = data.used || isExp;
            markUsedBtn.addEventListener('click', async () => {
                try {
                    await updateDoc(doc(db, 'discounts', data.id), { used: true });
                    statusBadge.className = 'used-true';
                    statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Used';
                    markUsedBtn.disabled = true;
                    showStatus('Discount marked as used successfully!', 'success');
                    loadStats();
                } catch (err) {
                    showError('Failed to update record: ' + err.message);
                }
            });
            actionsDiv.appendChild(markUsedBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this discount code?')) {
                    try {
                        await deleteDoc(doc(db, 'discounts', data.id));
                        showStatus('Discount deleted successfully!', 'success');
                        loadRecentDiscounts(currentPage);
                        loadStats();
                    } catch (err) {
                        showError('Failed to delete record: ' + err.message);
                    }
                }
            });
            actionsDiv.appendChild(deleteBtn);
            actionsTd.appendChild(actionsDiv);
            tr.appendChild(actionsTd);

            discountsTableBody.appendChild(tr);
        });

        updatePagination(totalPages);

    } catch (error) {
        discountsTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--danger);">Error loading discounts</td></tr>';
        showError('Error loading discounts: ' + error.message);
    }
}

// Bulk Delete
bulkDeleteBtn.addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.discount-checkbox:checked');
    if (checkboxes.length === 0) {
        showStatus('No discounts selected for deletion.', 'error');
        return;
    }
    if (confirm(`Are you sure you want to delete ${checkboxes.length} discount code(s)?`)) {
        try {
            for (const checkbox of checkboxes) {
                await deleteDoc(doc(db, 'discounts', checkbox.value));
            }
            showStatus(`${checkboxes.length} discount(s) deleted successfully!`, 'success');
            loadRecentDiscounts(currentPage);
            loadStats();
        } catch (err) {
            showError('Failed to delete discounts: ' + err.message);
        }
    }
});

selectAllDiscounts.addEventListener('change', () => {
    const checkboxes = document.querySelectorAll('.discount-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAllDiscounts.checked);
    bulkDeleteBtn.disabled = !document.querySelector('.discount-checkbox:checked');
});

discountsTableBody.addEventListener('change', (e) => {
    if (e.target.classList.contains('discount-checkbox')) {
        bulkDeleteBtn.disabled = !document.querySelector('.discount-checkbox:checked');
    }
});

// Pagination
function updatePagination(totalPages) {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    pageInfo.textContent = totalPages ? `Page ${currentPage} of ${totalPages}` : 'No pages';
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        loadRecentDiscounts(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    loadRecentDiscounts(currentPage + 1);
});

// Sorting
document.querySelectorAll('#discountsTable th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const column = th.dataset.sort;
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        loadRecentDiscounts(currentPage);
    });
});

// Real-time Search and Filters
discountSearch.addEventListener('input', () => loadRecentDiscounts(1));
statusFilter.addEventListener('change', () => loadRecentDiscounts(1));
dateStart.addEventListener('change', () => loadRecentDiscounts(1));
dateEnd.addEventListener('change', () => loadRecentDiscounts(1));

// Load Today's Birthdays
async function loadBirthdays() {
    if (!birthdayRemindersToggle.checked) {
        birthdaysTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Birthday reminders are disabled</td></tr>';
        return;
    }
    birthdaysTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading...</td></tr>';
    
    try {
        const today = new Date();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const todayStr = `${month}-${day}`;

        const discountsRef = collection(db, 'discounts');
        const q = query(discountsRef, where('dob', '!=', null));
        const querySnapshot = await getDocs(q);

        birthdaysTableBody.innerHTML = '';
        
        let hasBirthdays = false;
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.dob) {
                const dob = new Date(data.dob);
                const dobMonth = (dob.getMonth() + 1).toString().padStart(2, '0');
                const dobDay = dob.getDate().toString().padStart(2, '0');
                if (`${dobMonth}-${dobDay}` === todayStr) {
                    hasBirthdays = true;
                    const tr = document.createElement('tr');

                    const nameTd = document.createElement('td');
                    nameTd.textContent = data.name || '-';
                    tr.appendChild(nameTd);

                    const phoneTd = document.createElement('td');
                    phoneTd.textContent = data.phone || '-';
                    tr.appendChild(phoneTd);

                    const dobTd = document.createElement('td');
                    dobTd.textContent = data.dob || '-';
                    tr.appendChild(dobTd);

                    const actionsTd = document.createElement('td');
                    const sendReminderBtn = document.createElement('button');
                    sendReminderBtn.className = 'btn btn-success btn-sm';
                    sendReminderBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Birthday Discount';
                    sendReminderBtn.addEventListener('click', async () => {
                        await sendBirthdayReminder(data.name, data.phone, data.dob);
                    });
                    actionsTd.appendChild(sendReminderBtn);
                    tr.appendChild(actionsTd);

                    birthdaysTableBody.appendChild(tr);
                }
            }
        });

        if (!hasBirthdays) {
            birthdaysTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No birthdays today</td></tr>';
        }

    } catch (error) {
        birthdaysTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--danger);">Error loading birthdays</td></tr>';
        showError('Error loading birthdays: ' + error.message);
    }
}

// Load Upcoming Birthdays
async function loadUpcomingBirthdays() {
    if (!birthdayRemindersToggle.checked) {
        upcomingBirthdaysTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Birthday reminders are disabled</td></tr>';
        return;
    }
    upcomingBirthdaysTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';

    try {
        const today = new Date();
        const discountsRef = collection(db, 'discounts');
        const q = query(discountsRef, where('dob', '!=', null));
        const querySnapshot = await getDocs(q);

        upcomingBirthdaysTableBody.innerHTML = '';
        let hasUpcoming = false;

        querySnapshot.forEach(async docSnap => {
            const data = docSnap.data();
            if (data.dob) {
                const dob = new Date(data.dob);
                const todayMonth = today.getMonth();
                const todayDay = today.getDate();
                const dobMonth = dob.getMonth();
                const dobDay = dob.getDate();

                const daysUntilBirthday = ((dobMonth - todayMonth) * 30 + (dobDay - todayDay) + 360) % 360;
                if (daysUntilBirthday > 0 && daysUntilBirthday <= 7) {
                    hasUpcoming = true;
                    const tr = document.createElement('tr');

                    const nameTd = document.createElement('td');
                    nameTd.textContent = data.name || '-';
                    tr.appendChild(nameTd);

                    const phoneTd = document.createElement('td');
                    phoneTd.textContent = data.phone || '-';
                    tr.appendChild(phoneTd);

                    const dobTd = document.createElement('td');
                    dobTd.textContent = data.dob || '-';
                    tr.appendChild(dobTd);

                    const codeTd = document.createElement('td');
                    codeTd.textContent = data.code || '-';
                    tr.appendChild(codeTd);

                    const actionsTd = document.createElement('td');
                    const sendReminderBtn = document.createElement('button');
                    sendReminderBtn.className = 'btn btn-success btn-sm';
                    sendReminderBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reminder';
                    sendReminderBtn.addEventListener('click', async () => {
                        await sendBirthdayReminder(data.name, data.phone, data.dob, data.code);
                    });
                    actionsTd.appendChild(sendReminderBtn);
                    tr.appendChild(actionsTd);

                    upcomingBirthdaysTableBody.appendChild(tr);
                }
            }
        });

        if (!hasUpcoming) {
            upcomingBirthdaysTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No upcoming birthdays in the next 7 days</td></tr>';
        }

    } catch (error) {
        upcomingBirthdaysTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Error loading upcoming birthdays</td></tr>';
        showError('Error loading upcoming birthdays: ' + error.message);
    }
}

// Send Birthday Reminder
async function sendBirthdayReminder(name, phone, dob, existingCode = null) {
    try {
        showStatus('Generating birthday discount...', 'info');
        let code = existingCode || generateCode();
        // Fetch the discount range from Firebase
        const docRef = doc(db, 'adminSettings', 'discountConfig');
        const docSnap = await getDoc(docRef);
        let discountRangeFrom = 1;
        let discountRangeTo = 10;
        if (docSnap.exists()) {
            const data = docSnap.data();
            discountRangeFrom = data.discountRangeFrom || 1;
            discountRangeTo = data.discountRangeTo || 10;
        }
        // Generate a random discount within the range
        const discount = Math.floor(Math.random() * (discountRangeTo - discountRangeFrom + 1)) + discountRangeFrom;

        if (!existingCode) {
            await addDoc(collection(db, 'discounts'), {
                name,
                phone,
                dob,
                discount: `${discount}%`,
                code,
                used: false,
                createdAt: serverTimestamp()
            });
        }

        let message = birthdayMessageTemplate.value
            .replace('{name}', name)
            .replace('{discount}', `${discount}%`)
            .replace('{code}', code);

        // Simulate sending SMS (replace with actual SMS API integration)
        console.log(`Sending SMS to ${phone}: ${message}`);
        
        showStatus(`Birthday discount sent to ${name}!`, 'success');
        loadStats();
        loadRecentDiscounts();
        loadBirthdays();
        loadUpcomingBirthdays();
    } catch (error) {
        showError('Failed to send birthday reminder: ' + error.message);
    }
}

// Load Reports
async function loadReports() {
    reportTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading...</td></tr>';

    try {
        const discountsRef = collection(db, 'discounts');
        const q = query(discountsRef);
        const querySnapshot = await getDocs(q);

        const customers = {};
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (!customers[data.phone]) {
                customers[data.phone] = {
                    name: data.name,
                    totalVisits: 0,
                    discountsUsed: 0,
                    codesGenerated: 0,
                    lastVisit: null,
                    lastDiscount: null // Store the discount percentage for the most recent visit
                };
            }
            customers[data.phone].totalVisits++;
            customers[data.phone].codesGenerated++;
            if (data.used) customers[data.phone].discountsUsed++;
            if (!customers[data.phone].lastVisit || (data.createdAt && data.createdAt.toDate() > customers[data.phone].lastVisit)) {
                customers[data.phone].lastVisit = data.createdAt?.toDate();
                customers[data.phone].lastDiscount = data.discount || '-'; // Store the discount for the most recent visit
            }
        });

        // Apply date range filter
        const startDate = reportDateStart.value ? new Date(reportDateStart.value) : null;
        const endDate = reportDateEnd.value ? new Date(reportDateEnd.value) : null;
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }

        reportTableBody.innerHTML = '';
        Object.entries(customers).forEach(([phone, data]) => {
            if ((startDate && data.lastVisit < startDate) || (endDate && data.lastVisit > endDate)) {
                return;
            }
            const tr = document.createElement('tr');

            const phoneTd = document.createElement('td');
            phoneTd.textContent = phone;
            tr.appendChild(phoneTd);

            const nameTd = document.createElement('td');
            nameTd.textContent = data.name || '-';
            tr.appendChild(nameTd);

            const visitsTd = document.createElement('td');
            visitsTd.textContent = data.totalVisits;
            tr.appendChild(visitsTd);

            const usedTd = document.createElement('td');
            usedTd.textContent = data.discountsUsed;
            tr.appendChild(usedTd);

            const codesTd = document.createElement('td');
            codesTd.textContent = data.codesGenerated;
            tr.appendChild(codesTd);

            // Display the discount percentage for the most recent visit
            const discountTd = document.createElement('td');
            discountTd.textContent = data.lastDiscount;
            tr.appendChild(discountTd);

            const lastVisitTd = document.createElement('td');
            lastVisitTd.textContent = data.lastVisit ? data.lastVisit.toLocaleDateString() : '-';
            tr.appendChild(lastVisitTd);

            reportTableBody.appendChild(tr);
        });

        if (reportTableBody.children.length === 0) {
            reportTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No customer data found</td></tr>';
        }

    } catch (error) {
        reportTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--danger);">Error loading reports</td></tr>';
        showError('Error loading reports: ' + error.message);
    }
}

// Initialize Usage Chart
function initUsageChart() {
    const ctx = document.getElementById('usageChart').getContext('2d');
    if (usageChart) usageChart.destroy();

    usageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Discounts Generated',
                    data: [100, 120, 90, 150, 130, 140, 160, 170, 180, 190, 200, 210],
                    borderColor: 'rgba(255, 112, 67, 1)',
                    backgroundColor: 'rgba(255, 112, 67, 0.2)',
                    fill: true
                },
                {
                    label: 'Discounts Used',
                    data: [50, 60, 45, 75, 65, 70, 80, 85, 90, 95, 100, 105],
                    borderColor: 'rgba(76, 175, 80, 1)',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#f5f5f5' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#f5f5f5' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#f5f5f5' }
                }
            }
        }
    });
}

// Export to CSV
exportCSVBtn.addEventListener('click', () => {
    const rows = [['Phone', 'Name', 'Total Visits', 'Discounts Used', 'Codes Generated', 'Discount Percentage', 'Last Visit']];
    const trs = reportTableBody.querySelectorAll('tr');
    trs.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length) {
            const row = Array.from(tds).map(td => `"${td.textContent.replace(/"/g, '""')}"`);
            rows.push(row);
        }
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customer_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
});

// Settings
saveSettingsBtn.addEventListener('click', async () => {
    const discountRangeFromValue = parseInt(discountRangeFrom.value);
    const discountRangeToValue = parseInt(discountRangeTo.value);

    // Validation
    if (isNaN(discountRangeFromValue) || discountRangeFromValue < 0 || discountRangeFromValue > 100) {
        showStatus('Discount range "From" must be between 0 and 100', 'error', settingsStatus);
        return;
    }
    if (isNaN(discountRangeToValue) || discountRangeToValue < 0 || discountRangeToValue > 100) {
        showStatus('Discount range "To" must be between 0 and 100', 'error', settingsStatus);
        return;
    }
    if (discountRangeFromValue > discountRangeToValue) {
        showStatus('Discount range "From" must be less than or equal to "To"', 'error', settingsStatus);
        return;
    }

    const settings = {
        emailNotifications: emailNotifications.checked,
        birthdayReminders: birthdayRemindersToggle.checked,
        birthdayMessageTemplate: birthdayMessageTemplate.value,
        requireDOB: requireDOB.checked,
        discountRangeFrom: discountRangeFromValue,
        discountRangeTo: discountRangeToValue
    };

    try {
        // Save to Firebase
        await setDoc(doc(db, 'adminSettings', 'discountConfig'), {
            ...settings,
            expiryDurationDays: 30 // Keep existing expiry duration
        }, { merge: true });

        showStatus('Settings saved successfully!', 'success', settingsStatus);
    } catch (error) {
        showStatus(`Error saving settings: ${error.message}`, 'error', settingsStatus);
    }
});

updateAdminBtn.addEventListener('click', async () => {
    const email = adminEmail.value.trim();
    const password = adminPassword.value;
    const confirm = confirmPassword.value;

    if (!email) {
        showStatus('Email is required', 'error', settingsStatus);
        return;
    }

    if (password && password !== confirm) {
        showStatus('Passwords do not match', 'error', settingsStatus);
        return;
    }

    try {
        const user = auth.currentUser;
        if (email !== user.email) {
            await updateEmail(user, email);
        }
        if (password) {
            await updatePassword(user, password);
        }
        showStatus('Admin details updated successfully!', 'success', settingsStatus);
        adminEmail.value = '';
        adminPassword.value = '';
        confirmPassword.value = '';
    } catch (error) {
        showStatus(`Error updating admin: ${error.message}`, 'error', settingsStatus);
    }
});

// Load Settings on Page Load
async function loadSettings() {
    try {
        const docRef = doc(db, 'adminSettings', 'discountConfig');
        const docSnap = await getDoc(docRef);
        const savedSettings = docSnap.exists() ? docSnap.data() : {};

        emailNotifications.checked = savedSettings.emailNotifications !== false;
        birthdayRemindersToggle.checked = savedSettings.birthdayReminders !== false;
        birthdayMessageTemplate.value = savedSettings.birthdayMessageTemplate || birthdayMessageTemplate.value;
        requireDOB.checked = savedSettings.requireDOB || false;
        discountRangeFrom.value = savedSettings.discountRangeFrom || 1;
        discountRangeTo.value = savedSettings.discountRangeTo || 10;
    } catch (error) {
        showStatus(`Error loading settings: ${error.message}`, 'error', settingsStatus);
    }
}

// Refresh Buttons
refreshDashboardBtn.addEventListener('click', loadStats);
refreshDiscountsBtn.addEventListener('click', () => loadRecentDiscounts(currentPage));
refreshRemindersBtn.addEventListener('click', () => {
    loadBirthdays();
    loadUpcomingBirthdays();
});
refreshReportsBtn.addEventListener('click', loadReports);
reportDateStart.addEventListener('change', loadReports);
reportDateEnd.addEventListener('change', loadReports);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});
