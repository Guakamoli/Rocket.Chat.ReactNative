//
//  MPushModule.m
//  RocketChatRN
//
//  Created by 龙傲天 on 2021/10/25.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import "MPushModule.h"

#import <React/RCTLog.h>

// 阿里推送
#import <CloudPushSDK/CloudPushSDK.h>

@implementation MPushModule {
  UNUserNotificationCenter *_notificationCenter;
};

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

static MPushModule *sharedInstance = nil;

// 搞个单例
+ (id) allocWithZone:(NSZone *)zone {
	static dispatch_once_t onceToken;
	dispatch_once(&onceToken, ^{
		sharedInstance = [super allocWithZone:zone];
	});
	return sharedInstance;
}

+ (MPushModule *) make {
	return [MPushModule allocWithZone: nil];
}
// 搞个单例 end

NSString *const EVENT_NOTIFICATION = @"onMPushNotification";
NSString *const EVENT_LOCAL_NOTIFICATION = @"onMPushLocalNotification";
NSString *const EVENT_MESSAGE_RECEIVED = @"onMPushMessageReceived";
NSString *const EVENT_REGISTER_DEVICE_TOKEN = @"onMPushRegisterDeviceToken";
NSString *const EVENT_REGISTER_DEVICE_TOKEN_ERROR = @"onMPushRegisterDeviceTokenError";

- (NSDictionary *) constantsToExport
{
  return @{
    @"EVENT_NOTIFICATION": EVENT_NOTIFICATION,
    @"EVENT_LOCAL_NOTIFICATION": EVENT_LOCAL_NOTIFICATION,
    @"EVENT_MESSAGE_RECEIVED": EVENT_MESSAGE_RECEIVED,
    @"EVENT_REGISTER_DEVICE_TOKEN": EVENT_REGISTER_DEVICE_TOKEN,
    @"EVENT_REGISTER_DEVICE_TOKEN_ERROR": EVENT_REGISTER_DEVICE_TOKEN_ERROR,
  };
}

// 注册RN事件名
- (NSArray<NSString *> *) supportedEvents
{
  return @[@"MPushModule", EVENT_NOTIFICATION, EVENT_LOCAL_NOTIFICATION, EVENT_MESSAGE_RECEIVED, EVENT_REGISTER_DEVICE_TOKEN, EVENT_REGISTER_DEVICE_TOKEN_ERROR];
}

- (void) initPush:(UIApplication *)application
      initWithBridge:(RCTBridge *)bridge
      withAppKey:(NSString *)appKey
      withAppSecret:(NSString *)appSecret
      withLaunchOptions:(NSDictionary *)launchOptions {
  NSLog(@"MPushModule init appkey=%@. appSecret=%@.", appKey, appSecret);
  
  // 注入bridge
  self.bridge = bridge;

  // APNs注册，获取deviceToken并上报
//  [self registerAPNS:application];
  
  // 开始调试模式
#if DEBUG
  [CloudPushSDK turnOnDebug];
#endif

  // SDK初始化
  [CloudPushSDK asyncInit:appKey appSecret:appSecret callback:^(CloudPushCallbackResult *res) {
    if (res.success) {
      NSLog(@"MPushModule init success, deviceId: %@.", [CloudPushSDK getDeviceId]);
    } else {
      NSLog(@"MPushModule init failed, error: %@", res.error);
    }
  }];
  
  // 点击通知将App从关闭状态启动时，将通知打开回执上报
  [CloudPushSDK sendNotificationAck:launchOptions];
}

#pragma mark APNs Register
/**
 *  向APNs注册，获取deviceToken用于推送
 *
 *  @param   application
 */
- (void) registerAPNS:(UIApplication *)application {
  NSLog(@"MPushModule registerAPNS start.");
  float systemVersionNum = [[[UIDevice currentDevice] systemVersion] floatValue];
  if (systemVersionNum >= 10.0) {
    // iOS 10 notifications
    _notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
    // 创建category，并注册到通知中心
    [self createCustomNotificationCategory];
    _notificationCenter.delegate = self;
    // 请求推送权限
    [_notificationCenter requestAuthorizationWithOptions:UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound completionHandler:^(BOOL granted, NSError * _Nullable error) {
      if (granted) {
        // granted
        NSLog(@"MPushModule User authored notification.");
        // 向APNs注册，获取deviceToken
        NSLog(@"MPushModule iOS 10 Notifications-----------------");
      } else {
        // not granted
        NSLog(@"MPushModule User denied notification.");
      }
      [application registerForRemoteNotifications];
    }];
  } else if (systemVersionNum >= 8.0) {
    // iOS 8 Notifications
#pragma clang diagnostic push
#pragma clang diagnostic ignored"-Wdeprecated-declarations"
    [application registerUserNotificationSettings:
     [UIUserNotificationSettings settingsForTypes:
      (UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge)
                                       categories:nil]];
    NSLog(@"MPushModule iOS 8 Notifications-----------------");
    [application registerForRemoteNotifications];
#pragma clang diagnostic pop
  } else {
    // iOS < 8 Notifications
#pragma clang diagnostic push
#pragma clang diagnostic ignored"-Wdeprecated-declarations"
    [[UIApplication sharedApplication] registerForRemoteNotificationTypes:
     (UIRemoteNotificationTypeAlert | UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeSound)];
#pragma clang diagnostic pop
  }
}

/**
 *  主动获取设备通知是否授权(iOS 10+)
 */
- (void) getNotificationSettingStatus {
  [_notificationCenter getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
    if (settings.authorizationStatus == UNAuthorizationStatusAuthorized) {
      NSLog(@"MPushModule User authed.");
    } else {
      NSLog(@"MPushModule User denied.");
    }
  }];
}

/**
 *  创建并注册通知category(iOS 10+)
 */
- (void) createCustomNotificationCategory {
  // 自定义`action1`和`action2`
  UNNotificationAction *action1 = [UNNotificationAction actionWithIdentifier:@"action1" title:@"test1" options: UNNotificationActionOptionNone];
  UNNotificationAction *action2 = [UNNotificationAction actionWithIdentifier:@"action2" title:@"test2" options: UNNotificationActionOptionNone];
  // 创建id为`test_category`的category，并注册两个action到category
  // UNNotificationCategoryOptionCustomDismissAction表明可以触发通知的dismiss回调
  UNNotificationCategory *category = [UNNotificationCategory categoryWithIdentifier:@"test_category" actions:@[action1, action2] intentIdentifiers:@[] options:
                                      UNNotificationCategoryOptionCustomDismissAction];
  // 注册category到通知中心
  [_notificationCenter setNotificationCategories:[NSSet setWithObjects:category, nil]];
}

/**
 *  处理iOS 10通知(iOS 10+)
 */
- (void) handleiOS10Notification:(UNNotification *)notification withRemote:(BOOL)remote withBackground:(BOOL)background {
  UNNotificationRequest *request = notification.request;
  UNNotificationContent *content = request.content;
  NSDictionary *userInfo = content.userInfo;
  // 通知打开回执上报
  [CloudPushSDK sendNotificationAck:userInfo];
  
//  // 通知时间
//  NSDate *noticeDate = notification.date;
//  // 标题
//  NSString *title = content.title;
//  // 副标题
//  NSString *subtitle = content.subtitle;
//  // 内容
//  NSString *body = content.body;
//  // 角标
//  int badge = [content.badge intValue];
//  // 取得通知自定义字段内容，例：获取key为"Extras"的内容
//  NSString *extras = [userInfo valueForKey:@"Extras"];
//  NSLog(@"MPushModule Notification, date: %@, title: %@, subtitle: %@, body: %@, badge: %d, extras: %@.", noticeDate, title, subtitle, body, badge, extras);

  [[MPushModule make] JSEvent:EVENT_NOTIFICATION event:@{
    @"payload": userInfo,
    @"remote": [NSNumber numberWithBool:remote],
    @"background": [NSNumber numberWithBool:background],
  }];
}

/**
 *  App处于前台时收到通知(iOS 10+)
 */
- (void) userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  NSLog(@"MPushModule Receive a notification in foregound.");
  
  // 处理iOS 10通知，并上报通知打开回执
  [self handleiOS10Notification:notification withRemote:true withBackground:false];
  
  // 通知不弹出
  completionHandler(UNNotificationPresentationOptionNone);
  
  // 通知弹出，且带有声音、内容和角标
  //completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

/**
 *  触发通知动作时回调，比如点击、删除通知和点击自定义action(iOS 10+)
 */
- (void) userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  NSString *userAction = response.actionIdentifier;
  // 点击通知打开
  if ([userAction isEqualToString:UNNotificationDefaultActionIdentifier]) {
    NSLog(@"MPushModule User opened the notification.");
    // 处理iOS 10通知，并上报通知打开回执
    [self handleiOS10Notification:response.notification withRemote:false withBackground:true];
  }
  // 通知dismiss，category创建时传入UNNotificationCategoryOptionCustomDismissAction才可以触发
  if ([userAction isEqualToString:UNNotificationDismissActionIdentifier]) {
    NSLog(@"MPushModule User dismissed the notification.");
  }
  NSString *customAction1 = @"action1";
  NSString *customAction2 = @"action2";
  // 点击用户自定义Action1
  if ([userAction isEqualToString:customAction1]) {
    NSLog(@"MPushModule User custom action1.");
  }
  
  // 点击用户自定义Action2
  if ([userAction isEqualToString:customAction2]) {
    NSLog(@"MPushModule User custom action2.");
  }
  completionHandler();
}

/**
 *  推送通道打开回调
 *
 *  @param   notification
 */
- (void) onChannelOpened:(NSNotification *)notification {
  NSLog(@"MPushModule 推送通道建立成功");
}

#pragma mark Receive Message
/**
 *  @brief  注册推送消息到来监听
 */
- (void) registerMessageReceive {
  [[NSNotificationCenter defaultCenter]
   addObserver:self
   selector:@selector(onMessageReceived:)
   name:@"CCPDidReceiveMessageNotification"
   object:nil];
}

/**
 *  注册推送通道打开监听
 */
- (void) listenerOnChannelOpened {
  [[NSNotificationCenter defaultCenter]
   addObserver:self
   selector:@selector(onChannelOpened:)
   name:@"CCPDidChannelConnectedSuccess"
   object:nil];
}

/**
 *  处理到来推送消息
 *
 *  @param   notification
 */
- (void) onMessageReceived:(NSNotification *)notification {
  NSLog(@"MPushModule Receive one message! notification: %@", notification);
  
  CCPSysMessage *message = [notification object];
  NSString *title = [[NSString alloc] initWithData:message.title encoding:NSUTF8StringEncoding];
  NSString *body = [[NSString alloc] initWithData:message.body encoding:NSUTF8StringEncoding];
  NSLog(@"MPushModule Receive message title: %@, content: %@.", title, body);

  NSDictionary *payload = @{
    @"title": title,
    @"body": body,
  };
  [[MPushModule make] JSEvent:EVENT_MESSAGE_RECEIVED event:@{@"payload": payload}];
}

/*
 * APNs注册成功回调
 */
- (void) didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  NSLog(@"MPushModule Upload deviceToken to CloudPush server.");
  // 上报阿里服务器
  [CloudPushSDK registerDevice:deviceToken withCallback:^(CloudPushCallbackResult *res) {
    if (res.success) {
      NSString *token = [CloudPushSDK getApnsDeviceToken];
      NSLog(@"MPushModule Register deviceToken success, deviceToken: %@", token);
    } else {
      NSLog(@"MPushModule Register deviceToken failed, error: %@", res.error);
      [[MPushModule make] JSEvent:EVENT_REGISTER_DEVICE_TOKEN_ERROR event:@{@"error": res.error}];
    }
  }];
}

/*
 * APNs注册失败回调
 */
- (void) didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  NSLog(@"MPushModule didFailToRegisterForRemoteNotificationsWithError error: %@", error);
  [[MPushModule make] JSEvent:EVENT_REGISTER_DEVICE_TOKEN_ERROR event:@{@"error": [NSString stringWithFormat:@"%@", error]}];
}

- (void) didReceiveRemoteNotification:(NSDictionary *)userInfo {
  NSLog(@"MPushModule didReceiveRemoteNotification userInfo: %@", userInfo);
  [CloudPushSDK sendNotificationAck:userInfo];
}

- (void) JSEvent:(NSString *)name event:(id)event {
  NSLog(@"MPushModule JSEvent() name: %@, event: %@.", name, event);
  [self sendEventWithName:name body:event];
}

RCT_EXPORT_METHOD(registerDeviceToken:(NSString *)deviceToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"MPushModule Upload deviceToken to CloudPush server.");
  // 上报阿里服务器
  [CloudPushSDK registerDevice:[deviceToken dataUsingEncoding:NSUTF8StringEncoding] withCallback:^(CloudPushCallbackResult *res) {
    if (res.success) {
      NSLog(@"MPushModule Register deviceToken success, deviceToken: %@", [CloudPushSDK getApnsDeviceToken]);
      resolve(@"success");
    } else {
      NSLog(@"MPushModule Register deviceToken failed, error: %@", res.error);
      reject(@"Promise", @"registerDeviceToken Error", res.error);
    }
  }];
}

RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
	resolve([CloudPushSDK getDeviceId]);
}

RCT_EXPORT_METHOD(getApnsDeviceToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
	resolve([CloudPushSDK getApnsDeviceToken]);
}

RCT_EXPORT_METHOD(addAccount:(NSString *)account
								 resolver:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject)
{
	[CloudPushSDK bindAccount:account withCallback:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush addAccount data: %@", res.data);
			resolve(@[@"success"]);
		} else {
			reject(@"Promise", @"addAccount Error", res.error);
		}
	}];
}

RCT_EXPORT_METHOD(removeAccount:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject){
	[CloudPushSDK unbindAccount:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush removeAccount data: %@", res.data);
			resolve(@"success");
		} else {
			reject(@"Promise", @"removeAccount Error", res.error);
		}
	}];
}

RCT_EXPORT_METHOD(addAlias:(NSString *)alias
								 addAliasWithResolver:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject) {
	[CloudPushSDK addAlias:alias withCallback:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush addAlias data: %@", res.data);
			resolve(@[@"success"]);
		} else {
			reject(@"Promise", @"addAlias Error", res.error);
		}
	}];
}

RCT_EXPORT_METHOD(removeAlias:(NSString *)alias
								 removeAliasWithResolver:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject) {
	[CloudPushSDK removeAlias:alias withCallback:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush removeAlias data: %@", res.data);
			resolve(@"success");
		} else {
			reject(@"Promise", @"removeAlias Error", res.error);
		}
	}];
}

RCT_EXPORT_METHOD(listAliases:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject) {
	[CloudPushSDK listAliases:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush listAliases data: %@", res.data);
			resolve(@"success");
		} else {
			reject(@"Promise", @"listAliases Error", res.error);
		}
	}];
}

RCT_EXPORT_METHOD(addTag:(NSArray *)tags
								 bindTagWithResolver:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject) {
	[CloudPushSDK bindTag:1 withTags:tags withAlias:@"" withCallback:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush addTag data: %@", res.data);
			resolve(@[@"success"]);
		} else {
			reject(@"Promise", @"addTag Error", res.error);
		}
	}];
}

RCT_EXPORT_METHOD(removeTag:(NSArray *)tags
								 removeTagWithResolver:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject) {
	[CloudPushSDK unbindTag:1 withTags:tags withAlias:@"" withCallback:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush removeTag data: %@", res.data);
			resolve(@"success");
		} else {
			reject(@"Promise", @"removeTag Error", res.error);
		}
	}];
}

RCT_EXPORT_METHOD(listTags:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject) {
	[CloudPushSDK listTags:1 withCallback:^(CloudPushCallbackResult *res) {
		if (res.success) {
			NSLog(@"MPush listTags data: %@", res.data);
			resolve(@"success");
		} else {
			reject(@"Promise", @"listTags Error", res.error);
		}
	}];
}

// badge设置范围[0, 99999]
RCT_EXPORT_METHOD(syncBadgeNum:(NSUInteger)badge
								 syncBadgeNumWithResolver:(RCTPromiseResolveBlock)resolve
								 rejecter:(RCTPromiseRejectBlock)reject) {
	[CloudPushSDK syncBadgeNum:badge withCallback:^(CloudPushCallbackResult *res) {
		if (res.success) {
			// 设置本地角标
			[[UIApplication sharedApplication] setApplicationIconBadgeNumber:badge];
			NSLog(@"MPush syncBadgeNum data: %@", res.data);
			resolve(@"success");
		} else {
			reject(@"Promise", @"syncBadgeNum Error", res.error);
		}
	}];
}

@end
