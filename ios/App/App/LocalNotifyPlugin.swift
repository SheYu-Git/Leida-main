import Capacitor
import Foundation
import LocalAuthentication
import UIKit
import UserNotifications

@objc(LocalNotifyPlugin)
public class LocalNotifyPlugin: CAPPlugin, CAPBridgedPlugin, UNUserNotificationCenterDelegate {
    public let identifier = "LocalNotifyPlugin"
    public let jsName = "LocalNotifyPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "prompt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "notify", returnType: CAPPluginReturnPromise)
    ]

    public override func load() {
        UNUserNotificationCenter.current().delegate = self
    }

    @objc public func requestPermission(_ call: CAPPluginCall) {
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            if settings.authorizationStatus == .notDetermined {
                center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
                    call.resolve([
                        "granted": granted,
                        "status": granted ? "authorized" : "denied"
                    ])
                }
                return
            }
            let granted = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional || settings.authorizationStatus == .ephemeral
            call.resolve([
                "granted": granted,
                "status": String(describing: settings.authorizationStatus)
            ])
        }
    }

    @objc public func prompt(_ call: CAPPluginCall) {
        requestPermission(call)
    }

    @objc public func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let url = URL(string: UIApplication.openSettingsURLString) else {
                call.resolve(["opened": false])
                return
            }
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:]) { ok in
                    call.resolve(["opened": ok])
                }
            } else {
                call.resolve(["opened": false])
            }
        }
    }

    @objc public func notify(_ call: CAPPluginCall) {
        let title = call.getString("title") ?? "招投标雷达"
        let body = call.getString("body") ?? ""
        let id = call.getString("id") ?? UUID().uuidString

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            call.resolve(["scheduled": true])
        }
    }

    public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
}

@objc(FaceAuthPlugin)
public class FaceAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FaceAuthPlugin"
    public let jsName = "FaceAuthPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise)
    ]

    @objc public func isAvailable(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?
        let can = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        let type = biometryTypeName(context.biometryType)
        if can {
            call.resolve(["available": true, "biometryType": type])
            return
        }
        call.resolve([
            "available": false,
            "biometryType": type,
            "message": error?.localizedDescription ?? "Biometric unavailable"
        ])
    }

    @objc public func authenticate(_ call: CAPPluginCall) {
        let reason = call.getString("reason") ?? "请进行面容认证"
        let context = LAContext()
        context.localizedFallbackTitle = "输入密码"
        var error: NSError?
        let can = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        if !can {
            call.resolve([
                "success": false,
                "message": error?.localizedDescription ?? "Biometric unavailable",
                "biometryType": biometryTypeName(context.biometryType)
            ])
            return
        }
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, err in
            if success {
                call.resolve([
                    "success": true,
                    "biometryType": self.biometryTypeName(context.biometryType)
                ])
                return
            }
            call.resolve([
                "success": false,
                "message": err?.localizedDescription ?? "Authentication failed",
                "biometryType": self.biometryTypeName(context.biometryType)
            ])
        }
    }

    private func biometryTypeName(_ type: LABiometryType) -> String {
        switch type {
        case .faceID: return "faceID"
        case .touchID: return "touchID"
        default: return "none"
        }
    }
}
