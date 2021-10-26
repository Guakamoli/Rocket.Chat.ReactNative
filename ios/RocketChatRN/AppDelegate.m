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
// #import <Bugsnag/Bugsnag.h>
#import <UMCore/UMModuleRegistry.h>
#import <UMReactNativeAdapter/UMNativeModulesProxy.h>
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>
#import <MMKV/MMKV.h>

// code push
// #import <CodePush/CodePush.h>

// umeng share
#import <UMCommon/UMCommon.h>
#import <UShareUI/UShareUI.h>
#import "RNUMConfigure.h"
#import <UIKit/UIKit.h>
#import "WXApi.h"

// umeng analytics
#import <UMCommon/UMConfigure.h>

// 阿里推送
#import "MPushModule.h"

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
    // [Bugsnag start];
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
  
    // 初始化阿里推送
    [[MPushModule make] initPush:application
                  initWithBridge:bridge
                  withAppKey:@"333562441"
                  withAppSecret:@"f987865b298142de8ac28993030215fe"
                  withLaunchOptions:launchOptions];
    
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
  // return [CodePush bundleURL];
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
  [[MPushModule make] didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
  [[MPushModule make] didFailToRegisterForRemoteNotificationsWithError:error];
}

//- (void) application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
//  [[MPushModule make] didReceiveRemoteNotification:userInfo];
//}

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

@end
