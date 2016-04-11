Requirements:

* npm: included with installation of NodeJS
* Apache Cordova: run `npm install -g cordova`
* Ionic CLI: run `npm install -g ionic`
* Xcode

To compile:

1. at root project directory, run `ionic state restore`
2. go to plugins/cordova-plugin-camera-with-exif/src/ios/CDVCamera.m then 
put `#import <Cordova/NSArray+Comparisons.h>` and #import `<Cordova/NSDictionary+Extensions.h>` to `#ifndef __CORDOVA_4_0_0` block
so that it appears like the following:

        #import "CDVCamera.h"
        #import "CDVJpegHeaderWriter.h"
        #import "UIImage+CropScaleOrientation.h"
        #import <ImageIO/CGImageProperties.h>
        #import <AssetsLibrary/ALAssetRepresentation.h>
        #import <AssetsLibrary/AssetsLibrary.h> 
        #import <AVFoundation/AVFoundation.h>
        #import <ImageIO/CGImageSource.h>
        #import <ImageIO/CGImageProperties.h>
        #import <ImageIO/CGImageDestination.h>
        #import <MobileCoreServices/UTCoreTypes.h>
        #import <objc/message.h>

        #ifndef __CORDOVA_4_0_0
            #import <Cordova/NSData+Base64.h>
            #import <Cordova/NSArray+Comparisons.h>
            #import <Cordova/NSDictionary+Extensions.h>
        #endif

3. run `ionic platform rm ios` followed by `ionic platform add ios@4.1.0`
4. run `ionic build ios` which will create a new xcode project at platforms/ios