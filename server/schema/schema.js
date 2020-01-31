const graphql = require('graphql');
const _ = require('lodash');
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = "socialmediawebappproject";
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
                return Post.find({ username: parent.username });
            }
        },
        numberOfPosts : { type: GraphQLInt },
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        username : { type: GraphQLString },
        link     : { type: GraphQLString },
        likes    : { type: GraphQLInt },
        dislikes : { type: GraphQLInt },
        caption  : { type: GraphQLString },
        postId   : { type: GraphQLString }
    })
});

// const FriendRequestNotificationType = new GraphQLObjectType({
//     name: 'Firend Request',
//     fields: () => ({
//         toUser: {
//             type: 
//         }
//     })
// })

const TokenType = new GraphQLObjectType({
    name: 'Token',
    fields: () => ({
        username      : { type: GraphQLString },
        token         : { type: GraphQLString }
    })
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        user: {
            type: UserType,
            args: { username: { type: GraphQLString } },
            resolve(parent, args) {
                return User.findOne({ username: args.username });
            }
        },
        userPosts: {
            type: new GraphQLList(PostType),
            args: { username: { type: GraphQLString } },
            resolve (parent, args) {
                return Post.find({ username: args.username });
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
                    numberOfPosts: 0
                });
                return user.save();
            }
        },
        addPost: {
            type: PostType,
            args: {
                username : { type: new GraphQLNonNull(GraphQLString) },
                caption  : { type: new GraphQLNonNull(GraphQLString) },
                link     : { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error('Not Authenticated.');
                }
                var user = await User.find({ 'username': args.username });
                var newpost = user[0].numberOfPosts + 1;
                var condition = { 'username': args.username };
                await User.updateOne(condition, { 'numberOfPosts': newpost});
                var Id = user[0].username + '-' + newpost;
                let post = new Post({
                    username  : args.username,
                    link      : args.link,
                    caption   : args.caption,
                    likes     : 0,
                    dislikes  : 0,
                    postId    : Id
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
                let user = await User.find({username: args.username});
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
                return { 'username': user[0].username, 'token': token };
            }
        },
        likePost: {
            type: PostType,
            args: {
                postId: { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args, req) {
                // if (!req.isAuth) {
                //     throw new Error('Not Authenticated.');
                // }
                let post = await Post.findOne({'postId': args.postId});
                let likes = post.likes + 1;
                return Post.updateOne({'postId': args.postId}, {'likes': likes});
            }
        },
        dislikePost: {
            type: PostType,
            args: {
                postId: { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error('Not Authenticated.');
                }
                let post = await Post.findOne({'postId': args.postId});
                let dislikes = post.dislikes + 1;
                return Post.updateOne({'postId': args.postId}, {'dislikes': dislikes});
            }
        },
        dislikePost: {
            type: PostType,
            args: {
                postId: { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error('Not Authenticated.');
                }
                let post = await Post.findOne({'postId': args.postId});
                let dislikes = post.dislikes + 1;
                return Post.updateOne({'postId': args.postId}, {'dislikes': dislikes});
            }
        },
        deletePost: {
            type: PostType,
            args: {
                postId: { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error('Not Authenticated.');
                }
                return Post.deleteOne({'postId': args.postId}, {'dislikes': dislikes});
            }
        }
    }
});

// const Subscription = {
//     name: 'Subscribe',
//     fields: {
//         notifications: {
//             type: FriendRequestNotificationType,
//             args: {
//                 username: { type: new GraphQLNonNull(GraphQLString) },
//             },
//             resolve(parent, args, req) {
//                 if (!req.isAuth) {
//                     throw new Error('Not Authenticated.');
//                 }

//             }
//         }
//     }
// }

// Exporting Query and Mutations
module.exports = new GraphQLSchema({
    query    : RootQuery,
    mutation : Mutation,
    // subscription: Subscription
});
