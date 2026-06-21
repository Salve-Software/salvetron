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
// Pulls in the margelo::nitro::salvetron C++ types before including the
// generated -Swift.h header, mirroring NitroSalvetronAutolinking.mm — importing
// -Swift.h directly fails because it references those types inline.
#import "NitroSalvetron-Swift-Cxx-Umbrella.hpp"

@interface SalvetronEarlyLog : NSObject
@end

@implementation SalvetronEarlyLog

+ (void)load {
    [[SalvetronLogBuffer shared] installIfDebug];
}

@end
#endif
