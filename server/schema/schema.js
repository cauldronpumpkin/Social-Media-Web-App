const graphql = require('graphql');
const _ = require('lodash');
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = "ilovewebdevelopment1201";
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull } = graphql;

// GraphQL Types
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        name       : { type: GraphQLString },
        username   : { type: GraphQLString },
        email      : { type: GraphQLString },
        password   : { type: GraphQLString },
        friends    : { type: GraphQLList(GraphQLString) },
        posts: {
            type: GraphQLList(PostType),
            resolve(parent) {
                return Post.find({ user: parent.username });
            }
        }
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        username : { type: GraphQLString },
        link     : { type: GraphQLString },
        likes    : { type: GraphQLInt },
        dislikes : { type: GraphQLInt },
        caption  : { type: GraphQLString }
    })
});

const TokenType = new GraphQLObjectType({
    name: 'Token',
    fields: () => ({
        token: { type: GraphQLString }
    })
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        user: {
            type: new GraphQLList(UserType),
            args: { username: { type: GraphQLString } },
            resolve(parent, args) {
                return User.find({ username: args.username });
            }
        },
        post: {
            type: new GraphQLList(PostType),
            args: { user: { type: GraphQLString } },
            resolve(parent, args) {
                return Post.find({ user: args.user });
            }
        },
        userPosts: {
            type: new GraphQLList(PostType),
            args: { user: { type: GraphQLString } },
            resolve (parent, args) {
                return Post.find({ user: args.user });
            }
        }
    })
});

// Mutations
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                name     : { type: new GraphQLNonNull(GraphQLString) },
                username : { type: new GraphQLNonNull(GraphQLString) },
                email    : { type: new GraphQLNonNull(GraphQLString) },
                password : { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                let user = new User({
                    name     : args.name,
                    username : args.username,
                    email    : args.email,
                    password : bcrypt.hashSync(args.password, 10, function (err) {
                        if (err) throw (err);
                    }),
                    friends  : [],
                });
                return user.save();
            }
        },
        addPost: {
            type: PostType,
            args: {
                user    : { type: new GraphQLNonNull(GraphQLString) },
                caption : { type: new GraphQLNonNull(GraphQLString) },
                link    : { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error('Not Authenticated.');
                }
                let post = new Post({
                    user      : args.name,
                    link      : args.link,
                    caption   : args.genre,
                    likes     : 0,
                    dislikes  : 0
                });
                return post.save();
            }
        },
        loginUser: {
            type: TokenType,
            args: {
                username : { type: new GraphQLNonNull(GraphQLString) },
                password : { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args, req) {
                let user = await User.find({name: args.username});
                if (!user) {
                    throw new Error('Username Not Found !');
                }

                const valid = bcrypt.compareSync(args.password, user[0].password, function(err) {
                    if (err) throw (err);
                })
                if (!valid) {
                    throw new Error('Username & Password Do Not Match !');
                }

                const token = jwt.sign({ 'user': _.pick(user[0], ['name', 'email']) }, SECRET, { expiresIn: '1y' });
                return { 'token': token };
            }
        }
    }
});

// Exporting Query and Mutations
module.exports = new GraphQLSchema({
    query    : RootQuery,
    mutation : Mutation
});
