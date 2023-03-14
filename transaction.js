class User{
    constructor () {
        this.id = "";
        this.name = "";
        this.dob = "";
        this.contact = "";
        this.mail = "";
        this.accountType = { savings: false, current: false };
        this.homeaddress = "";
        this.balance = { savings: 0, current: 0 };
        this.pin = "";
        this.transactions = [0];
    }

    setUserDetails(id, name, dob, contact, mail, accountType, balance, homeaddress, pin, transactions) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.contact = contact;
        this.mail = mail;
        this.accountType = accountType;
        this.balance = balance;
        this.homeaddress = homeaddress;
        this.pin = pin;
        this.transactions = transactions;
    }

    updateTransaction(balance, transaction) {
        this.balance = balance;
        this.transactions = transaction;
    }

    get details() {
        return ({
            id: this.id,
            pin: this.pin,
            name: this.name,
            dob: this.dob,
            contact: this.contact,
            mail: this.mail,
            accountType: this.accountType,
            balance: this.balance,
            homeaddress: this.homeaddress,
            transactions: this.transactions,
        });
    }
}

let db = null;
let objectStore = null;
let DBOpenReq = indexedDB.open('BankDB', 4);
let currentUser = new User();
let withdrawMoney = true;
let savingsAccount = true;

const IDB = (function init() {

    if (localStorage.getItem('currentUserId') == '') {
        window.location.replace('index.html');
    } else {

        DBOpenReq.addEventListener('error', (err) => {
        
        });
        DBOpenReq.addEventListener('success', (ev) => {
            db = ev.target.result;
            let tx = db.transaction('accountDetails', 'readonly');
            tx.oncomplete = (ev) => {
                console.log(ev);
            };
            tx.onerror = (err) => {
                console.warn(err);
            }
            let acct = tx.objectStore('accountDetails');
            let request = acct.get(localStorage.getItem('currentUserId'));
            request.onsuccess = (ev) => {
                let user = request.result;
                currentUser.setUserDetails(user.id, user.name, user.dob, user.contact, user.mail, user.accountType, user.balance, user.homeaddress, user.pin, user.transactions);
            };
            request.onerror = (err) => {
                console.log('error');
            };
        });
        DBOpenReq.addEventListener('upgradeneeded', (ev) => {
            db = ev.target.result; 
            if( !db.objectStoreNames.contains('accountDetails')){
                objectStore = db.createObjectStore('accountDetails', {
                    keyPath: 'id'
                });
            }
        });
    } 

})();

function savings() {
    let user = currentUser.details; 
    if (!user.accountType['savings']) { 
        alert('This account is not linked with savings');
        return;
    }
    document.getElementById('content').style.display = 'none';
    document.getElementById('home-bar').style.display = 'none';
    document.getElementById('transaction-bar').style.display = '';
    document.getElementById('text').innerHTML = '<h2>Savings Account</h2>';
    document.getElementById('transaction-block').style.display = '';
    savingsAccount = true;
}

function current() {
    let user = currentUser.details;
    if (!user.accountType['current']) { 
        alert('This account is not linked with current');
        return;
    }
    document.getElementById('content').style.display = 'none';
    document.getElementsById('home-bar').style.display = 'none';
    document.getElementById('transaction-bar').style.display = '';
    document.getElementById('text').innerHTML = '<h2>Current Account</h2>';
    document.getElementById('transaction-block').style.display = '';
    savingsAccount = false;
}

function deposit() {
    document.getElementById('withdraw-tile').style.display = 'none';
    document.getElementById('text').innerHTML = '<h2>Deposit</h2>';
    document.getElementById('amount-form').style.display = '';
    document.getElementById('amount-form').style.left = '2%';
    document.getElementById('message').style.left = '2%';
    withdrawMoney = false;
}

function withdraw() {
    document.getElementById('deposit-tile').style.display = 'none';
    document.getElementById('text').innerHTML = '<h2>Withdraw</h2>';
    document.getElementById('amount-form').style.display = '';
    document.getElementById('amount-form').style.right = '2%';
    document.getElementById('message').style.right = '2%';
    withdrawMoney = true;
}

function myAccount() {
    if ( document.getElementById('my-account').style.display == 'none') {
        document.getElementById('my-account').style.display = '';
        document.getElementById('content').style.display = 'none';
        document.getElementById('transaction-history').style.display = 'none';
        document.getElementById('acct-button').innerText = 'Home';
        document.getElementById('trans-button').innerText = 'Transaction History';
    } else {
        document.getElementById('my-account').style.display = 'none';
        document.getElementById('content').style.display = '';
        document.getElementById('acct-button').innerText = 'My Account';
    }

    let user = currentUser.details;
    let details = '';
    let flag = 0;
    for (key in user) {
        if (key != 'pin' && key != 'transactions') {
            let displayKey = key;
            if (key == 'accountType') {
                if (user[key]['savings'] != true) {
                    details += `<h5>ACCOUNT TYPE:</h5> <h4>Current</h4><br>`;
                    flag = 1;
                } else if (user[key]['current'] != true) {
                    details += `<h5>ACCOUNT TYPE:</h5> <h4>Savings</h4><br>`;
                } else {
                    details += `<h5>ACCOUNT TYPE:</h5> <h4>Savings & Current</h4><br>`;
                    flag = 2;
                }
                continue;
            }
            if (key == 'balance') {
                if (flag == 1) {
                    details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>${user[key]['current']}</h4><br>`;
                } else if (flag == 2) {
                    details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>Savings: ${user[key]['savings']} Current: ${user[key]['current']}</h4><br>`;
                } else {
                    details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>${user[key]['savings']}</h4><br>`;
                }
                continue;
            }
            details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>${user[key]}</h4><br>`;
        }
    }
    document.getElementById('details').innerHTML = details;
    console.log(currentUser.details);

}

function transactionSummary() {
    let user = currentUser.details.transactions;
    let details = '';
    let filterUser = [...user];
    let start = document.getElementById('startDate').value;
    let end = document.getElementById('endDate').value;

    if (start != '' && end != '') {
        filterUser = user.filter((item) => { return (item['date'] <= end && item['date'] >= start )});
        for (index in filterUser) {
            if (typeof(filterUser[index]) == 'object') {
                details = `<h4>Day: ${filterUser[index].date}</h4><h4>Time: ${filterUser[index].time}</h4><br>
                            <h4>Transaction: ${filterUser[index].transaction}</h4><h4>Amount: ${filterUser[index].amount}</h4><br>
                            <h4>Account: ${filterUser[index].account}</h4><h4>Balance: ${filterUser[index].balance}</h4><hr>` + details;
            }   
        }   
    } else if (start != '') {
        filterUser = user.filter((item) => item['date'] >= start );
        for (index in filterUser) {
            if (typeof(filterUser[index]) == 'object') {
                details = `<h4>Day: ${filterUser[index].date}</h4><h4>Time: ${filterUser[index].time}</h4><br>
                            <h4>Transaction: ${filterUser[index].transaction}</h4><h4>Amount: ${filterUser[index].amount}</h4><br>
                            <h4>Account: ${filterUser[index].account}</h4><h4>Balance: ${filterUser[index].balance}</h4><hr>` + details;
            }   
        } 
    } else if (end != '') {
        filterUser = user.filter((item) => item['date'] <= end );
        for (index in filterUser) {
            if (typeof(filterUser[index]) == 'object') {
                details = `<h4>Day: ${filterUser[index].date}</h4><h4>Time: ${filterUser[index].time}</h4><br>
                            <h4>Transaction: ${filterUser[index].transaction}</h4><h4>Amount: ${filterUser[index].amount}</h4><br>
                            <h4>Account: ${filterUser[index].account}</h4><h4>Balance: ${filterUser[index].balance}</h4><hr>` + details;
            }   
        } 
    } else {
        for (index in user) {
            if (typeof(user[index]) == 'object') {
                details = `<h4>Day: ${user[index].date}</h4><h4>Time: ${user[index].time}</h4><br>
                            <h4>Transaction: ${user[index].transaction}</h4><h4>Amount: ${user[index].amount}</h4><br>
                            <h4>Account: ${user[index].account}</h4><h4>Balance: ${user[index].balance}</h4><hr>` + details;
            }
        }
    }

    if (details == '') {
        details = `<h4>No Transactions Performed</h4>`;
    }

    document.getElementById('history').innerHTML = details;
}

function transactionHistory() {
    let user = currentUser.details.transactions;
    let details = '';
    if ( document.getElementById('transaction-history').style.display == 'none') {
        document.getElementById('transaction-history').style.display = '';
        document.getElementById('my-account').style.display = 'none';
        document.getElementById('content').style.display = 'none';
        document.getElementById('trans-button').innerText = 'Home';
        document.getElementById('acct-button').innerText = 'My Account';
    } else {
        document.getElementById('transaction-history').style.display = 'none';
        document.getElementById('content').style.display = '';
        document.getElementById('trans-button').innerText = 'Transaction History';
    }

    for (index in user) {
        if (typeof(user[index]) == 'object') {
            details = `<h4>Day: ${user[index].date}</h4><h4>Time: ${user[index].time}</h4><br>
                        <h4>Transaction: ${user[index].transaction}</h4><h4>Amount: ${user[index].amount}</h4><br>
                        <h4>Account: ${user[index].account}</h4><h4>Balance: ${user[index].balance}</h4><hr>` + details;
        }
    }

    if (details == '') {
        details = `<h4>No Transactions Performed</h4>`;
    }

    document.getElementById('history').innerHTML = details;
}

let count = 3;

function validateTransaction() {
    let user = currentUser.details;
    let amount = document.getElementById('amount').value;
    amount = Number(amount);
    let pin = document.getElementById('pin').value;
    let transSuccess = false;
    if (pin != user.pin) {
        if (count == 0) {
            alert('Logged out due to too many attempts of incorrect pin');
            window.location.replace('index.html');
            return;
        }
        alert(`${count--} Attempts Left`);
        document.getElementById('wrongPin').style.display = '';
        document.getElementById('pin').value = '';
        document.getElementById('pin').focus();
        document.getElementById('pin').style.backgroundColor = 'rgba(247, 7, 19, 0.4)';
        return;
    }
    count = 3;
    let index = 'savings';
    document.getElementById('exit-button').style.display = 'none';
    if (!savingsAccount) { index = 'current';}
    if (withdrawMoney) {
        if (user.balance[index] > (amount)) {
            user.balance[index] -= amount;
            document.getElementById('amount-form').style.display = 'none';
            document.getElementById('message').style.display = '';
            document.getElementById('message').innerHTML = '<h2>Transaction Successfull</h2> <h2>Balance: ' + user.balance[index] + '</h2>';
            let date = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,0) + '-' + String(new Date().getDate()).padStart(2,0);
            let time = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2,0) + ':' + String(new Date().getSeconds()).padStart(2,0);
            user.transactions.push({
                id: user.transactions.length+1,
                date,
                time,
                transaction: 'Withdraw',
                amount: amount,
                balance: user.balance[index],
                account: index,
            });
            transSuccess = true;
        }
        if (user.balance[index] < amount) {
            document.getElementById('amount-form').style.display = 'none';
            document.getElementById('message').style.display = '';
            document.getElementById('message').innerHTML = '<h2>Transaction Unsuccessfull! Insuffiecient Balance</h2> <h2>Balance: ' + user.balance[index] + '</h2>';
        }
    } else {
            user.balance[index] += amount;
            document.getElementById('amount-form').style.display = 'none';
            document.getElementById('message').style.display = '';
            document.getElementById('message').innerHTML = '<h2>Transaction Successfull</h2> <h2>Balance: ' + user.balance[index] + '</h2>';
            let date = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,0) + '-' + String(new Date().getDate()).padStart(2,0);
            let time = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2,0) + ':' + String(new Date().getSeconds()).padStart(2,0);
            user.transactions.push({
                id: user.transactions.length+1,
                date,
                time,
                transaction: "Deposit",
                amount: amount,
                balance: user.balance[index],
                account: index,
            });
            transSuccess = true;
    }
    if (transSuccess) {
        console.log(user.transactions);
        currentUser.updateTransaction(user.balance, user.transactions);
        let tx = db.transaction('accountDetails', 'readwrite');
        tx.oncomplete = (ev) => {
            console.log(ev);
        };
        tx.onerror = (err) => {
            console.warn(err);
        }

        let acct = tx.objectStore('accountDetails'); 
        let request = acct.put(user);  

        request.onsuccess = (ev) => {
            console.log('success');
        };
        request.onerror = (err) => {
            console.log('error');
        };   
    }
    setTimeout(() => window.location.replace('dashboard.html') , 2000);
}

function logout() {
    document.getElementById('logout').href = 'index.html';
    localStorage.setItem('currentUserId', '');
}

