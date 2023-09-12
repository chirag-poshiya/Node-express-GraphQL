const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        content: String!
        title: String!
        imageUrl: String!
        createdAt: String!
        creator: User!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String! 
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post]!
        totalPosts: Int!
    }

    input UserInputData {
        email: String! 
        name: String!
        password: String!
    }

    input PostInputData{
        title: String!
        content: String!
        imageUrl: String!
    }

    type RootQuery {
        post(id: ID!): Post!
        login(email: String!, password: String!): AuthData!
        user: User!
        posts(page: Int): PostData!
    }

    type RootMutation {
        updatePost(id: ID!, postInput: PostInputData!): Post! 
        createUser(userInput: UserInputData ): User!
        updateStatus(status: String): User!
        createPost(postInput: PostInputData): Post!
        deletePost(id: ID!):Boolean
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
`);