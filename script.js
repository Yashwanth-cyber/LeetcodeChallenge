// script.js

// Initialize or retrieve data from localStorage
let data = JSON.parse(localStorage.getItem('leetcodeChallengeData')) || {
    members: [],
    problems_solved: {},
    total_problems: 50,
    start_date: new Date().toISOString(),
    winners: {}
};

// DOM Elements
const addMemberBtn = document.getElementById('addMemberBtn');
const removeMemberBtn = document.getElementById('removeMemberBtn');
const setProblemCountBtn = document.getElementById('setProblemCountBtn');

const addMemberModal = document.getElementById('addMemberModal');
const removeMemberModal = document.getElementById('removeMemberModal');
const setProblemCountModal = document.getElementById('setProblemCountModal');

const closeAddMember = document.getElementById('closeAddMember');
const closeRemoveMember = document.getElementById('closeRemoveMember');
const closeSetProblemCount = document.getElementById('closeSetProblemCount');

const confirmAddMember = document.getElementById('confirmAddMember');
const confirmRemoveMember = document.getElementById('confirmRemoveMember');
const confirmSetProblemCount = document.getElementById('confirmSetProblemCount');

const newMemberName = document.getElementById('newMemberName');
const memberToRemove = document.getElementById('memberToRemove');
const totalProblemCount = document.getElementById('totalProblemCount');

const totalProblemsDisplay = document.getElementById('totalProblems');
const winnersList = document.getElementById('winnersList');
const membersList = document.getElementById('membersList');

const confirmReset = document.getElementById('confirmReset');
const resetChallengeBtn = document.getElementById('resetChallengeBtn');

// Event Listeners for Opening Modals
addMemberBtn.addEventListener('click', () => {
    addMemberModal.style.display = 'block';
});

removeMemberBtn.addEventListener('click', () => {
    populateRemoveMemberOptions();
    removeMemberModal.style.display = 'block';
});

setProblemCountBtn.addEventListener('click', () => {
    totalProblemCount.value = data.total_problems;
    setProblemCountModal.style.display = 'block';
});

// Event Listeners for Closing Modals
closeAddMember.addEventListener('click', () => {
    addMemberModal.style.display = 'none';
});

closeRemoveMember.addEventListener('click', () => {
    removeMemberModal.style.display = 'none';
});

closeSetProblemCount.addEventListener('click', () => {
    setProblemCountModal.style.display = 'none';
});

// Close modals when clicking outside of them
window.addEventListener('click', (event) => {
    if (event.target == addMemberModal) {
        addMemberModal.style.display = 'none';
    }
    if (event.target == removeMemberModal) {
        removeMemberModal.style.display = 'none';
    }
    if (event.target == setProblemCountModal) {
        setProblemCountModal.style.display = 'none';
    }
});

// Confirm Add Member
confirmAddMember.addEventListener('click', () => {
    const name = newMemberName.value.trim();
    if (name && !data.members.includes(name)) {
        data.members.push(name);
        data.problems_solved[name] = {
            count: 0,
            join_date: new Date().toISOString()
        };
        saveData();
        renderMembers();
        renderWinners();
        newMemberName.value = '';
        addMemberModal.style.display = 'none';
        showNotification(`Member "${name}" added successfully!`, 'success');
    } else {
        showNotification('Member already exists or invalid name.', 'error');
    }
});

// Populate Remove Member Options
function populateRemoveMemberOptions() {
    memberToRemove.innerHTML = '';
    if (data.members.length === 0) {
        memberToRemove.innerHTML = '<option value="">No Members Available</option>';
    } else {
        data.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            memberToRemove.appendChild(option);
        });
    }
}

// Confirm Remove Member
confirmRemoveMember.addEventListener('click', () => {
    const member = memberToRemove.value;
    if (member && data.members.includes(member)) {
        data.members = data.members.filter(m => m !== member);
        delete data.problems_solved[member];
        delete data.winners[member];
        saveData();
        renderMembers();
        renderWinners();
        removeMemberModal.style.display = 'none';
        showNotification(`Member "${member}" removed successfully!`, 'success');
    } else {
        showNotification('Invalid member selection.', 'error');
    }
});

// Confirm Set Problem Count
confirmSetProblemCount.addEventListener('click', () => {
    const count = parseInt(totalProblemCount.value);
    if (count >= 1) {
        data.total_problems = count;
        // Check for existing winners who might no longer qualify
        for (let member in data.winners) {
            if (data.problems_solved[member].count < count) {
                delete data.winners[member];
            }
        }
        saveData();
        renderMembers();
        renderWinners();
        totalProblemsDisplay.textContent = count;
        setProblemCountModal.style.display = 'none';
        showNotification('Total problem count updated successfully!', 'success');
    } else {
        showNotification('Total problem count must be at least 1.', 'error');
    }
});

// Render Challenge Goal
totalProblemsDisplay.textContent = data.total_problems;

// Render Winners
function renderWinners() {
    winnersList.innerHTML = '';
    const winnersArray = Object.keys(data.winners);
    if (winnersArray.length === 0) {
        winnersList.innerHTML = '<p>No winners yet. Keep solving!</p>';
    } else {
        winnersArray.forEach(winner => {
            const badge = document.createElement('div');
            badge.classList.add('winner-badge');
            const winDate = new Date(data.winners[winner]);
            badge.innerHTML = `<i class="fas fa-medal"></i> ${winner} completed on ${winDate.toLocaleDateString()} ${winDate.toLocaleTimeString()}`;
            winnersList.appendChild(badge);
        });
    }
}

// Render Members and Their Progress
function renderMembers() {
    membersList.innerHTML = '';
    data.members.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('member');

        // Member Info
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('member-info');
        infoDiv.textContent = member;

        // Progress Bar
        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('progress-bar-container');

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');

        const progress = document.createElement('div');
        progress.classList.add('progress');
        const solved = data.problems_solved[member].count;
        const total = data.total_problems;
        const progressPercent = Math.min(1, solved / total);
        progress.style.width = `${progressPercent * 100}%`;
        progress.style.backgroundColor = interpolateColor(progressPercent);

        progressBar.appendChild(progress);

        const progressText = document.createElement('div');
        progressText.classList.add('progress-text');
        progressText.textContent = `${solved}/${total} Problems`;

        progressBarContainer.appendChild(progressBar);
        progressBarContainer.appendChild(progressText);

        // Action Buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('member-actions');

        const incrementBtn = document.createElement('button');
        incrementBtn.classList.add('increment-btn');
        incrementBtn.innerHTML = '<i class="fas fa-plus"></i>';
        incrementBtn.title = `Increment ${member}'s Problems`;
        incrementBtn.addEventListener('click', () => {
            incrementProblems(member);
        });

        const decrementBtn = document.createElement('button');
        decrementBtn.classList.add('decrement-btn');
        decrementBtn.innerHTML = '<i class="fas fa-minus"></i>';
        decrementBtn.title = `Decrement ${member}'s Problems`;
        decrementBtn.addEventListener('click', () => {
            decrementProblems(member);
        });

        actionsDiv.appendChild(incrementBtn);
        actionsDiv.appendChild(decrementBtn);

        // Assemble Member Div
        memberDiv.appendChild(infoDiv);
        memberDiv.appendChild(progressBarContainer);
        memberDiv.appendChild(actionsDiv);

        membersList.appendChild(memberDiv);
    });
}

// Increment Problems Solved
function incrementProblems(member) {
    if (data.problems_solved[member].count < data.total_problems) {
        data.problems_solved[member].count += 1;
        if (data.problems_solved[member].count === data.total_problems) {
            data.winners[member] = new Date().toISOString();
            showNotification(`🎉 Congratulations ${member}! You've completed the challenge.`, 'success');
        }
        saveData();
        renderMembers();
        renderWinners();
    }
}

// Decrement Problems Solved
function decrementProblems(member) {
    if (data.problems_solved[member].count > 0) {
        data.problems_solved[member].count -= 1;
        if (data.winners.hasOwnProperty(member) && data.problems_solved[member].count < data.total_problems) {
            delete data.winners[member];
        }
        saveData();
        renderMembers();
        renderWinners();
    }
}

// Reset Challenge
resetChallengeBtn.addEventListener('click', () => {
    if (confirmReset.checked) {
        if (confirm('Are you sure you want to reset the entire challenge? This action cannot be undone.')) {
            data = {
                members: [],
                problems_solved: {},
                total_problems: 50,
                start_date: new Date().toISOString(),
                winners: {}
            };
            saveData();
            renderMembers();
            renderWinners();
            totalProblemsDisplay.textContent = data.total_problems;
            showNotification('🎉 The challenge has been completely reset!', 'success');
        }
    } else {
        showNotification('Please confirm to reset the challenge.', 'error');
    }
});

// Save Data to localStorage
function saveData() {
    localStorage.setItem('leetcodeChallengeData', JSON.stringify(data));
}

// Interpolate Color from Red to Green based on progress
function interpolateColor(progress) {
    const startHue = 0;    // Red
    const endHue = 120;    // Green
    const currentHue = startHue + (endHue - startHue) * progress;
    const rgb = hslToRgb(currentHue / 360, 0.5, 0.5);
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

// Convert HSL to RGB
function hslToRgb(h, s, l){
    let r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Notification System
function showNotification(message, type) {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '300';
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    // Append to container
    notificationContainer.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fadeOut');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        });
    }, 3000);
}

// Initial Rendering
renderMembers();
renderWinners();