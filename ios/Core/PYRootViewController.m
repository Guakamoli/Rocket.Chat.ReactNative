//
//  PYRootViewController.m
//  paiya
//
//  Created by jimmy on 2021/2/22.
//

#import "PYRootViewController.h"

@interface PYRootViewController ()

@end

@implementation PYRootViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

#pragma mark - 设备旋转
- (BOOL)shouldAutorotate
{
    return YES;
}
// 竖屏显示
- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    return (UIInterfaceOrientationPortrait | UIInterfaceOrientationLandscapeRight | UIInterfaceOrientationLandscapeLeft);
}

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation {
    return UIInterfaceOrientationPortrait;
}

@end
