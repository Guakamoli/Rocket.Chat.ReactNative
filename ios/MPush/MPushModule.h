//
//  MPushModule.h
//  RocketChatRN
//
//  Created by 龙傲天 on 2021/10/25.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

//#import <UIKit/UIKit.h>

// iOS 10 notification
#import <UserNotifications/UserNotifications.h>

@interface MPushModule : RCTEventEmitter <RCTBridgeModule, UNUserNotificationCenterDelegate>
+ (instancetype) new NS_UNAVAILABLE;
- (instancetype) init NS_UNAVAILABLE;

+ (MPushModule *) make;

- (void) initPush:(UIApplication *)application
    initWithBridge:(RCTBridge *)bridge
    withAppKey:(NSString *)appKey
    withAppSecret:(NSString *)appSecret
    withLaunchOptions:(NSDictionary *)launchOptions;
- (void) didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
- (void) didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
- (void) didReceiveRemoteNotification:(NSDictionary *)userInfo;
- (void) userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler;
@end
