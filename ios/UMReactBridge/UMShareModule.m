//
//  ShareModule.h
//  UMComponent
//
//  Created by wyq.Cloudayc on 11/09/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "UMShareModule.h"
#import <UMShare/UMShare.h>
#import <UShareUI/UShareUI.h>

#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>

@implementation UMShareModule

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (UMSocialPlatformType)platformType:(NSInteger)platform
{
  switch (platform) {
    case 0:
      return UMSocialPlatformType_Sina;
    case 1:
      return UMSocialPlatformType_WechatSession;
    case 2:
      return UMSocialPlatformType_WechatTimeLine;
    case 3:
      return UMSocialPlatformType_WechatFavorite;
    case 4:
      return UMSocialPlatformType_QQ;
    case 5:
      return UMSocialPlatformType_Qzone;
    case 6:
      return UMSocialPlatformType_TencentWb;
    case 7:
      return UMSocialPlatformType_APSession;
    case 8:
      return UMSocialPlatformType_YixinSession;
    case 9:
      return UMSocialPlatformType_YixinTimeLine;
    case 10:
      return UMSocialPlatformType_YixinFavorite;
    case 11:
      return UMSocialPlatformType_LaiWangSession;
    case 12:
      return UMSocialPlatformType_LaiWangTimeLine;
    case 13:
      return UMSocialPlatformType_Sms;
    case 14:
      return UMSocialPlatformType_Email;
    case 15:
      return UMSocialPlatformType_Renren;
    case 16:
      return UMSocialPlatformType_Facebook;
    case 17:
      return UMSocialPlatformType_Twitter;
    case 18:
      return UMSocialPlatformType_Douban;
    case 19:
      return UMSocialPlatformType_KakaoTalk;
    case 20:
      return UMSocialPlatformType_Pinterest;
    case 21:
      return UMSocialPlatformType_Line;
    case 22:
      return UMSocialPlatformType_Linkedin;
    case 23:
      return UMSocialPlatformType_Flickr;
    case 24:
      return UMSocialPlatformType_Tumblr;
    case 25:
      return UMSocialPlatformType_Instagram;
    case 26:
      return UMSocialPlatformType_Whatsapp;
    case 27:
      return UMSocialPlatformType_DingDing;
    case 28:
      return UMSocialPlatformType_YouDaoNote;
    case 29:
      return UMSocialPlatformType_EverNote;
    case 30:
      return UMSocialPlatformType_GooglePlus;
    case 31:
      return UMSocialPlatformType_Pocket;
    case 32:
      return UMSocialPlatformType_DropBox;
    case 33:
      return UMSocialPlatformType_VKontakte;
    case 34:
      return UMSocialPlatformType_FaceBookMessenger;
    case 35:
      return UMSocialPlatformType_Tim;
    case 36:
      return UMSocialPlatformType_WechatWork;
    case 37:
      return UMSocialPlatformType_DouYin;

    default:
      return UMSocialPlatformType_UnKnown;
  }
}

- (id)convertImg:(NSString *)icon
{
  id img = nil;
  if ([icon hasPrefix:@"http"]) img = icon;
  else {
    if ([icon hasPrefix:@"/"]) img = [UIImage imageWithContentsOfFile:icon];
    else img = [UIImage imageWithContentsOfFile:[[NSBundle mainBundle] pathForResource:icon ofType:nil]];
  }
  
  return img;
}

- (void)shareToSina:(UMSocialMessageObject *)messageObject text:(NSString *)text icon:(NSString *)icon link:(NSString *)link title:(NSString *)title
{
  UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:text descr:title thumImage:icon];
  shareObject.webpageUrl = link;

  messageObject.shareObject = shareObject;
}

- (void)shareToWechatTimeLine:(UMSocialMessageObject *)messageObject text:(NSString *)text icon:(NSString *)icon link:(NSString *)link title:(NSString *)title
{
  UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:text descr:title thumImage:icon];
  shareObject.webpageUrl = link;

  messageObject.shareObject = shareObject;
}

- (void)shareWithText:(NSString *)text icon:(NSString *)icon link:(NSString *)link title:(NSString *)title platform:(NSInteger)platform completion:(UMSocialRequestCompletionHandler)completion
{
  UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
  
  UMSocialPlatformType plf = [self platformType:platform];
  
  if (plf == UMSocialPlatformType_Sina) {
    [self shareToSina:messageObject text:text icon:icon link:link title:title];
  } else if (plf == UMSocialPlatformType_WechatTimeLine || plf == UMSocialPlatformType_WechatSession) {
    [self shareToWechatTimeLine:messageObject text:text icon:icon link:link title:title];
  } else if (link.length > 0) {
    UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:title descr:text thumImage:icon];
    shareObject.webpageUrl = link;
    
    messageObject.shareObject = shareObject;
  } else if (icon.length > 0) {
    id img = [self convertImg:icon];
    UMShareImageObject *shareObject = [[UMShareImageObject alloc] init];
    shareObject.thumbImage = img;
    shareObject.shareImage = img;
    
    messageObject.shareObject = shareObject;
    messageObject.text = text;
  } else if (text.length > 0) {
    messageObject.text = text;
  } else {
    if (completion) {
      completion(nil, [NSError errorWithDomain:@"UShare" code:-3 userInfo:@{@"message": @"invalid parameter"}]);
      return;
    }
  }
  
  [[UMSocialManager defaultManager] shareToPlatform:platform messageObject:messageObject currentViewController:nil completion:completion];
}

RCT_EXPORT_METHOD(share:(NSString *)text icon:(NSString *)icon link:(NSString *)link title:(NSString *)title platform:(NSInteger)platform completion:(RCTResponseSenderBlock)completion)
{
  UMSocialPlatformType plf = [self platformType:platform];
  if (plf == UMSocialPlatformType_UnKnown) {
    if (completion) {
      completion(@[@(UMSocialPlatformType_UnKnown), @"invalid platform"]);
      return;
    }
  }
  
  [self shareWithText:text icon:icon link:link title:title platform:plf completion:^(id result, NSError *error) {
    if (completion) {
      if (error) {
        NSString *msg = error.userInfo[@"NSLocalizedFailureReason"];
        if (!msg) {
          msg = error.userInfo[@"message"];
        }if (!msg) {
          msg = @"share failed";
        }
        NSInteger stcode =error.code;
        if(stcode == 2009){
         stcode = -1;
        }
        completion(@[@(stcode), msg]);
      } else {
        completion(@[@200, @"share success"]);
      }
    }
  }];
  
}

RCT_EXPORT_METHOD(shareboard:(NSString *)text icon:(NSString *)icon link:(NSString *)link title:(NSString *)title platform:(NSArray *)platforms completion:(RCTResponseSenderBlock)completion)
{
  NSMutableArray *plfs = [NSMutableArray array];
  for (NSNumber *plf in platforms) {
    [plfs addObject:@([self platformType:plf.integerValue])];
  }
  if (plfs.count > 0) {
    [UMSocialUIManager setPreDefinePlatforms:plfs];
  }
  [UMSocialUIManager showShareMenuViewInWindowWithPlatformSelectionBlock:^(UMSocialPlatformType platformType, NSDictionary *userInfo) {
    [self shareWithText:text icon:icon link:link title:title platform:platformType completion:^(id result, NSError *error) {
      if (completion) {
        if (error) {
          NSString *msg = error.userInfo[@"NSLocalizedFailureReason"];
          if (!msg) {
            msg = error.userInfo[@"message"];
          }if (!msg) {
            msg = @"share failed";
          }
          NSInteger stcode =error.code;
          if(stcode == 2009){
            stcode = -1;
          }
          completion(@[@(stcode), msg]);
        } else {
          completion(@[@200, @"share success"]);
        }
      }
    }];
  }];
}

RCT_EXPORT_METHOD(getAvailablePlatforms:(NSArray *)platforms resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableArray *availablePlatforms = [NSMutableArray array];
  for (NSNumber *platform in platforms) {
    UMSocialPlatformType platformTypes = [self platformType:platform.integerValue];
    if ([[UMSocialManager defaultManager] isInstall:platformTypes]) {
      [availablePlatforms addObject:@(platformTypes)];
    }
  }
  
  resolve(availablePlatforms);
}

@end
