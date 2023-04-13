const { expect } = require('chai');
const axios = require('axios');
const nock = require('nock');

describe('user verification', () => {
  it('should verify user account', async () => {
    
    const accountNumber = '0231181719';
    const bankCode = '058';
    const accountName = 'Onuoha Hubert';

    nock('https://api.paystack.co', {
      reqheaders: {
        Authorization: process.env.PAYSTACK_TOKEN
      }
    })
    .get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
    .reply(200, {
      status: true,
      data: { account_name: accountName }
    });

    const response = await axios.post('http://localhost:3000/backdrop/api', {
      query: `
        mutation {
          signup(userInput: {
            user_account_number: "${accountNumber}",
            user_bank_code: "${bankCode}",
            user_account_name: "${accountName}"
          }) {
            is_verified
          }
        }
      `
    });

    expect(response.status).to.equal(200);
    expect(response.data.data.signup.is_verified).to.be.a('boolean');
  });
});
