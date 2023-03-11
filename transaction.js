function savings() {
    document.getElementById('current-tile').style.display = 'none';
    document.getElementById('nav-bar').style.display = 'none';
}

function current() {
    document.getElementById('savings-tile').style.display = 'none';
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementById('current-tile').style.left = '2%';
    document.getElementById('current-tile').style.right = '';
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
}

function transactionHistory() {
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
}

function logout() {
    document.getElementById('logout').href = 'index.html';
}