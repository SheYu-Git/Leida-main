import Capacitor
import UIKit

class BridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        bridge?.registerPluginInstance(LocalNotifyPlugin())
        bridge?.registerPluginInstance(LocationPlugin())
        bridge?.registerPluginInstance(FaceAuthPlugin())
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(LocalNotifyPlugin())
        bridge?.registerPluginInstance(LocationPlugin())
        bridge?.registerPluginInstance(FaceAuthPlugin())
    }
}
