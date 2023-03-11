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
        this.accountType = [false, false];
        this.homeaddress = "";
        this.balance = 0;
        this.pin = "";
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

const IDB = (function init() {

    // getState('/country.txt');
    // async function getState(file) {
    //     let x = await fetch(file);
    //     let y = await x.text();
    //     alert(typeof(y));
    //     alert(y);
    //     y = JSON.stringify(y);
    //     let z = JSON.parse(y);
    //     alert(typeof(z));
    // }

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

function signUp(ev) {
    let form = document.getElementById("SignUpForm");
    let tags = form.children;    
    let userDetails = [];
    let accountType = [];
    let address = '';
    for (child of tags) {
        if (child.tagName == 'INPUT') {
            if (child.name.indexOf('address') != -1) {
                address += child.value + ', ';
                continue;
            }
            if (child.name == 'accountType') {
                if (child.checked) {
                    accountType.push(true);
                } else {
                    accountType.push(false);
                }
                continue;
            }
            userDetails.push(child.value);
        }
    }
    let id = uid();
    currentUser.setUserDetails(id, ...userDetails, accountType, address);  
    console.log(currentUser.details);
    document.getElementById("signup").style.display = 'none';
    document.getElementById('block').style.height = '46vh';
    document.getElementById("hide").style.display = 'none';
    setTimeout(()=>document.getElementById('password').style.display = '',100);
}

function setPin() {
    document.getElementById("password").style.display = '';
    let pin = document.getElementById('pin').value;
    let confirmpin = document.getElementById('confirmPin').value;
    
    if(pin!=confirmpin){
        document.getElementById('wrongPassword').style.display = '';
        document.getElementById('wrongPassword').innerHTML = "Password does not match <br>";
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

function disp() {
    console.log(currentUser.details);
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
        document.getElementById('warning').style.display = '';
        document.getElementById('warning').innerHTML = 'Incorrect Pin <br>';
        document.getElementById('loginPin').value = '';
    }  
}

function checkAccountId() {
    let accountID = document.getElementById('accountId').value;
    if  (accountID.length == 0) {
        return;
    } else if (accountID.length != 10) {
        document.getElementById('acctId').style.display = '';
        document.getElementById('accountId').style.backgroundColor = 'rgba(247, 7, 19, 0.4)';
        document.getElementById('accountId').focus();
        document.getElementById('accountId').style.marginBottom = '1%';
        document.getElementById('warning').style.display = 'none';
        return;
    } else {
        document.getElementById('acctId').style.display = 'none';
        document.getElementById('accountId').style.backgroundColor = 'rgba(159, 181, 229, 0.4);';
        document.getElementById('accountId').style.marginBottom = '5%';
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
                document.getElementById('warning').innerText = '';
            } else {
                document.getElementById('warning').style.display = '';
                document.getElementById('warning').innerHTML = 'Account Not Found!!<br>';
                document.getElementById('accountId').value = '';
                document.getElementById('accountId').style.backgroundColor = 'rgba(247, 7, 19, 0.4)';
                document.getElementById('accountId').focus(); 
            }    
        };
        request.onerror = (err) => {
            console.log('error');
        };
    }
}

function createAccount() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('block').style.height = '90vh';
    document.getElementById('block').style.transition = '0.5s';
    setTimeout(()=>document.getElementById('signup').style.display = '',200);
    document.getElementById('loginPage').classList.remove('login');
    document.getElementById('SignUpPage').classList.add('login');
}

function loginPage() {
    document.getElementById('signup').style.display = 'none';
    document.getElementById('block').style.height = '55vh';
    setTimeout(()=>document.getElementById('login').style.display = '',25);
    document.getElementById('loginPage').classList.add('login');
    document.getElementById('SignUpPage').classList.remove('login');
}

