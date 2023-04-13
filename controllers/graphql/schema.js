const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type IsVerified {
        is_verified: String!
    }

    input SignupInput {
        user_account_number: String!
        user_bank_code: String!
        user_account_name: String!
    }

    input UserName {
        bank_code: String!
        account_number: String!
    }

    type GetUserName{
        account_name: String!
    }

    type Mutation{
        signup(userInput: SignupInput): IsVerified!
    }

    type Query {
        hello: String!
        username(userInput: UserName): GetUserName!
    }

    schema {
        query: Query
        mutation: Mutation
    }
`);