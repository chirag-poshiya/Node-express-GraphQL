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
        status: String!
        name: String!
        password: String
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
        imageUrl: String!
        title: String!
        content: String!
    }

    type RootQuery {
        post(id: ID!): Post!
        login(email: String!, password: String!): AuthData!
        user: User!
        posts(page: Int): PostData!
    }

    type RootMutation {
        createUser(userInput: UserInputData ): User!
        updatePost(id: ID!, postInput: PostInputData!): Post! 
        updateStatus(status: String): User!
        deletePost(id: ID!):Boolean
        createPost(postInput: PostInputData): Post!
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
`);