const { expect } = require('chai');
const axios = require('axios');
const nock = require('nock');

describe('returns username', () => {
  it('should return account name from user input if available else return account name from paystack', async () => {
    
    const accountNumber = '0231181719';
    const bankCode = '058';

    nock('https://api.paystack.co', {
      reqheaders: {
        Authorization: process.env.PAYSTACK_TOKEN
      }
    })
    .get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
    .reply(200, {
      status: true,
      data: { account_name: "Account name" }
    });

    const response = await axios.post('http://localhost:3000/backdrop/api', {
      query: `
            query{
                username(userInput: {
                    account_number: "${accountNumber}",
                    bank_code: "${bankCode}"
                }) {
                    account_name
                }
            }
      `
    });

    expect(response.status).to.equal(200);
    expect(response.data.data.username.account_name).to.be.a.string;
  });
});
