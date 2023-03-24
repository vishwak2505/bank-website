class User{
    constructor () {
        this.id = "";
        this.name = "";
        this.dob = "";
        this.contact = "";
        this.mail = "";
        this.accountType = { savings: false, current: false };
        this.homeaddress = { addressDoor: '', addressHouseName: '', addressStreet: '', addressArea: '', addressCity: '', addressState: '' };
        this.balance = { savings: 0, current: 0 };
        this.pin = "";
        this.transactions = [{}];
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

    setUserLoginDetails(id, name, dob, contact, mail, accountType, homeaddress) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.contact = contact;
        this.mail = mail;
        this.accountType = accountType;
        this.homeaddress = homeaddress;
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

    setUserPin(pin) {
        this.pin=pin;
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
}
