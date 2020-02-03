const graphql = require('graphql');
const _ = require('lodash');
const Post = require('../models/Post');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = "socialmediawebappproject";
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLBoolean } = graphql;
const { GraphQLDateTime } = require('graphql-iso-date');
const { PubSub } = require('apollo-server');
const pubsub = new PubSub();
const { withFilter } = require('graphql-subscriptions');
const { subscribe } = require('graphql/subscription');


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
        username   : { type: GraphQLString },
        link       : { type: GraphQLString },
        likes      : { type: GraphQLInt },
        dislikes   : { type: GraphQLInt },
        caption    : { type: GraphQLString },
        postId     : { type: GraphQLString },
        likedBy    : { type: GraphQLList(GraphQLString) },
        dislikedBy : { type: GraphQLList(GraphQLString) },
    })
});

const FriendRequestNotificationType = new GraphQLObjectType({
    name: 'FriendRequestNotificationType',
    fields: () => ({
        toUser     : { type: GraphQLString },
        fromUser   : { type: GraphQLString },
        time       : { type: GraphQLDateTime },
        done       : { type: GraphQLBoolean },
        requestId  : { type: GraphQLString },
        toUserObj  : {
            type: UserType,
            resolve(parent) {
                return User.findOne({'username': parent.toUser})
            }
        },
        fromUserObj: {
            type: UserType,
            resolve(parent) {
                return User.findOne({'username': parent.fromUser})
            }
        }
    })
})

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
    // options: { fetchPolicy: "network-only" },
    defaultOptions: {
        watchQuery: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
      },
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
        },
        allUsers: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },
        getNotifications: {
            type: new GraphQLList(FriendRequestNotificationType),
            args: { username: { type: GraphQLString }},
            resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error('Not Authenticated.');
                }
                return FriendRequest.find({'toUser': args.username});
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
                    friends  : ["admin"],
                    numberOfPosts: 0,
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
                newpost = newpost - 1;
                var Id = user[0].username + '-' + newpost;
                let post = new Post({
                    username  : args.username,
                    link      : args.link,
                    caption   : args.caption,
                    likes     : 0,
                    dislikes  : 0,
                    postId    : Id,
                    likedBy   : ['admin'],
                    dislikedBy: ['admin']
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
                postId   : { type: new GraphQLNonNull(GraphQLString)},
                username : { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args, req) {
                let post = await Post.findOne({'postId': args.postId});
                let likes = post.likes + 1;
                return Post.updateOne({'postId': args.postId}, {'likes': likes, $push: {likedBy: args.username}});
            }
        },
        dislikePost: {
            type: PostType,
            args: {
                postId: { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args, req) {
                let post = await Post.findOne({'postId': args.postId});
                let dislikes = post.dislikes + 1;
                return Post.updateOne({'postId': args.postId}, {'dislikes': dislikes,  $push: {dislikedBy: args.username}});
            }
        },
        deletePost: {
            type: PostType,
            args: {
                postId: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args, req) {
                return Post.deleteOne({'postId': args.postId});
            }
        },
        sendFriendRequest: {
            type: FriendRequestNotificationType,
            args: {
                toUser    : { type: GraphQLString },
                fromUser  : { type: GraphQLString },
                requestId : { type: GraphQLString }
            },
            async resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error('Not Authenticated.');
                }
                let notification = new FriendRequest({
                    toUser    : args.toUser,
                    fromUser  : args.fromUser,
                    done      : false,
                    requestId : args.requestId,
                    time      : new Date(),
                });
                let payload = await notification.save();
                await pubsub.publish('NOTIFICATION', {
                    payload,
                });
                return payload;
            }
        },
        requestDone: {
            type: FriendRequestNotificationType,
            args: {
                requestId: { type: GraphQLString }
            },
            async resolve(parent, args, req) {
                let payload = await FriendRequest.updateOne({'requestId': args.requestId}, {'done': true});
                return payload;
            }
        },
        makeFriends: {
            type: new GraphQLList(UserType),
            args: {
                userOne    : { type: GraphQLString },
                userSecond : { type: GraphQLString },
            },
            async resolve(parent, args) {
                let user1 = await User.updateOne({'username': args.userOne}, { $push: {friends: args.userSecond}});
                let user2 = await User.updateOne({'username': args.userSecond}, { $push: {friends: args.userOne}});
                let list = [user1, user2];
                return list;
            }
        }
    }
});

const Subscription = new GraphQLObjectType({
    name: 'Subscribe',
    fields: {
        FriendRequestNotification: {
            type: FriendRequestNotificationType,
            args: {
                username: { type: new GraphQLNonNull(GraphQLString) },
            },
            subscribe: withFilter(
                () => pubsub.asyncIterator('NOTIFICATION'),
                (payload, args) => {
                  return (payload.payload.toUser == args.username);
                }
            ),
            async resolve(note, args) {
                return note.payload;
            }
        }
    }
})

// Exporting Query and Mutations
module.exports = new GraphQLSchema({
    query    : RootQuery,
    mutation : Mutation,
    subscription: Subscription
});
