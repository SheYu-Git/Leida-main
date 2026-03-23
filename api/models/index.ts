import User from './User.js';
import Pet from './Pet.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Like from './Like.js';
import Follow from './Follow.js';
import Breed from './Breed.js';
import BiddingItem from './BiddingItem.js';
import BiddingDailyStat from './BiddingDailyStat.js';
import BiddingSyncState from './BiddingSyncState.js';
import MemberPlan from './MemberPlan.js';
import UserSubscription from './UserSubscription.js';
import MemberActivationCode from './MemberActivationCode.js';
import ReferralRecord from './ReferralRecord.js';
import MemberOrder from './MemberOrder.js';
import AppConfig from './AppConfig.js';
import AppConfigVersion from './AppConfigVersion.js';
import AdminAuditLog from './AdminAuditLog.js';

// User & Pet
User.hasMany(Pet, { foreignKey: 'user_id', as: 'pets' });
Pet.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// Pet & Breed
Breed.hasMany(Pet, { foreignKey: 'breed_id', as: 'pets' });
Pet.belongsTo(Breed, { foreignKey: 'breed_id', as: 'breed_info' });

// User & Post
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// User & Comment
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Post & Comment
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User & Like
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Post & Like
Post.hasMany(Like, { foreignKey: 'post_id', as: 'post_likes' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User & Follow (Self-referential M:N)
User.belongsToMany(User, {
  as: 'followers',
  through: Follow,
  foreignKey: 'following_id',
  otherKey: 'follower_id',
});

User.belongsToMany(User, {
  as: 'following',
  through: Follow,
  foreignKey: 'follower_id',
  otherKey: 'following_id',
});

User.hasMany(UserSubscription, { foreignKey: 'user_id', as: 'subscriptions' });
UserSubscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ReferralRecord, { foreignKey: 'inviter_user_id', as: 'referral_rewards' });
User.hasMany(ReferralRecord, { foreignKey: 'invitee_user_id', as: 'referral_events' });
ReferralRecord.belongsTo(User, { foreignKey: 'inviter_user_id', as: 'inviter' });
ReferralRecord.belongsTo(User, { foreignKey: 'invitee_user_id', as: 'invitee' });
User.hasMany(AdminAuditLog, { foreignKey: 'admin_user_id', as: 'admin_logs' });
AdminAuditLog.belongsTo(User, { foreignKey: 'admin_user_id', as: 'admin' });
User.hasMany(MemberOrder, { foreignKey: 'user_id', as: 'member_orders' });
MemberOrder.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AppConfig.hasMany(AppConfigVersion, { foreignKey: 'key', sourceKey: 'key', as: 'versions' });
AppConfigVersion.belongsTo(AppConfig, { foreignKey: 'key', targetKey: 'key', as: 'config' });

export {
  User,
  Pet,
  Post,
  Comment,
  Like,
  Follow,
  Breed,
  BiddingItem,
  BiddingDailyStat,
  BiddingSyncState,
  MemberPlan,
  UserSubscription,
  MemberActivationCode,
  ReferralRecord,
  MemberOrder,
  AppConfig,
  AppConfigVersion,
  AdminAuditLog,
};
