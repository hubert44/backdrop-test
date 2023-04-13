const validator = require('validator');
const axios = require("axios");

const User = require('../../models/user');

function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
  
    const matrix = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
    for (let i = 0; i <= m; i++) {
      matrix[i][0] = i;
    }
  
    for (let j = 0; j <= n; j++) {
      matrix[0][j] = j;
    }
  
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= m; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, 
            matrix[i][j - 1] + 1, 
            matrix[i - 1][j - 1] + 1
          );
        }
      }
    }
  
    return matrix[m][n];
  }
  

module.exports = {
    hello() {
        return 'Hello World!';
    },

    async signup({userInput}, req) {
        try{
            let accountName = validator.blacklist(userInput.user_account_name, `<>&'"/`);
            accountName = validator.trim(accountName);
            let bankCode = validator.blacklist(userInput.user_bank_code, `<>&'"/`);
            bankCode = validator.trim(bankCode);
            let accountNumber = validator.blacklist(userInput.user_account_number, `<>&'"/`);
            accountNumber = validator.trim(accountNumber);

            if(validator.isEmpty(accountName)){
                const err = new Error('Invalid account name');
                err.statusCode = 422;
                throw err;
            }
            if(validator.isEmpty(bankCode)){
                const err = new Error('Invalid bank code');
                err.statusCode = 422;
                throw err;
            }
            if(!validator.isLength(accountNumber, {min: 10, max: 10})){
                const err = new Error('Invalid account number');
                err.statusCode = 422;
                throw err;
            }

            const existingUser = await User.findOne({user_account_number: accountNumber});
            if(existingUser){
                const err = new Error('An account with this account number exists already');
                err.statusCode = 401;
                throw err;
            }

            const paystack = await axios({
                method: 'get',
                url: `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
                headers: {
                  'Authorization': 'Bearer ' + process.env.PAYSTACK_TOKEN
                }
            });

            const newUser = new User({
                user_account_name: accountName,
                user_account_number: accountNumber,
                user_bank_code: bankCode,
                is_verified: levenshteinDistance(paystack.data.data.account_name.toLowerCase(), accountName.toLowerCase()) > 2 ? false : true
            });

            const user = await newUser.save();

            return  {is_verified: user.is_verified};
        }catch(err){
            console.log(err);
            throw err; 
        }
    },

    async username({userInput}, req) {
        try{
            let bankCode = validator.blacklist(userInput.bank_code, `<>&'"/`);
            bankCode = validator.trim(bankCode);
            let accountNumber = validator.blacklist(userInput.account_number, `<>&'"/`);
            accountNumber = validator.trim(accountNumber);

            if(validator.isEmpty(bankCode)){
                const err = new Error('Invalid bank code');
                err.statusCode = 422;
                throw err;
            }
            if(!validator.isLength(accountNumber, {min: 10, max: 10})){
                const err = new Error('Invalid account number');
                err.statusCode = 422;
                throw err;
            }

            let accountName;
            const existingUser = await User.findOne({user_account_number: accountNumber});
            if(existingUser){
                accountName = existingUser.user_account_name;
            }else{
                const paystack = await axios({
                    method: 'get',
                    url: `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
                    headers: {
                    'Authorization': 'Bearer ' + process.env.PAYSTACK_TOKEN
                    }
                });
                accountName = paystack.data.data.account_name;
            }

            return {account_name: accountName};
        }catch(err){
            console.log(err);
            throw err; 
        }
    }
};