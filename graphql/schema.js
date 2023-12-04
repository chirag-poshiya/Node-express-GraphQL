const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        content: String!
        imageUrl: String!
        creator: User!
        title: String!
        updatedAt: String!
        createdAt: String!
    }

    type User {
        email: String! 
        _id: ID!
        name: String!
        status: String!
        posts: [Post!]!
        password: String
    }

    type AuthData {
        userId: String!
        token: String!
    }

    type PostData {
        totalPosts: Int!
        posts: [Post]!
    }

    input UserInputData {
        name: String!
        email: String! 
        password: String!
    }

    input PostInputData{
        title: String!
        imageUrl: String!
        content: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        post(id: ID!): Post!
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