/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <React/RCTEventDispatcher.h>

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import "RNNotifications.h"
#import "RNBootSplash.h"
#import "Orientation.h"
#import <Firebase.h>
#import <Bugsnag/Bugsnag.h>
#import <UMCore/UMModuleRegistry.h>
#import <UMReactNativeAdapter/UMNativeModulesProxy.h>
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>
#import <MMKV/MMKV.h>

// code push
#import <CodePush/CodePush.h>
// umeng share
#import <UMCommon/UMCommon.h>
#import <UShareUI/UShareUI.h>
#import "RNUMConfigure.h"
#import <UIKit/UIKit.h>
#import "WXApi.h"
// umeng analytics
#import <UMCommon/UMConfigure.h>
// jpush
#import "JPUSHService.h"
#import <UserNotifications/UserNotifications.h>
#import "RCTJPushEventQueue.h"
#import "RCTJPushModule.h"
// expo
#import <UMCore/UMModuleRegistry.h>
#import <UMReactNativeAdapter/UMNativeModulesProxy.h>
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>
#import "RNBootSplash.h" // <- add the header import

#if DEBUG
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
static void InitializeFlipper(UIApplication *application) {
 FlipperClient *client = [FlipperClient sharedClient];
 SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
 [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
 [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
 [client addPlugin:[FlipperKitReactPlugin new]];
 [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
 [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
   #if DEBUG
     InitializeFlipper(application);
   #endif

    self.moduleRegistryAdapter = [[UMModuleRegistryAdapter alloc] initWithModuleRegistryProvider:[[UMModuleRegistryProvider alloc] init]];
    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
    self.bridge = bridge;
    if(![FIRApp defaultApp]){
      [FIRApp configure];
    }
    [Bugsnag start];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                moduleName:@"RocketChatRN"
                                                initialProperties:nil];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];
    [RNNotifications startMonitorNotifications];
    [ReplyNotification configure];
    [self initUMCommon];
  
    // Required
    // notice: 3.0.0 及以后版本注册可以这样写，也可以继续用之前的注册方式
    JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
    entity.types = JPAuthorizationOptionAlert|JPAuthorizationOptionBadge|JPAuthorizationOptionSound|JPAuthorizationOptionProvidesAppNotificationSettings;
    if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
      // 可以添加自定义 categories
      // NSSet<UNNotificationCategory *> *categories for iOS10 or later
      // NSSet<UIUserNotificationCategory *> *categories for iOS8 and iOS9
    }
    [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
    
    // 初始化极光sdk
    [JPUSHService setupWithOption:launchOptions appKey:@"78af9fd1aaa2c2256158466e"
                          channel:@"App Store"
                apsForProduction:0];
    
    //  [WXApi startLogByLevel:WXLogLevelDetail logBlock:^(NSString *log) {
    //      NSLog(@"WeChatSDK: %@", log);
    //  }];

    [WXApi registerApp:@"wxd825434340498298" universalLink:@"https://store.paiyaapp.com/"];

    //  [WXApi checkUniversalLinkReady:^(WXULCheckStep step, WXCheckULStepResult* result) {
    //      NSLog(@"查看变化 %@, %u, %@, %@", @(step), result.success, result.errorInfo, result.suggestion);
    //  }];
    // AppGroup MMKV
    NSString *groupDir = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:[[NSBundle mainBundle] objectForInfoDictionaryKey:@"AppGroup"]].path;
    [MMKV initializeMMKV:nil groupDir:groupDir logLevel:MMKVLogNone];
  
    [RNBootSplash initWithStoryboard:@"LaunchScreen" rootView:rootView];

    return YES;
}
- (void)onReq:(BaseResp *)req {
  NSLog(@"newReq.message.messageExt:%@", req);

  if ([req isKindOfClass:[LaunchFromWXReq class]]) {

    //获取开放标签传递的extinfo数据逻辑

    LaunchFromWXReq *newReq = (LaunchFromWXReq *)req;
    NSString *openID = newReq.openID;
    NSString *extInfo = newReq.message.messageExt;
    NSDictionary *options = @{@"extInfo":extInfo};
    // [RCTLinkingManager application:[UIApplication sharedApplication] openURL:self.url options:options];
            [self.bridge.eventDispatcher sendDeviceEventWithName:@"WeChat_Req" body:options];

    NSLog(@"newReq.message.messageExt:%@", newReq.message.messageExt);
  }
}
//按Home键使App进入后台

- (void)applicationDidEnterBackground:(UIApplication *)application{
  // [application setApplicationIconBadgeNumber:0];
  // [application cancelAllLocalNotifications];
}


- (void)initUMCommon {
  // 打开友盟调试日志
//  [UMCommonLogManager setUpUMCommonLogManager];
//  [UMConfigure setLogEnabled:YES];
  
  // 初始化友盟
  [UMConfigure initWithAppkey:@"5fbcd15b1e29ca3d7be36593" channel:@"App Store"];
//  [[UMSocialManager defaultManager] openLog:YES];
  
  // 设置微信的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession appKey:@"wxd825434340498298" appSecret:@"d138b45b7ba9b3410f9724db6913e762" redirectURL:@"https://store.paiyaapp.com/"];

  /*
   设置新浪的appKey和appSecret
   [新浪微博集成说明]http://dev.umeng.com/social/ios/%E8%BF%9B%E9%98%B6%E6%96%87%E6%A1%A3#1_2
  */
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:@"140397167"  appSecret:@"bf224abd5f03d04d625a213eabc930fd" redirectURL:@"https://store.paiyaapp.com/"];
}
- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge
{
  NSArray<id<RCTBridgeModule>> *extraModules = [_moduleRegistryAdapter extraModulesForBridge:bridge];
  // You can inject any extra modules that you would like here, more information at:
  // https://facebook.github.io/react-native/docs/native-modules-ios.html#dependency-injection
  return extraModules;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [CodePush bundleURL];
  // return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
    [JPUSHService registerDeviceToken:deviceToken];

}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window
{
  return [Orientation getOrientation];
}

// Only if your app is using [Universal Links](https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/AppSearch/UniversalLinks.html).
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}
#pragma mark - Share

//#define __IPHONE_10_0    100000

#if __IPHONE_OS_VERSION_MAX_ALLOWED > 100000

- (BOOL)application:(UIApplication*)application openURL:(NSURL*)url options:(NSDictionary *)options {
  return [RCTLinkingManager application:application openURL:url options:options];

}

#endif

- (BOOL)application:(UIApplication*)application handleOpenURL:(NSURL*)url
{
  BOOL result = [[UMSocialManager defaultManager] handleOpenURL:url];
  if(!result) {
    // 其他如支付等SDK的回调
    result = [WXApi handleOpenURL:url delegate:self];
  }

  return result;
}

#pragma mark- JPUSHRegisterDelegate

// iOS 12 Support
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center openSettingsForNotification:(UNNotification *)notification
{
  if (notification && [notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    //从通知界面直接进入应用
    NSLog(@"通知");
  }else{
    //从通知设置界面进入应用
    NSLog(@"通知设置");
  }
}


// iOS 10 前台收到通知
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler
{
  // Required
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 前台收到消息");
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  } else {
    // 本地通知 Todo
    NSLog(@"iOS 10 本地通知 前台收到消息");
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  // [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
  // [JPUSHService setBadge:0];
  completionHandler(UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionAlert); // 需要执行这个方法，选择是否提醒用户，有 Badge、Sound、Alert 三种类型可以选择设置
}

// iOS 10 消息事件回调
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler
{
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // APNS
    NSLog(@"APNS 消息事件回调");
    [JPUSHService handleRemoteNotification:userInfo];
    // 应用死了以后，用户点击推送消息，打开app以后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._notificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_OPENED_EVENT object:userInfo];
  } else {
    // 本地通知
    NSLog(@"本地通知事件回调");
    // 应用死了以后，用户点击推送消息，打开app以后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._localNotificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_OPENED_EVENT object:userInfo];
  }
  // [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
  // [JPUSHService setBadge:0];
  completionHandler();  // 系统要求执行这个方法
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  // Required, iOS 7 Support
  [JPUSHService handleRemoteNotification:userInfo];
  completionHandler(UIBackgroundFetchResultNewData);
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
  // Required, For systems with less than or equal to iOS 6
  [JPUSHService handleRemoteNotification:userInfo];
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
  // NSLog(@"App进入前台");
  // 每次进入前台，清除所有JPush通知
  // [JPUSHService removeNotification:nil];
  // [application setApplicationIconBadgeNumber:0];
  [application cancelAllLocalNotifications];
}

@end
