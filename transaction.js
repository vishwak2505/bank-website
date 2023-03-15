class User{
    constructor () {
        this.id = "";
        this.name = "";
        this.dob = "";
        this.contact = "";
        this.mail = "";
        this.accountType = { savings: false, current: false };
        this.homeaddress = [];
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
    
    updateAccount(address, accountType, contact, mail) {
        this.homeaddress = address;
        this.accountType = accountType;
        this.contact = contact;
        this.mail = mail;
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
    document.getElementsByClassName('content')[0].classList.add('display');
    document.getElementsByClassName('home-bar')[0].classList.add('display');
    document.getElementsByClassName('transaction-bar')[0].classList.remove('display');
    document.getElementById('text').innerHTML = '<h2>Savings Account</h2>';
    document.getElementsByClassName('transaction-block')[0].classList.remove('display');
    savingsAccount = true;
}

function current() {
    let user = currentUser.details;
    if (!user.accountType['current']) { 
        alert('This account is not linked with current');
        return;
    }
    document.getElementsByClassName('content')[0].classList.add('display');
    document.getElementsByClassName('home-bar')[0].classList.add('display');
    document.getElementsByClassName('transaction-bar')[0].classList.remove('display');
    document.getElementById('text').innerHTML = '<h2>Current Account</h2>';
    document.getElementsByClassName('transaction-block')[0].classList.remove('display');
    savingsAccount = false;
}

function deposit() {
    document.getElementsByClassName('withdraw-tile')[0].classList.add('display');
    document.getElementById('text').innerHTML = '<h2>Deposit</h2>';
    document.getElementsByClassName('amount-form')[0].classList.add('display-left');
    document.getElementsByClassName('amount-form')[0].classList.remove('display');
    document.getElementsByClassName('message')[0].classList.add('display-left');
    withdrawMoney = false;
}

function withdraw() {
    document.getElementsByClassName('deposit-tile')[0].classList.add('display');
    document.getElementById('text').innerHTML = '<h2>Withdraw</h2>';
    document.getElementsByClassName('amount-form')[0].classList.add('display-right');
    document.getElementsByClassName('amount-form')[0].classList.remove('display');
    document.getElementsByClassName('message')[0].classList.add('display-right');
    withdrawMoney = true;
}

function myAccount() {
    if ( document.getElementsByClassName('my-account')[0].classList.contains('display') ) {
        document.getElementsByClassName('update')[0].classList.add('display');
        document.getElementsByClassName('my-account')[0].classList.remove('display');
        document.getElementsByClassName('content')[0].classList.add('display');
        document.getElementsByClassName('transaction-history')[0].classList.add('display');
        document.getElementById('acct-button').innerText = 'Home';
        document.getElementById('trans-button').innerText = 'Transaction History';
    } else {
        document.getElementsByClassName('my-account')[0].classList.add('display');
        document.getElementsByClassName('content')[0].classList.remove('display');
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
            if (key == 'homeaddress') {
                details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>${user[key].join(', ')}</h4><br>`;
                continue;
            }
            details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>${user[key]}</h4><br>`;
        }
    }
    document.getElementsByClassName('details')[0].innerHTML = details;
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

    document.getElementsByClassName('history')[0].innerHTML = details;
}

function transactionHistory() {
    let user = currentUser.details.transactions;
    let details = '';
    if ( document.getElementsByClassName('transaction-history')[0].classList.contains('display')) {
        document.getElementsByClassName('transaction-history')[0].classList.remove('display');
        document.getElementsByClassName('my-account')[0].classList.add('display');
        document.getElementsByClassName('content')[0].classList.add('display');
        document.getElementById('trans-button').innerText = 'Home';
        document.getElementById('acct-button').innerText = 'My Account';
    } else {
        document.getElementsByClassName('transaction-history')[0].classList.add('display');
        document.getElementsByClassName('content')[0].classList.remove('display');
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

    document.getElementsByClassName('history')[0].innerHTML = details;
}

let count = 3;

function validateTransaction() {
    let user = currentUser.details;
    let amount = document.getElementById('amount').value;
    amount = Number(amount);
    let pin = document.getElementById('pin').value;
    let transSuccess = false;
    if (amount == '') {
        document.getElementsByClassName('wrongPin')[0].classList.remove('display');
        document.getElementsByClassName('wrongPin')[0].innerHTML = 'Enter Amount <br>';
        document.getElementById('amount').value = '';
        document.getElementById('amount').focus();
        document.getElementById('amount').classList.add('wrong-input');
        return;
    }
    if (pin != user.pin) {
        if (count == 0) {
            alert('Logged out due to too many attempts of incorrect pin');
            window.location.replace('index.html');
            return;
        }
        document.getElementsByClassName('wrongPin')[0].classList.remove('display');
        document.getElementsByClassName('wrongPin')[0].innerHTML = 'Incorrect Pin <br>';
        document.getElementById('pin').value = '';
        document.getElementById('pin').focus();
        document.getElementById('pin').classList.add('wrong-input');
        alert(`${count--} Attempts Left`);
        return;
    }
    count = 3;
    let account = 'savings';
    let transaction = '';
    document.getElementById('exit-button').classList.add('display');
    document.getElementsByClassName('amount-form')[0].classList.add('display');
    if (!savingsAccount) { account = 'current';}
    if (withdrawMoney) {
        if (user.balance[account] > (amount)) {
            user.balance[account] -= amount;
            transaction = 'Withdraw';
            transSuccess = true;
        } else {
            document.getElementsByClassName('message')[0].classList.remove('display');
            document.getElementsByClassName('message')[0].innerHTML = '<h2>Transaction Unsuccessfull! Insuffiecient Balance</h2> <h2>Balance: ' + user.balance[account] + '</h2>';
        }
    } else {
            user.balance[account] += amount;
            transaction = 'Deposit';
            transSuccess = true;
    }
    if (transSuccess) {
        document.getElementsByClassName('message')[0].classList.remove('display');
        document.getElementsByClassName('message')[0].innerHTML = '<h2>Transaction Successfull</h2> <h2>Balance: ' + user.balance[account] + '</h2>';    
        let date = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,0) + '-' + String(new Date().getDate()).padStart(2,0);
        let time = String(new Date().getHours()).padStart(2,0) + ':' + String(new Date().getMinutes()).padStart(2,0) + ':' + String(new Date().getSeconds()).padStart(2,0);
        user.transactions.push({
            id: user.transactions.length+1,
            date,
            time,
            transaction,
            amount,
            balance: user.balance[account],
            account,
        });
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

function updateDetails(){
    document.getElementsByClassName('update')[0].classList.remove('display');
    document.getElementsByClassName('my-account')[0].classList.add('display');
    document.getElementsByClassName('home-bar')[0].classList.add('display');
    document.getElementsByClassName('transaction-bar')[0].classList.remove('display');
    let form = document.getElementsByClassName('form')[0];
    let tags = form.children;    
    let user = currentUser.details;
    let account = { savings: user.accountType.savings, current: user.accountType.current};
    let address = user.homeaddress;
    for (child of tags) {
        if (child.tagName == 'INPUT') {
            if (child.name == 'contact') {
                child.value = Number(user.contact);
            }
            if (child.name == 'mail') {
                child.value = user.mail;
            }
            if (child.name == 'addressDoor') {
                child.value = address[0];
            }
            if (child.name == 'addressHouseName') {
                child.value = address[1];
            }      
            if (child.name == 'addressStreet') {
                child.value = address[2];
            }
            if (child.name == 'addressArea') {
                child.value = address[3]; 
            }
            if (child.name == 'addressCity') {
                child.value = address[4];
            }             
            if (child.name == 'savings') {
                if (account.savings) {
                    child.checked = true;
                    child.disabled = true;
                }
            }
            if (child.name == 'current') {
                if (account.current) {
                    child.checked = true;
                    child.disabled = true;
                }
            }
        }       
    }
}

function update() {
    document.getElementsByClassName('home-bar')[0].classList.remove('display');
    document.getElementsByClassName('transaction-bar')[0].classList.add('display');
    let form = document.getElementsByClassName('form')[0];
    let tags = form.children;    
    let contact = '';
    let mail = '';
    let accountType = { savings: false, current: false};
    let address = [];
    for (child of tags) {
        if (child.tagName == 'INPUT') {
            if (child.name.indexOf('address') != -1) {
                address.push(child.value);
                continue;
            }
            if (child.name == 'savings') {
                if (child.checked) {
                    accountType.savings = true;
                }
                continue;
            }
            if (child.name == 'current') {
                if (child.checked) {
                    accountType.current = true;
                }
                continue;
            }
            if (child.name == 'contact') {
                contact = child.value;
            }
            if (child.name == 'mail') {
                mail = child.value;
            }
        }
    }
    address.push(currentUser.details.homeaddress[5]);
    currentUser.updateAccount(address, accountType, contact, mail);
    let user = currentUser.details;
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
    myAccount(); 
}
