//
//  SalvetronEarlyLog.mm
//  NitroSalvetron
//
//  Installs native log capture at dylib load time — before main() runs, and
//  therefore before AppDelegate.application(didFinishLaunchingWithOptions:)
//  ever executes. Debug builds only: never compiled into Release.
//

#if DEBUG
#import <Foundation/Foundation.h>
#import "NitroSalvetron-Swift.h"

@interface SalvetronEarlyLog : NSObject
@end

@implementation SalvetronEarlyLog

+ (void)load {
    [[SalvetronLogBuffer shared] installIfDebug];
}

@end
#endif
