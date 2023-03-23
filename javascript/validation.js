function condition(name, toolName, flag) {
    if (!flag) {
        document.getElementById(name).classList.add(wrongInput);
        document.getElementById(name).focus();
        document.getElementsByClassName(toolName)[0].classList.add('tool-tip-disp');
        setTimeout(() => { 
            document.getElementsByClassName(toolName)[0].classList.remove('tool-tip-disp');
        }, 2000);
        return;
    }
    document.getElementById(name).classList.remove(wrongInput);
    return;  
}

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

function inputField(inputId) {
    document.getElementsByClassName('wrong-pin')[0].classList.remove(displayItem);
    document.getElementById(inputId).value = '';
    document.getElementById(inputId).focus();
    document.getElementById(inputId).classList.add(wrongInput);
}

function checkAmount() {
    let amount = Number(document.getElementById('amount').value);
    if (amount == 0) {
        inputField('amount');
        document.getElementsByClassName('wrong-pin')[0].innerHTML = 'Enter Valid Amount <br>';
    } else if (amount > 50000) {
        inputField('amount');
        document.getElementsByClassName('wrong-pin')[0].innerHTML = 'Enter Amount Less than 50,000<br>';
    }
}

function checkPinTrans() {
    let pin = document.getElementById('pin').value;
    if (pin.length != 4) {
        inputField('pin');
        document.getElementsByClassName('wrong-pin')[0].innerHTML = 'Enter 4 digit Pin <br>';
    }
}

function checkAccount() {
    if (document.getElementById('savings').checked == false && document.getElementById('current').checked == false) {
        document.getElementsByClassName('tool-account')[0].classList.add('tool-tip-disp');
        setTimeout(() => { 
            document.getElementsByClassName('tool-account')[0].classList.remove('tool-tip-disp');
        }, 2000);
        return;
    }
    document.getElementsByClassName('tool-account')[0].classList.remove('tool-tip-disp');
}

function setMax() {
    let endDate = document.getElementById('endDate').value;
    if (endDate == '') {
        endDate = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,0) + '-' + String(new Date().getDate()).padStart(2,0);
    }
    document.getElementById('startDate').max = endDate;
}

function setMin() {
    let startDate = document.getElementById('startDate').value,
    maxDate = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,0) + '-' + String(new Date().getDate()).padStart(2,0);
    document.getElementById('endDate').min = startDate;
    document.getElementById('endDate').max = maxDate;
}