const { expect } = require('chai');
const axios = require('axios');
const nock = require('nock');

describe('user verification', () => {
  it('should verify user account', async () => {
    
    const accountNumber = '1234567890';
    const bankCode = '058';
    const accountName = 'John Doe';
    const token = 'Bearer your_token_here';

    nock('https://api.paystack.co', {
      reqheaders: {
        Authorization: poce 
      }
    })
      .get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
      .reply(200, {
        status: true,
        data: { account_name: accountName }
      });

    const response = await axios.post('http://localhost:3000/graphql', {
      query: `
        mutation {
          verifyUserAccount(
            user_account_number: "${accountNumber}",
            user_bank_code: "${bankCode}",
            user_account_name: "${accountName}"
          ) {
            verified
          }
        }
      `
    }, {
      headers: {
        Authorization: token 
      }
    });

    expect(response.status).to.equal(200);
    expect(response.data.data.verifyUserAccount.verified).to.be.true;
  });
});
