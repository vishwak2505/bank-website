const uid = () => {
    let key = Date.now().toString(10).slice(0, 5) + Date.now().toString(10).slice(-5);
    return key;
}

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

    setUserDetails(id, name, dob, contact, mail, accountType, homeaddress) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.contact = contact;
        this.mail = mail;
        this.accountType = accountType;
        this.homeaddress = homeaddress;
    }

    get details() {
        return ({
            id: this.id,
            balance: this.balance,
            pin: this.pin,
            name: this.name,
            dob: this.dob,
            contact: this.contact,
            mail: this.mail,
            accountType: this.accountType,
            homeaddress: this.homeaddress,
            transactions: this.transactions,
        });
    }

    setUserPin(pin) {
        this.pin=pin;
    }
}

let db = null;
let objectStore = null;
let DBOpenReq = indexedDB.open('BankDB', 4);
let currentUser = new User();
let states = [];

async function getState(file) {
    let response = await fetch(file);
    let list = await response.json();
    
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

const IDB = (function init() {

    getState('/country');
    localStorage.setItem('currentUserId', '');

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
})();

function signUp() {
    let form = document.getElementById("SignUpForm");
    let tags = form.children;    
    let userDetails = [];
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
            userDetails.push(child.value);
        }
        if (child.tagName == 'SELECT') {
            address.push(child.value);
        }
    }
    let id = uid();
    currentUser.setUserDetails(id, ...userDetails, accountType, address);  
    console.log(currentUser.details);
    document.getElementsByClassName('signup')[0].classList.add('display');
    document.getElementsByClassName('block')[0].classList.add('block-height-password');
    document.getElementsByClassName('block')[0].classList.remove('block-height');
    document.getElementsByClassName('hide')[0].classList.add('display');
    setTimeout(() => document.getElementsByClassName('password')[0].classList.remove('display'), 100);
}

function setPin() {
    document.getElementsByClassName('password')[0].classList.remove('display');
    let pin = document.getElementById('pin').value;
    let confirmpin = document.getElementById('confirmPin').value;
    
    if(pin == '' || pin != confirmpin){
        document.getElementsByClassName('wrongPassword')[0].classList.remove('display');
        document.getElementById('pin').classList.add('wrong-input');
        document.getElementById('confirmPin').classList.add('wrong-input');
        document.pinForm.setAttribute("onsubmit", "return false;");
    } else {
        currentUser.setUserPin(pin);
        let user = currentUser.details;

        console.log(user);

        let tx = db.transaction('accountDetails', 'readwrite');
        tx.oncomplete = (ev) => {
            console.log(ev);
        };
        tx.onerror = (err) => {
            console.warn(err);
        }

        localStorage.setItem('currentUserId', user.id);

        document.pinForm.onsubmit = "";
        document.pinForm.setAttribute("action", "dashboard.html");

        let acct = tx.objectStore('accountDetails'); 
        let request = acct.add(user);  

        request.onsuccess = (ev) => {
            console.log('success');
        };
        request.onerror = (err) => {
            console.log('error');
        };
    }
}

function login() {

    let accountID = document.getElementById('accountId').value.toString();
    let pin = document.getElementById('loginPin').value;
    document.loginForm.setAttribute('onsubmit', 'return false;');

    if (pin == currentUser.details.pin) {
        localStorage.setItem('currentUserId', accountID);
        document.loginForm.setAttribute("action", "dashboard.html");
        document.loginForm.onsubmit = "";
    } else {
        document.getElementsByClassName('warning')[0].classList.remove('display');
        document.getElementsByClassName('warning')[0].innerHTML = 'Incorrect Pin <br>';
        document.getElementById('loginPin').classList.add('wrong-input');
        document.getElementById('loginPin').value = '';
    }  
}

function checkAccountId() {
    let accountID = document.getElementById('accountId').value;
    if  (accountID.length == 0) {
        return;
    } else if (accountID.length != 10) {
        document.getElementsByClassName('acctId')[0].classList.remove('display');
        document.getElementById('accountId').classList.add('wrong-input');
        document.getElementById('accountId').focus();
        document.getElementsByClassName('warning')[0].classList.add('display');
        return;
    } else {
        document.getElementsByClassName('acctId')[0].classList.add('display');
        document.getElementById('accountId').classList.remove('wrong-input');
        let tx = db.transaction('accountDetails', 'readonly');
        tx.oncomplete = (ev) => {
            console.log(ev);
        };
        tx.onerror = (err) => {
            console.warn(err);
        }
        let acct = tx.objectStore('accountDetails');
        let request = acct.get(accountID);
        request.onsuccess = (ev) => {
            let user = request.result;
            console.log(user);
            if (user) {
                currentUser.setUserPin(user.pin);
                document.getElementById('loginPin').readOnly = false;
                document.getElementsByClassName('warning')[0].innerHTML = '';
            } else {
                document.getElementsByClassName('warning')[0].classList.remove('display');
                document.getElementsByClassName('warning')[0].innerHTML = 'Account Not Found!!<br>';
                document.getElementById('accountId').value = '';
                document.getElementById('accountId').classList.add('account-id-incorrect');
                document.getElementById('accountId').focus(); 
            }    
        };
        request.onerror = (err) => {
            console.log('error');
        };
    }
}

function createAccount() {
    document.getElementsByClassName('login-block')[0].classList.add('display');
    document.getElementsByClassName('block')[0].classList.add('block-height');
    setTimeout(() => document.getElementsByClassName('signup')[0].classList.remove('display'), 200);
    document.getElementById('loginPage').classList.remove('login');
    document.getElementById('SignUpPage').classList.add('login');
}

function loginPage() {
    document.getElementsByClassName('signup')[0].classList.add('display');
    document.getElementsByClassName('block')[0].classList.remove('block-height');
    setTimeout(() => document.getElementsByClassName('login-block')[0].classList.remove('display'), 25);
    document.getElementById('loginPage').classList.add('login');
    document.getElementById('SignUpPage').classList.remove('login');
}

