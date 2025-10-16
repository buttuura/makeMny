// Fetch and update balances on profile page
document.addEventListener('DOMContentLoaded', function() {
	// Assume user is identified by name or phone (for demo, use localStorage or prompt)
	let userName = localStorage.getItem('userName');
	if (!userName) {
		userName = prompt('Enter your full name to view your profile:');
		localStorage.setItem('userName', userName);
	}

	fetch('http://localhost:5000/api/approved-deposits?accountName=' + encodeURIComponent(userName))
		.then(res => res.json())
		.then(deposits => {
			let totalDeposited = 0;
			let accountBalance = 0;
			deposits.forEach(dep => {
				totalDeposited += Number(dep.amount);
				accountBalance += Number(dep.amount); // For demo, balance = total deposited
			});
			document.getElementById('totalDeposited').textContent = 'UGX ' + totalDeposited;
			document.getElementById('accountBalance').textContent = 'UGX ' + accountBalance;
		});
});
// profile.js
// This file will update the profile page with the user's balances after admin approval.
// TODO: Implement fetch and update logic after backend changes.
