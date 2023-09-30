const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        imageUrl: String!
        content: String!
        title: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        email: String! 
        name: String!
        status: String!
        password: String
        posts: [Post!]!
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