// CSS
const displayItem = 'display-item', 
      wrongInput = 'wrong-input';

let dbVersion = 4,
    db = null,
    objectStore = null,
    DBOpenReq = indexedDB.open('BankDB', dbVersion),
    currentUser = new User(),
    withdrawMoney = true,
    savingsAccount = true;

function dbEvent() {
    DBOpenReq.addEventListener('error', (err) => {
        
    });
    DBOpenReq.addEventListener('success', (ev) => {
        db = ev.target.result;
        let dbTransaction = db.transaction('accountDetails', 'readonly');
        dbTransaction.oncomplete = (ev) => {
        };
        dbTransaction.onerror = (err) => {
        }
        let acct = dbTransaction.objectStore('accountDetails'),
            request = acct.get(localStorage.getItem('currentUserId'));
        request.onsuccess = (ev) => {
            let user = request.result;
            currentUser.setUserDetails(user.id, user.name, user.dob, user.contact, user.mail, user.accountType, user.balance, user.homeaddress, user.pin, user.transactions);
        };
        request.onerror = (err) => {
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

const IDB = (function init() {
    if (localStorage.getItem('currentUserId') == '') {
        window.location.replace('index.html');
    } else {
        dbEvent();
    } 

})();

function savings() {
    let user = currentUser.details; 
    if (!user.accountType['savings']) { 
        alert('This account is not linked with savings');
        return;
    }
    document.getElementsByClassName('content')[0].classList.add(displayItem);
    document.getElementsByClassName('home-bar')[0].classList.add(displayItem);
    document.getElementsByClassName('transaction-bar')[0].classList.remove(displayItem);
    document.getElementById('text').innerHTML = '<h2>Savings Account</h2>';
    document.getElementsByClassName('transaction-block')[0].classList.remove(displayItem);
    savingsAccount = true;
}

function current() {
    let user = currentUser.details;
    if (!user.accountType['current']) { 
        alert('This account is not linked with current');
        return;
    }
    document.getElementsByClassName('content')[0].classList.add(displayItem);
    document.getElementsByClassName('home-bar')[0].classList.add(displayItem);
    document.getElementsByClassName('transaction-bar')[0].classList.remove(displayItem);
    document.getElementById('text').innerHTML = '<h2>Current Account</h2>';
    document.getElementsByClassName('transaction-block')[0].classList.remove(displayItem);
    savingsAccount = false;
}

function deposit() {
    document.getElementsByClassName('withdraw-tile')[0].classList.add(displayItem);
    document.getElementById('text').innerHTML = '<h2>Deposit</h2>';
    document.getElementsByClassName('amount-form')[0].classList.replace(displayItem, 'display-left');
    document.getElementsByClassName('message')[0].classList.add('display-left');
    document.getElementById('amount').focus();
    withdrawMoney = false;
}

function withdraw() {
    document.getElementsByClassName('deposit-tile')[0].classList.add(displayItem);
    document.getElementById('text').innerHTML = '<h2>Withdraw</h2>';
    document.getElementsByClassName('amount-form')[0].classList.replace(displayItem, 'display-right');
    document.getElementsByClassName('message')[0].classList.add('display-right');
    document.getElementById('amount').focus();
    withdrawMoney = true;
}

function myAccount() {
    if ( document.getElementsByClassName('my-account')[0].classList.contains(displayItem) ) {
        document.getElementsByClassName('update')[0].classList.add(displayItem);
        document.getElementsByClassName('my-account')[0].classList.remove(displayItem);
        document.getElementsByClassName('content')[0].classList.add(displayItem);
        document.getElementsByClassName('transaction-history')[0].classList.add(displayItem);
        document.getElementById('acct-button').innerText = 'Home';
        document.getElementById('trans-button').innerText = 'Transaction History';
    } else {
        document.getElementsByClassName('my-account')[0].classList.add(displayItem);
        document.getElementsByClassName('content')[0].classList.remove(displayItem);
        document.getElementById('acct-button').innerText = 'My Account';
    }

    let user = currentUser.details,
        details = '',
        flag = 0;
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
                details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>${[].concat(...Object.values(user[key])).join(', ')}</h4><br>`;
                continue;
            }
            details += `<h5>${displayKey.toUpperCase()}:</h5> <h4>${user[key]}</h4><br>`;
        }
    }
    document.getElementsByClassName('details')[0].innerHTML = details;
}

function transactionDetails(filterUser) {
    let details = '';
    filterUser.forEach(detail => {
        if (typeof(detail) == 'object' && Object.keys(detail).length > 0) {
            details = `<h4>Date: ${detail.date}</h4><h4>Time: ${detail.time}</h4><br>
                        <h4>Transaction: ${detail.transaction}</h4><h4>Amount: ${detail.amount}</h4><br>
                        <h4>Account: ${detail.account}</h4><h4>Balance: ${detail.balance}</h4><hr>` + details;
        } 
    });
    return details;
}

function transactionSummary() {
    let user = currentUser.details.transactions;

    if (user.length == 1) { 
        document.getElementsByClassName('history')[0].innerHTML = '<h4>No Transactions Performed</h4>';
        return;
    }
    
    let details = '',
        filterUser = [...user],
        start = document.getElementById('startDate').value,
        end = document.getElementById('endDate').value;

    if (start != '' && end != '') {
        filterUser = user.filter((item) => { return (item['date'] <= end && item['date'] >= start )});
        details = transactionDetails(filterUser);
    } else if (start != '') {
        filterUser = user.filter((item) => item['date'] >= start );
        details = transactionDetails(filterUser); 
    } else if (end != '') {
        filterUser = user.filter((item) => item['date'] <= end );
        details = transactionDetails(filterUser); 
    } else {
        details = transactionDetails(filterUser);
    }

    if (details == '') {
        details = `<h4>No Transactions Performed</h4>`;
    }

    document.getElementsByClassName('history')[0].innerHTML = details;
}

function transactionHistory() {
    if ( document.getElementsByClassName('transaction-history')[0].classList.contains(displayItem)) {
        document.getElementsByClassName('transaction-history')[0].classList.remove(displayItem);
        document.getElementsByClassName('my-account')[0].classList.add(displayItem);
        document.getElementsByClassName('content')[0].classList.add(displayItem);
        document.getElementById('trans-button').innerText = 'Home';
        document.getElementById('acct-button').innerText = 'My Account';
    } else {
        document.getElementsByClassName('transaction-history')[0].classList.add(displayItem);
        document.getElementsByClassName('content')[0].classList.remove(displayItem);
        document.getElementById('trans-button').innerText = 'Transaction History';
    }

    transactionSummary();
}

let wrongPasswordCount = 3;

function validateTransaction() {
    let user = currentUser.details,
        amount = document.getElementById('amount').value,
        pin = document.getElementById('pin').value,
        transSuccess = false;
        amount = +amount;
    if (amount == '') {
        document.getElementsByClassName('wrong-pin')[0].classList.remove(displayItem);
        document.getElementsByClassName('wrong-pin')[0].innerHTML = 'Enter Amount <br>';
        document.getElementById('amount').value = '';
        document.getElementById('amount').focus();
        document.getElementById('amount').classList.add(wrongInput);
        return;
    }
    if (pin != user.pin) {
        if (wrongPasswordCount == 0) {
            alert('Logged out due to too many attempts of incorrect pin');
            window.location.replace('index.html');
            return;
        }
        document.getElementsByClassName('wrong-pin')[0].classList.remove(displayItem);
        document.getElementsByClassName('wrong-pin')[0].innerHTML = 'Incorrect Pin <br>';
        document.getElementById('pin').value = '';
        document.getElementById('pin').focus();
        document.getElementById('pin').classList.add(wrongInput);
        alert(`${wrongPasswordCount--} Attempts Left`);
        return;
    }
    wrongPasswordCount = 3;
    let account = 'savings',
        transaction = '';
    document.getElementsByClassName('exit-button')[0].classList.add(displayItem);
    document.getElementsByClassName('amount-form')[0].classList.add(displayItem);
    if (!savingsAccount) { account = 'current';}
    if (withdrawMoney) {
        if (user.balance[account] > (amount)) {
            user.balance[account] -= amount;
            transaction = 'Withdraw';
            transSuccess = true;
        } else {
            document.getElementsByClassName('message')[0].classList.remove(displayItem);
            document.getElementsByClassName('message')[0].innerHTML = '<h2>Transaction Unsuccessfull! Insuffiecient Balance</h2> <h2>Balance: ' + user.balance[account] + '</h2>';
        }
    } else {
            user.balance[account] += amount;
            transaction = 'Deposit';
            transSuccess = true;
    }
    if (transSuccess) {
        document.getElementsByClassName('message')[0].classList.remove(displayItem);
        document.getElementsByClassName('message')[0].innerHTML = '<h2>Transaction Successfull</h2> <h2>Balance: ' + user.balance[account] + '</h2>';    
        let date = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,0) + '-' + String(new Date().getDate()).padStart(2,0),
            time = String(new Date().getHours()).padStart(2,0) + ':' + String(new Date().getMinutes()).padStart(2,0) + ':' + String(new Date().getSeconds()).padStart(2,0);
        user.transactions.push({
            id: user.transactions.length+1,
            date,
            time,
            transaction,
            amount,
            balance: user.balance[account],
            account,
        });
        currentUser.updateTransaction(user.balance, user.transactions);
        let dbTransaction = db.transaction('accountDetails', 'readwrite');
        dbTransaction.oncomplete = (ev) => {
        };
        dbTransaction.onerror = (err) => {
            console.error(err);
        }

        let acct = dbTransaction.objectStore('accountDetails'), 
            request = acct.put(user);  

        request.onsuccess = (ev) => {
        };
        request.onerror = (err) => {
        };   
    }
    setTimeout(() => window.location.replace('dashboard.html') , 2000);
}

function logout() {
    document.getElementById('logout').href = 'index.html';
    localStorage.setItem('currentUserId', '');
}

function updateDetails(){
    document.getElementsByClassName('update')[0].classList.remove(displayItem);
    document.getElementsByClassName('my-account')[0].classList.add(displayItem);
    document.getElementsByClassName('home-bar')[0].classList.add(displayItem);
    document.getElementsByClassName('transaction-bar')[0].classList.remove(displayItem);
    let form = document.getElementsByClassName('form')[0],
        tags = form.children,    
        user = currentUser.details,
        account = { savings: user.accountType.savings, current: user.accountType.current},
        address = user.homeaddress;
    Array.from(tags).forEach (child => {
        if (child.tagName == 'INPUT') {
            switch (child.id) {
                case 'contact':
                    child.value = +user.contact;
                    break;
                case 'mail':
                    child.value = user.mail;
                    break;
                case 'addressDoor':
                    child.value = address[child.id];
                    break;
                case 'addressHouseName':
                    child.value = address[child.id];
                    break;
                case 'addressStreet':
                    child.value = address[child.id];
                    break;
                case 'addressArea':
                    child.value = address[child.id];
                    break;  
                case 'addressCity':
                    child.value = address[child.id];
                    break;
                case 'savings':
                    if (account.savings) {
                        child.checked = true;
                        child.disabled = true;
                    }
                    break;     
                case 'current':
                    if (account.current) {
                        child.checked = true;
                        child.disabled = true;
                    }
                    break;           
                default:
                    break;
            }
        }       
    });
}

function update() {
    let form = document.getElementsByClassName('form')[0],
        tags = form.children,  
        contact = '',
        mail = '',
        accountType = { savings: false, current: false},
        address = {};
    for (child of tags) {
        if (child.tagName == 'INPUT') {
            if (child.id.indexOf('address') != -1) {
                if (child.value == '') {
                    child.classList.add(wrongInput);
                    return;
                }
                child.classList.remove(wrongInput);
                address[child.id] = child.value;
            } else if (child.id == 'savings') {
                if (child.checked) {
                    accountType.savings = true;
                }
            } else if (child.id == 'current') {
                if (child.checked) {
                    accountType.current = true;
                }
            } else {
                if (child.value == '') {
                    child.classList.add(wrongInput);
                    return;
                }
                child.classList.remove(wrongInput);
                if (child.id == 'contact') {
                    contact = child.value;
                }
                if (child.id == 'mail') {
                    mail = child.value;
                }
            }
        }
    }
    document.getElementsByClassName('home-bar')[0].classList.remove(displayItem);
    document.getElementsByClassName('transaction-bar')[0].classList.add(displayItem);
    address.addressState = currentUser.details.homeaddress.addressState;
    currentUser.updateAccount(address, accountType, contact, mail);
    let user = currentUser.details,
        dbTransaction = db.transaction('accountDetails', 'readwrite');
    dbTransaction.oncomplete = (ev) => {
    };
    dbTransaction.onerror = (err) => {
        console.error(err);
    }

    let acct = dbTransaction.objectStore('accountDetails'),
        request = acct.put(user);  

    request.onsuccess = (ev) => {
    };
    request.onerror = (err) => {
    };
    myAccount(); 
}
