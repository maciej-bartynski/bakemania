import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    endpoint: { type: String, required: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    token: { type: String, required: true },
});

const PushSubscriptionModel = mongoose.model('PushSubscriptionModel', PushSubscriptionSchema);

// const UserSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     unique: { type: String, required: true },
//     role: {
//         type: String,
//         enum: ['user', 'admin', 'manager'],
//         default: 'user',
//         required: true,
//     },
//     stamps: {
//         _id: false,
//         required: true,
//         default: {
//             amount: 0,
//         },
//         type: {
//             amount: {
//                 type: Number,
//                 required: true,
//                 default: 0
//             }
//         }
//     }
// });

// const UserModel = mongoose.model('UserModel', UserSchema);

export default {
    PushSubscriptionModel,
    // UserModel,
}