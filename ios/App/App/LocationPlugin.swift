import Capacitor
import CoreLocation
import Foundation

@objc(LocationPlugin)
public class LocationPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "LocationPlugin"
    public let jsName = "LocationPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getCity", returnType: CAPPluginReturnPromise)
    ]

    private var manager: CLLocationManager?
    private var currentCall: CAPPluginCall?
    private var geocoder = CLGeocoder()

    @objc public func getCity(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.currentCall = call
            if self.manager == nil {
                let m = CLLocationManager()
                m.delegate = self
                m.desiredAccuracy = kCLLocationAccuracyHundredMeters
                self.manager = m
            }

            let status = self.manager?.authorizationStatus ?? CLLocationManager.authorizationStatus()
            if status == .denied || status == .restricted {
                self.currentCall?.reject("DENIED")
                self.currentCall = nil
                return
            }

            if status == .notDetermined {
                self.manager?.requestWhenInUseAuthorization()
            }

            self.manager?.requestLocation()
        }
    }

    public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedAlways || status == .authorizedWhenInUse {
            manager.requestLocation()
        } else if status == .denied || status == .restricted {
            self.currentCall?.reject("DENIED")
            self.currentCall = nil
        }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        self.currentCall?.reject(error.localizedDescription)
        self.currentCall = nil
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else {
            self.currentCall?.reject("NO_LOCATION")
            self.currentCall = nil
            return
        }

        geocoder.reverseGeocodeLocation(loc, preferredLocale: Locale(identifier: "zh_CN")) { placemarks, error in
            if let error = error {
                self.currentCall?.reject(error.localizedDescription)
                self.currentCall = nil
                return
            }
            let pm = placemarks?.first
            let city = (pm?.locality ?? pm?.subAdministrativeArea ?? pm?.administrativeArea ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let province = (pm?.administrativeArea ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            self.currentCall?.resolve([
                "city": city,
                "province": province,
                "latitude": loc.coordinate.latitude,
                "longitude": loc.coordinate.longitude
            ])
            self.currentCall = nil
        }
    }
}
