function checkText() {
    let name = document.getElementById('name').value.trim();
    let reg = /^[a-z ,.'-]+$/i;
    condition ('name', 'tool-name', reg.test(name));  
}

function checkNumber() {
    let contact = document.getElementById('contact').value.trim();
    condition ('contact', 'tool-contact', (contact.length == 10 ? true : false) );
}
 
function checkMail() {
    let mail = document.getElementById('mail').value.trim();
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    condition ('mail', 'tool-mail', reg.test(mail));
}

function checkPin() {
    let pin = document.getElementById('pin').value.trim();
    condition ('pin', 'tool-pin', (pin.length == 4 ? true : false) );
}

function checkAmount() {
    let amount = Number(document.getElementById('amount').value);
    if (amount == 0) {
        document.getElementsByClassName('wrongPin')[0].classList.remove('display');
        document.getElementsByClassName('wrongPin')[0].innerHTML = 'Enter Valid Amount <br>';
        document.getElementById('amount').value = '';
        document.getElementById('amount').focus();
        document.getElementById('amount').classList.add('wrong-input');
    } else if (amount > 50000) {
        document.getElementsByClassName('wrongPin')[0].classList.remove('display');
        document.getElementsByClassName('wrongPin')[0].innerHTML = 'Enter Amount Less than 50,000<br>';
        document.getElementById('amount').value = '';
        document.getElementById('amount').focus();
        document.getElementById('amount').classList.add('wrong-input');
    }
}

function checkPinTrans() {
    let pin = document.getElementById('pin').value;
    if (pin.length != 4) {
        document.getElementsByClassName('wrongPin')[0].classList.remove('display');
        document.getElementsByClassName('wrongPin')[0].innerHTML = 'Enter 4 digit Pin <br>';
        document.getElementById('pin').value = '';
        document.getElementById('pin').focus();
        document.getElementById('pin').classList.add('wrong-input');
        return;
    }
}

function checkAccount() {
    if (document.getElementById('savings').checked == false && document.getElementById('current').checked == false) {
        document.getElementsByClassName('tool-account')[0].classList.add('tool-tip-disp');
        document.getElementsByClassName('tool-account')[0].classList.remove('tool-account');
        setTimeout(() => { 
            document.getElementsByClassName('tool-tip-disp')[0].classList.add('tool-account');
            document.getElementsByClassName('tool-tip-disp')[0].classList.remove('tool-tip-disp');
        }, 2000);
        return;
    }
    document.getElementsByClassName('tool-tip-disp')[0].classList.add('tool-account');
    document.getElementsByClassName('tool-tip-disp')[0].classList.remove('tool-tip-disp');
}

function condition(name, toolName, flag) {
    if (!flag) {
        document.getElementById(name).classList.add('wrong-input');
        document.getElementById(name).focus();
        document.getElementsByClassName(toolName)[0].classList.add('tool-tip-disp');
        document.getElementsByClassName(toolName)[0].classList.remove(toolName);
        setTimeout(() => { 
            document.getElementsByClassName('tool-tip-disp')[0].classList.add(toolName);
            document.getElementsByClassName('tool-tip-disp')[0].classList.remove('tool-tip-disp');
        }, 2000);
        return;
    }
    document.getElementById(name).classList.remove('wrong-input');
    return;  
}
