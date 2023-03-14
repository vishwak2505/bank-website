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

function checkPinTrans() {
    let pin = document.getElementById('pin').value;
    if (pin.length != 4) {
        document.getElementById('wrongPin').style.display = '';
        document.getElementById('wrongPin').innerHTML = 'Enet 4 digit Pin <br>';
        document.getElementById('pin').value = '';
        document.getElementById('pin').focus();
        document.getElementById('pin').style.backgroundColor = 'rgba(247, 7, 19, 0.4)';
        return;
    }
}

function condition(name, toolName, flag) {
    if (!flag) {
        document.getElementById(name).style.backgroundColor = 'rgba(247, 7, 19, 0.4)';
        document.getElementById(name).focus();
        document.getElementById(toolName).style.visibility = 'visible';
        setTimeout(() => { 
            document.getElementById(toolName).style.visibility = 'hidden';
            document.getElementById(toolName).style.transition = '3s';
        }, 2000);
        return;
    }
    document.getElementById(name).style.backgroundColor = 'rgba(159, 181, 229, 0.4)';
    return;  
}
