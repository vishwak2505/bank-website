const uid = () => {
    let key = Date.now().toString(10).slice(0, 5) + Date.now().toString(10).slice(-5);
    return key;
}

//CSS
const displayItem = 'display-item', 
      wrongInput = 'wrong-input';

let dbVersion = 4,
    db = null,
    objectStore = null,
    DBOpenReq = indexedDB.open('BankDB', dbVersion),
    currentUser = new User(),
    states = [];

async function getState(file) {
    let response = await fetch(file),
        list = await response.json();
    
    list['state'].forEach(values => {
        states.push(values['state']);
    });

    let state = document.getElementById('addressState');
    states.forEach(value => {
        let option = document.createElement("option");
        option.value = value;
        option.text = value;
        state.add(option);
    }); 
}

function dbEvent() {
    DBOpenReq.addEventListener('error', (err) => {
        
    });
    DBOpenReq.addEventListener('success', (ev) => {
        db = ev.target.result;
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

(function init() {
    getState('/state');
    localStorage.setItem('currentUserId', '');
    dbEvent();
})();

function signUp() {
    let form = document.getElementById("SignUpForm"),
        tags = form.children,
        userDetails = [],
        accountType = { savings: false, current: false },
        address = [];
    for (child of tags) {
        if (child.tagName == 'INPUT') {
            if (child.id.indexOf('address') != -1) {
                if (child.value == '') {
                    child.classList.add(wrongInput);
                    return;
                }
                child.classList.remove(wrongInput);
                address[child.id] = child.value;
                continue;
            }
            if (child.id == 'savings') {
                if (child.checked) {
                    accountType.savings = true;
                }
                continue;
            }
            if (child.id == 'current') {
                if (child.checked) {
                    accountType.current = true;
                }
                continue;
            }
            if (child.value == '') {
                child.classList.add(wrongInput);
                return;
            }
            child.classList.remove(wrongInput);
            userDetails.push(child.value);
        }
        if (child.tagName == 'SELECT') {
            address[child.id] = child.value;
        }
    }
    let id = uid();
    currentUser.setUserLoginDetails(id, ...userDetails, accountType, address); 
    document.getElementsByClassName('signup')[0].classList.add(displayItem);
    document.getElementsByClassName('block')[0].classList.replace('block-height', 'block-height-password');
    document.getElementsByClassName('hide')[0].classList.add(displayItem);
    setTimeout(() => document.getElementsByClassName('password')[0].classList.remove(displayItem), 100);
}

function setPin() {
    document.getElementsByClassName('password')[0].classList.remove(displayItem);
    let pin = document.getElementById('pin').value,
        confirmPin = document.getElementById('confirmPin').value;
    
    if(pin == '' || pin != confirmPin){
        document.getElementsByClassName('wrong-password')[0].classList.remove(displayItem);
        document.getElementById('pin').classList.add(wrongInput);
        document.getElementById('confirmPin').classList.add(wrongInput);
        document.pinForm.setAttribute("onsubmit", "return false;");
    } else {
        currentUser.setUserPin(pin);
        let user = currentUser.details,
            dbTransaction = db.transaction('accountDetails', 'readwrite');
        dbTransaction.oncomplete = (ev) => {
        };
        dbTransaction.onerror = (err) => {
            console.error(err);
        }

        localStorage.setItem('currentUserId', user.id);

        document.pinForm.onsubmit = "";
        document.pinForm.setAttribute("action", "dashboard.html");

        let acct = dbTransaction.objectStore('accountDetails'),
            request = acct.add(user);  

        request.onsuccess = (ev) => {
        };
        request.onerror = (err) => {
        };
    }
}

let accountExist = false;

function checkAccountId() {
    if (accountExist) return;
    let accountID = document.getElementById('accountId').value;
    if (accountID.length != 10) {
        document.getElementsByClassName('account-id')[0].classList.remove(displayItem);
        document.getElementById('accountId').classList.add(wrongInput);
        document.getElementById('accountId').focus();
        document.getElementsByClassName('warning')[0].classList.add(displayItem);
        return;
    } else {
        document.getElementsByClassName('account-id')[0].classList.add(displayItem);
        document.getElementById('accountId').classList.remove(wrongInput);
        let dbTransaction = db.transaction('accountDetails', 'readonly');
        dbTransaction.oncomplete = (ev) => {
        };
        dbTransaction.onerror = (err) => {
            console.error(err);
        }
        let acct = dbTransaction.objectStore('accountDetails'),
            request = acct.get(accountID);
        request.onsuccess = (ev) => {
            let user = request.result;
            if (user) {
                accountExist = true;
                currentUser.setUserPin(user.pin);
                document.getElementById('loginPin').readOnly = false;
                document.getElementsByClassName('warning')[0].innerHTML = '';
            } else {
                document.getElementsByClassName('warning')[0].classList.remove(displayItem);
                document.getElementsByClassName('warning')[0].innerHTML = 'Account Not Found!!<br>';
                document.getElementById('accountId').value = '';
                document.getElementById('accountId').classList.add('account-id-incorrect');
                document.getElementById('accountId').focus(); 
            }    
        };
        request.onerror = (err) => {
        };
    }
}

function login() {

    let accountID = document.getElementById('accountId').value.toString(),
        pin = document.getElementById('loginPin').value;
    document.loginForm.setAttribute('onsubmit', 'return false;');
    if (!accountExist) {
        document.getElementById('accountId').classList.add(wrongInput);
        document.getElementById('accountId').value = '';
        return;
    }

    if (pin == currentUser.details.pin) {
        localStorage.setItem('currentUserId', accountID);
        document.loginForm.setAttribute("action", "dashboard.html");
        document.loginForm.onsubmit = "";
    } else {
        document.getElementsByClassName('warning')[0].classList.remove(displayItem);
        document.getElementsByClassName('warning')[0].innerHTML = 'Incorrect Pin <br>';
        document.getElementById('loginPin').classList.add(wrongInput);
        document.getElementById('loginPin').value = '';
    }  
}

function createAccount() {
    document.getElementsByClassName('login-block')[0].classList.add(displayItem);
    document.getElementsByClassName('block')[0].classList.add('block-height');
    setTimeout(() => document.getElementsByClassName('signup')[0].classList.remove(displayItem), 200);
    document.getElementsByClassName('login-page')[0].classList.remove('login');
    document.getElementsByClassName('sign-up-page')[0].classList.add('login');
    document.getElementById('accountId').focus();
}

function loginPage() {
    document.getElementsByClassName('signup')[0].classList.add(displayItem);
    document.getElementsByClassName('block')[0].classList.remove('block-height');
    setTimeout(() => document.getElementsByClassName('login-block')[0].classList.remove(displayItem), 25);
    document.getElementsByClassName('login-page')[0].classList.add('login');
    document.getElementsByClassName('sign-up-page')[0].classList.remove('login');
    document.getElementById('name').focus();
}

